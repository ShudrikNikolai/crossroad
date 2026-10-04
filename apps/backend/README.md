# Crossroad — Backend

Backend для платформы создания интерактивных историй (квестов) с ветвящимся сюжетом. Визуальный редактор на React Flow.


## Линтер

```bash
pnpm lint          # oxlint — no-restricted-imports ловит прямой импорт в обход ports/
pnpm lint:fix       # автофикс того, что фиксится (сортировка импортов и т.п.)
pnpm format         # prettier --write
```

## Тесты

```bash
pnpm test
```

## Локальный запуск

```bash
pnpm install
pnpm dev
```

## Стек

| Слой | Технология |
|---|---|
| Framework | NestJS |
| База данных | MongoDB (Mongoose) |
| Кэш | Redis (node-redis v6) |
| Файловое хранилище | MinIO (S3-совместимое) |
| Валидация / DTO | Zod 4 + `nestjs-zod` 5, схемы живут в `packages/schemas` (монорепо) |
| Логирование | Pino (`nestjs-pino`) |
| Трейсинг/метрики | OpenTelemetry (`@opentelemetry/sdk-node`, auto-instrumentations) |
| Документация API | Swagger (OpenAPI), генерируется из Zod-схем |
| Аутентификация | JWT (access + refresh), Passport-стратегии |
| Тесты | Vitest + `@nestjs/testing` |
| Линт/формат | oxlint + Prettier |


## Архитектура

**Модульный монолит.** Каждый модуль в `src/modules/*` — самодостаточный домен: свои модели, репозитории, сервисы, контроллеры, DTO и тесты. Цель — чтобы любой модуль можно было в будущем вынести в отдельный сервис, поменяв только его инфраструктурную обвязку, не трогая бизнес-логику.

**Порты вместо прямых импортов между модулями.** Модуль, который используется другими (`user`, `story`, `media`), выставляет публичный контракт в своей папке `ports/` — интерфейс + DI-токен (`USER_PORT`, `STORY_PORT`, `MEDIA_PORT`). Потребители инжектят токен, а не конкретный сервис:

```typescript
constructor(@Inject(USER_PORT) private readonly userPort: IUserAuthPort) {}
```

Экспортировать из `*.module.ts` наружу можно **только** порт — внутренние сервисы (`UserService`, `SecurityService` и т.п.) из `exports` не торчат. Это правило механически проверяется линтом (см. «Границы модулей» ниже) — случайный прямой импорт внутреннего сервиса другого модуля падает на `pnpm lint`.

**Эффекты между модулями — через события**, не через прямые вызовы, там, где это не синхронный запрос-ответ (например, `statistic` слушает события из `game`, а не вызывается им напрямую). Инфраструктура — `infrastructure/event` (обёртка над `EventEmitterModule`).

## Структура модуля (на примере `story`)

```
story/
│   story.module.ts        — точка входа: providers, controllers, imports, exports: [STORY_PORT]
├── core/                  — сущность "история" целиком: model + repository + service
├── node/                  — сущность "узел графа" (своя папка на каждую сущность модуля)
├── edge/                  — сущность "ребро графа"
├── variable/              — сущность "переменная истории"
├── facades/               — StoryFacade: сборка полного графа, публикация, оркестрация нескольких сервисов
├── ports/                 — публичный контракт модуля для внешних потребителей (STORY_PORT)
├── controllers/           — HTTP-слой, тонкий, вызывает сервисы/фасад
├── dtos/                  — createZodDto(...) обёртки над схемами из @crossroad/schemas
└── tests/                 — vitest-спеки, по файлу на сервис
```

## Модули

| Модуль | Назначение | 
|---|---|
| `auth` | Регистрация/логин/refresh/logout, JWT-стратегии, cookie с refresh-токеном | 
| `user` | Пользователь + подсущности `profile` (публичный профиль) и `security` (пароль) | 
| `story` | Граф истории: `core` (метаданные), `node`, `edge`, `variable`; `StoryFacade` — сборка графа и публикация (locks the story from edits once published) | 
| `media` | Presigned-загрузка файлов в MinIO (upload-url → клиент льёт напрямую → confirm), фоновая очистка зависших `pending`-записей | 
| `game` | Прохождение опубликованной истории: `playthrough`, выбор ветки по `edgeId`, проверка условий на переменных |
| `statistic` | Статистика |
| `health` | Liveness/readiness (`/health/ping`, `/health/network`, `/health/db`) через `@nestjs/terminus` | 

## Аутентификация

- **Access-токен** — короткоживущий (минуты), возвращается в теле ответа (`/auth/login`, `/auth/register`, `/auth/refresh`), хранится на фронте только в памяти (не в `localStorage`), прикрепляется axios-интерцептором как `Authorization: Bearer`.
- **Refresh-токен** — долгоживущий, уходит только в `httpOnly` cookie (никогда в JSON-теле), хранится в БД как bcrypt-хэш, привязан к `jti`. Ротируется при каждом `/auth/refresh`.
- Guard'ы: `JwtAuthGuard` — глобальный (`APP_GUARD` в `app.module.ts`), роуты без авторизации помечаются `@Public()`. `RefreshTokenGuard` — отдельный, только для `/auth/refresh`.
- Локальный dev: фронт (`:3000`) и бэк (`:3001`) на `localhost` с разными портами — cookie работает без прокси благодаря тому, что куки в браузере не изолируются по порту (RFC 6265). **В проде так не сработает** — нужен reverse-proxy, сводящий фронт и бэк под один домен, либо `Domain=.example.com` на общем родительском домене.

## Данные и репозитории

Все репозитории наследуют `common/repositories/base.repository.ts`. Общие гарантии:

- **Soft delete по умолчанию.** `findById`/`findOne`/`findMany`/`updateById` и т.д. автоматически фильтруют `deletedAt: null`. Физическое удаление — только через `hardDeleteById`.
- **Наружу — только `id`, никогда `_id`.** Методы чтения отдают POJO (`Response<T> = Omit<T, '_id'> & { id: string }`), а не `HydratedDocument` — Mongoose-специфика (`$__`, `.save()`, методы схемы) не должна утекать выше репозитория. Если сервису нужен именно живой документ — `createDocument()`/`toPublic()` на уровне репозитория делают явное преобразование.
- **Строковые id в фильтрах и на запись конвертируются в `ObjectId` автоматически** — передавай `string`, репозиторий сам приведёт к `ObjectId` там, где это требует схема.
- Методы схемы (`schema.methods.*`) не используются — логика вроде «токен ещё валиден» живёт как чистая функция в `*.util.ts`, а не как метод документа, чтобы не завязываться на `HydratedDocument` в сервисном слое.


## Инфраструктура (`src/infrastructure`)

Глобальные модули (`@Global()`), каждый — тонкая обёртка над конкретным провайдером, доменные модули обращаются к обёртке, а не к клиенту напрямую:

- `database` — подключение к MongoDB (`MongooseModule.forRootAsync`).
- `redis` — клиент `node-redis`, используется как кэш (например, кэш опубликованного графа истории в `game`).
- `storage` — `StorageService` поверх `IStorage`; текущая реализация — `MinioStorage` (DI-токен `STORAGE`, подменяется при необходимости).
- `event` — обёртка над `EventEmitterModule`, контракты событий — в `event/events/*.event.ts`.
- `logger` — Pino, `AppLoggerModule` оборачивает `LoggerModule` из `nestjs-pino`; чувствительные поля (`cookie`, `authorization`) редактируются через `redact`.
- `observability` — OpenTelemetry SDK (`telemetry.ts`, грузится через `--require` до старта Nest) + `MetricsService`.
- `scheduler` — `ScheduleModule`, фоновые задачи через `@Cron` (например, `MediaCleanupService`).

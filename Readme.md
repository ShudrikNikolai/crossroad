# Crossroad

Платформа для создания интерактивных историй (квестов) с ветвящимся сюжетом: визуальный drag-and-drop редактор графа (React Flow), прохождение истории игроком.

## Структура монорепо

```
crossroad/
├── apps/
│   ├── backend/       — NestJS API
│   └── frontend/      — Next.js клиент
├── packages/
│   ├── schemas/       — общие Zod-схемы и типы (DTO, контракты запрос/ответ)
│   └── types/        — общие TS-типы, не завязанные на Zod 
└── infra/
    ├── docker/        — docker-compose.yaml и конфиги
    ├── env/           — .env-файлы для контейнеров
    └── nginx/        — реверс-прокси nginx
```

Инструменты монорепо — pnpm workspaces + Turborepo. Общий код (схемы, типы) собирается отдельным шагом и переиспользуется в обоих `apps/*` через `workspace:*`-зависимости — правка в `packages/schemas` сразу типизированно отражается и в бэке, и во фронте.

## Быстрый старт

```bash
git clone <repo>
cd crossroad
task install        # pnpm install по всему монорепо
task up             # поднять всё: инфраструктуру + backend + frontend + nginx
```

После этого:
- приложение — `http://localhost`
- Swagger — `http://localhost/api/swagger`
- Jaeger (трейсы) — `http://localhost:16686`
- Prometheus — `http://localhost:9090`
- MinIO Console — `http://localhost:9001`

## Разработка без полного Docker-стека

Для разработки удобнее поднимать в Docker только инфраструктуру, а `backend`/`frontend` гонять локально с hot-reload:

```bash
task infra:up        # mongo, redis, minio, otel-collector, jaeger, prometheus
task dev              # pnpm turbo run dev — backend и frontend с watch-режимом
```

## Частые команды

| Команда | Что делает |
|---|---|
| `task up` / `task down` | поднять / остановить весь стек |
| `task down:volumes` | остановить и снести данные (БД, MinIO, Prometheus) |
| `task infra:up` | только инфраструктура, для локальной разработки |
| `task logs -- backend` | логи конкретного сервиса |
| `task build` | пересобрать образы `backend`/`frontend` без кэша |
| `task test` | юнит-тесты по всем пакетам (Vitest) |
| `task test:e2e` | e2e-тесты бэкенда (требует `task infra:up` заранее) |
| `task lint` / `task lint:fix` | линт по всему монорепо (oxlint) |

Полный список — `Taskfile.yml` в корне.

## Границы между модулями и пакетами

Внутри `apps/backend` действует жёсткое правило: модуль импортируется извне только через его `ports/` или `*.module.ts`, прямой импорт внутреннего сервиса другого модуля — ошибка линта (`oxlint`, правило `no-restricted-imports`), не предупреждение. Это сделано, чтобы в будущем любой модуль можно было вынести в отдельный сервис, поменяв только его обвязку.

`packages/schemas` — источник правды для форм запросов/ответов API. Правило: схема определяется один раз, импортируется (а не копируется) везде, где нужна — иначе `nestjs-zod` падает на сборке OpenAPI-документа из-за двух разных схем с одинаковым `meta.id`.

## Переменные окружения

Все `.env`-файлы — в `infra/env/`, подключаются сервисам через `env_file` в `docker-compose.yaml`. Внутри Docker-сети сервисы обращаются друг к другу по именам контейнеров (`mongo`, `redis`, `minio`, `backend`), не по `localhost` — это единственное, что меняется между локальным запуском вне Docker и запуском через `task up`.

## Документация по частям проекта

- [`apps/backend/README.md`](./apps/backend/README.md) — стек, архитектура, модули, конвенции репозиториев, аутентификация, тесты.
- [`apps/frontend/README.md`](./apps/frontend/README.md)

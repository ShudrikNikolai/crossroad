# Crossroad Frontend

Frontend приложения **Crossroad** — веб-интерфейс для авторизации пользователей, управления профилем, создания и публикации историй и прохождения интерактивных игр.

Frontend взаимодействует с backend API через HTTP и использует прямую загрузку медиафайлов в MinIO.

---

## Стек

Основные технологии:

* **Next.js**
* **React**
* **TypeScript**
* **HeroUI** — UI-компоненты
* **React Flow** (`@xyflow/react`) — визуальный редактор графа истории
* **Axios** — HTTP-клиент
* **Zod / `@crossroad/schemas`** — общие схемы и типы
* **MinIO / S3** — хранение медиафайлов

Backend API:

```text
http://localhost:3001/api/v1
```

Локальное хранилище MinIO:

```text
http://localhost:9000
```

---

# Структура проекта

Основная бизнес-логика организована по feature-based структуре:

```text
features/
├── auth/
│   ├── api/
│   ├── components/
│   ├── hooks/
│   └── types/
│
├── game/
│   ├── api/
│   ├── components/
│   │   ├── list/
│   │   ├── new/
│   │   └── play/
│   ├── hooks/
│   ├── lib/
│   │   └── saves/
│   └── types/
│
├── media/
│   ├── api/
│   ├── hooks/
│   ├── types/
│   └── utils/
│
├── stories/
│   ├── api/
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   └── types/
│
└── user/
    ├── api/
    ├── components/
    └── types/
```

# shumys-kz-backend

Минималистичный REST API для маркетплейса работы shumys.kz. Собран на **Hono**, **Drizzle ORM** и **PostgreSQL**. Текущий объём: регистрация и вход (аутентификация).

## Стек

- [Hono](https://hono.dev/) — веб-фреймворк (запуск на Node через `@hono/node-server`)
- [Drizzle ORM](https://orm.drizzle.team/) + [node-postgres](https://node-postgres.com/)
- [Zod](https://zod.dev/) — валидация запросов
- JWT (`hono/jwt`) + хэширование паролей через `scrypt` (`node:crypto`, без нативных зависимостей)
- pnpm, TypeScript (ESM)

## Быстрый старт

### Вариант A — всё в Docker

Поднимает и PostgreSQL, и API в контейнерах. Контейнер `app` при старте применяет
миграции и слушает http://localhost:3000.

```bash
docker compose up -d --build    # db + app
docker compose logs -f app      # смотреть логи
docker compose down             # остановить (данные сохранятся в томе `pgdata`)
```

Миграции генерируются из схемы командой `pnpm db:generate` и лежат в `drizzle/`;
контейнер их только *применяет*.

### Вариант B — БД в Docker, API на хосте (быстрый цикл разработки)

Создайте файл `.env` в корне бэкенда и заполните его переменными (ориентир —
`.env.example` и таблица [«Переменные окружения»](#переменные-окружения) ниже):

```env
PORT=3000
DATABASE_URL=postgres://shumys:shumys@localhost:5433/shumys
JWT_SECRET=поменяйте-на-случайную-строку
CORS_ORIGIN=http://localhost:5173
```

Затем:

```bash
pnpm install
docker compose up -d db        # только PostgreSQL (host-порт :5433)
pnpm db:migrate               # применить миграции (сначала pnpm db:generate, если менялась схема)
pnpm dev                      # старт на http://localhost:3000, watch-режим
```

## Переменные окружения

| Переменная     | Описание                              | По умолчанию              |
| -------------- | ------------------------------------- | ------------------------- |
| `PORT`         | HTTP-порт                             | `3000`                    |
| `DATABASE_URL` | Строка подключения к PostgreSQL       | —                         |
| `JWT_SECRET`   | Секрет для подписи JWT (≥16 символов) | —                         |
| `CORS_ORIGIN`  | Разрешённый origin фронтенда          | `http://localhost:5173`   |

## API

| Метод | Путь             | Тело / примечание                                 |
| ----- | ---------------- | ------------------------------------------------- |
| GET   | `/health`        | Проверка живости                                  |
| POST  | `/auth/register` | `{ email, password, name }` → `{ user, token }`   |
| POST  | `/auth/login`    | `{ email, password }` → `{ user, token }`         |

`passwordHash` наружу никогда не отдаётся.

> Защищённые эндпоинты (`/auth/me`, список и просмотр пользователей) и JWT-middleware
> будут добавлены позже.

## Как посмотреть базу

**Drizzle Studio** — веб-интерфейс поверх БД:

```bash
pnpm db:studio          # поднимается на https://local.drizzle.studio (Drizzle Kit на :4983)
```

> Chromium/Brave/Safari по умолчанию блокируют доступ к локальной сети, поэтому страница
> может зависнуть на _Connecting…_. Разрешите доступ через **иконку замка → Local network
> access**, либо в Brave опустите **Shields** для `local.drizzle.studio` и обновите страницу.

**psql** — прямо в контейнере:

```bash
docker compose exec db psql -U shumys -d shumys
# \dt  список таблиц   \d users  структура   SELECT * FROM users;   \q  выход
```

**Любой GUI-клиент** (DBeaver, TablePlus, pgAdmin): host `localhost`, port `5433`,
база/пользователь/пароль — везде `shumys`.

## Скрипты

| Скрипт            | Описание                               |
| ----------------- | -------------------------------------- |
| `pnpm dev`        | Dev-сервер с watch (`tsx`)             |
| `pnpm start`      | Запуск сервера (`tsx`, без сборки)     |
| `pnpm typecheck`  | Проверка типов                         |
| `pnpm db:generate`| Сгенерировать миграции из схемы        |
| `pnpm db:migrate` | Применить миграции                     |
| `pnpm db:push`    | Залить схему напрямую (для разработки) |
| `pnpm db:studio`  | Открыть Drizzle Studio                 |

## Структура проекта

```
src/
  index.ts            бутстрап сервера
  app.ts              сборка приложения, middleware, обработка ошибок
  env.ts              валидация переменных окружения
  db/                 drizzle-клиент, схема, миграции
  lib/                хэширование паролей, JWT
  modules/            модули-фичи (schema / service / routes)
    auth/
```

Новые фичи (jobs, messages, …) добавляются новой папкой в `src/modules/` по шаблону
`*.schema.ts` / `*.service.ts` / `*.routes.ts`: добавить таблицу в `src/db/schema.ts`
и подключить роутер в `src/app.ts`.

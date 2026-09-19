# 🏨 Guest Place — Monorepo & Service Hub

Платформа для управления гостевыми домами, отелями и апартаментами.  
Архитектура построена по принципу **Zero Cloud Lock-in**: всё работает локально и в Docker без привязки к проприетарным облачным сервисам.

---

## 🗂️ Ветки проекта и архитектура

Каждый ключевой компонент проекта изолирован в собственной ветке репозитория:

| Компонент | Ветка на GitHub | Рабочая ветка (PR) | Стек | Порт |
| :--- | :--- | :--- | :--- | :--- |
| **🌐 Client** (Гостевой сайт) | [`client`](https://github.com/cookies-with-tea/guest-place/tree/client) | `dev` | Nuxt 3, Vue 3, Pinia, GSAP | `3000` |
| **⚡ Admin Panel** (Админка MFE) | [`admin-panel`](https://github.com/cookies-with-tea/guest-place/tree/admin-panel) | `admin-panel-update` | Module Federation, Vite, Vue 3, Turborepo | `4173` (Shell) |
| **🦀 Server** (REST & Realtime) | [`server`](https://github.com/cookies-with-tea/guest-place/tree/server) | `server-update` | Rust (Axum, SQLx, Redis, SSE, OpenAPI) | `8000` |
| **🎛️ Root & Infra** (Координатор) | [`main`](https://github.com/cookies-with-tea/guest-place/tree/main) | `infra/root-dx` | Docker Compose, Makefile, Scripts | — |

---

## 🚀 Варианты локального запуска

Проект поддерживает гибкий запуск: от запуска всех сервисов в dev-режиме до изолированной разработки одного проекта, когда все зависимости работают в Docker.

### 📋 Сводная таблица команд

| Сценарий | Команда Make | Команда pnpm | Что происходит |
| :--- | :--- | :--- | :--- |
| **Разработка только клиента** | `make dev-client` | `pnpm dev:client` | DB, Redis, Server и Admin поднимаются в Docker, клиент запускается локально в dev |
| **Разработка только админки** | `make dev-admin` | `pnpm dev:admin` | DB, Redis и Server поднимаются в Docker, админка запускается локально в dev |
| **Разработка только бэкенда** | `make dev-server` | `pnpm dev:server` | DB и Redis поднимаются в Docker, сервер запускается локально в `cargo watch` |
| **Полный стек в dev-режиме** | `make dev-full` | `pnpm dev:full` | DB/Redis в Docker + Rust + Все микрофронтенды + Nuxt клиент в dev (hot-reload) |
| **Всё в Docker** | `make docker-up-all` | `pnpm docker:up:all` | Все сервисы собираются и работают в фоновых контейнерах |
| **Остановка контейнеров** | `make docker-down` | `pnpm docker:down` | Остановка и удаление контейнеров |
| **Генерация фикстур (Seed)** | `make seed` | `pnpm seed` | Наполнение БД тестовыми данными (55+ пользователей, медиа, аналитика) |
| **Синхронизация API типов** | `make generate-api` | `pnpm generate:api` | Экспорт OpenAPI из бэкенда и генерация TS-типов в `@admin-panel/lib` |
| **Headless E2E тесты** | `make test-e2e` | `pnpm test:e2e` | Быстрый прогон Playwright тестов с mock-авторизацией |

---

### Сценарий 1: Разработчик клиентской части (`client`)

Если вы пишете код гостевого сайта на Nuxt 3, вам **не нужно** ставить компилятор Rust, запускать `cargo watch` и поднимать 10 dev-серверов админки:

1. **Запустите зависимости в Docker, а клиент — локально:**
   ```bash
   make dev-client
   # или
   pnpm dev:client
   ```
   *Команда поднимет PostgreSQL, Redis, Rust API сервер (порт 8000) и микрофронтенды админки (порт 4173) в готовых Docker-контейнерах, а затем запустит Nuxt `pnpm dev` на порту 3000.*

2. **Заполните базу тестовыми данными (при первом запуске):**
   ```bash
   make seed
   # или pnpm seed
   ```

3. **Готово к работе:**
   - Гостевой сайт (dev, hot-reload): `http://localhost:3000`
   - Бэкенд API: `http://localhost:8000/api/v1`
   - Swagger / OpenAPI UI: `http://localhost:8000/swagger-ui`
   - Админ-панель (контейнер): `http://localhost:4173`

---

### Сценарий 2: Разработчик админ-панели (`admin-panel`)

Если вы разрабатываете микрофронтенды в `admin-panel`:

1. **Запустите бэкенд и базы данных в Docker:**
   ```bash
   make dev-admin
   # или
   pnpm dev:admin
   ```
   *Команда запустит DB, Redis и скомпилированный сервер в Docker, а затем запустит микрофронтенды через Turbo (`pnpm dev:all`).*

2. **Если нужно разработать конкретный микрофронтенд (например, только `admin-content`):**
   ```bash
   # 1. Поднять бэкенд и админ-шелл:
   make docker-up-deps
   # 2. Запустить только нужный MFE локально:
   cd admin-panel/apps/admin-content && pnpm dev
   ```

---

### Сценарий 3: Разработчик серверной части (`server`)

Если вы пишете код на Rust:

1. **Запустите только базы данных (PostgreSQL и Redis):**
   ```bash
   make dev-server
   # или
   pnpm dev:server
   ```
   *Команда поднимет контейнеры БД и запустит сервер в режиме отслеживания изменений `cargo watch -x run`.*

2. **Применить миграции / пересоздать схему:**
   ```bash
   cd server && sqlx migrate run
   ```

3. **Наполнить тестовыми данными:**
   ```bash
   make seed
   ```

---

### Сценарий 4: Полный локальный запуск (`dev:full`)

Для сквозной разработки всех слоев одновременно:

```bash
make dev-full
# или
pnpm dev:full
```

Скрипт автоматически:
1. Проверяет и запускает Docker Compose (`db` + `redis`).
2. Дожидается готовности PostgreSQL (healthcheck на порту 5432).
3. Запускает бэкенд `cargo watch -x run` (порт 8000).
4. Запускает все микрофронтенды админки `pnpm dev:all` (порт 4173).
5. Запускает Nuxt-клиент `pnpm dev` (порт 3000).
6. При нажатии `Ctrl+C` корректно завершает все процессы.

---

## 🔒 Тестовые учетные записи (после `make seed`)

| Роль | Email | Пароль |
| :--- | :--- | :--- |
| **Суперадминистратор** | `admin@guestplace.local` | `admin123` |
| **Менеджер** | `manager@guestplace.local` | `admin123` |
| **Гость** | `guest1@guestplace.local` | `guest123` |

---

## 🌿 Git Workflow: Работа с ветками и Pull Request в `main`

В этом репозитории каждая подсистема живет в отдельной ветке. Вся работа ведется через фиче-ветки и **Pull Request (PR)**.

### 1. Как устроен процесс PR для отдельных проектов

У каждого подпроекта есть своя целевая ветка:
- **Server:** разработка в ветке `server-update` -> PR в ветку `server`
- **Admin Panel:** разработка в ветке `admin-panel-update` -> PR в ветку `admin-panel`
- **Client:** разработка в ветке `dev` -> PR в ветку `client`

```bash
# Пример отправки изменений по серверу:
cd server
git add .
git commit -m "feat(server): add redis soft entity locking and sse bus"
git push origin server-update
# -> Открыть Pull Request на GitHub: server-update -> server
```

---

### 2. Как залить `Makefile`, `compose.yaml`, `package.json` и `README.md` в ветку `main`

Ветка `main` содержит общую документацию, оркестратор и корневые файлы автоматизации (`Makefile`, `compose.yaml`, `package.json`, `scripts/`, `README.md`).

Поскольку вы пушите **только через PR**, создайте фиче-ветку для корневой инфраструктуры (например, `infra/root-dx`):

#### Шаг 1. Инициализировать репозиторий в корне (если еще не инициализирован)
```bash
# Находясь в корне /Users/miirsery/web/practice/cookies/guest-place:
git init
git remote add origin https://github.com/cookies-with-tea/guest-place.git
git fetch origin main
```

#### Шаг 2. Создать ветку от `origin/main`
```bash
git checkout -b infra/root-dx origin/main
```

#### Шаг 3. Добавить корневые файлы и настроить `.gitignore`
Создайте/проверьте файл `.gitignore` в корне, чтобы не коммитить папки подрепозиториев (`server`, `admin-panel`, `client`) целиком внутрь `main`, если они ведутся отдельными ветками:

```gitignore
# .gitignore в корне
node_modules/
.DS_Store
*.log

# Если server, admin-panel и client ведутся в отдельных ветках:
# они могут быть исключены из ветки main, либо добавлены как git submodule
```

Добавьте только корневые файлы инфраструктуры:
```bash
git add Makefile compose.yaml package.json pnpm-lock.yaml scripts/ README.md admin-panel/Dockerfile client/Dockerfile
git commit -m "feat(infra): add root Makefile, docker compose orchestrator and DX documentation"
```

#### Шаг 4. Запушить фиче-ветку на GitHub
```bash
git push -u origin infra/root-dx
```

#### Шаг 5. Открыть Pull Request в `main`
1. Перейдите в репозиторий на GitHub: `https://github.com/cookies-with-tea/guest-place/pulls`
2. Нажмите кнопку **New pull request**.
3. Выберите:
   - **Base repository:** `cookies-with-tea/guest-place`
   - **Base branch:** `main`
   - **Compare branch:** `infra/root-dx`
4. Проверьте диффы (в PR войдут `Makefile`, `compose.yaml`, `package.json`, `scripts/`, `README.md`).
5. Нажмите **Create pull request** и выполните Merge после ревью.

---

### 3. Ссылки на ветки внутри `main`

Чтобы внутри ветки `main` (в GitHub веб-интерфейсе и документации) были прямые и удобные переходы на другие ветки проекта:

1. **В шапке `README.md`** уже добавлены прямые ссылки на ветки:
   - [Ветка `server`](https://github.com/cookies-with-tea/guest-place/tree/server)
   - [Ветка `admin-panel`](https://github.com/cookies-with-tea/guest-place/tree/admin-panel)
   - [Ветка `client`](https://github.com/cookies-with-tea/guest-place/tree/client)
2. **Переключение веток в GitHub UI**: В левом верхнем выпадающем меню GitHub (`Branch: main`) любой разработчик может переключиться на нужную ветку.
3. **Клонирование конкретной ветки разработчиком:**
   ```bash
   # Клонировать только клиент:
   git clone -b client https://github.com/cookies-with-tea/guest-place.git client

   # Клонировать только админку:
   git clone -b admin-panel https://github.com/cookies-with-tea/guest-place.git admin-panel

   # Клонировать только бэкенд:
   git clone -b server https://github.com/cookies-with-tea/guest-place.git server
   ```

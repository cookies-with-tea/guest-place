# Admin Panel Monorepo

Monorepo для административной панели с микрофронтендами на Vite + Module Federation. Управление пакетами — pnpm, оркестрация задач — Turborepo.

## Содержание
- [Требования](#требования)
- [Установка](#установка)
- [Структура монорепозитория](#структура-монорепозитория)
- [Скрипты и команды](#скрипты-и-команды)
  - [Ежедневная разработка](#ежедневная-разработка)
  - [Микрофронтенды](#микрофронтенды)
  - [Сборка](#сборка)
  - [Тесты](#тесты)
  - [Линтинг и форматирование](#линтинг-и-форматирование)
  - [Storybook](#storybook)
- [Порты и URL](#порты-и-url)
- [Технологии](#технологии)

## Требования
- Node.js 22+ (проект разрабатывался на 22.x; `apps/admin-shell` требует >= 22.12.0)
- pnpm 9+

Рекомендуется использовать версию Node из `.nvmrc` (если используете nvm/nvs/Volta).

## Установка
```bash
pnpm install
```

## Структура монорепозитория
- `apps/`
  - `admin-shell` — хост-приложение (shell)
  - `admin-statistics` — микрофронтенд «Статистика»
  - `admin-translations` — микрофронтенд «Переводы»
  - `docs` — Storybook
- `packages/`
  - `ui` — общий UI-kit
  - `utils` — общие утилиты
  - конфиги: `eslint-config`, `prettier-config`, `stylelint-config`, `typescript-config`

## Скрипты и команды
Все команды запускаются из корня репозитория.

### Ежедневная разработка
- Запуск всех приложений в dev-режиме (параллельно через Turborepo):
```bash
pnpm dev
```
- Запуск только shell (vite dev):
```bash
pnpm dev:shell
```

### Микрофронтенды
- Запуск микрофронтендов в preview и shell в dev одновременно:
```bash
pnpm dev:mf
```
Что делает команда:
- `preview:mf` — запускает preview для `apps/admin-statistics` и `apps/admin-translations`
- `dev:shell` — запускает dev для `apps/admin-shell`
- `run-p` запускает их параллельно (Windows-friendly)

- Отдельно только preview микрофронтендов:
```bash
pnpm preview:mf
```

Примечание: историческая команда `pnpm preview` была последовательной и могла «зависать» на первом preview; используйте `dev:mf`.

### Сборка
- Полная сборка всех пакетов и приложений:
```bash
pnpm build
```
- Сборка конкретного проекта (через интерактивный выбор):
```bash
pnpm build:project
```

### Тесты
- Юнит-тесты (Vitest):
```bash
pnpm test
# или
pnpm test:unit
```
- E2E (Cypress) для shell: в `apps/admin-shell` настроены скрипты `test:e2e`/`test:e2e:dev`.
  Запуск из корня (по умолчанию стартует preview и затем cypress):
```bash
pnpm -C apps/admin-shell test:e2e
```

### Линтинг и форматирование
- Запуск всех линтеров и проверки форматирования:
```bash
pnpm lint
```
- Автоисправления:
```bash
pnpm lint:fix
```

### Storybook
- Запуск Storybook (пакет `apps/docs`):
```bash
pnpm storybook
```
- Предпросмотр собранного Storybook:
```bash
pnpm preview-storybook
```

## Порты и URL
- Shell dev (Vite): `http://localhost:5173`
- `admin-statistics`
  - dev: `http://localhost:4174`
  - preview: `http://localhost:3001`
- `admin-translations`
  - dev: `http://localhost:4175`
  - preview: `http://localhost:3002`

Команда `pnpm dev:mf` поднимает shell в dev (5173) и микрофронтенды в preview (3001/3002) одновременно.

## Технологии
- Vite 7, Vue 3, Vue Router 4
- Module Federation (`@originjs/vite-plugin-federation`)
- Turborepo — параллельные dev/build задачи
- pnpm — workspaces и менеджер пакетов
- ESLint, Prettier, Stylelint
- Vitest, Cypress

---
Если требуется добавить новые микрофронтенды — используйте аналогичную конфигурацию `vite` и добавьте соответствующие `scripts` (`dev`, `build`, `preview`), после чего включите их в корневые фильтры `preview:mf`/`dev:mf` при необходимости.

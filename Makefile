.PHONY: help dev-full dev-client dev-admin dev-server seed generate-api check-api-drift smoke-test test test-server test-admin test-client test-unit test-e2e test-e2e-report test-e2e-ui test-all docker-up docker-up-deps docker-up-all docker-down

help:
	@echo "================================================================="
	@echo "Guest Place - Команды разработки и локального запуска:"
	@echo "================================================================="
	@echo "  make dev-full        - Запуск ВСЕХ 3 проектов локально в dev-режиме (hot reload)"
	@echo "  make dev-client      - Разработка CLIENT: server и admin в prod/preview, client в dev"
	@echo "  make dev-client-docker - Разработка CLIENT: server и admin в Docker контейнерах, client в dev"
	@echo "  make dev-admin       - Разработка ADMIN: server + DB/Redis в Docker, admin в dev"
	@echo "  make dev-server      - Разработка SERVER: DB/Redis в Docker, Rust cargo watch в dev"
	@echo "-----------------------------------------------------------------"
	@echo "  make docker-up-deps  - Поднять зависимости для клиента (DB + Redis + Server + Admin)"
	@echo "  make docker-up       - Поднять только PostgreSQL и Redis"
	@echo "  make docker-up-all   - Поднять абсолютно всё в Docker"
	@echo "  make docker-down     - Остановить все Docker контейнеры"
	@echo "  make docker-down-volume - Остановить Docker контейнеры и удалить volume"
	@echo "-----------------------------------------------------------------"
	@echo "  make seed            - Наполнить БД реалистичными фикстурами (50+ пользователей)"
	@echo "  make generate-api    - Экспорт OpenAPI и генерация TypeScript-типов"
	@echo "  make check-api-drift - Проверить, что закоммиченные openapi.json/types.ts не расходятся с кодом сервера (для CI)"
	@echo "  make smoke-test      - Поднять db/redis + все 3 dev-сервиса вместе и проверить, что каждый отвечает по HTTP (для CI)"
	@echo "  make test            - Запуск ВСЕХ unit/integration тестов (server + admin + client)"
	@echo "  make test-server     - Запуск тестов бэкенда (Rust cargo test)"
	@echo "  make test-admin      - Запуск unit тестов админ-панели (Vitest)"
	@echo "  make test-client     - Запуск unit/компонентных тестов клиента (Vitest)"
	@echo "  make test-e2e        - Запуск headless E2E тестов (Playwright + mock-auth)"
	@echo "  make test-e2e-report - Открыть HTML-отчёт последнего прогона Playwright"
	@echo "  make test-e2e-ui     - Интерактивный UI раннер Playwright"
	@echo "  make test-all        - Полный прогон всех тестов (unit + integration + e2e)"
	@echo "================================================================="

dev-full:
	node scripts/dev-full.mjs

dev-client:
	node scripts/dev-client.mjs

dev-client-docker:
	docker compose up -d db redis server admin-panel
	cd client && pnpm dev

dev-admin:
	docker compose up -d db redis server
	cd admin-panel && pnpm dev:all

dev-server:
	docker compose up -d db redis
	cd server && cargo watch -x run

seed:
	cargo run --manifest-path server/Cargo.toml --bin seed

generate-api:
	cargo run --manifest-path server/Cargo.toml --bin guest-place -- --export-openapi
	cd admin-panel && pnpm generate:api

# Regenerates server/openapi.json and admin-panel/packages/lib/src/api/types.ts from the
# current server code, then fails (via `git diff --exit-code`, in each file's own repo —
# server/ and admin-panel/ are separate git checkouts) if that changes anything already
# committed. Catches exactly the drift class that stayed invisible for a long time: a
# server route/DTO changed without re-running `make generate-api`, so admin-panel's
# generated types quietly described an API that no longer matched the server.
check-api-drift: generate-api
	@echo "Checking server/openapi.json for drift..."
	cd server && git diff --exit-code openapi.json
	@echo "Checking admin-panel/packages/lib/src/api/types.ts for drift..."
	cd admin-panel && git diff --exit-code packages/lib/src/api/types.ts
	@echo "No API drift detected."

# Brings up db/redis + server + admin-shell + client together (same shape as `dev-full`,
# but one-shot and scriptable) and polls each one's HTTP port until it answers or a timeout
# is hit. Exits non-zero, and tears everything back down, if any of the three never came up.
smoke-test:
	node scripts/smoke-test.mjs

test: test-server test-admin test-client

test-server:
	cargo test --manifest-path server/Cargo.toml --features test-auth -- --test-threads=1

test-admin:
	cd admin-panel && pnpm test:unit -- --run

test-client:
	cd client && pnpm test:run

test-unit: test-admin

test-e2e:
	cd admin-panel && pnpm --filter admin-shell test:e2e:pw --project=chromium

test-e2e-report:
	cd admin-panel/apps/admin-shell && pnpm test:e2e:pw:report

test-e2e-ui:
	cd admin-panel/apps/admin-shell && pnpm test:e2e:pw:ui

test-all: test test-e2e

docker-up:
	docker compose up -d db redis

docker-up-deps:
	docker compose up -d db redis server admin-panel

docker-up-all:
	docker compose up -d

docker-down:
	docker compose down

docker-down-volume:
	docker compose down -v

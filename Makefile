.PHONY: help dev-full dev-client dev-admin dev-server seed generate-api test-e2e test-unit docker-up docker-up-deps docker-up-all docker-down

help:
	@echo "================================================================="
	@echo "Guest Place - Команды разработки и локального запуска:"
	@echo "================================================================="
	@echo "  make dev-full        - Запуск ВСЕХ 3 проектов локально в dev-режиме (hot reload)"
	@echo "  make dev-client      - Разработка CLIENT: server + admin в Docker, client в dev"
	@echo "  make dev-admin       - Разработка ADMIN: server + DB/Redis в Docker, admin в dev"
	@echo "  make dev-server      - Разработка SERVER: DB/Redis в Docker, Rust cargo watch в dev"
	@echo "-----------------------------------------------------------------"
	@echo "  make docker-up-deps  - Поднять зависимости для клиента (DB + Redis + Server + Admin)"
	@echo "  make docker-up       - Поднять только PostgreSQL и Redis"
	@echo "  make docker-up-all   - Поднять абсолютно всё в Docker"
	@echo "  make docker-down     - Остановить все Docker контейнеры"
	@echo "-----------------------------------------------------------------"
	@echo "  make seed            - Наполнить БД реалистичными фикстурами (50+ пользователей)"
	@echo "  make generate-api    - Экспорт OpenAPI и генерация TypeScript-типов"
	@echo "  make test-e2e        - Запуск headless E2E тестов (Playwright + mock-auth)"
	@echo "  make test-unit       - Запуск unit тестов админ-панели"
	@echo "================================================================="

dev-full:
	node scripts/dev-full.mjs

dev-client:
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

test-e2e:
	cd admin-panel && pnpm --filter admin-shell test:e2e:pw --project=chromium

test-unit:
	cd admin-panel && pnpm test:unit -- --run

docker-up:
	docker compose up -d db redis

docker-up-deps:
	docker compose up -d db redis server admin-panel

docker-up-all:
	docker compose up -d

docker-down:
	docker compose down

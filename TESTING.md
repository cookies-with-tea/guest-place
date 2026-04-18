# Testing Guide: Admin Panel (Vue)

This document describes how to execute and implement tests for the frontend packages and applications.

## Types of Tests

### 1. Unit Tests (Vitest)

Used for testing utility functions, data mappers, and component logic.

**Core Commands**:

- **Run all tests**: `pnpm test:unit`
- **With Coverage**: `pnpm test:coverage`
- **Only Git changes**: `pnpm test:changes`

**Targeted execution**:

- `@admin-panel/lib`: `pnpm -C packages/lib test:unit`
- `@admin-panel/ui`: `pnpm -C packages/ui test:unit`

### 2. Component Tests

Testing Vue components using `@vue/test-utils` and `Vitest`. Ensure you register global plugins (like Element Plus or Pinia) if the component depends on them.

Example setup in tests:

```typescript
const wrapper = mount(MyComponent, {
	global: {
		plugins: [ElementPlus, createTestingPinia()],
	},
})
```

### 3. E2E Tests (Cypress)

Testing full user flows in the browser.

**Run command**:

```bash
pnpm test:e2e
```

## Configuration

- **Vitest Config**: Centralized block in `@admin-panel/lib/vite/config.ts`.
- **Environment**: All tests run in `jsdom`.

## Coverage Goal

Each package aims for **80% coverage**.

- `@admin-panel/lib`: ~94% (Current)
- `@admin-panel/ui`: 100% (Current)

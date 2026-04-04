# TODO: Phase 1 - Dynamic Orchestration & Discovery

This list tracks the implementation of a dynamic micro-frontend loading system.

## 1. Discovery Infrastructure
- [x] Define `manifest.json` schema (URL, scope, module, metadata) <!-- id: p1_0 -->
- [x] Create a mock `manifest.json` in `admin-shell` for development <!-- id: p1_1 -->

## 2. Shell Refactoring (Runtime Loading)
- [x] Create `@admin-panel/lib/orchestrator` package or utility <!-- id: p1_2 -->
- [x] Implement `loadRemoteModule` using Vite Module Federation runtime API <!-- id: p1_3 -->
- [x] Update `admin-shell/main.ts` to fetch manifest before app mount <!-- id: p1_4 -->
- [x] Dynamically inject routes into the router after remotes are loaded <!-- id: p1_5 -->

## 3. Shared State & Communication
- [x] Implement `useSharedStore` helper for cross-MF Pinia access <!-- id: p1_6 -->
- [x] Standardize `LifecycleHooks` (onMount, onUnmount) in the base config <!-- id: p1_7 -->

## 4. Automation & DX
- [x] Update `scripts/create-mf` to support manifestation-ready MFs <!-- id: p1_8 -->
- [x] Create a simple "MF Monitor" page in the shell to show loaded remotes <!-- id: p1_9 -->

## 5. Verification
- [x] Verify that adding a new entry to `manifest.json` adds a new menu item/route without rebuilding the shell <!-- id: p1_10 -->

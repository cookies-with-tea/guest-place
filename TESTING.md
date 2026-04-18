# Testing Guide: Server (Rust)

This document describes how to execute and implement tests for the Rust backend.

## Types of Tests

### 1. Unit Tests

Located within the source files (`src/**/*.rs`) in `#[cfg(test)]` modules. These test individual functions and logic.

**Run command**:

```bash
cargo test
```

### 2. Integration Tests

Located in the `tests/` directory. These tests spin up a mock server using `axum-test` and verify API endpoints.

**Available Tests**:

- `auth_test`: Login and registration flows.
- `i18n_test`: Dictionary management (CRUD).
- `mfe_test`: Microfrontend manifest generation.

**Run command**:

```bash
cargo test --test <test_name>
```

## Auth Bypass (Testing Feature)

For integration tests, a special mechanism is implemented to bypass database-backed token validation.

To authorize a request in tests without a real token, add the following header:
`Authorization: TestBearer`

Example using `axum-test`:

```rust
let response = server.get("/api/v1/protected")
    .add_header("Authorization", "TestBearer")
    .await;
```

## Database

Integration tests connect to the database specified in your `.env` file (usually `pg://admin:admin@localhost/admin`). Ensure your local Postgres is running.

## Coverage

To check coverage, it is recommended to use `cargo-llvm-cov` which is more reliable across platforms (including Windows).

**Installation**:
```bash
cargo install cargo-llvm-cov
```

**Run command**:
```bash
cargo llvm-cov
```

To generate an HTML report:
```bash
cargo llvm-cov --html
```

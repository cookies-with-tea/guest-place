## Backend for Guest Place

### Для запуска потребуется

- Клонировать репозиторий

```bash
git clone https://github.com/cookies-with-tea/guest-place -b server server
```

- Скопировать `.env`

```bash
cp .env.example .env
```

- Заполнить `.env`
- Запустить контейнеры

### Для работы

```bash
docker-compose up -d --build
```

### Для локальной разработки

- Изменить POSTGRES_HOST = `localhost`

```bash
docker-compose up db -d --build
docker-compose up db redis -d --build
```

<hr />

### Подсказки, чтобы не забыть

**run new migration**

```bash
sqlx migrate run --database-url postgresql://admin:admin@localhost:5432/admin
```

**fix postgres with sqlx** - add postgres to features

```bash
cargo add sqlx -F postgres
```

**add new migration**

```bash
cargo install sqlx-cli
sqlx migrate add -r <name>
```

**hot reload**

```bash
cargo install cargo-watch
cargo watch -x run
```

**additional**

```bash
rustup toolchain install stable-x86_64-pc-windows-gnu
rustup default stable-x86_64-pc-windows-gnu
# download visual studio
```

** kill specific port **

```bash
netstat -ano | findstr :<PORT_NUMBER>
taskkill /F /PID <PID>
```

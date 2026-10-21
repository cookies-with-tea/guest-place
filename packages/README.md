# Общие конфигурации проекта

Этот проект использует централизованные конфигурации для TypeScript и Stylelint, расположенные в папке `/packages`, а также общие конфигурации Oxlint (`.oxlintrc.json`) и Oxfmt (`.oxfmtrc.json`) в корне проекта.

## Структура конфигураций

```
packages/
├── stylelint-config/       # Общая конфигурация Stylelint
└── typescript-config/      # Общие конфигурации TypeScript
```

## Использование

### Oxlint & Oxfmt

Линтинг и форматирование кода используют [Oxlint](https://oxc.rs/docs/learn/how-to-use/linter.html) и [Oxfmt](https://oxc.rs/). Конфигурации задаются в корне репозитория:

- `.oxlintrc.json`
- `.oxfmtrc.json`

### Stylelint

В каждом приложении создайте файл `stylelint.config.mjs`:

```javascript
import config from '@admin-panel/stylelint-config'

export default config
```

### TypeScript

Используйте соответствующие конфигурации из пакета `@admin-panel/typescript-config`:

- `@admin-panel/typescript-config/base` - базовая конфигурация
- `@admin-panel/typescript-config/vue` - для Vue приложений
- `@admin-panel/typescript-config/node` - для Node.js файлов (vite.config.ts и т.д.)
- `@admin-panel/typescript-config/vitest` - для тестов

Пример `tsconfig.app.json`:

```json
{
	"extends": "@admin-panel/typescript-config/vue",
	"include": ["src/**/*", "src/**/*.vue"],
	"exclude": ["src/**/__tests__/*", "node_modules"],
	"compilerOptions": {
		"tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo"
	}
}
```

## Обновление конфигураций

При изменении правил в пакетах конфигураций:

1. Внесите изменения в соответствующий пакет в `/packages`
2. Запустите `pnpm install` для обновления зависимостей
3. Все проекты автоматически получат новые правила

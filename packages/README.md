# Общие конфигурации проекта

Этот проект использует централизованные конфигурации для ESLint, TypeScript, Stylelint и Prettier, расположенные в папке `/packages`.

## Структура конфигураций

```
packages/
├── eslint-config/          # Общая конфигурация ESLint
├── prettier-config/        # Общая конфигурация Prettier
├── stylelint-config/       # Общая конфигурация Stylelint
└── typescript-config/      # Общие конфигурации TypeScript
```

## Использование

### ESLint

В каждом приложении/пакете создайте файл `eslint.config.mjs`:

```javascript
import config from '@admin-panel/eslint-config'

export default config
```

### Prettier

В каждом приложении/пакете создайте файл `.prettierrc`:

```
"@admin-panel/prettier-config"
```

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

## Преимущества

1. **Единообразие** - все проекты используют одинаковые правила
2. **Централизованное управление** - изменения в одном месте применяются везде
3. **Упрощение настройки** - новые проекты легко подключаются к существующим правилам
4. **Совместимость** - все инструменты работают согласованно

## Обновление конфигураций

При изменении правил в пакетах конфигураций:

1. Внесите изменения в соответствующий пакет в `/packages`
2. Запустите `pnpm install` для обновления зависимостей
3. Все проекты автоматически получат новые правила

## Тестирование

Для проверки работы конфигураций:

```bash
# ESLint
pnpm eslint

# Stylelint
pnpm stylelint

# Prettier
pnpm prettier --check .

# TypeScript
pnpm type-check
```

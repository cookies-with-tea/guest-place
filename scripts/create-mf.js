import pkg from 'enquirer'
import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

const { Input, Select } = pkg

async function main() {
	try {
		// Step 1: Prompt for microfrontend name
		const namePrompt = new Input({
			message: 'Введите имя нового микрофронтенда (например, admin-new-feature):',
			validate: (value) => {
				if (!value.trim()) return 'Имя не может быть пустым'
				if (!/^admin-/.test(value)) return 'Имя должно начинаться с "admin-"'
				if (!/^[a-z0-9-]+$/.test(value)) return 'Имя может содержать только строчные буквы, цифры и дефисы'
				return true
			},
		})

		const name = await namePrompt.run()

		// Step 2: Prompt for display name
		const displayNamePrompt = new Input({
			message: 'Введите отображаемое имя (например, "Новая Функция"):',
			initial: name.replace(/^admin-/, '').replace(/-([a-z])/g, (_, letter) => letter.toUpperCase()),
		})

		const displayName = await displayNamePrompt.run()

		// Step 3: Prompt for port numbers
		const devPortPrompt = new Input({
			message: 'Введите порт для режима разработки (например, 4176):',
			initial: '4176',
			validate: (value) => {
				const port = parseInt(value)
				if (isNaN(port)) return 'Порт должен быть числом'
				if (port < 1024 || port > 65535) return 'Порт должен быть в диапазоне 1024-65535'
				return true
			},
		})

		const previewPortPrompt = new Input({
			message: 'Введите порт для режима preview (например, 3003):',
			initial: '3003',
			validate: (value) => {
				const port = parseInt(value)
				if (isNaN(port)) return 'Порт должен быть числом'
				if (port < 1024 || port > 65535) return 'Порт должен быть в диапазоне 1024-65535'
				return true
			},
		})

		const devPort = await devPortPrompt.run()
		const previewPort = await previewPortPrompt.run()

		// Step 4: Confirm creation
		const confirmPrompt = new Select({
			message: `Создать микрофронтенд "${name}" с портами ${devPort} (dev) и ${previewPort} (preview)?`,
			choices: ['Да', 'Нет'],
		})

		const confirm = await confirmPrompt.run()
		if (confirm === 'Нет') {
			console.log('❌ Создание отменено')
			process.exit(0)
		}

		// Step 5: Create directory structure
		const appDir = path.join(process.cwd(), 'apps', name)
		if (fs.existsSync(appDir)) {
			console.error(`❌ Директория ${appDir} уже существует`)
			process.exit(1)
		}

		fs.mkdirSync(appDir, { recursive: true })
		fs.mkdirSync(path.join(appDir, 'src'), { recursive: true })
		fs.mkdirSync(path.join(appDir, 'src/app'), { recursive: true })
		fs.mkdirSync(path.join(appDir, 'src/app/router'), { recursive: true })
		fs.mkdirSync(path.join(appDir, 'src/app/assets'), { recursive: true })
		fs.mkdirSync(path.join(appDir, 'src/app/assets/styles'), { recursive: true })
		fs.mkdirSync(path.join(appDir, 'src/pages'), { recursive: true })
		fs.mkdirSync(path.join(appDir, 'src/widgets'), { recursive: true })
		fs.mkdirSync(path.join(appDir, 'src/features'), { recursive: true })
		fs.mkdirSync(path.join(appDir, 'src/entities'), { recursive: true })
		fs.mkdirSync(path.join(appDir, 'src/shared'), { recursive: true })

		// Step 6: Create package.json
		const packageJson = {
			name: name,
			private: true,
			version: '0.0.0',
			type: 'module',
			scripts: {
				dev: `vite --port ${devPort}`,
				build: 'vue-tsc -b && vite build',
				preview: `vite preview --port ${previewPort}`,
				'test:unit': 'vitest',
				'test:e2e': `start-server-and-test 'vite dev --port ${devPort}' http://localhost:${devPort} 'cypress run --e2e'`,
				'test:e2e:dev': `start-server-and-test 'vite dev --port ${devPort}' http://localhost:${devPort} 'cypress open --e2e'`,
				eslint: 'eslint . --ext .ts,.js,.vue',
				'eslint:fix': 'eslint . --ext .ts,.js,.vue --fix',
				stylelint: 'stylelint "**/*.{vue,css,scss,postcss}"',
				'stylelint:fix': 'stylelint "**/*.{vue,css,scss,postcss}" --fix',
				prettier: 'prettier --check .',
				'prettier:fix': 'prettier --write .',
				lint: 'pnpm eslint && pnpm stylelint && pnpm prettier',
				'lint:fix': 'pnpm eslint:fix && pnpm stylelint:fix && pnpm prettier:fix',
			},
			dependencies: {
				'@admin-panel/ui': 'workspace:*',
				'@admin-panel/utils': 'workspace:*',
				vue: '^3.5.22',
				'vue-router': '^4.5.1',
			},
			devDependencies: {
				'@admin-panel/eslint-config': 'workspace:*',
				'@admin-panel/prettier-config': 'workspace:*',
				'@admin-panel/stylelint-config': 'workspace:*',
				'@admin-panel/typescript-config': 'workspace:*',
				'@types/node': '^24.6.0',
				'@vitejs/plugin-vue': '^6.0.1',
				typescript: '~5.9.3',
				vite: '^7.1.7',
				'vue-tsc': '^3.1.0',
			},
		}

		fs.writeFileSync(path.join(appDir, 'package.json'), JSON.stringify(packageJson, null, 2) + '\n')

		// Step 7: Create vite.config.ts
		const viteConfig = `import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import federation from '@originjs/vite-plugin-federation'
import { fileURLToPath } from 'node:url'

export default defineConfig({
	plugins: [
		vue(),
		federation({
			name: '${name.replace(/^admin-/, '')}',
			filename: 'remoteEntry.js',
			exposes: {
				'./${displayName.replace(/\s+/g, '')}Routes': './src/app/router/index.ts',
			},
			shared: ['vue', 'vue-router'],
		}),
	],
	resolve: {
		alias: {
			'@': fileURLToPath(new URL('./src', import.meta.url)),
			'#app': fileURLToPath(new URL('./src/app', import.meta.url)),
			'#pages': fileURLToPath(new URL('./src/pages', import.meta.url)),
			'#widgets': fileURLToPath(new URL('./src/widgets', import.meta.url)),
			'#features': fileURLToPath(new URL('./src/features', import.meta.url)),
			'#entities': fileURLToPath(new URL('./src/entities', import.meta.url)),
			'#shared': fileURLToPath(new URL('./src/shared', import.meta.url)),
			styles: fileURLToPath(new URL('./src/app/assets/styles', import.meta.url)),
		},
	},
	build: {
		target: 'esnext',
		minify: false,
		cssCodeSplit: false,
	},
	server: {
		port: ${previewPort},
		cors: true,
	},
})
`

		fs.writeFileSync(path.join(appDir, 'vite.config.ts'), viteConfig)

		// Step 8: Create index.html
		const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8" />
	<link rel="icon" href="/favicon.ico" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<title>${displayName}</title>
</head>
<body>
	<div id="app"></div>
	<script type="module" src="/src/main.ts"></script>
</body>
</html>
`

		fs.writeFileSync(path.join(appDir, 'index.html'), indexHtml)

		// Step 9: Create main.ts
		const mainTs = `import { createApp } from 'vue'
import App from '#app/App.vue'
import router from '#app/router'

const app = createApp(App)

app.use(router)

app.mount('#app')
`

		fs.writeFileSync(path.join(appDir, 'src/main.ts'), mainTs)

		// Step 10: Create App.vue
		const appVue = `<template>
	<div>
		<h1>${displayName}</h1>
		<router-view />
	</div>
</template>

<script setup lang="ts">
// Your component logic here
</script>

<style scoped>
/* Your styles here */
</style>
`

		fs.writeFileSync(path.join(appDir, 'src/app/App.vue'), appVue)

		// Step 11: Create router/index.ts
		const routerTs = `import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { ROUTES } from '@admin-panel/lib'

const routes: RouteRecordRaw[] = [
	{
		path: '/',
		component: () => import('#pages/IndexPage.vue'),
	},
]

const router = createRouter({
	history: createWebHistory('/${name.replace(/^admin-/, '')}/'),
	routes,
})

export default router
`

		fs.writeFileSync(path.join(appDir, 'src/app/router/index.ts'), routerTs)

		// Step 12: Create IndexPage.vue
		const indexPageVue = `<template>
	<div>
		<h2>Welcome to ${displayName}</h2>
		<p>This is the main page of the ${name} microfrontend.</p>
	</div>
</template>

<script setup lang="ts">
// Page logic here
</script>

<style scoped>
/* Page styles here */
</style>
`

		fs.writeFileSync(path.join(appDir, 'src/pages/IndexPage.vue'), indexPageVue)

		// Step 13: Create .editorconfig
		fs.writeFileSync(
			path.join(appDir, '.editorconfig'),
			'root = true\n\n[*]\nindent_style = space\nindent_size = 2\nend_of_line = lf\ncharset = utf-8\ntrim_trailing_whitespace = true\ninsert_final_newline = true\n\n[*.{md,markdown}]\ntrim_trailing_whitespace = false\n'
		)

		// Step 14: Create .prettierrc
		fs.writeFileSync(path.join(appDir, '.prettierrc'), '{\n\t"extends": "@admin-panel/prettier-config"\n}\n')

		// Step 15: Create env.d.ts
		fs.writeFileSync(
			path.join(appDir, 'env.d.ts'),
			`/// <reference types="vite/client" />\n\ndeclare module '*.vue' {\n\timport type { DefineComponent } from 'vue'\n\texport default DefineComponent\n}\n`
		)

		// Step 16: Create TypeScript config files
		fs.writeFileSync(
			path.join(appDir, 'tsconfig.json'),
			'{\n\t"extends": "@admin-panel/typescript-config",\n\t"compilerOptions": {\n\t\t"composite": true,\n\t\t"baseUrl": ".",\n\t\t"paths": {\n\t\t\t"@/*\": ["./src/*"],\n\t\t\t"#app/*\": ["./src/app/*"],\n\t\t\t"#pages/*\": ["./src/pages/*"],\n\t\t\t"#widgets/*\": ["./src/widgets/*"],\n\t\t\t"#features/*\": ["./src/features/*"],\n\t\t\t"#entities/*\": ["./src/entities/*"],\n\t\t\t"#shared/*\": ["./src/shared/*"]\n\t\t}\n\t},\n\t"include": ["src/**/*.ts", "src/**/*.d.ts", "src/**/*.tsx", "src/**/*.vue"],\n\t"exclude": ["node_modules", "dist"]\n}\n'
		)

		fs.writeFileSync(
			path.join(appDir, 'tsconfig.app.json'),
			'{\n\t"extends": "./tsconfig.json",\n\t"compilerOptions": {\n\t\t"noEmit": true,\n\t\t"isolatedModules": false\n\t},\n\t"include": ["env.d.ts", "src/**/*.ts", "src/**/*.d.ts", "src/**/*.tsx", "src/**/*.vue"]\n}\n'
		)

		fs.writeFileSync(
			path.join(appDir, 'tsconfig.node.json'),
			'{\n\t"extends": "./tsconfig.json",\n\t"compilerOptions": {\n\t\t"composite": true,\n\t\t"module": "ESNext",\n\t\t"moduleResolution": "Node",\n\t\t"noEmit": true\n\t},\n\t"include": ["vite.config.ts", "scripts/**/*.ts"]\n}\n'
		)

		fs.writeFileSync(
			path.join(appDir, 'tsconfig.vitest.json'),
			'{\n\t"extends": "./tsconfig.json",\n\t"compilerOptions": {\n\t\t"types": ["vite/client", "jsdom", "@vitest/browser"]\n\t},\n\t"test": {\n\t\t"environment": "jsdom"\n\t}\n}\n'
		)

		// Step 18: Create ESLint config
		fs.writeFileSync(
			path.join(appDir, 'eslint.config.mjs'),
			`import { createConfig } from '@admin-panel/eslint-config'\n\nexport default createConfig()\n`
		)

		// Step 19: Create Stylelint config
		fs.writeFileSync(
			path.join(appDir, 'stylelint.config.mjs'),
			`import { createConfig } from '@admin-panel/stylelint-config'\n\nexport default createConfig()\n`
		)

		// Step 19: Install dependencies
		console.log('📦 Установка зависимостей...')
		execSync(`pnpm install`, {
			cwd: appDir,
			stdio: 'inherit',
		})

		// Step 20: Success message
		console.log(`\n✅ Микрофронтенд "${name}" успешно создан!`)
		console.log(`\nЧтобы начать разработку, выполните:\n`)
		console.log(`  cd apps/${name}`)
		console.log(`  pnpm dev\n`)
		console.log(`\nЧтобы добавить микрофронтенд в общую сборку, обновите скрипты в корневом package.json:\n`)
		console.log(`  preview:mf: добавьте "--filter=./apps/${name}"`)
		console.log(`  dev:mf: добавьте "--filter=./apps/${name}" (если нужно)\n`)
	} catch (error) {
		console.error('❌ Ошибка при создании микрофронтенда:', error.message || error)
		process.exit(1)
	}
}

main()

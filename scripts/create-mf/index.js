import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import { getMfParams } from './lib/prompts.js'
import { getNextPorts, updatePortsFile } from './lib/ports.js'
import { getRoutesData, updateRoutesFile } from './lib/routes.js'
import * as templates from './templates/index.js'

async function main() {
	try {
		const { nextDevPort, nextPreviewPort, portsFilePath, portsContent } = getNextPorts()
		const { routesFilePath, routesContent } = getRoutesData()

		console.log(`🔍 Next ports: dev ${nextDevPort}, preview ${nextPreviewPort}`)

		const params = await getMfParams(nextDevPort, nextPreviewPort)
		if (!params.confirm) {
			console.log('❌ Создание отменено')
			return
		}

		const { name, displayName, devPort, previewPort } = params
		const mfName = name.replace(/^admin-/, '')

		// Update ports.ts
		updatePortsFile(portsFilePath, portsContent, name, devPort, previewPort)
		console.log('✅ Updated ports.ts')

		// Update routes.ts
		updateRoutesFile(routesFilePath, routesContent, name)
		console.log('✅ Updated routes.ts')

		// Create directories
		const appDir = path.join(process.cwd(), 'apps', name)
		if (fs.existsSync(appDir)) {
			throw new Error(`Directory ${appDir} already exists`)
		}

		const dirs = [
			'src/app/router',
			'src/app/assets/styles',
			'src/app/layouts',
			`src/pages/${mfName}-page/ui/components`,
			'src/entities',
			'src/features',
			'src/shared',
		]

		dirs.forEach((dir) => fs.mkdirSync(path.join(appDir, dir), { recursive: true }))
		console.log('✅ Created directory structure')

		// Write files
		const writeFile = (file, content) => {
			fs.writeFileSync(
				path.join(appDir, file),
				typeof content === 'string' ? content : JSON.stringify(content, null, 2) + '\n'
			)
		}

		writeFile('package.json', templates.getPackageJson(name))
		writeFile('vite.config.ts', templates.getViteConfig(name, displayName))
		writeFile('index.html', templates.getIndexHtml(name, displayName))
		writeFile('src/main.ts', templates.getMainTs(name))
		writeFile('src/app/index.ts', templates.getAppIndex())
		writeFile('src/app/App.vue', templates.getAppVue())
		writeFile('src/app/router/index.ts', templates.getRouter(name))

		const componentName =
			mfName
				.split('-')
				.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
				.join('') + 'Page'
		writeFile(`src/pages/${mfName}-page/ui/${componentName}.vue`, templates.getPageVue(name, displayName))
		writeFile(`src/pages/${mfName}-page/index.ts`, templates.getPageIndex(name))

		writeFile('tsconfig.json', templates.getTsConfig())
		writeFile('tsconfig.app.json', templates.getTsConfigApp())
		writeFile('tsconfig.node.json', templates.getTsConfigNode())

		writeFile(
			'.editorconfig',
			'root = true\n\n[*]\nindent_style = space\nindent_size = 2\nend_of_line = lf\ncharset = utf-8\ntrim_trailing_whitespace = true\ninsert_final_newline = true\n'
		)
		writeFile('.prettierrc', { extends: '@admin-panel/prettier-config' })
		writeFile(
			'env.d.ts',
			`/// <reference types="vite/client" />\n\ndeclare module '*.vue' {\n  import type { DefineComponent } from 'vue'\n  export default DefineComponent\n}\n`
		)
		writeFile(
			'eslint.config.mjs',
			`import { createConfig } from '@admin-panel/eslint-config'\n\nexport default createConfig()\n`
		)
		writeFile(
			'stylelint.config.mjs',
			`import { createConfig } from '@admin-panel/stylelint-config'\n\nexport default createConfig()\n`
		)

		console.log('✅ Files created successfully')

		console.log('📦 Installing dependencies...')
		execSync('pnpm install', { cwd: appDir, stdio: 'inherit' })

		console.log(`\n✅ Micro-frontend "${name}" created successfully!`)
		console.log(`\nTo start development:\n  cd apps/${name}\n  pnpm dev:project -> ${name}\n`)
		console.log(`App will be available at port: ${devPort}`)
		console.log(`Preview will be available at port: ${previewPort}`)
	} catch (error) {
		console.error('❌ Error:', error.message)
		process.exit(1)
	}
}

main()

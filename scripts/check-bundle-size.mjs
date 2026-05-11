import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { gzipSizeFromFileSync } from 'gzip-size'
import chalk from 'chalk'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT_DIR = path.resolve(__dirname, '..')
const APPS_DIR = path.resolve(ROOT_DIR, 'apps')

// Define budgets (Gzipped size in bytes for the APP code only, excluding shared libs)
const BUDGETS = {
	'admin-shell': 400 * 1024, // 400kb for shell logic (it's the orchestrator)
	'admin-orchestrator': 250 * 1024, // 250kb
	default: 150 * 1024, // 150kb for MFE logic
}

async function checkBundleSizes() {
	console.log(chalk.cyan('\n📊 Analyzing Bundle Sizes (Gzipped Breakdown)...\n'))

	const apps = fs.readdirSync(APPS_DIR).filter((d) => fs.statSync(path.join(APPS_DIR, d)).isDirectory())
	let hasError = false

	for (const app of apps) {
		const distDir = path.join(APPS_DIR, app, 'dist')
		if (!fs.existsSync(distDir)) continue

		const budget = BUDGETS[app] || BUDGETS.default
		let appSize = 0
		let sharedSize = 0

		const files = getAllFiles(distDir).filter((f) => f.endsWith('.js') || f.endsWith('.css'))

		if (files.length === 0) {
			console.log(`${chalk.gray('○')} ${chalk.bold(app)}: No assets found (check build)`)
			continue
		}

		for (const file of files) {
			const size = gzipSizeFromFileSync(file)
			if (file.includes('__federation_shared_')) {
				sharedSize += size
			} else {
				appSize += size
			}
		}

		const appSizeKb = (appSize / 1024).toFixed(2)
		const sharedSizeKb = (sharedSize / 1024).toFixed(2)
		const budgetKb = (budget / 1024).toFixed(2)

		if (appSize > budget) {
			console.log(
				`${chalk.red('✘')} ${chalk.bold(app)}: ${chalk.red(appSizeKb + 'kb')} (App) + ${chalk.yellow(sharedSizeKb + 'kb')} (Shared) | Budget: ${budgetKb}kb`
			)
			hasError = true
		} else if (appSize > budget * 0.8) {
			console.log(
				`${chalk.yellow('⚠')} ${chalk.bold(app)}: ${chalk.yellow(appSizeKb + 'kb')} (App) + ${chalk.yellow(sharedSizeKb + 'kb')} (Shared) | Budget: ${budgetKb}kb`
			)
		} else {
			console.log(
				`${chalk.green('✔')} ${chalk.bold(app)}: ${chalk.green(appSizeKb + 'kb')} (App) + ${chalk.gray(sharedSizeKb + 'kb')} (Shared) | Budget: ${budgetKb}kb`
			)
		}
	}

	if (hasError) {
		console.log(chalk.red('\nSome application bundles exceeded their performance budget!\n'))
		console.log(
			chalk.gray('Note: "Shared" size represents libraries that are shared across MFEs and deduplicated at runtime.\n')
		)
		process.exit(1)
	} else {
		console.log(chalk.green('\nAll application code is within performance budgets.\n'))
	}
}

function getAllFiles(dirPath, arrayOfFiles) {
	const files = fs.readdirSync(dirPath)

	arrayOfFiles = arrayOfFiles || []

	files.forEach(function (file) {
		if (fs.statSync(dirPath + '/' + file).isDirectory()) {
			arrayOfFiles = getAllFiles(dirPath + '/' + file, arrayOfFiles)
		} else {
			arrayOfFiles.push(path.join(dirPath, '/', file))
		}
	})

	return arrayOfFiles
}

checkBundleSizes().catch((err) => {
	console.error(err)
	process.exit(1)
})

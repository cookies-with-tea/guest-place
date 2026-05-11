import { execSync } from 'node:child_process'
import { existsSync } from 'node:fs'

async function lintChanged() {
	try {
		console.log('🔍 Detecting changed files...')

		// 1. Get unstaged and staged changes (active work)
		let output = execSync('git diff --name-only HEAD', { encoding: 'utf8' })
		let fileList = output
			.split('\n')
			.map((f) => f.trim())
			.filter(Boolean)

		// 2. If no local changes, fall back to branch changes since origin/main
		if (fileList.length === 0) {
			console.log('No local uncommitted changes found, checking changes since origin/main...')
			try {
				const base = execSync('git merge-base origin/main HEAD', { encoding: 'utf8' }).trim()
				output = execSync(`git diff --name-only ${base}`, { encoding: 'utf8' })
				fileList = output
					.split('\n')
					.map((f) => f.trim())
					.filter(Boolean)
			} catch (e) {
				console.warn('Could not detect branch changes.')
			}
		}

		// Filter existing files with supported extensions
		const files = [...new Set(fileList)].filter((f) => f && existsSync(f) && /\.(js|ts|vue|css|scss)$/.test(f))

		if (files.length === 0) {
			console.log('No relevant changed files to lint.')
			return
		}

		console.log(`Linting ${files.length} changed files...`)

		// Separate files by type for different linters
		const scriptFiles = files.filter((f) => /\.(js|ts|vue)$/.test(f))
		const styleFiles = files.filter((f) => /\.(css|scss|vue)$/.test(f))

		// Batching to avoid E2BIG on Windows
		const BATCH_SIZE = 40

		if (scriptFiles.length > 0) {
			console.log(`Running ESLint on ${scriptFiles.length} files...`)
			for (let i = 0; i < scriptFiles.length; i += BATCH_SIZE) {
				const batch = scriptFiles.slice(i, i + BATCH_SIZE)
				execSync(`pnpm exec eslint --fix ${batch.join(' ')}`, { stdio: 'inherit' })
			}
		}

		if (styleFiles.length > 0) {
			console.log(`Running Stylelint on ${styleFiles.length} files...`)
			for (let i = 0; i < styleFiles.length; i += BATCH_SIZE) {
				const batch = styleFiles.slice(i, i + BATCH_SIZE)
				execSync(`pnpm exec stylelint --fix ${batch.join(' ')}`, { stdio: 'inherit' })
			}
		}

		console.log('Done!')
	} catch (err) {
		console.error('Linting failed:', err.message)
		process.exit(1)
	}
}

lintChanged()

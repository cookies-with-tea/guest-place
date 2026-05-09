import pkg from 'enquirer'

import { execSync } from 'child_process'
import path from 'path'

const { Select } = pkg

const command = process.argv[2]

const TURBO_TASKS = ['build', 'dev', 'lint', 'clean', 'typecheck', 'storybook', 'preview-storybook', 'preview']

if (!command) {
	console.error('❌ Specify a command.')

	console.error(`Available commands: ${TURBO_TASKS.join(', ')}`)

	console.error('Example: node scripts/choose-project.js dev')

	process.exit(1)
}

if (!TURBO_TASKS.includes(command)) {
	console.error(`❌ Unknown command: "${command}".`)

	console.error(`Available: ${TURBO_TASKS.join(', ')}`)

	process.exit(1)
}

try {
	const output = execSync('pnpm ls -r --json', { encoding: 'utf8' })
	const packages = JSON.parse(output)

	const appProjects = packages.filter((pkg) => {
		const relativePath = path.relative(process.cwd(), pkg.path)

		return relativePath.startsWith('apps' + path.sep)
	})

	const projectNames = [...new Set(appProjects.map((pkg) => pkg.name))].sort()

	if (projectNames.length === 0) {
		console.error('❌ No projects found in apps/ folder')

		process.exit(1)
	}

	const prompt = new Select({
		name: 'project',
		message: `Select a project to run "${command}":`,
		choices: projectNames,
	})

	prompt
		.run()
		.then((projectName) => {
			console.log(`\n🚀 Starting "${command}" for: ${projectName}`)

			let turboCmd = `pnpm turbo run ${command} --filter=${projectName}`

			execSync(turboCmd, {
				stdio: 'inherit',
			})
		})
		.catch((err) => {
			if (err.isCanceled) {
				console.log('\n🚫 Selection cancelled.')
			} else {
				console.error('\n❌ Error:', err.message)
			}

			process.exit(1)
		})
} catch (e) {
	console.error('❌ Failed to get project list:', e.message || e)

	process.exit(1)
}

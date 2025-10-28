import pkg from 'enquirer'

import { execSync } from 'child_process'
import path from 'path'

const { Select } = pkg

const command = process.argv[2]

const TURBO_TASKS = ['build', 'dev', 'lint', 'clean', 'typecheck', 'storybook', 'preview-storybook']

if (!command) {
	console.error('❌ Укажите команду.')

	console.error(`Допустимые команды: ${TURBO_TASKS.join(', ')}`)

	console.error('Пример: node scripts/choose-project.js dev')

	process.exit(1)
}

if (!TURBO_TASKS.includes(command)) {
	console.error(`❌ Неизвестная команда: "${command}".`)

	console.error(`Допустимые: ${TURBO_TASKS.join(', ')}`)

	process.exit(1)
}

try {
	// Получаем список всех workspace-пакетов
	const output = execSync('pnpm ls -r --json', { encoding: 'utf8' })
	const packages = JSON.parse(output)

	// Фильтруем только apps/
	const appProjects = packages.filter((pkg) => {
		const relativePath = path.relative(process.cwd(), pkg.path)

		return relativePath.startsWith('apps' + path.sep)
	})

	const projectNames = [...new Set(appProjects.map((pkg) => pkg.name))].sort()

	if (projectNames.length === 0) {
		console.error('❌ Не найдено ни одного проекта в папке apps/')

		process.exit(1)
	}

	const prompt = new Select({
		name: 'project',
		message: `Выберите проект для выполнения "${command}":`,
		choices: projectNames,
	})

	prompt
		.run()
		.then((projectName) => {
			console.log(`\n🚀 Запуск "${command}" для: ${projectName}`)

			let turboCmd = `pnpm turbo run ${command} --filter=${projectName}`

			// Для dev не нужен --parallel при фильтрации одного проекта
			// (оставим как есть — turbo сам решит)

			execSync(turboCmd, {
				stdio: 'inherit',
			})
		})
		.catch((err) => {
			if (err.isCanceled) {
				console.log('\n🚫 Выбор отменён.')
			} else {
				console.error('\n❌ Ошибка:', err.message)
			}

			process.exit(1)
		})
} catch (e) {
	console.error('❌ Не удалось получить список проектов:', e.message || e)

	process.exit(1)
}

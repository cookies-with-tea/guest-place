import pkg from 'enquirer'

import { execSync } from 'child_process'
import path from 'path'

const { Select } = pkg

try {
	// Получаем все workspace-пакеты с путями
	const output = execSync('pnpm ls -r --json', { encoding: 'utf8' })
	const packages = JSON.parse(output)

	// Фильтруем только те, что находятся в папке 'packages/'
	const packageProjects = packages.filter((pkg) => {
		// Приводим путь к стандартному виду (для кроссплатформенности)
		const relativePath = path.relative(process.cwd(), pkg.path)

		return relativePath.startsWith('apps' + path.sep)
	})

	const projectNames = [...new Set(packageProjects.map((pkg) => pkg.name))].sort()

	if (projectNames.length === 0) {
		console.error('❌ Не найдено ни одного проекта в папке packages/')

		process.exit(1)
	}

	const prompt = new Select({
		name: 'project',
		message: 'Выберите пакет из packages/ для сборки:',
		choices: projectNames,
	})

	prompt
		.run()
		.then((projectName) => {
			console.log(`\n🏗️  Запуск сборки для: ${projectName}`)

			execSync(`pnpm turbo run build --filter=${projectName}`, {
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
	console.error('❌ Не удалось получить список пакетов:', e.message)

	process.exit(1)
}

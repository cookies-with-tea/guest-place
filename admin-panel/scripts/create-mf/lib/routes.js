import fs from 'fs'
import path from 'path'

export function getRoutesData() {
	const routesFilePath = path.join(process.cwd(), 'packages/lib/src/constants/routes.ts')
	const routesContent = fs.readFileSync(routesFilePath, 'utf8')
	return { routesFilePath, routesContent }
}

export function updateRoutesFile(filePath, content, name) {
	const mfName = name.replace(/^admin-/, '')
	const componentName =
		mfName
			.split('-')
			.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
			.join('') + 'Page'

	const key = mfName.includes('-') ? `'${mfName}'` : mfName
	const newRouteEntry = `,\n  ${key}: {\n    name: '${componentName}',\n    title: 'general.${mfName}',\n  },`

	const updatedContent = content.replace(/(export const ROUTES = \{[\s\S]*?)(\n\}\s*as const)/, (match, p1, p2) => {
		const trimmedP1 = p1.trimEnd()
		if (trimmedP1.endsWith('},')) {
			return `${trimmedP1}\n  ${key}: {\n    name: '${componentName}',\n    title: 'general.${mfName}',\n  },${p2}`
		}
		if (trimmedP1.endsWith('}')) {
			return `${trimmedP1},\n  ${key}: {\n    name: '${componentName}',\n    title: 'general.${mfName}',\n  },${p2}`
		}
		return `${p1}\n  ${key}: {\n    name: '${componentName}',\n    title: 'general.${mfName}',\n  },${p2}`
	})

	fs.writeFileSync(filePath, updatedContent)
}

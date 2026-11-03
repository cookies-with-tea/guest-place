export function getCrudEntityApi(resourceSlug, entitySingular, entityPlural, entityPluralCamel) {
	return `import { createApi } from '@admin-panel/lib'

// Placeholder shape — replace \`name\`/\`description\`/\`status\` with the real fields of this entity.
export interface ${entitySingular}Item {
	id: string
	name: string
	description: string
	status: 'active' | 'inactive'
	createdAt: string
}

export interface Create${entitySingular}DTO {
	name: string
	description?: string
	status?: 'active' | 'inactive'
}

export interface Update${entitySingular}DTO {
	name?: string
	description?: string
	status?: 'active' | 'inactive'
}

const { fetchData } = createApi('${resourceSlug}')

export const ${entityPluralCamel}Api = {
	get${entityPlural}: () => fetchData<${entitySingular}Item[]>(''),

	create${entitySingular}: (payload: Create${entitySingular}DTO) =>
		fetchData<${entitySingular}Item>('', {
			method: 'POST',
			body: payload,
		}),

	update${entitySingular}: (id: string, payload: Update${entitySingular}DTO) =>
		fetchData<${entitySingular}Item>(\`/\${id}\`, {
			method: 'PATCH',
			body: payload,
		}),

	delete${entitySingular}: (id: string) =>
		fetchData(\`/\${id}\`, {
			method: 'DELETE',
		}),
}
`
}

export enum FieldType {
	Text = 'text',
	RichText = 'rich_text',
	Number = 'number',
	Boolean = 'boolean',
	Date = 'date',
	Media = 'media',
	Relation = 'relation',
}

export interface FieldDefinition {
	name: string // Technical key (slug)
	label: string // Display name
	fieldType: FieldType
	required: boolean
	multiple?: boolean
	relationTo?: string
	defaultValue?: any
}

export interface ContentSchema {
	id: string // UUID
	name: string // Display name
	slug: string // Schema identifier
	fields: FieldDefinition[]
	isSingleton?: boolean
	createdAt: string
	updatedAt: string
}

export interface ContentEntry {
	id: string // UUID
	schemaId: string // UUID
	slug: string // Entry slug
	data: Record<string, any>
	status: 'draft' | 'published'
	i18n?: Record<string, any>
	createdAt: string
	updatedAt: string
}

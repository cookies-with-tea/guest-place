export enum FieldType {
	Text = 'text',
	RichText = 'rich_text',
	Number = 'number',
	Boolean = 'boolean',
	Date = 'date',
	Media = 'media',
	Relation = 'relation',
	Repeater = 'repeater',
	Group = 'group',
	Json = 'json',
	Color = 'color',
	Link = 'link',
}

export interface FieldDefinition {
	name: string // Technical key (slug)
	label: string // Display name
	fieldType: FieldType
	required: boolean
	multiple?: boolean
	relationTo?: string
	fields?: FieldDefinition[] // nested fields for repeater and group
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
	status: 'draft' | 'review' | 'published'
	i18n?: Record<string, any>
	publishedAt?: string
	publishedBy?: string
	createdAt: string
	updatedAt: string
}

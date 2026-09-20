import type { Component } from 'vue'

export interface FieldDefinition {
	name: string
	label: string
	fieldType:
		| 'Text'
		| 'RichText'
		| 'Number'
		| 'Boolean'
		| 'Media'
		| 'Date'
		| 'Relation'
		| 'Repeater'
		| 'Group'
		| 'Json'
		| 'Color'
		| 'Link'
		| string
	required?: boolean
	multiple?: boolean
	relationTo?: string
	fields?: FieldDefinition[]
	defaultValue?: any
}

export interface CmsBlockDefinition<T = any> {
	type: string
	name: string
	description?: string
	icon?: string
	category?: 'hero' | 'content' | 'media' | 'cta' | 'interactive' | string
	schema: FieldDefinition[]
	component: Component
	defaultData?: T
}

export interface CmsBlockManifestItem {
	name: string
	slug: string
	description?: string
	icon?: string
	category?: string
	schema: FieldDefinition[]
}

const registry = new Map<string, CmsBlockDefinition>()
const canonicalBlocks: CmsBlockDefinition[] = []

function normalizeKey(str: string): string {
	return (str || '').toLowerCase().replace(/[-_]/g, '')
}

function toSnakeCase(str: string): string {
	return (str || '')
		.replace(/([a-z0-9])([A-Z])/g, '$1_$2')
		.replace(/[-_]+/g, '_')
		.toLowerCase()
}

function toCamelCase(str: string): string {
	return (str || '').toLowerCase().replace(/[-_]([a-z0-9])/g, (_, c) => c.toUpperCase())
}

export function registerCmsBlock(def: CmsBlockDefinition) {
	canonicalBlocks.push(def)
	registry.set(def.type, def)
	registry.set(normalizeKey(def.type), def)
	registry.set(toSnakeCase(def.type), def)
	registry.set(toCamelCase(def.type), def)
}

export function getCmsBlock(type: string): CmsBlockDefinition | undefined {
	if (!type) return undefined
	return (
		registry.get(type) ||
		registry.get(normalizeKey(type)) ||
		registry.get(toSnakeCase(type)) ||
		registry.get(toCamelCase(type))
	)
}

export function getAllCmsBlocks(): CmsBlockDefinition[] {
	return canonicalBlocks
}

export function getCmsBlocksManifest(): CmsBlockManifestItem[] {
	return canonicalBlocks.map(b => ({
		name: b.name,
		slug: b.type,
		description: b.description,
		icon: b.icon || '📦',
		category: b.category || 'content',
		schema: b.schema,
	}))
}

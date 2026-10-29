import { FieldType } from '@admin-panel/lib'

export interface FieldBlock {
	id: string
	label: string
	/** Field name the block is inserted under (wrapped in a Group field) — see `insertBlock`. */
	name: string
	icon: string
	description: string
	fields: Array<{
		name: string
		label: string
		fieldType: FieldType
		required?: boolean
		multiline?: boolean
	}>
}

/** Ready-made sets of fields a schema can insert in one click instead of rebuilding them by
 * hand each time (ROADMAP.md, section 2: "общий SEO-блок сейчас либо копируется вручную в
 * каждую схему, либо не предусмотрен"). Inserted as a copy, wrapped in one Group field — not a
 * live reference back to this list, so editing a schema's own copy never affects another schema. */
export const FIELD_BLOCKS: FieldBlock[] = [
	{
		id: 'seo',
		label: 'SEO',
		name: 'seo',
		icon: '🔍',
		description: 'Meta title, description, OG image',
		fields: [
			{ name: 'metaTitle', label: 'Meta Title', fieldType: FieldType.Text },
			{ name: 'metaDescription', label: 'Meta Description', fieldType: FieldType.Text, multiline: true },
			{ name: 'ogImage', label: 'OG Image', fieldType: FieldType.Media },
		],
	},
]

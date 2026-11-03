import { FieldType } from '@admin-panel/lib'

export function getDefaultValue(type: FieldType) {
	switch (type) {
		case FieldType.Boolean:
			return false
		case FieldType.Number:
			return 0
		case FieldType.Media:
			return null
		case FieldType.Repeater:
			return []
		case FieldType.Group:
			return {}
		default:
			return ''
	}
}

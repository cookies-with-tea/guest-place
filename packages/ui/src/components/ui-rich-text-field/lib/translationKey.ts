import { createApi } from '@admin-panel/lib'
import { useI18n } from '@admin-panel/i18n'
import { ElMessage } from 'element-plus'

const escapeRegExp = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/**
 * Suggests the next free `<namespace>.<fieldPath>.<counter>` key name by scanning
 * `existingContent` (the field's current tag-format text or editor HTML — both
 * contain the key as a plain substring) for the highest counter already used
 * under that prefix.
 */
export function suggestTranslationKey(existingContent: string, namespace: string, fieldPath: string): string {
	const prefix = `${namespace}.${fieldPath}`
	const regex = new RegExp(`${escapeRegExp(prefix)}\\.(\\d+)`, 'g')

	let max = 0
	let match: RegExpExecArray | null

	while ((match = regex.exec(existingContent)) !== null) {
		max = Math.max(max, parseInt(match[1], 10))
	}

	return `${prefix}.${max + 1}`
}

/**
 * Creates/updates the i18n key via the same upsert endpoint admin-translations uses.
 * The mark is already applied locally by the time this runs (see useRichTextEditor /
 * useSimpleRichTextField), so a failure here only means the key doesn't exist in
 * i18n_translations yet — surfaced to the content manager instead of thrown, since the
 * caller doesn't await/handle rejections from a toolbar action.
 */
export async function createTranslationKey(key: string, fallback: string, namespace: string): Promise<void> {
	const { fetchData } = createApi('i18n')
	const { currentLocale } = useI18n()

	try {
		await fetchData('', {
			method: 'POST',
			body: {
				key,
				value: fallback,
				namespace,
				locale: currentLocale.value,
			},
		})
	} catch {
		ElMessage.error(`Не удалось создать ключ перевода «${key}» на сервере. Отметка в тексте сохранена локально.`)
	}
}

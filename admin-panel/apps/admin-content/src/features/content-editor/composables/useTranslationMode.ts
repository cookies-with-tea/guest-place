import { computed, reactive, ref } from 'vue'
import type { Ref } from 'vue'

import { contentApi } from '#entities/content'

/** Side-by-side source/target translation editing for a content entry's fields. */
export const useTranslationMode = (
	modelValue: Ref<Record<string, any> | undefined>,
	i18n: Ref<Record<string, any> | undefined>
) => {
	const isTranslationMode = ref(false)
	const languages = ref<any[]>([])
	const sourceLocale = ref('en')
	const targetLocale = ref('ru')

	const fetchLanguages = async () => {
		try {
			const res = await contentApi.getLanguages()

			if (res.data) {
				languages.value = res.data
			}
		} catch {
			console.warn('Failed to fetch languages')
		}
	}

	fetchLanguages()

	const sourceData = computed(() => {
		if (sourceLocale.value === 'en') return modelValue.value

		return i18n.value?.[sourceLocale.value] || {}
	})

	const targetData = computed({
		get: () => {
			return i18n.value?.[targetLocale.value] || {}
		},
		set: (val) => {
			if (!i18n.value) i18n.value = {}

			i18n.value[targetLocale.value] = val
		},
	})

	return reactive({
		isTranslationMode,
		languages,
		sourceLocale,
		targetLocale,
		sourceData,
		targetData,
	})
}

export type TranslationMode = ReturnType<typeof useTranslationMode>

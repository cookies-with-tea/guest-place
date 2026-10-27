import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

import { useEntityLock, type ContentSchema } from '@admin-panel/lib'
import { ElMessage } from 'element-plus'

import { contentApi } from '#entities/content'

interface SaveHooks {
	onSaved?: () => void
	shouldGoBack?: () => boolean
}

/** A single content entry: schema/entry loading, the soft-lock banner state, and save/navigate. */
export const useContentEntry = (schemaIdentifier: string, initialEntryId?: string) => {
	const router = useRouter()

	const entryId = ref<string | undefined>(initialEntryId)
	const isEdit = computed(() => !!entryId.value)
	const schema = ref<ContentSchema | null>(null)
	const formData = reactive<Record<string, any>>({})
	const errors = ref<Record<string, string[]>>({})
	const isSaving = ref(false)
	const entryStatus = ref('draft')
	const i18nData = reactive<Record<string, any>>({})

	const lockEntityId = computed(() => (isEdit.value && entryId.value ? String(entryId.value) : ''))
	const { isLocked, isLockedByOther, lockedByName, forceUnlock } = useEntityLock('entry', lockEntityId)

	const goBack = () => {
		router.push({ name: 'EntriesList', params: { schemaIdentifier } })
	}

	const fetchData = async (onSchemaLoaded?: () => void) => {
		try {
			const schemaRes = await contentApi.getSchemaByIdentifier(schemaIdentifier)

			if (schemaRes.data) {
				schema.value = schemaRes.data

				onSchemaLoaded?.()

				if (isEdit.value && entryId.value) {
					const entryRes = await contentApi.getEntry(entryId.value)

					if (entryRes.data) {
						// Clear and merge to keep reactivity
						Object.keys(formData).forEach((key) => delete formData[key])

						Object.assign(formData, entryRes.data.data)

						entryStatus.value = entryRes.data.status

						if (entryRes.data.i18n) {
							Object.keys(i18nData).forEach((k) => delete i18nData[k])

							Object.assign(i18nData, entryRes.data.i18n)
						}
					}
				}
			}
		} catch (error: any) {
			ElMessage.error(error.messages?.[0] || 'Failed to fetch editor data')
		}
	}

	const onSave = async (seoData: any, hooks?: SaveHooks) => {
		if (!schema.value) return

		if (isLockedByOther.value) {
			ElMessage.warning(`Запись заблокирована пользователем ${lockedByName.value || 'другим администратором'}`)

			return
		}

		isSaving.value = true
		errors.value = {}

		// Merge SEO data into formData
		const finalData = {
			...formData,
			_seo: seoData,
		}

		try {
			const payload = {
				data: finalData,
				status: entryStatus.value,
				i18n: i18nData,
			}

			if (isEdit.value && entryId.value) {
				await contentApi.updateEntry(entryId.value, payload)
				ElMessage.success('Запись сохранена в БД! Изменения применены.')
			} else {
				// Generate a slug for the entry
				const entrySlug = `${schema.value.slug}-entry-${Date.now()}`

				const res = await contentApi.createEntry({
					schema_id: schema.value.id,
					slug: entrySlug,
					...payload,
				})

				ElMessage.success('Запись успешно создана и сохранена!')

				if (res.data?.id) {
					entryId.value = res.data.id

					router.replace({
						name: 'EntryEdit',
						params: { schemaIdentifier: schema.value.slug, id: res.data.id },
					})
				}
			}

			hooks?.onSaved?.()

			if (hooks?.shouldGoBack?.() ?? true) {
				goBack()
			}
		} catch (error: any) {
			errors.value = error.errors || {}
			ElMessage.error(error.messages?.[0] || 'Failed to save entry')
		} finally {
			isSaving.value = false
		}
	}

	return reactive({
		entryId,
		isEdit,
		schema,
		formData,
		errors,
		isSaving,
		entryStatus,
		i18nData,
		isLocked,
		isLockedByOther,
		lockedByName,
		forceUnlock,
		fetchData,
		onSave,
		goBack,
	})
}

export type ContentEntry = ReturnType<typeof useContentEntry>

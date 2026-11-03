import { reactive, ref } from 'vue'

import type { ContentSchema } from '@admin-panel/lib'
import { FieldType } from '@admin-panel/lib'
import { ElMessage } from 'element-plus'

import { contentApi } from '#entities/content'

const SETTINGS_IDENTIFIER = 'global-settings'

/** The `global-settings` singleton CMS schema/entry — an ordinary Schema Builder
 * schema with a reserved slug, not a separate system mechanism (see ContentDocsPage). */
export const useGlobalSettingsEntry = () => {
	const schema = ref<ContentSchema | null>(null)
	const formData = reactive<Record<string, any>>({})
	const errors = ref<Record<string, string[]>>({})
	const isLoading = ref(true)
	const isSaving = ref(false)
	const isInitializing = ref(false)
	const entryId = ref<string | null>(null)

	const fetchData = async () => {
		isLoading.value = true

		try {
			// Suppress global error toast since 404 is an expected state on fresh setup
			const schemaRes = await contentApi.getSchemaByIdentifier(SETTINGS_IDENTIFIER, { silent: true })

			if (schemaRes.data) {
				schema.value = schemaRes.data

				const entriesRes = await contentApi.getEntries(schema.value.id)

				if (entriesRes.data && entriesRes.data.length > 0) {
					const entry = entriesRes.data[0]

					entryId.value = entry.id

					Object.assign(formData, entry.data)
				}
			} else {
				schema.value = null
			}
		} catch (err: any) {
			// 404 means the schema has not been initialized yet — completely normal
			schema.value = null

			if (err.status !== 404 && err.statusCode !== 404) {
				console.error('Failed to fetch global settings schema:', err)
			}
		} finally {
			isLoading.value = false
		}
	}

	const onSave = async () => {
		if (!schema.value) return

		isSaving.value = true
		errors.value = {}

		try {
			const entriesRes = await contentApi.getEntries(schema.value.id)
			const existingEntry = entriesRes.data?.[0]

			if (existingEntry) {
				await contentApi.updateEntry(existingEntry.id, {
					data: formData,
					status: 'published',
				})
				ElMessage.success('Глобальные настройки успешно сохранены')
			} else {
				const createRes = await contentApi.createEntry({
					schema_id: schema.value.id,
					slug: 'global-settings-entry',
					status: 'published',
					data: formData,
				})

				if (createRes.data) {
					entryId.value = createRes.data.id
				}

				ElMessage.success('Глобальные настройки созданы и сохранены')
			}
		} catch (err: any) {
			console.error('Failed to save settings:', err)
			ElMessage.error(err.messages?.[0] || 'Ошибка при сохранении настроек')
		} finally {
			isSaving.value = false
		}
	}

	const createDefaultSchema = async () => {
		isInitializing.value = true

		try {
			const schemaRes = await contentApi.createSchema({
				name: 'Глобальные настройки',
				slug: SETTINGS_IDENTIFIER,
				isSingleton: true,
				fields: [
					{ name: 'site_name', label: 'Название сайта', fieldType: FieldType.Text, required: true },
					{ name: 'tagline', label: 'Слоган проекта', fieldType: FieldType.Text, required: false },
					{ name: 'description', label: 'Описание (SEO Meta)', fieldType: FieldType.RichText, required: false },
					{ name: 'contact_email', label: 'Контактный E-mail', fieldType: FieldType.Text, required: false },
					{ name: 'maintenance_mode', label: 'Режим техобслуживания', fieldType: FieldType.Boolean, required: false },
				],
			})

			if (schemaRes.data) {
				schema.value = schemaRes.data

				// Initialize default initial entry
				const initialData = {
					site_name: 'Guest Place',
					tagline: 'Modern Headless Platform',
					description: '<p>Современная платформа для управления контентом и бронированием.</p>',
					contact_email: 'admin@example.com',
					maintenance_mode: false,
				}

				const entryRes = await contentApi.createEntry({
					schema_id: schemaRes.data.id,
					slug: 'global-settings-entry',
					status: 'published',
					data: initialData,
				})

				if (entryRes.data) {
					entryId.value = entryRes.data.id

					Object.assign(formData, entryRes.data.data)
				}

				ElMessage.success('Схема глобальных настроек успешно инициализирована!')
			}
		} catch (err: any) {
			console.error('Failed to create default settings schema:', err)
			ElMessage.error(err.messages?.[0] || 'Не удалось создать схему настроек')
		} finally {
			isInitializing.value = false
		}
	}

	return reactive({
		schema,
		formData,
		errors,
		isLoading,
		isSaving,
		isInitializing,
		entryId,
		fetchData,
		onSave,
		createDefaultSchema,
	})
}

export type GlobalSettingsEntry = ReturnType<typeof useGlobalSettingsEntry>

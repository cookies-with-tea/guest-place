import { reactive, ref, watch } from 'vue'

import { createApi } from '@admin-panel/lib'
import { ElMessage } from 'element-plus'

interface IPlatformsData {
	title: string
	description: string
	heroGuideUuid?: string | null
	opportunitiesGuideUuid?: string | null
	toolsGuideUuid?: string | null
	opportunities: {
		items: Array<{
			title: string
			icon?: { uuid: string }
			items: string[]
			link: string
			buttonText: string
		}>
	}
	toolsAndServices: {
		title: string
		logo?: { uuid: string }
		items: Array<{
			title: string
			text: string
		}>
	}
}

const { fetchData: apiFetch } = createApi('platforms')

// Section guide UUIDs that trigger an auto-save when changed from the media picker
const GUIDE_UUID_FIELDS = ['heroGuideUuid', 'opportunitiesGuideUuid', 'toolsGuideUuid']

/** The "Platforms" client page content — hero, opportunities, tools & services —
 * plus the auto-save-on-media-pick behavior for each section's preview guide. */
export const usePlatformsData = () => {
	const loading = ref(false)
	const saving = ref(false)

	const form = reactive({
		title: '',
		description: '',
		heroGuideUuid: null as string | null,
		opportunitiesGuideUuid: null as string | null,
		toolsGuideUuid: null as string | null,
		opportunities: [] as any[],
		toolsTitle: '',
		toolsLogoUuid: null as string | null,
		toolsItems: [] as any[],
	})

	const fetchData = async () => {
		loading.value = true

		try {
			const response = await apiFetch<IPlatformsData>('')

			if (response.data) {
				const d = response.data

				form.title = d.title

				form.description = d.description

				form.heroGuideUuid = d.heroGuideUuid || null

				form.opportunitiesGuideUuid = d.opportunitiesGuideUuid || null

				form.toolsGuideUuid = d.toolsGuideUuid || null

				form.opportunities = d.opportunities.items.map((o: any) => ({
					title: o.title,
					iconUuid: o.icon?.uuid || null,
					items: o.items || [],
					link: o.link || '',
					buttonText: o.buttonText || '',
				}))

				form.toolsTitle = d.toolsAndServices?.title || ''

				form.toolsLogoUuid = d.toolsAndServices?.logo?.uuid || null

				form.toolsItems = (d.toolsAndServices?.items || []).map((i: any) => ({
					title: i.title,
					text: i.text,
				}))
			}
		} catch {
			ElMessage.error('Failed to load platforms data')
		} finally {
			loading.value = false
		}
	}

	const handleSave = async () => {
		saving.value = true

		try {
			await apiFetch('', {
				method: 'PUT',
				body: form,
			})

			ElMessage.success('Platforms page updated successfully')

			fetchData()
		} catch {
			ElMessage.error('Failed to save changes')
		} finally {
			saving.value = false
		}
	}

	const autoSave = async () => {
		if (loading.value || saving.value) return

		try {
			await apiFetch('', {
				method: 'PUT',
				body: form,
			})

			fetchData()
		} catch {
			ElMessage.error('Auto-save failed')
		}
	}

	// Watch section guide UUIDs for auto-save
	GUIDE_UUID_FIELDS.forEach((field) => {
		watch(
			() => (form as any)[field],
			(newVal, oldVal) => {
				if (oldVal !== undefined && newVal !== oldVal) {
					autoSave()
				}
			}
		)
	})

	return reactive({
		loading,
		saving,
		form,
		fetchData,
		handleSave,
	})
}

export type PlatformsData = ReturnType<typeof usePlatformsData>
export type PlatformsForm = PlatformsData['form']

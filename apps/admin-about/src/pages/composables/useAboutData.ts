import { reactive, ref, watch } from 'vue'

import { createApi } from '@admin-panel/lib'
import { ElMessage } from 'element-plus'

interface IAboutData {
	title: string
	description: string
	heroGuide?: { url: string }
	opportunitiesGuide?: { url: string }
	leadershipGuide?: { url: string }
	whoWeAreGuide?: { url: string }
	newsGuide?: { url: string }
	heroGuideUuid?: string | null
	opportunitiesGuideUuid?: string | null
	leadershipGuideUuid?: string | null
	whoWeAreGuideUuid?: string | null
	newsGuideUuid?: string | null
	opportunities: {
		items: Array<{
			title: string
			icon?: { uuid: string }
			items: string[]
			link: string
			buttonText: string
		}>
	}
	leadership: {
		title: string
		description: string
		logo?: { uuid: string }
		items: Array<{
			text: string
			icon?: { uuid: string }
		}>
	}
	whoWeAre: Array<{
		title: string
		description: string
		image?: { uuid: string }
	}>
	news: {
		title: string
		items: Array<{
			text: string
			icon?: { uuid: string }
		}>
	}
}

const { fetchData: apiFetch } = createApi('about')

// Section guide UUIDs that trigger an auto-save when changed from the media picker
const GUIDE_UUID_FIELDS = [
	'heroGuideUuid',
	'opportunitiesGuideUuid',
	'leadershipGuideUuid',
	'whoWeAreGuideUuid',
	'newsGuideUuid',
]

/** The "About Platform" page content — hero, opportunities, leadership, who-we-are,
 * news — plus the auto-save-on-media-pick behavior for each section's preview guide. */
export const useAboutData = () => {
	const loading = ref(false)
	const saving = ref(false)

	const form = reactive({
		title: '',
		description: '',
		heroGuideUuid: null as string | null,
		opportunitiesGuideUuid: null as string | null,
		leadershipGuideUuid: null as string | null,
		whoWeAreGuideUuid: null as string | null,
		newsGuideUuid: null as string | null,
		opportunities: [] as any[],
		leadershipTitle: '',
		leadershipDescription: '',
		leadershipLogoUuid: null as string | null,
		leadershipItems: [] as any[],
		whoWeAre: [] as any[],
		newsTitle: '',
		newsItems: [] as any[],
	})

	const fetchData = async () => {
		loading.value = true

		try {
			const response = await apiFetch<IAboutData>('')

			if (response.data) {
				const d = response.data

				form.title = d.title
				form.description = d.description
				form.heroGuideUuid = d.heroGuideUuid || null
				form.opportunitiesGuideUuid = d.opportunitiesGuideUuid || null
				form.leadershipGuideUuid = d.leadershipGuideUuid || null
				form.whoWeAreGuideUuid = d.whoWeAreGuideUuid || null
				form.newsGuideUuid = d.newsGuideUuid || null

				form.opportunities = d.opportunities.items.map((o: any) => ({
					title: o.title,
					iconUuid: o.icon?.uuid || null,
					items: o.items || [],
					link: o.link || '',
					buttonText: o.buttonText || '',
				}))

				form.leadershipTitle = d.leadership.title
				form.leadershipDescription = d.leadership.description
				form.leadershipLogoUuid = d.leadership.logo?.uuid || null

				form.leadershipItems = d.leadership.items.map((i: any) => ({
					text: i.text,
					iconUuid: i.icon?.uuid || null,
				}))

				form.whoWeAre = d.whoWeAre.map((w: any) => ({
					title: w.title,
					description: w.description,
					imageUuid: w.image?.uuid || null,
				}))

				form.newsTitle = d.news.title

				form.newsItems = d.news.items.map((n: any) => ({
					text: n.text,
					iconUuid: n.icon?.uuid || null,
				}))
			}
		} catch {
			ElMessage.error('Failed to load about data')
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

			ElMessage.success('About page updated successfully')

			fetchData() // Refresh to get URLs
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

			// eslint-disable-next-line no-console
			console.log('Section preview auto-saved')

			fetchData() // Refresh to get URLs for the picker
		} catch (error) {
			// eslint-disable-next-line no-console
			console.error('Auto-save failed:', error)
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

	const addItem = (list: any[], defaultVal: any) => {
		list.push(defaultVal)
	}

	const removeItem = (list: any[], index: number) => {
		list.splice(index, 1)
	}

	const addOpportunity = () => {
		form.opportunities.push({ title: '', iconUuid: null, items: [], link: '', buttonText: '' })
	}

	const addWhoWeAreItem = () => {
		form.whoWeAre.push({ title: '', description: '', imageUuid: null })
	}

	return reactive({
		loading,
		saving,
		form,
		fetchData,
		handleSave,
		addItem,
		removeItem,
		addOpportunity,
		addWhoWeAreItem,
	})
}

export type AboutData = ReturnType<typeof useAboutData>
export type AboutForm = AboutData['form']

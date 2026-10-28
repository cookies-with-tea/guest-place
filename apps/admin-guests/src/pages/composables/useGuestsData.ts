import { reactive, ref, watch } from 'vue'

import { createApi } from '@admin-panel/lib'
import { ElMessage } from 'element-plus'

interface IGuestsData {
	title: string
	heroGuideUuid?: string | null
	opportunitiesGuideUuid?: string | null
	interactionCardsGuideUuid?: string | null
	searchPromoGuideUuid?: string | null
	additionalServicesGuideUuid?: string | null
	opportunities: Array<{
		title: string
		iconUuid?: string | null
		items: string[]
		buttonText: string
		link: string
	}>
	interactionCards: Array<{
		title: string
		text: string
		buttonText: string
		link: string
		iconUuid?: string | null
	}>
	searchPromo: {
		title: string
		description: string
	}
	additionalServices: Array<{
		text: string
		iconUuid?: string | null
	}>
}

const { fetchData: apiFetch } = createApi('guests')

// Section guide UUIDs that trigger an auto-save when changed from the media picker
const GUIDE_UUID_FIELDS = [
	'heroGuideUuid',
	'opportunitiesGuideUuid',
	'interactionCardsGuideUuid',
	'searchPromoGuideUuid',
	'additionalServicesGuideUuid',
]

/** The "Guests" client page content — hero, opportunities, interaction cards, search
 * promo, additional services — plus the auto-save-on-media-pick behavior for each
 * section's preview guide. */
export const useGuestsData = () => {
	const loading = ref(false)
	const saving = ref(false)

	const form = reactive({
		title: '',
		heroGuideUuid: null as string | null,
		opportunitiesGuideUuid: null as string | null,
		interactionCardsGuideUuid: null as string | null,
		searchPromoGuideUuid: null as string | null,
		additionalServicesGuideUuid: null as string | null,
		opportunities: [] as any[],
		interactionCards: [] as any[],
		searchPromoTitle: '',
		searchPromoDescription: '',
		additionalServices: [] as any[],
	})

	const fetchData = async () => {
		loading.value = true

		try {
			const response = await apiFetch<IGuestsData>('')

			if (response.data) {
				const d = response.data

				form.title = d.title

				form.heroGuideUuid = d.heroGuideUuid || null

				form.opportunitiesGuideUuid = d.opportunitiesGuideUuid || null

				form.interactionCardsGuideUuid = d.interactionCardsGuideUuid || null

				form.searchPromoGuideUuid = d.searchPromoGuideUuid || null

				form.additionalServicesGuideUuid = d.additionalServicesGuideUuid || null

				form.opportunities = d.opportunities.map((o: any) => ({
					title: o.title,
					iconUuid: o.iconUuid || o.icon?.uuid || null,
					items: o.items || [],
					buttonText: o.buttonText || '',
					link: o.link || '',
				}))

				form.interactionCards = d.interactionCards.map((c: any) => ({
					title: c.title,
					text: c.text,
					buttonText: c.buttonText,
					link: c.link,
					iconUuid: c.iconUuid || c.icon?.uuid || null,
				}))

				form.searchPromoTitle = d.searchPromo?.title || ''

				form.searchPromoDescription = d.searchPromo?.description || ''

				form.additionalServices = d.additionalServices.map((s: any) => ({
					text: s.text,
					iconUuid: s.iconUuid || s.icon?.uuid || null,
				}))
			}
		} catch {
			ElMessage.error('Failed to load guests data')
		} finally {
			loading.value = false
		}
	}

	const buildBody = () => ({
		title: form.title,
		heroGuideUuid: form.heroGuideUuid,
		opportunitiesGuideUuid: form.opportunitiesGuideUuid,
		interactionCardsGuideUuid: form.interactionCardsGuideUuid,
		searchPromoGuideUuid: form.searchPromoGuideUuid,
		additionalServicesGuideUuid: form.additionalServicesGuideUuid,
		opportunities: form.opportunities || [],
		interactionCards: form.interactionCards || [],
		searchPromo: {
			title: form.searchPromoTitle,
			description: form.searchPromoDescription,
		},
		additionalServices: form.additionalServices,
	})

	const handleSave = async () => {
		saving.value = true

		try {
			await apiFetch('', {
				method: 'PUT',
				body: buildBody(),
			})

			ElMessage.success('Guests page updated successfully')

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
				body: buildBody(),
			})

			// eslint-disable-next-line no-console
			console.log('Section preview auto-saved')

			fetchData()
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

	return reactive({
		loading,
		saving,
		form,
		fetchData,
		handleSave,
	})
}

export type GuestsData = ReturnType<typeof useGuestsData>
export type GuestsForm = GuestsData['form']

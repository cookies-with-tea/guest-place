import { reactive, ref } from 'vue'
import { createApi } from '@admin-panel/lib'
import { ElMessage } from 'element-plus'

export interface HomeCategory {
	id?: number
	title: string
	slug: string
	link: string
	iconUuid?: string | null
	sortOrder?: number
}

export interface HomeInteraction {
	id?: number
	stepNumber: number
	title: string
	text: string
	buttonText: string
	link: string
	isAccent: boolean
	sortOrder?: number
}

const { fetchData: apiFetch } = createApi('home')

/**
 * Owns the home page content form (hero, categories, latest/popular venue section settings,
 * interaction steps, banner) plus its load/save and the categories/interactions list editing.
 * `onChange` is called after every mutation so the caller can keep the live-preview iframe in sync.
 */
export function useHomePageForm(onChange: () => void) {
	const loading = ref(false)
	const saving = ref(false)

	const form = reactive({
		title: '',
		subtitle: '',
		heroMapButtonText: '',
		heroListButtonText: '',
		heroGuideUuid: null as string | null,

		categoriesTitle: '',
		categories: [] as HomeCategory[],

		latestSectionTitle: '',
		latestSectionButtonText: '',
		latestSectionButtonLink: '',

		popularSectionTitle: '',
		popularSectionButtonText: '',
		popularSectionButtonLink: '',

		interactionsTitle: '',
		interactions: [] as HomeInteraction[],

		bannerTitle: '',
		bannerText: '',
		bannerGuideUuid: null as string | null,
	})

	async function fetchData() {
		loading.value = true
		try {
			const response = await apiFetch<Record<string, any>>('')
			if (response.data) {
				const d = response.data
				form.title = d.title || ''
				form.subtitle = d.subtitle || ''
				form.heroMapButtonText = d.heroMapButtonText || 'Показать на карте'
				form.heroListButtonText = d.heroListButtonText || 'Показать списком'
				form.heroGuideUuid = d.heroGuideUuid || null

				form.categoriesTitle = d.categoriesTitle || 'Места по категориям'
				form.categories = (d.categories || []).map((c: any) => ({
					id: c.id,
					title: c.title,
					slug: c.slug,
					link: c.link,
					iconUuid: c.iconUuid || c.icon_uuid || null,
					sortOrder: c.sortOrder || c.sort_order || 0,
				}))

				form.latestSectionTitle = d.latestSectionTitle || 'Последние добавленные'
				form.latestSectionButtonText = d.latestSectionButtonText || 'Показать еще'
				form.latestSectionButtonLink = d.latestSectionButtonLink || '/venues'

				form.popularSectionTitle = d.popularSectionTitle || 'Самые популярные'
				form.popularSectionButtonText = d.popularSectionButtonText || 'В каталог'
				form.popularSectionButtonLink = d.popularSectionButtonLink || '/venues'

				form.interactionsTitle = d.interactionsTitle || 'Варианты взаимодействия с GP Platform'
				form.interactions = (d.interactions || []).map((item: any) => ({
					id: item.id,
					stepNumber: item.stepNumber || item.step_number || 1,
					title: item.title,
					text: item.text,
					buttonText: item.buttonText || item.button_text,
					link: item.link,
					isAccent: !!(item.isAccent ?? item.is_accent),
					sortOrder: item.sortOrder || item.sort_order || 0,
				}))

				form.bannerTitle = d.bannerTitle || ''
				form.bannerText = d.bannerText || ''
				form.bannerGuideUuid = d.bannerGuideUuid || null
			}
			onChange()
		} catch (err: any) {
			ElMessage.error(err.message || 'Ошибка загрузки данных главной страницы')
		} finally {
			loading.value = false
		}
	}

	async function handleSave() {
		saving.value = true
		try {
			await apiFetch('', { method: 'PUT', body: form })
			ElMessage.success('Контент главной страницы успешно сохранён!')
			return true
		} catch (err: any) {
			ElMessage.error(err.message || 'Не удалось сохранить изменения')
			return false
		} finally {
			saving.value = false
		}
	}

	function addCategory() {
		form.categories.push({
			title: '',
			slug: '',
			link: '/venues',
			iconUuid: null,
			sortOrder: form.categories.length + 1,
		})
		onChange()
	}

	function removeCategory(idx: number) {
		form.categories.splice(idx, 1)
		onChange()
	}

	function addInteraction() {
		form.interactions.push({
			stepNumber: form.interactions.length + 1,
			title: '',
			text: '',
			buttonText: 'Подробнее',
			link: '/venues',
			isAccent: false,
			sortOrder: form.interactions.length + 1,
		})
		onChange()
	}

	function removeInteraction(idx: number) {
		form.interactions.splice(idx, 1)
		onChange()
	}

	return reactive({
		form,
		loading,
		saving,
		fetchData,
		handleSave,
		addCategory,
		removeCategory,
		addInteraction,
		removeInteraction,
	})
}

export type HomePageForm = ReturnType<typeof useHomePageForm>

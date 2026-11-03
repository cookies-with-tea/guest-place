import { computed, reactive, ref } from 'vue'
import type { Router } from 'vue-router'
import { ElMessage } from 'element-plus'
import { pagesApi, type PageBlock, type PageItem } from '#entities/pages'
import { getStatusLabel } from '../lib/helpers'

/**
 * Owns the page document itself (title, slug, status, blocks, SEO), its CRUD against the API,
 * and the status/slug/navigation helpers the header and settings panel need.
 */
export function usePageDocument(route: { params: Record<string, any> }, router: Router) {
	const isEdit = computed(() => !!route.params.id)
	const pageId = computed(() => (route.params.id as string) || '')

	const saving = ref(false)
	const availableParentPages = ref<PageItem[]>([])

	const pageForm = reactive({
		title: '',
		slug: '',
		status: 'draft',
		published_at: '',
		published_by: '',
		parent_id: null as string | null,
		blocks: [] as PageBlock[],
		seo: {
			title: '',
			description: '',
			og_image: '',
			canonical: '',
			no_index: false,
		},
	})

	async function fetchPage() {
		if (!isEdit.value) return
		try {
			const res = await pagesApi.getPageById(pageId.value, { preview: true })
			if (res.data) {
				// The API client camelCases incoming responses (see @admin-panel/lib's snakeToCamel),
				// so the response shape is publishedAt/publishedBy/parentId, not the snake_case DTO fields.
				const data = res.data as unknown as Record<string, any>
				pageForm.title = data.title || ''
				pageForm.slug = data.slug || ''
				pageForm.status = data.status || 'draft'
				pageForm.published_at = data.publishedAt || ''
				pageForm.published_by = data.publishedBy || ''
				pageForm.parent_id = data.parentId || null
				pageForm.blocks = Array.isArray(data.blocks) ? data.blocks : []
				pageForm.seo = {
					title: data.seo?.title || '',
					description: data.seo?.description || '',
					og_image: data.seo?.ogImage || '',
					canonical: data.seo?.canonical || '',
					no_index: !!data.seo?.noIndex,
				}
			}
		} catch (err: any) {
			ElMessage.error(err.message || 'Ошибка загрузки страницы')
		}
	}

	async function fetchParentPages() {
		try {
			const pagesRes = await pagesApi.getPages()
			if (pagesRes.data) {
				availableParentPages.value = pagesRes.data.filter((p) => p.id !== pageId.value)
			}
		} catch (e) {
			console.warn('Failed to load parent pages:', e)
		}
	}

	async function handleSave() {
		if (!pageForm.title) {
			ElMessage.warning('Введите название страницы')
			return
		}
		if (!pageForm.slug) {
			ElMessage.warning('Введите slug страницы')
			return
		}

		saving.value = true
		try {
			const payload = {
				title: pageForm.title,
				slug: pageForm.slug,
				status: pageForm.status,
				parent_id: pageForm.parent_id || null,
				clear_parent: !pageForm.parent_id,
				published_at:
					pageForm.status === 'published'
						? pageForm.published_at || new Date().toISOString()
						: pageForm.published_at || undefined,
				published_by: pageForm.published_by || undefined,
				blocks: pageForm.blocks,
				seo: pageForm.seo,
			}

			if (isEdit.value) {
				await pagesApi.updatePage(pageId.value, payload)
				ElMessage.success('Страница успешно обновлена')
			} else {
				const res = await pagesApi.createPage(payload)
				ElMessage.success('Страница успешно создана')
				if (res.data?.id) {
					router.replace({ name: 'PageEdit', params: { id: res.data.id } })
				}
			}
		} catch (err: any) {
			ElMessage.error(err.message || 'Ошибка сохранения страницы')
		} finally {
			saving.value = false
		}
	}

	function handleStatusTransition(cmd: string) {
		pageForm.status = cmd
		if (cmd === 'published' && !pageForm.published_at) {
			pageForm.published_at = new Date().toISOString()
		}
		ElMessage.success(`Статус страницы изменён: ${getStatusLabel(cmd)}`)
	}

	function onStatusSelectChange(val: string) {
		if (val === 'published' && !pageForm.published_at) {
			pageForm.published_at = new Date().toISOString()
		}
	}

	function onSlugInput(val: string) {
		pageForm.slug = val.replace(/[^a-zA-Z0-9-_]/g, '').toLowerCase()
	}

	function goBack() {
		router.push({ name: 'PageList' })
	}

	return reactive({
		isEdit,
		pageId,
		saving,
		availableParentPages,
		pageForm,
		fetchPage,
		fetchParentPages,
		handleSave,
		handleStatusTransition,
		onStatusSelectChange,
		onSlugInput,
		goBack,
	})
}

export type PageDocument = ReturnType<typeof usePageDocument>

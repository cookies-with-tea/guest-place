import { reactive, ref } from 'vue'
import type { ContentSchema } from '@admin-panel/lib'
import { getSchemas } from '#entities/content/api'
import { pagesApi, type PageItem } from '#entities/pages'
import { ElMessage, ElMessageBox } from 'element-plus'

/** Owns the raw data behind the page list: block pages and content schemas, loaded together. */
export function usePagesAndSchemas() {
	const pages = ref<PageItem[]>([])
	const schemas = ref<ContentSchema[]>([])
	const loading = ref(false)

	async function fetchData() {
		loading.value = true
		try {
			const [pagesRes, schemasRes] = await Promise.all([
				pagesApi.getPages().catch(() => ({ data: [] })),
				getSchemas().catch(() => ({ data: [] })),
			])
			if (pagesRes?.data) pages.value = pagesRes.data
			if (schemasRes?.data) schemas.value = schemasRes.data
		} catch (err: any) {
			ElMessage.error(err.message || 'Ошибка загрузки страниц')
		} finally {
			loading.value = false
		}
	}

	function countByStatus(st: string): number {
		return pages.value.filter((p) => (p.status || 'draft') === st).length
	}

	function getStatusLabel(st: string): string {
		if (st === 'published') return 'Опубликовано'
		if (st === 'review') return 'На проверке'
		return 'Черновик'
	}

	async function quickSetStatus(item: any, newStatus: string) {
		try {
			await pagesApi.updatePage(item.id, {
				status: newStatus,
				published_at: newStatus === 'published' ? new Date().toISOString() : item.published_at || undefined,
			})
			item.status = newStatus
			if (newStatus === 'published' && !item.published_at) item.published_at = new Date().toISOString()
			ElMessage.success(`Статус изменён: ${getStatusLabel(newStatus)}`)
		} catch (e: any) {
			ElMessage.error(e.message || 'Ошибка обновления статуса')
		}
	}

	async function handleDelete(item: any) {
		try {
			await ElMessageBox.confirm(
				`Вы уверены, что хотите удалить блочную страницу «${item.title}» (/p/${item.slug})?`,
				'Подтверждение удаления',
				{
					confirmButtonText: 'Удалить',
					cancelButtonText: 'Отмена',
					type: 'warning',
				}
			)
			await pagesApi.deletePage(item.id)
			ElMessage.success('Страница удалена')
			fetchData()
		} catch {
			// user cancelled the confirmation
		}
	}

	return reactive({ pages, schemas, loading, fetchData, countByStatus, getStatusLabel, quickSetStatus, handleDelete })
}

export type PagesAndSchemas = ReturnType<typeof usePagesAndSchemas>

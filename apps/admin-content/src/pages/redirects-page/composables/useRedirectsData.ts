import { computed, reactive, ref } from 'vue'

import { ElMessage, ElMessageBox } from 'element-plus'

import { pagesApi, type PageItem } from '#entities/pages'
import { redirectsApi, type RedirectItem } from '#entities/redirects'

/** The redirects table — load/filter rules, the create/edit dialog form, and the
 * per-row activate/test/delete actions. */
export const useRedirectsData = () => {
	const loading = ref(true)
	const redirects = ref<RedirectItem[]>([])
	const pages = ref<PageItem[]>([])

	const searchQuery = ref('')
	const codeFilter = ref<string | number>('all')
	const statusFilter = ref<'all' | 'active' | 'inactive'>('all')

	const isDialogOpen = ref(false)
	const editingId = ref<string | null>(null)

	const form = reactive({
		sourcePath: '',
		targetPath: '',
		statusCode: 301,
		isActive: true,
	})

	const loadRedirects = async () => {
		loading.value = true
		try {
			const res = await redirectsApi.getRedirects()
			redirects.value = res.data || []
		} catch (e: any) {
			ElMessage.error(e.message || 'Ошибка загрузки редиректов')
		} finally {
			loading.value = false
		}
	}

	const loadPages = async () => {
		try {
			const res = await pagesApi.getPages()
			pages.value = res.data || []
		} catch (e) {
			// eslint-disable-next-line no-console
			console.warn('Failed to load pages:', e)
		}
	}

	const filteredRedirects = computed(() => {
		let list = redirects.value

		if (searchQuery.value.trim()) {
			const q = searchQuery.value.trim().toLowerCase()
			list = list.filter((r) => r.sourcePath.toLowerCase().includes(q) || r.targetPath.toLowerCase().includes(q))
		}

		if (codeFilter.value !== 'all') {
			list = list.filter((r) => r.statusCode === Number(codeFilter.value))
		}

		if (statusFilter.value === 'active') {
			list = list.filter((r) => r.isActive)
		} else if (statusFilter.value === 'inactive') {
			list = list.filter((r) => !r.isActive)
		}

		return list
	})

	const normalizeSourcePath = () => {
		if (!form.sourcePath) return
		let p = form.sourcePath.trim()
		if (p.startsWith('/')) {
			p = p.substring(1)
		}
		form.sourcePath = p
	}

	const onSelectPageTarget = (val: string) => {
		if (val) {
			form.targetPath = val
		}
	}

	const copyPath = (text: string) => {
		navigator.clipboard.writeText(text)
		ElMessage.success(`Скопировано: ${text}`)
	}

	const toggleActive = async (row: RedirectItem, val: boolean) => {
		try {
			await redirectsApi.updateRedirect(row.id, { isActive: val })
			ElMessage.success(`Редирект ${val ? 'активирован' : 'отключен'}`)
		} catch (e: any) {
			row.isActive = !val
			ElMessage.error(e.message || 'Ошибка изменения статуса')
		}
	}

	const testRedirect = async (row: RedirectItem) => {
		try {
			const res = await redirectsApi.checkRedirect(row.sourcePath)
			if (res.data?.matched) {
				ElMessage({
					type: 'success',
					message: `Проверка успешна: ${row.sourcePath} → ${res.data.targetPath} (Код: ${res.data.statusCode})`,
					duration: 4000,
				})
				row.hits++
			} else {
				ElMessage.warning(`Редирект для ${row.sourcePath} не найден или отключен.`)
			}
		} catch (e: any) {
			ElMessage.error(e.message || 'Ошибка проверки редиректа')
		}
	}

	const openCreateDialog = () => {
		editingId.value = null
		form.sourcePath = ''
		form.targetPath = ''
		form.statusCode = 301
		form.isActive = true
		isDialogOpen.value = true
	}

	const openEditDialog = (row: RedirectItem) => {
		editingId.value = row.id
		form.sourcePath = row.sourcePath.replace(/^\/+/, '')
		form.targetPath = row.targetPath
		form.statusCode = row.statusCode
		form.isActive = row.isActive
		isDialogOpen.value = true
	}

	const confirmSave = async () => {
		let fullSource = form.sourcePath.trim()
		if (!fullSource.startsWith('/')) {
			fullSource = `/${fullSource}`
		}

		try {
			if (editingId.value) {
				await redirectsApi.updateRedirect(editingId.value, {
					sourcePath: fullSource,
					targetPath: form.targetPath.trim(),
					statusCode: form.statusCode,
					isActive: form.isActive,
				})
				ElMessage.success('Редирект успешно обновлен')
			} else {
				await redirectsApi.createRedirect({
					sourcePath: fullSource,
					targetPath: form.targetPath.trim(),
					statusCode: form.statusCode,
					isActive: form.isActive,
				})
				ElMessage.success('Редирект успешно создан')
			}
			isDialogOpen.value = false
			await loadRedirects()
		} catch (e: any) {
			ElMessage.error(e.message || 'Ошибка сохранения редиректа')
		}
	}

	const confirmDelete = async (row: RedirectItem) => {
		try {
			await ElMessageBox.confirm(`Удалить редирект ${row.sourcePath} → ${row.targetPath}?`, 'Подтверждение', {
				confirmButtonText: 'Удалить',
				cancelButtonText: 'Отмена',
				type: 'warning',
			})
			await redirectsApi.deleteRedirect(row.id)
			ElMessage.success('Редирект удален')
			await loadRedirects()
		} catch {
			// cancelled
		}
	}

	return reactive({
		loading,
		pages,
		searchQuery,
		codeFilter,
		statusFilter,
		isDialogOpen,
		editingId,
		form,
		filteredRedirects,
		loadRedirects,
		loadPages,
		normalizeSourcePath,
		onSelectPageTarget,
		copyPath,
		toggleActive,
		testRedirect,
		openCreateDialog,
		openEditDialog,
		confirmSave,
		confirmDelete,
	})
}

export type RedirectsData = ReturnType<typeof useRedirectsData>

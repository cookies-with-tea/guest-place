import { reactive, ref } from 'vue'
import { menusApi, type Menu, type MenuItem } from '#entities/menus'
import { pagesApi, type PageItem } from '#entities/pages'
import { ElMessage } from 'element-plus'

const SYSTEM_LOCATIONS = ['header', 'footer', 'sidebar']

/** Owns the list of navigation menus and the pages available to link to from menu items. */
export function useMenusList() {
	const loading = ref(true)
	const menus = ref<Menu[]>([])
	const availablePages = ref<PageItem[]>([])

	async function loadMenus() {
		loading.value = true
		try {
			const res = await menusApi.getMenus()
			// The API client camelCases responses, so `created_at`/`updated_at` arrive as
			// createdAt/updatedAt; those two fields aren't used anywhere in this UI.
			menus.value = (res.data || []) as unknown as Menu[]
		} catch (e: any) {
			ElMessage.error(e.message || 'Ошибка загрузки меню')
		} finally {
			loading.value = false
		}
	}

	async function loadPages() {
		try {
			const res = await pagesApi.getPages()
			availablePages.value = res.data || []
		} catch (e) {
			console.warn('Failed to load pages for selector:', e)
		}
	}

	function isSystemLocation(loc?: string): boolean {
		return SYSTEM_LOCATIONS.includes(loc || '')
	}

	function getLocationIcon(loc?: string): string {
		if (loc === 'header') return 'Top'
		if (loc === 'footer') return 'Bottom'
		if (loc === 'sidebar') return 'Folder'
		return 'Compass'
	}

	function countTotalItems(items?: MenuItem[]): number {
		if (!items) return 0
		let total = items.length
		for (const it of items) {
			if (it.children?.length) total += it.children.length
		}
		return total
	}

	return reactive({
		loading,
		menus,
		availablePages,
		loadMenus,
		loadPages,
		isSystemLocation,
		getLocationIcon,
		countTotalItems,
	})
}

export type MenusList = ReturnType<typeof useMenusList>

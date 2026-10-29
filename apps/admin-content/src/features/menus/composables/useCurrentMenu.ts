import { reactive, ref } from 'vue'
import { menusApi, type Menu, type MenuItem } from '#entities/menus'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { MenusList } from './useMenusList'

/** Owns the menu currently open for editing: selection, item reordering/removal, and saving. */
export function useCurrentMenu(menusList: MenusList) {
	const currentMenu = ref<Menu | null>(null)
	const saving = ref(false)

	function selectMenu(menu: Menu) {
		currentMenu.value = JSON.parse(JSON.stringify(menu))
	}

	function getTypeLabel(type: string): string {
		if (type === 'page') return 'Страница'
		if (type === 'anchor') return 'Якорь'
		return 'URL'
	}

	function formatItemUrl(item: MenuItem): string {
		if (item.type === 'page') {
			const found = menusList.availablePages.find((p: any) => p.id === item.page_id)
			return found ? `/p/${found.slug}` : item.url || '/p/...'
		}
		return item.url || ''
	}

	function moveItemUp(arr: MenuItem[], idx: number) {
		if (idx <= 0) return
		;[arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]]
	}

	function moveItemDown(arr: MenuItem[], idx: number) {
		if (idx >= arr.length - 1) return
		;[arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]]
	}

	function removeItem(arr: MenuItem[], idx: number) {
		arr.splice(idx, 1)
	}

	async function saveCurrentMenu() {
		if (!currentMenu.value) return
		saving.value = true
		try {
			await menusApi.updateMenu(currentMenu.value.id, {
				name: currentMenu.value.name,
				location: currentMenu.value.location,
				items: currentMenu.value.items,
			})
			ElMessage.success('Меню успешно сохранено')
			await menusList.loadMenus()
		} catch (e: any) {
			ElMessage.error(e.message || 'Ошибка сохранения меню')
		} finally {
			saving.value = false
		}
	}

	async function confirmDeleteMenu(menu: Menu) {
		try {
			await ElMessageBox.confirm(`Удалить навигационное меню «${menu.name}»?`, 'Подтверждение удаления', {
				confirmButtonText: 'Удалить',
				cancelButtonText: 'Отмена',
				type: 'warning',
			})
			await menusApi.deleteMenu(menu.id)
			ElMessage.success('Меню удалено')
			currentMenu.value = null
			await menusList.loadMenus()
		} catch {
			// user cancelled the confirmation
		}
	}

	return reactive({
		currentMenu,
		saving,
		selectMenu,
		getTypeLabel,
		formatItemUrl,
		moveItemUp,
		moveItemDown,
		removeItem,
		saveCurrentMenu,
		confirmDeleteMenu,
	})
}

export type CurrentMenu = ReturnType<typeof useCurrentMenu>

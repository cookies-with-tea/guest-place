import { reactive, ref } from 'vue'
import { menusApi, type Menu } from '#entities/menus'
import { ElMessage } from 'element-plus'
import type { CurrentMenu } from './useCurrentMenu'
import type { MenusList } from './useMenusList'

/** Owns the "create new menu" dialog: its form and creating + selecting the resulting menu. */
export function useCreateMenuDialog(menusList: MenusList, currentMenu: CurrentMenu) {
	const isOpen = ref(false)
	const form = reactive({ name: '', location: '' })

	function open() {
		form.name = ''
		form.location = ''
		isOpen.value = true
	}

	async function confirmCreate() {
		try {
			const res = await menusApi.createMenu({
				name: form.name.trim(),
				location: form.location.trim().toLowerCase(),
				items: [],
			})
			ElMessage.success('Меню создано')
			isOpen.value = false
			await menusList.loadMenus()
			if (res.data) currentMenu.selectMenu(res.data as unknown as Menu)
		} catch (e: any) {
			ElMessage.error(e.message || 'Ошибка создания меню')
		}
	}

	return reactive({ isOpen, form, open, confirmCreate })
}

export type CreateMenuDialog = ReturnType<typeof useCreateMenuDialog>

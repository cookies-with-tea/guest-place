import { reactive, ref } from 'vue'
import type { MenuItem } from '#entities/menus'
import type { CurrentMenu } from './useCurrentMenu'
import type { MenusList } from './useMenusList'

/** Owns the add/edit menu-item dialog: its form, which item it targets, and saving it in place. */
export function useMenuItemDialog(menusList: MenusList, currentMenu: CurrentMenu) {
	const isOpen = ref(false)
	const editingItem = ref<MenuItem | null>(null)
	const parentItemForAdd = ref<MenuItem | null>(null)
	let targetContainerArray: MenuItem[] = []

	const itemForm = reactive({
		title: '',
		type: 'url' as 'page' | 'url' | 'anchor',
		page_id: '',
		url: '',
		target: '_self' as '_self' | '_blank',
	})

	function openAddItemDialog(parent: MenuItem | null) {
		editingItem.value = null
		parentItemForAdd.value = parent
		if (parent) {
			if (!parent.children) parent.children = []
			targetContainerArray = parent.children
		} else if (currentMenu.currentMenu) {
			targetContainerArray = currentMenu.currentMenu.items
		}

		itemForm.title = ''
		itemForm.type = 'url'
		itemForm.page_id = ''
		itemForm.url = ''
		itemForm.target = '_self'
		isOpen.value = true
	}

	function openEditItemDialog(item: MenuItem, container: MenuItem[]) {
		editingItem.value = item
		parentItemForAdd.value = null
		targetContainerArray = container

		itemForm.title = item.title
		itemForm.type = item.type || 'url'
		itemForm.page_id = item.page_id || ''
		itemForm.url = item.url || ''
		itemForm.target = item.target || '_self'
		isOpen.value = true
	}

	function onPageSelected(pageId: string) {
		const found = menusList.availablePages.find((p: any) => p.id === pageId)
		if (found) {
			if (!itemForm.title) itemForm.title = found.title
			itemForm.url = `/p/${found.slug}`
		}
	}

	function confirmSaveItem() {
		if (editingItem.value) {
			editingItem.value.title = itemForm.title.trim()
			editingItem.value.type = itemForm.type
			editingItem.value.page_id = itemForm.page_id || undefined
			editingItem.value.url = itemForm.url.trim()
			editingItem.value.target = itemForm.target
		} else {
			targetContainerArray.push({
				id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
				title: itemForm.title.trim(),
				type: itemForm.type,
				page_id: itemForm.page_id || undefined,
				url: itemForm.url.trim(),
				target: itemForm.target,
				children: [],
			})
		}
		isOpen.value = false
	}

	return reactive({
		isOpen,
		editingItem,
		parentItemForAdd,
		itemForm,
		openAddItemDialog,
		openEditItemDialog,
		onPageSelected,
		confirmSaveItem,
	})
}

export type MenuItemDialog = ReturnType<typeof useMenuItemDialog>

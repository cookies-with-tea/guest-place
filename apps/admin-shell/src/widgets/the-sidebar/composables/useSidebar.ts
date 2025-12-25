import { readonly, ref } from 'vue'
import type { ISidebarItem } from '../model'

const sidebarData = ref<ISidebarItem[]>([])

export const useSidebar = () => {
	const setData = (data: ISidebarItem[]) => {
		sidebarData.value = data
	}

	return {
		sidebarData: readonly(sidebarData),

		setData,
	}
}

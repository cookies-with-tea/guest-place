import { computed, readonly, ref } from 'vue'

import type { ISidebarItem, SidebarContext } from '../model'

const sidebarData = ref<Record<SidebarContext, ISidebarItem[]>>({
	system: [],
	website: [],
})

const activeContext = ref<SidebarContext>((localStorage.getItem('gp-sidebar-context') as SidebarContext) || 'system')
const isCollapsed = ref(localStorage.getItem('gp-sidebar-collapsed') === 'true')

export const useSidebar = () => {
	const setData = (context: SidebarContext, data: ISidebarItem[]) => {
		sidebarData.value[context] = data
	}

	const setContext = (context: SidebarContext) => {
		activeContext.value = context

		localStorage.setItem('gp-sidebar-context', context)
	}

	const toggleCollapse = () => {
		isCollapsed.value = !isCollapsed.value

		localStorage.setItem('gp-sidebar-collapsed', String(isCollapsed.value))
	}

	const currentSidebarData = computed(() => sidebarData.value[activeContext.value])

	return {
		sidebarData: currentSidebarData,
		activeContext: readonly(activeContext),
		isCollapsed: readonly(isCollapsed),
		setContext,
		setData,
		toggleCollapse,
	}
}

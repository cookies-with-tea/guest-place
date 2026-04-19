import { computed, readonly, ref } from 'vue'
import type { ISidebarItem } from '../model'

export type SidebarContext = 'system' | 'website'

const sidebarData = ref<Record<SidebarContext, ISidebarItem[]>>({
	system: [],
	website: [],
})

const activeContext = ref<SidebarContext>((localStorage.getItem('gp-sidebar-context') as SidebarContext) || 'system')

export const useSidebar = () => {
	const setData = (context: SidebarContext, data: ISidebarItem[]) => {
		sidebarData.value[context] = data
	}

	const setContext = (context: SidebarContext) => {
		activeContext.value = context

		localStorage.setItem('gp-sidebar-context', context)
	}

	const currentSidebarData = computed(() => sidebarData.value[activeContext.value])

	return {
		sidebarData: currentSidebarData,
		activeContext: readonly(activeContext),
		setContext,
		setData,
	}
}

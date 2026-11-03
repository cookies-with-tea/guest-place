import { reactive, ref } from 'vue'

export type HomeTabId = 'hero' | 'categories' | 'latest' | 'popular' | 'interactions' | 'banner'

/** Owns which tab of the home page editor is active. */
export function useHomeEditorTabs() {
	const active = ref<HomeTabId>('hero')
	return reactive({ active })
}

export type HomeEditorTabs = ReturnType<typeof useHomeEditorTabs>

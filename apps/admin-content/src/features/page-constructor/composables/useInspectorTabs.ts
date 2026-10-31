import { reactive } from 'vue'

/**
 * Shared tab UI state between the canvas (which flips tabs on add/paste/select)
 * and the inspector (which reads them to decide what to render).
 *
 * Kept as a reactive object (not a ref) so it can be passed as a single prop through
 * `<script setup>` templates without Vue's automatic ref-unwrapping stripping its reactivity.
 */
export function useInspectorTabs() {
	return reactive({
		inspector: 'block' as 'block' | 'page',
		blockSub: 'content' as 'content' | 'style',
	})
}

export type InspectorTabs = ReturnType<typeof useInspectorTabs>

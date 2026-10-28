import { onMounted, ref, watch, type Ref } from 'vue'

import { GP_EVENTS, isBrowser, useEvents } from '@admin-panel/lib'

/** Canvas-rendered charts (ECharts) can't resolve `var(--x)` themselves — this reads the
 * real color from computed styles and keeps it in sync across light/dark theme toggles. */
function readCssVar(expr: string): string {
	if (!isBrowser) return expr
	const match = expr.match(/^var\((--[\w-]+)\)$/)
	if (!match) return expr
	return getComputedStyle(document.documentElement).getPropertyValue(match[1]).trim() || expr
}

export function useResolvedColor(source: Ref<string>): Ref<string> {
	const resolved = ref(readCssVar(source.value))
	const { on } = useEvents()

	const update = () => {
		resolved.value = readCssVar(source.value)
	}

	watch(source, update)

	onMounted(update)

	on(GP_EVENTS.THEME_CHANGED, update)

	return resolved
}

/** Same as {@link useResolvedColor}, for a list of color expressions at once. */
export function useResolvedColors(source: Ref<string[]>): Ref<string[]> {
	const resolved = ref(source.value.map(readCssVar))
	const { on } = useEvents()

	const update = () => {
		resolved.value = source.value.map(readCssVar)
	}

	watch(source, update)

	onMounted(update)

	on(GP_EVENTS.THEME_CHANGED, update)

	return resolved as Ref<string[]>
}

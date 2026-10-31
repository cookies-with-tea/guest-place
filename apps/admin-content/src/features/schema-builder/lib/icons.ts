import * as Icons from '@element-plus/icons-vue'

/** Resolves an `@element-plus/icons-vue` component by name — same lookup `UiSidebar` already
 * uses for menu icons, applied here to the field-type palette/blocks instead of emoji. */
export function resolveIcon(name: string) {
	return (Icons as Record<string, unknown>)[name] ?? Icons.Document
}

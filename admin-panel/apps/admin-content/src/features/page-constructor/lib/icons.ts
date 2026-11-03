import * as Icons from '@element-plus/icons-vue'

/** Resolves an `@element-plus/icons-vue` component by name — same lookup pattern used in
 * schema-builder's `lib/icons.ts`, applied here to block-type icons instead of emoji. */
export function resolveIcon(name: string | undefined) {
	return (name && (Icons as Record<string, unknown>)[name]) || Icons.Box
}

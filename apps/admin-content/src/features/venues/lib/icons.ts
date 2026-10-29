import * as Icons from '@element-plus/icons-vue'

/** Resolves an `@element-plus/icons-vue` component by name — same lookup pattern used
 * across the admin-panel for data-driven icon fields (tabs, cards, palettes). */
export const resolveIcon = (name: string) => (Icons as Record<string, unknown>)[name] ?? Icons.Document

import * as Icons from '@element-plus/icons-vue'

/** Resolves an `@element-plus/icons-vue` component by name — same lookup pattern used across
 * the admin-content feature areas (see schema-builder/lib/icons.ts). */
export const resolveIcon = (name: string) => (Icons as Record<string, unknown>)[name] ?? Icons.Document

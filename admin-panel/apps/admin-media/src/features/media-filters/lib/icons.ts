import * as Icons from '@element-plus/icons-vue'

export const resolveIcon = (name: string) => (Icons as Record<string, unknown>)[name] ?? Icons.Document

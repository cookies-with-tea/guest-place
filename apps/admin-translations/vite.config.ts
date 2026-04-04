import { createConfig } from '@admin-panel/lib/vite'

export default createConfig({
	name: 'translations',
	displayName: 'Translations',
	url: import.meta.url,
	shared: ['vue', 'vue-router', 'element-plus', '@tanstack/vue-query'],
})

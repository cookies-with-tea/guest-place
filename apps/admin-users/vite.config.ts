import { createConfig } from '@admin-panel/lib/vite'

export default createConfig({
	name: 'users',
	displayName: 'Users',
	root: import.meta.dirname,
	shared: ['vue', 'vue-router', 'element-plus', '@tanstack/vue-query'],
})

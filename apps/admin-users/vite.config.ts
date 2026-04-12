import { createConfig } from '@admin-panel/lib/vite'

export default createConfig({
	name: 'users',
	displayName: 'Users',
	shared: ['vue', 'vue-router', 'element-plus', '@tanstack/vue-query'],
})

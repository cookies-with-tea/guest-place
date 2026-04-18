import { createConfig } from '@admin-panel/lib/vite'

export default createConfig({
	name: 'statistics',
	displayName: 'Statistics',
	root: import.meta.dirname,
	shared: ['vue', 'vue-router'],
})

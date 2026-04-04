import { createConfig } from '@admin-panel/lib/vite'

export default createConfig({
	name: 'statistics',
	displayName: 'Statistics',
	url: import.meta.url,
	shared: ['vue', 'vue-router'],
})

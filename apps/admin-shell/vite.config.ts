import vueDevTools from 'vite-plugin-vue-devtools'
import { APPS_PORTS } from '@admin-panel/lib/constants'
import { createConfig } from '@admin-panel/lib/vite'

export default createConfig({
	name: 'shell',
	displayName: 'Shell',
	url: import.meta.url,
	exposes: {},
	remotes: {
		statistics: `http://localhost:${APPS_PORTS.statistics.preview}/assets/remoteEntry.js`,
		translations: `http://localhost:${APPS_PORTS.translations.preview}/assets/remoteEntry.js`,
		users: `http://localhost:${APPS_PORTS.users.preview}/assets/remoteEntry.js`,
	},
	shared: ['vue', 'vue-router', 'element-plus', '@tanstack/vue-query'],
	plugins: [vueDevTools()],
})

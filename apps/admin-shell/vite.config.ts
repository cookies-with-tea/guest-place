import vueDevTools from 'vite-plugin-vue-devtools'
import { APPS_PORTS } from '@admin-panel/lib/constants'
import { createConfig } from '@admin-panel/lib/vite'

export default createConfig({
	name: 'shell',
	displayName: 'Shell',
	exposes: {},
	remotes: {
		// Placeholder to force federation runtime initialization for dynamic remotes
		'remote-placeholder': 'http://localhost:5000/remoteEntry.js',
	},
	shared: ['vue', 'vue-router', 'element-plus', '@tanstack/vue-query'],
	plugins: [vueDevTools()],
})

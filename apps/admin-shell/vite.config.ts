import vueDevTools from 'vite-plugin-vue-devtools'
import { APPS_PORTS } from '@admin-panel/lib/constants'
import { createConfig } from '@admin-panel/lib/vite'

const remotes = Object.fromEntries(
	Object.entries(APPS_PORTS)
		.filter(([name]) => name !== 'shell')
		.map(([name, config]) => [name, `http://localhost:${(config as any).preview}/assets/remoteEntry.js`]),
)

export default createConfig({
	name: 'shell',
	displayName: 'Shell',
	exposes: {},
	remotes,
	shared: ['vue', 'vue-router', 'element-plus', '@tanstack/vue-query'],
	plugins: [vueDevTools()],
})

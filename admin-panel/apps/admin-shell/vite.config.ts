import { createConfig } from '@admin-panel/lib/vite'
import vueDevTools from 'vite-plugin-vue-devtools'

export default createConfig({
	name: 'shell',
	displayName: 'Shell',
	root: import.meta.dirname,
	exposes: {},
	remotes: {
		// Placeholder to force federation runtime initialization for dynamic remotes
		'remote-placeholder': 'http://localhost:5000/remoteEntry.js',
	},
	plugins: [vueDevTools()],
})

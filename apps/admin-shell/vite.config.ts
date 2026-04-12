import vueDevTools from 'vite-plugin-vue-devtools'
import { createConfig } from '@admin-panel/lib/vite'

export default createConfig({
	name: 'shell',
	displayName: 'Shell',
	exposes: {},
	remotes: {
		// Placeholder to force federation runtime initialization for dynamic remotes
		'remote-placeholder': 'http://localhost:5000/remoteEntry.js',
	},
	plugins: [vueDevTools()],
})

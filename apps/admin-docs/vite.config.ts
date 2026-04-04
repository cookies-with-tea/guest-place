import { createConfig } from '@admin-panel/lib/vite'

export default createConfig({
	name: 'docs',
	displayName: 'Admin Docs',
	url: import.meta.url,
	exposes: {},
	shared: [],
})

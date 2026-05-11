if (typeof window !== 'undefined') {
	;(window as any).__gp_is_shell = true

	;(window as any).__gp_shell_active = true
}

import { createApp } from 'vue'

import App from './App.vue'

export const app = createApp(App)

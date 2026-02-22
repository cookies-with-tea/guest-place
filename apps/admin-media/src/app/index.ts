import { createApp } from 'vue'
import App from './App.vue'
import { router } from './router'
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
import ConfirmationService from 'primevue/confirmationservice'
import Aura from '@primevue/themes/aura'

import '@admin-panel/ui/assets/styles/index.scss'

const app = createApp(App)

app.use(router)
app.use(PrimeVue, {
	theme: {
		preset: Aura,
		options: {
			darkModeSelector: '.dark-mode',
			cssLayer: false,
		},
	},
})
app.use(ToastService)
app.use(ConfirmationService)

export { app }

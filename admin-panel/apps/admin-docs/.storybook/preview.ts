import type { Preview } from '@storybook/vue3-vite'

import '@admin-panel/ui/assets/styles/index.scss'

const preview: Preview = {
	parameters: {
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/i,
			},
		},
	},
}

export default preview

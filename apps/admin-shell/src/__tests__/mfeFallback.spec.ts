import { mount } from '@vue/test-utils'
import ElementPlus from 'element-plus'
import { describe, expect, it, vi } from 'vitest'

import { UiMfeFallback } from '@admin-panel/ui'

describe('UiMfeFallback Component', () => {
	it('renders fallback UI with remote name and 503 status', () => {
		const wrapper = mount(UiMfeFallback, {
			props: {
				remoteName: 'about',
				displayName: 'About Page',
				url: 'http://localhost:3006/assets/remoteEntry.js',
				error: new Error('Failed to fetch dynamically imported module'),
			},
			global: {
				plugins: [ElementPlus],
			},
		})

		expect(wrapper.text()).toContain('Сервис временно недоступен')
		expect(wrapper.text()).toContain('About Page')
		expect(wrapper.text()).toContain('503 Service Unavailable')
		expect(wrapper.text()).toContain('http://localhost:3006/assets/remoteEntry.js')
		expect(wrapper.text()).toContain('Повторить попытку')
	})

	it('calls onRetry callback when retry button is clicked', async () => {
		const retryFn = vi.fn().mockResolvedValue(true)

		const wrapper = mount(UiMfeFallback, {
			props: {
				remoteName: 'guests',
				displayName: 'Guests Page',
				url: 'http://localhost:3007/assets/remoteEntry.js',
				onRetry: retryFn,
			},
			global: {
				plugins: [ElementPlus],
			},
		})

		const retryBtn = wrapper.findAll('button').find((b) => b.text().includes('Повторить попытку'))
		expect(retryBtn).toBeDefined()

		await retryBtn!.trigger('click')
		expect(retryFn).toHaveBeenCalledTimes(1)
	})
})

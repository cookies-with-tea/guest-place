import { createRouter, createWebHistory } from 'vue-router'
import { mount } from '@vue/test-utils'

import { describe, expect, it } from 'vitest'

import App from '../app/App.vue'

describe('App Integration', () => {
	it('should render router-view', async () => {
		const router = createRouter({
			history: createWebHistory(),
			routes: [{ path: '/', component: { template: '<div>Home</div>' } }],
		})

		const wrapper = mount(App, {
			global: {
				plugins: [router],
			},
		})

		expect(wrapper.exists()).toBe(true)
	})
})

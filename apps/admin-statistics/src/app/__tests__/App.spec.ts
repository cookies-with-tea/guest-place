import { describe, it, expect } from 'vitest';


import { mount } from '@vue/test-utils'
import App from '../App.vue'

describe('admin-statistics App', () => {
	it('renders root component', () => {
		const wrapper = mount(App)
		expect(wrapper.exists()).toBe(true)
	})
})



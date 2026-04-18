import { describe, it, expect } from 'vitest'
/** @vitest-environment jsdom */
import { mount } from '@vue/test-utils'
import UiButton from '../ui/UiButton.vue'

describe('UiButton', () => {
	it('renders default appearance and size with slot content', () => {
		const wrapper = mount(UiButton, {
			slots: { default: 'Click me' },
		})

		expect(wrapper.text()).toContain('Click me')

		expect(wrapper.classes()).toContain('ui-button')

		expect(wrapper.classes()).toContain('ui-button--primary')

		expect(wrapper.classes()).toContain('ui-button--l')
	})

	it('applies appearance and size props', () => {
		const wrapper = mount(UiButton, {
			props: { appearance: 'secondary', size: 'm' },
		})

		expect(wrapper.classes()).toContain('ui-button--secondary')

		expect(wrapper.classes()).toContain('ui-button--m')
	})
})

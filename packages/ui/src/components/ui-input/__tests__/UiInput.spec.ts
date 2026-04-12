import { describe, it, expect } from 'vitest'

import { mount } from '@vue/test-utils'
import UiInput from '../ui/UiInput.vue'

describe('UiInput', () => {
	it('renders with default props and updates v-model', async () => {
		const wrapper = mount(UiInput, {
			props: { modelValue: '' },
		})

		const input = wrapper.find('input')

		expect(input.exists()).toBe(true)

		expect(input.element).toHaveProperty('value', '')

		await input.setValue('hello')

		const emits = wrapper.emitted('update:modelValue')

		expect(emits?.[0]?.[0]).toBe('hello')
	})

	it('applies size class', () => {
		const wrapper = mount(UiInput, { props: { size: 'm' } })

		expect(wrapper.find('input').classes()).toContain('ui-input__control--m')
	})
})

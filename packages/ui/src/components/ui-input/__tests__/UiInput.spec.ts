import { mount } from '@vue/test-utils'

import { describe, expect, it } from 'vitest'

import UiInput from '../ui/UiInput.vue'

describe('UiInput', () => {
	it('should render correctly', () => {
		const wrapper = mount(UiInput, {
			props: {
				modelValue: 'test value',
			},
		})

		expect(wrapper.find('input').element.value).toBe('test value')
	})

	it('should emit update:modelValue on input', async () => {
		const wrapper = mount(UiInput)
		const input = wrapper.find('input')

		await input.setValue('new value')

		expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['new value'])
	})
})

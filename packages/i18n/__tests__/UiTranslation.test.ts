/** @vitest-environment jsdom */
import { nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'

import { describe, expect, it, vi } from 'vitest'

import UiTranslation from '../src/UiTranslation.vue'

// Mock useI18n to control the nodes returned
const mockNodes = ref<any[]>([])

vi.mock('../index', () => ({
	useI18n: () => ({
		getNodes: vi.fn(() => mockNodes.value),
	}),
}))

describe('UiTranslation component internals', () => {
	it('should expose nodes internal property as a ref/computed', async () => {
		mockNodes.value = [{ type: 'text', content: 'Hello' }]

		const wrapper = mount(UiTranslation, {
			props: { path: 'test.path' },
		})

		// Accessing internal property via wrapper.vm
		const vm = wrapper.vm as any

		expect(vm.nodes).toBeDefined()

		expect(vm.nodes).toEqual([{ type: 'text', content: 'Hello' }])

		// Test reactivity of internal property
		mockNodes.value = [{ type: 'text', content: 'Updated' }]

		await nextTick()

		expect(vm.nodes).toEqual([{ type: 'text', content: 'Updated' }])
	})

	it('should correctly render based on internal node structure', () => {
		mockNodes.value = [
			{ type: 'text', content: 'Welcome ' },
			{ type: 'tag', name: 'b', children: [{ type: 'text', content: 'User' }] },
			{ type: 'slot', name: 'icon' },
		]

		const wrapper = mount(UiTranslation, {
			props: {
				path: 'test.path',
				params: { icon: '🚀' },
			},
		})

		// Internal state should match
		const vm = wrapper.vm as any

		expect(vm.nodes.length).toBe(3)

		// HTML output should reflect the rendered nodes
		expect(wrapper.html()).toContain('Welcome <b>User</b>🚀')
	})

	it('should maintain state when tag prop changes', async () => {
		mockNodes.value = [{ type: 'text', content: 'Content' }]

		const wrapper = mount(UiTranslation, {
			props: {
				path: 'test.path',
				tag: 'div',
			},
		})

		expect(wrapper.element.tagName.toLowerCase()).toBe('div')

		await wrapper.setProps({ tag: 'p' })

		expect(wrapper.element.tagName.toLowerCase()).toBe('p')

		expect(wrapper.text()).toBe('Content')
	})

	it('should allow overriding tags with slots', () => {
		mockNodes.value = [
			{ type: 'text', content: 'Price: ' },
			{ type: 'tag', name: 'span', children: [{ type: 'text', content: '100$' }] },
		]

		const wrapper = mount(UiTranslation, {
			props: { path: 'test.path' },
			slots: {
				span: `
					<template #span="{ value }">
						<b class="custom-price">{{ value }}</b>
					</template>
				`,
			},
		})

		expect(wrapper.html()).toContain('Price: <b class="custom-price">100$</b>')
	})
})

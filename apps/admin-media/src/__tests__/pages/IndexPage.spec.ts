/** @vitest-environment jsdom */
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import IndexPage from '../../pages/media/ui/IndexPage.vue'
import { createTestingPinia } from '@pinia/testing'
import ElementPlus from 'element-plus'

// Mocking useMedia
vi.mock('@/entities/media/lib/composables/useMedia', () => ({
	useMedia: () => ({
		mediaItems: [],
		loading: false,
		loadMedia: vi.fn(),
		createMedia: vi.fn(),
		updateMedia: vi.fn(),
		deleteMedia: vi.fn(),
		deleteMultipleMedia: vi.fn(),
	}),
}))

describe('IndexPage Media Management', () => {
	it('should render the media management header', () => {
		const wrapper = mount(IndexPage, {
			global: {
				plugins: [createTestingPinia({ createSpy: vi.fn }), ElementPlus],
			},
		})

		expect(wrapper.find('h1').text()).toBe('Media Management')

		expect(wrapper.find('.el-button--success').text()).toContain('Add Media')
	})

	it('should disable delete button when no media selected', () => {
		const wrapper = mount(IndexPage, {
			global: {
				plugins: [createTestingPinia({ createSpy: vi.fn }), ElementPlus],
			},
		})

		const deleteBtn = wrapper.find('.el-button--danger')

		expect(deleteBtn.classes()).toContain('is-disabled')
	})
})

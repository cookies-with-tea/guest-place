/** @vitest-environment jsdom */
import { mount } from '@vue/test-utils'

import { createTestingPinia } from '@pinia/testing'
import ElementPlus from 'element-plus'
import { describe, expect, it, vi } from 'vitest'

// No top-level variables used in vi.mock to avoid hoisting issues
vi.mock('#entities/media', () => ({
	useMedia: () => ({
		filters: { search: '', sortBy: 'created_at', sortOrder: 'DESC' },
		pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
		isUploadModalOpen: false,
		isPreviewDialogOpen: false,
		isEditModalOpen: false,
		mediaItems: [],
		isLoading: false,
		isFetching: false,
		isSubmitting: false,
		setPage: vi.fn(),
		setLimit: vi.fn(),
		setSort: vi.fn(),
		openUploadModal: vi.fn(),
		closeUploadModal: vi.fn(),
		openPreviewDialog: vi.fn(),
		closePreviewDialog: vi.fn(),
		openEditModal: vi.fn(),
		closeEditModal: vi.fn(),
		handleDelete: vi.fn(),
		handleMultipleDelete: vi.fn(),
		createMedia: vi.fn(),
		updateMedia: vi.fn(),
	}),
	mediaUtils: {
		formatFileSize: (s: number) => `${s} bytes`,
		formatDate: (d: any) => String(d),
	},
}))

vi.mock('#entities/media/lib/composables/useMedia', () => ({
	useMedia: () => ({
		filters: { search: '', sortBy: 'created_at', sortOrder: 'DESC' },
		pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
		isUploadModalOpen: false,
		isPreviewDialogOpen: false,
		isEditModalOpen: false,
		mediaItems: [],
		isLoading: false,
		isFetching: false,
		isSubmitting: false,
		setPage: vi.fn(),
		setLimit: vi.fn(),
		setSort: vi.fn(),
		openUploadModal: vi.fn(),
		closeUploadModal: vi.fn(),
		openPreviewDialog: vi.fn(),
		closePreviewDialog: vi.fn(),
		openEditModal: vi.fn(),
		closeEditModal: vi.fn(),
		handleDelete: vi.fn(),
		handleMultipleDelete: vi.fn(),
		createMedia: vi.fn(),
		updateMedia: vi.fn(),
	}),
}))

vi.mock('#entities/media/utils/media.utils', () => ({
	mediaUtils: {
		formatFileSize: (s: number) => `${s} bytes`,
		formatDate: (d: any) => String(d),
	},
}))

// Import the component AFTER the mocks are defined
import IndexPage from '../../pages/media/ui/IndexPage.vue'

describe('IndexPage Media Management', () => {
	it('should render the media management header', () => {
		const wrapper = mount(IndexPage, {
			global: {
				plugins: [createTestingPinia({ createSpy: vi.fn }), ElementPlus],
			},
		})

		expect(wrapper.find('.page-title').text()).toBe('Media Library')

		expect(wrapper.find('.el-button--primary').text()).toContain('Upload Media')
	})

	it('should NOT render delete button when no media selected', () => {
		const wrapper = mount(IndexPage, {
			global: {
				plugins: [createTestingPinia({ createSpy: vi.fn }), ElementPlus],
			},
		})

		const deleteBtn = wrapper.find('.el-button--danger')

		// In the refactored IndexPage.vue, the button is hidden via v-if if selectedUuids.length is 0
		expect(deleteBtn.exists()).toBe(false)
	})
})

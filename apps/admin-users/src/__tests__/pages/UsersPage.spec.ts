/** @vitest-environment jsdom */
import { ref } from 'vue'
import { mount } from '@vue/test-utils'

import { describe, expect, it, vi } from 'vitest'

import UsersPage from '../../pages/users-page/ui/UsersPage.vue'

// Mocking dependencies
vi.mock('@admin-panel/i18n', () => ({
	useI18n: () => ({
		t: vi.fn((key: string) => `translated:${key}`),
		currentLocale: ref('en'),
	}),
	UiTranslation: {
		name: 'UiTranslation',
		render: () => 'TranslatedComponent',
	},
}))

vi.mock('@admin-panel/ui', () => ({
	useTheme: vi.fn(),
}))

vi.mock('#features/users-filters', () => ({ UsersFilters: { name: 'UsersFilters', render: () => 'Filters' } }))

vi.mock('#features/users-table', () => ({ UsersTable: { name: 'UsersTable', render: () => 'Table' } }))

vi.mock('#features/users-update-modal', () => ({
	UsersUpdateModal: { name: 'UsersUpdateModal', render: () => 'Modal' },
}))

vi.mock('../../pages/users-page/ui/components/drawer-detail-user', () => ({
	DrawerDetailUser: { name: 'DrawerDetailUser', render: () => 'Drawer' },
}))

describe('UsersPage', () => {
	it('should render correctly and expose internal properties', () => {
		const mockT = vi.fn((key: string) => `translated:${key}`)

		const wrapper = mount(UsersPage, {
			global: {
				config: {
					globalProperties: {
						$T: mockT,
					} as any,
				},
				stubs: {
					UsersFilters: true,
					UsersTable: true,
					UsersUpdateModal: true,
					DrawerDetailUser: true,
					UiTranslation: true,
				},
			},
		})

		// 1. Test rendering of SPOSOB 1 (useI18n().t())
		expect(wrapper.text()).toContain('useI18n().t(): translated:platforms.tools.title')

		// 2. Test rendering of SPOSOB 2 ($T())
		expect(wrapper.text()).toContain('$T(): translated:platforms.tools.title')

		expect(mockT).toHaveBeenCalledWith('platforms.tools.title')
	})
})

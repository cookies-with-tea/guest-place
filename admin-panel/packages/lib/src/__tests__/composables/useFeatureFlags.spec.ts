import { beforeEach, describe, expect, it, vi } from 'vitest'

// Move mockFetchData to hoisted so it's available before vi.mock
const { mockFetchData } = vi.hoisted(() => ({
	mockFetchData: vi.fn(),
}))

// Mocking the API
vi.mock('../../api', () => ({
	createApi: vi.fn(() => ({
		fetchData: mockFetchData,
	})),
}))

// Import after mocking
import { useFeatureFlags } from '../../composables/useFeatureFlags'

describe('useFeatureFlags', () => {
	beforeEach(() => {
		vi.clearAllMocks()

		// Reset state (it's global in useFeatureFlags.ts)
		const { flags, loading, initialized } = useFeatureFlags()

		flags.value = []

		loading.value = false

		initialized.value = false
	})

	it('should load flags from API', async () => {
		const testFlags = [{ id: 'feature1', name: 'F1', description: 'desc', enabled: true }]

		mockFetchData.mockResolvedValueOnce({ data: testFlags })

		const { loadFlags, flags, initialized } = useFeatureFlags()

		await loadFlags()

		expect(flags.value).toEqual(testFlags)

		expect(initialized.value).toBe(true)
	})

	it('should correctly check if feature is enabled', () => {
		const { flags, isEnabled } = useFeatureFlags()

		flags.value = [
			{ id: 'f1', name: 'F1', description: 'desc', enabled: true },
			{ id: 'f2', name: 'F2', description: 'desc', enabled: false },
		]

		expect(isEnabled('f1')).toBe(true)

		expect(isEnabled('f2')).toBe(false)

		expect(isEnabled('f3')).toBe(false)
	})

	it('should update flags via API', async () => {
		const newFlags = [{ id: 'f1', name: 'F1', description: 'desc', enabled: true }]

		mockFetchData.mockResolvedValueOnce({ data: {} })

		const { updateFlags, flags } = useFeatureFlags()

		await updateFlags(newFlags)

		expect(mockFetchData).toHaveBeenCalledWith(
			'',
			expect.objectContaining({
				method: 'POST',
				body: { flags: newFlags },
			})
		)

		expect(flags.value).toEqual(newFlags)
	})

	it('should handle loading state', async () => {
		let resolvePromise: any
		const promise = new Promise((resolve) => {
			resolvePromise = resolve
		})

		mockFetchData.mockReturnValueOnce(promise)

		const { loadFlags, loading } = useFeatureFlags()
		const loadTask = loadFlags()

		expect(loading.value).toBe(true)

		resolvePromise({ data: [] })

		await loadTask

		expect(loading.value).toBe(false)
	})
})

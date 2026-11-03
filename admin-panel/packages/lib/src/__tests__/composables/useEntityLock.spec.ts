import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'

const { mockOfetch } = vi.hoisted(() => ({
	mockOfetch: vi.fn(),
}))

vi.mock('ofetch', () => ({
	ofetch: mockOfetch,
}))

import { useEntityLock } from '../../composables/useEntityLock'

describe('useEntityLock', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('should acquire lock successfully when available', async () => {
		mockOfetch.mockResolvedValueOnce({
			data: {
				is_locked: true,
				is_own_lock: true,
				lock_info: {
					entity_type: 'schema',
					entity_id: 'blog',
					user_id: 'anonymous-admin',
					user_name: 'Администратор',
					locked_at: '2026-09-19T18:00:00Z',
				},
			},
		})

		const entityId = ref('blog')
		const { acquire, isLocked, isOwnLock, isLockedByOther, canEdit } = useEntityLock('schema', entityId, {
			autoAcquire: false,
		})

		const result = await acquire(false)

		expect(result).toBe(true)
		expect(isLocked.value).toBe(true)
		expect(isOwnLock.value).toBe(true)
		expect(isLockedByOther.value).toBe(false)
		expect(canEdit.value).toBe(true)
	})

	it('should handle conflict when locked by another user', async () => {
		mockOfetch.mockRejectedValueOnce({
			status: 409,
			data: {
				data: {
					is_locked: true,
					is_own_lock: false,
					lock_info: {
						entity_type: 'schema',
						entity_id: 'blog',
						user_id: 'user-2',
						user_name: 'Алексей',
						locked_at: '2026-09-19T18:00:00Z',
					},
				},
			},
		})

		const entityId = ref('blog')
		const { acquire, isLocked, isLockedByOther, lockedByName, canEdit } = useEntityLock('schema', entityId, {
			autoAcquire: false,
		})

		const result = await acquire(false)

		expect(result).toBe(false)
		expect(isLocked.value).toBe(true)
		expect(isLockedByOther.value).toBe(true)
		expect(lockedByName.value).toBe('Алексей')
		expect(canEdit.value).toBe(false)
	})

	it('should release lock on call', async () => {
		mockOfetch.mockResolvedValueOnce({})

		const entityId = ref('blog')
		const { release, isLocked, isLockedByOther } = useEntityLock('schema', entityId, {
			autoAcquire: false,
		})

		await release()

		expect(mockOfetch).toHaveBeenCalledWith(
			'/api/v1/locks/schema/blog',
			expect.objectContaining({
				method: 'DELETE',
			})
		)
		expect(isLocked.value).toBe(false)
		expect(isLockedByOther.value).toBe(false)
	})
})

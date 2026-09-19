import { computed, getCurrentInstance, onMounted, onUnmounted, ref, unref, watch, type Ref } from 'vue'
import { ofetch } from 'ofetch'
import { isBrowser } from '../utils'
import { GP_EVENTS } from '../constants'
import { useAuth } from './useAuth'
import { useEvents } from './useEvents'

export interface ILockInfo {
	entity_type: string
	entity_id: string
	user_id: string
	user_name: string
	locked_at: string
}

export interface ILockStatusResponse {
	is_locked: boolean
	lock_info?: ILockInfo | null
	is_own_lock: boolean
}

export interface IUseEntityLockOptions {
	autoAcquire?: boolean
	heartbeatIntervalMs?: number
}

export function useEntityLock(
	entityType: string,
	entityId: Ref<string> | string,
	options: IUseEntityLockOptions = {},
) {
	const { autoAcquire = true, heartbeatIntervalMs = 15000 } = options

	const { user } = useAuth()
	const { on, off } = useEvents()

	const isLocked = ref(false)
	const isLockedByOther = ref(false)
	const isOwnLock = ref(false)
	const lockedByName = ref('')
	const lockedAt = ref('')
	const isLoading = ref(false)

	let heartbeatTimer: any = null

	const currentEntityId = computed(() => unref(entityId))
	const canEdit = computed(() => !isLockedByOther.value)

	const currentUserId = computed(() => {
		return user.value?.uuid || 'anonymous-admin'
	})

	const currentUserName = computed(() => {
		return user.value?.firstName || user.value?.email || 'Администратор'
	})

	const checkStatus = async () => {
		const id = currentEntityId.value
		if (!id || id === 'new' || id === 'create') return

		try {
			isLoading.value = true
			const res = await ofetch<{ data: ILockStatusResponse }>(`/api/v1/locks/${entityType}/${id}`, {
				query: { user_id: currentUserId.value },
			})

			const data = res?.data
			if (data) {
				isLocked.value = data.is_locked
				isOwnLock.value = data.is_own_lock
				isLockedByOther.value = data.is_locked && !data.is_own_lock
				lockedByName.value = data.lock_info?.user_name || ''
				lockedAt.value = data.lock_info?.locked_at || ''
			}
		} catch (err) {
			console.error('[useEntityLock] Failed to check status', err)
		} finally {
			isLoading.value = false
		}
	}

	const acquire = async (force = false): Promise<boolean> => {
		const id = currentEntityId.value
		if (!id || id === 'new' || id === 'create') return true

		try {
			isLoading.value = true
			const res = await ofetch<{ data: ILockStatusResponse }>(`/api/v1/locks/${entityType}/${id}`, {
				method: 'POST',
				body: {
					user_id: currentUserId.value,
					user_name: currentUserName.value,
					force,
				},
			})

			const data = res?.data
			if (data) {
				isLocked.value = true
				isOwnLock.value = true
				isLockedByOther.value = false
				lockedByName.value = currentUserName.value
				lockedAt.value = data.lock_info?.locked_at || new Date().toISOString()
				startHeartbeat()
				return true
			}
			return false
		} catch (err: any) {
			if (err?.status === 409) {
				const conflictData = err?.data?.data as ILockStatusResponse | undefined
				isLocked.value = true
				isOwnLock.value = false
				isLockedByOther.value = true
				lockedByName.value = conflictData?.lock_info?.user_name || 'Другой пользователь'
				lockedAt.value = conflictData?.lock_info?.locked_at || ''
				stopHeartbeat()
				return false
			}
			console.error('[useEntityLock] Failed to acquire lock', err)
			return false
		} finally {
			isLoading.value = false
		}
	}

	const release = async (force = false) => {
		const id = currentEntityId.value
		if (!id) return

		stopHeartbeat()

		try {
			await ofetch(`/api/v1/locks/${entityType}/${id}`, {
				method: 'DELETE',
				query: {
					user_id: currentUserId.value,
					force,
				},
			})
			isLocked.value = false
			isOwnLock.value = false
			isLockedByOther.value = false
			lockedByName.value = ''
		} catch (err) {
			console.error('[useEntityLock] Failed to release lock', err)
		}
	}

	const forceUnlock = async () => {
		return acquire(true)
	}

	const startHeartbeat = () => {
		stopHeartbeat()
		if (!isBrowser) return

		heartbeatTimer = setInterval(() => {
			if (isOwnLock.value) {
				// Re-acquire ping to keep Redis TTL fresh
				acquire(false).catch(() => {})
			}
		}, heartbeatIntervalMs)
	}

	const stopHeartbeat = () => {
		if (heartbeatTimer) {
			clearInterval(heartbeatTimer)
			heartbeatTimer = null
		}
	}

	const handleEntityLocked = (payload: any) => {
		if (payload?.entity_type === entityType && payload?.entity_id === currentEntityId.value) {
			const isMine = payload.user_id === currentUserId.value
			isLocked.value = true
			isOwnLock.value = isMine
			isLockedByOther.value = !isMine
			lockedByName.value = payload.user_name || ''
			if (!isMine) {
				stopHeartbeat()
			}
		}
	}

	const handleEntityUnlocked = (payload: any) => {
		if (payload?.entity_type === entityType && payload?.entity_id === currentEntityId.value) {
			isLocked.value = false
			isOwnLock.value = false
			isLockedByOther.value = false
			lockedByName.value = ''
		}
	}

	const handleBeforeUnload = () => {
		if (isOwnLock.value && isBrowser) {
			// Using sendBeacon or synchronous navigator fetch for clean exit
			const id = currentEntityId.value
			if (id && navigator.sendBeacon) {
				const url = `/api/v1/locks/${entityType}/${id}?user_id=${encodeURIComponent(currentUserId.value)}`
				navigator.sendBeacon(url)
			}
		}
	}

	if (getCurrentInstance()) {
		onMounted(async () => {
			on(GP_EVENTS.ENTITY_LOCKED, handleEntityLocked)
			on(GP_EVENTS.ENTITY_UNLOCKED, handleEntityUnlocked)

			if (isBrowser) {
				window.addEventListener('beforeunload', handleBeforeUnload)
			}

			if (autoAcquire && currentEntityId.value) {
				await acquire(false)
			}
		})

		onUnmounted(() => {
			off(GP_EVENTS.ENTITY_LOCKED, handleEntityLocked)
			off(GP_EVENTS.ENTITY_UNLOCKED, handleEntityUnlocked)

			if (isBrowser) {
				window.removeEventListener('beforeunload', handleBeforeUnload)
			}

			if (isOwnLock.value) {
				release(false)
			} else {
				stopHeartbeat()
			}
		})
	}

	watch(
		() => currentEntityId.value,
		async (newId, oldId) => {
			if (oldId && isOwnLock.value) {
				release(false)
			}
			if (newId && autoAcquire) {
				await acquire(false)
			}
		},
	)

	return {
		isLocked,
		isLockedByOther,
		isOwnLock,
		lockedByName,
		lockedAt,
		canEdit,
		isLoading,
		checkStatus,
		acquire,
		release,
		forceUnlock,
	}
}

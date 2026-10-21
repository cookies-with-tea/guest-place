import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock element-plus
vi.mock('element-plus', () => ({
	ElNotification: vi.fn(),
}))

import { useRealtimeNotifications } from '../../composables/useRealtimeNotifications'

describe('useRealtimeNotifications', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		const { clearAll } = useRealtimeNotifications()
		clearAll()
	})

	it('should add notifications and compute unread count correctly', () => {
		const { notifications, unreadCount, addNotification } = useRealtimeNotifications()

		expect(notifications.value).toHaveLength(0)
		expect(unreadCount.value).toBe(0)

		addNotification({
			type: 'guest_registered',
			title: 'Новый гость',
			message: 'Гость Иван зарегистрировался',
			timestamp: new Date().toISOString(),
		})

		expect(notifications.value).toHaveLength(1)
		expect(unreadCount.value).toBe(1)
		expect(notifications.value[0].title).toBe('Новый гость')
		expect(notifications.value[0].read).toBe(false)
	})

	it('should mark notification as read', () => {
		const { notifications, unreadCount, addNotification, markAsRead } = useRealtimeNotifications()

		const notif = addNotification({
			type: 'media_uploaded',
			title: 'Медиафайл',
			message: 'Файл сохранён',
			timestamp: new Date().toISOString(),
		})

		expect(unreadCount.value).toBe(1)
		markAsRead(notif.id)
		expect(unreadCount.value).toBe(0)
		expect(notifications.value[0].read).toBe(true)
	})

	it('should mark all notifications as read', () => {
		const { notifications, unreadCount, addNotification, markAllAsRead } = useRealtimeNotifications()

		addNotification({ type: 'system_alert', title: 'A1', message: 'M1', timestamp: '' })
		addNotification({ type: 'system_alert', title: 'A2', message: 'M2', timestamp: '' })

		expect(unreadCount.value).toBe(2)
		markAllAsRead()
		expect(unreadCount.value).toBe(0)
		expect(notifications.value.every((n) => n.read)).toBe(true)
	})

	it('should clear all notifications', () => {
		const { notifications, addNotification, clearAll } = useRealtimeNotifications()

		addNotification({ type: 'system_alert', title: 'A1', message: 'M1', timestamp: '' })
		expect(notifications.value).toHaveLength(1)
		clearAll()
		expect(notifications.value).toHaveLength(0)
	})
})

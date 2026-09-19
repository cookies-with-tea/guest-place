import { computed, onMounted, onUnmounted, ref } from 'vue'
import { ElNotification } from 'element-plus'
import { isBrowser } from '../utils'
import { GP_EVENTS } from '../constants'
import { useEvents } from './useEvents'

export interface IRealtimeNotification {
	id: string
	type: 'guest_registered' | 'media_uploaded' | 'entity_locked' | 'entity_unlocked' | 'system_alert' | 'content_updated' | 'info'
	title: string
	message: string
	timestamp: string
	read: boolean
	link?: string
}

const STORAGE_KEY = 'gp_realtime_notifications'

// Module-level singleton state so all components and MFE share the same notification list
const notifications = ref<IRealtimeNotification[]>(loadPersistedNotifications())
const connectionStatus = ref<'connected' | 'connecting' | 'disconnected'>('disconnected')
let eventSourceInstance: EventSource | null = null
let reconnectTimeout: any = null
let listenerCount = 0

function loadPersistedNotifications(): IRealtimeNotification[] {
	if (!isBrowser) return []
	try {
		const raw = localStorage.getItem(STORAGE_KEY)
		return raw ? JSON.parse(raw) : []
	} catch {
		return []
	}
}

function persistNotifications() {
	if (!isBrowser) return
	try {
		// Store last 50 notifications
		localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications.value.slice(0, 50)))
	} catch {
		// Ignore storage quota
	}
}

export function useRealtimeNotifications() {
	const { dispatch } = useEvents()

	const unreadCount = computed(() => {
		return notifications.value.filter((n) => !n.read).length
	})

	const isConnected = computed(() => connectionStatus.value === 'connected')

	const addNotification = (notif: Omit<IRealtimeNotification, 'id' | 'read'>) => {
		const newNotif: IRealtimeNotification = {
			...notif,
			id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
			read: false,
		}

		notifications.value.unshift(newNotif)
		if (notifications.value.length > 100) {
			notifications.value.pop()
		}
		persistNotifications()

		if (isBrowser) {
			ElNotification({
				title: newNotif.title,
				message: newNotif.message,
				type: newNotif.type === 'system_alert' ? 'warning' : 'info',
				duration: 4500,
				position: 'bottom-right',
			})
		}

		return newNotif
	}

	const markAsRead = (id: string) => {
		const target = notifications.value.find((n) => n.id === id)
		if (target) {
			target.read = true
			persistNotifications()
		}
	}

	const markAllAsRead = () => {
		notifications.value.forEach((n) => {
			n.read = true
		})
		persistNotifications()
	}

	const clearAll = () => {
		notifications.value = []
		persistNotifications()
	}

	const connect = () => {
		if (!isBrowser || eventSourceInstance) return

		connectionStatus.value = 'connecting'
		const sseUrl = '/api/v1/events'

		try {
			const es = new EventSource(sseUrl)
			eventSourceInstance = es

			es.onopen = () => {
				connectionStatus.value = 'connected'
			}

			es.onerror = () => {
				connectionStatus.value = 'disconnected'
				es.close()
				eventSourceInstance = null

				// Exponential backoff reconnect
				if (!reconnectTimeout) {
					reconnectTimeout = setTimeout(() => {
						reconnectTimeout = null
						if (listenerCount > 0) {
							connect()
						}
					}, 5000)
				}
			}

			es.addEventListener('guest_registered', (e) => {
				try {
					const data = JSON.parse(e.data)
					const payload = data.payload || data
					addNotification({
						type: 'guest_registered',
						title: 'Новый гость',
						message: `${payload.name || payload.email || 'Гость'} зарегистрировался на платформе`,
						timestamp: payload.created_at || new Date().toISOString(),
						link: '/guests',
					})
					dispatch(GP_EVENTS.GUEST_REGISTERED, payload)
				} catch (err) {
					console.error('[SSE] Failed to parse guest_registered event', err)
				}
			})

			es.addEventListener('media_uploaded', (e) => {
				try {
					const data = JSON.parse(e.data)
					const payload = data.payload || data
					addNotification({
						type: 'media_uploaded',
						title: 'Медиафайл загружен',
						message: `Файл «${payload.name}» успешно загружен в медиатеку`,
						timestamp: new Date().toISOString(),
						link: '/media',
					})
					dispatch(GP_EVENTS.MEDIA_UPLOADED, payload)
				} catch (err) {
					console.error('[SSE] Failed to parse media_uploaded event', err)
				}
			})

			es.addEventListener('entity_locked', (e) => {
				try {
					const data = JSON.parse(e.data)
					const payload = data.payload || data
					dispatch(GP_EVENTS.ENTITY_LOCKED, payload)
				} catch (err) {
					console.error('[SSE] Failed to parse entity_locked event', err)
				}
			})

			es.addEventListener('entity_unlocked', (e) => {
				try {
					const data = JSON.parse(e.data)
					const payload = data.payload || data
					dispatch(GP_EVENTS.ENTITY_UNLOCKED, payload)
				} catch (err) {
					console.error('[SSE] Failed to parse entity_unlocked event', err)
				}
			})

			es.addEventListener('system_alert', (e) => {
				try {
					const data = JSON.parse(e.data)
					const payload = data.payload || data
					addNotification({
						type: 'system_alert',
						title: payload.title || 'Системное оповещение',
						message: payload.message || '',
						timestamp: payload.timestamp || new Date().toISOString(),
					})
					dispatch(GP_EVENTS.SYSTEM_ALERT, payload)
				} catch (err) {
					console.error('[SSE] Failed to parse system_alert event', err)
				}
			})

			es.addEventListener('content_updated', (e) => {
				try {
					const data = JSON.parse(e.data)
					const payload = data.payload || data
					addNotification({
						type: 'content_updated',
						title: 'Контент обновлён',
						message: `Схема «${payload.schema}» обновлена`,
						timestamp: new Date().toISOString(),
						link: '/content',
					})
					dispatch(GP_EVENTS.CONTENT_UPDATED, payload)
				} catch (err) {
					console.error('[SSE] Failed to parse content_updated event', err)
				}
			})
		} catch (err) {
			console.error('[SSE] Failed to initialize EventSource', err)
			connectionStatus.value = 'disconnected'
		}
	}

	const disconnect = () => {
		if (eventSourceInstance) {
			eventSourceInstance.close()
			eventSourceInstance = null
		}
		if (reconnectTimeout) {
			clearTimeout(reconnectTimeout)
			reconnectTimeout = null
		}
		connectionStatus.value = 'disconnected'
	}

	const initSubscriber = () => {
		listenerCount++
		if (listenerCount === 1) {
			connect()
		}
	}

	const removeSubscriber = () => {
		listenerCount = Math.max(0, listenerCount - 1)
		if (listenerCount === 0) {
			disconnect()
		}
	}

	return {
		notifications,
		unreadCount,
		connectionStatus,
		isConnected,
		addNotification,
		markAsRead,
		markAllAsRead,
		clearAll,
		connect,
		disconnect,
		initSubscriber,
		removeSubscriber,
	}
}

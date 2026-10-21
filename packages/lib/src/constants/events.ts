export const MFE_EVENTS = {
	UPDATED: 'mfe:updated',
	LOAD_STAT: 'mfe:load-stat',
	FORCE_RELOAD: 'mfe:force-reload',
} as const

export const AUTH_EVENTS = {
	UNAUTHORIZED: 'auth:unauthorized',
} as const

export const SYSTEM_EVENTS = {
	THEME_CHANGED: 'gp:theme-changed',
	THEME_SETTINGS_CHANGED: 'gp:theme-settings-changed',
	STORAGE: 'storage',
} as const

export const REALTIME_EVENTS = {
	GUEST_REGISTERED: 'guest_registered',
	MEDIA_UPLOADED: 'media_uploaded',
	ENTITY_LOCKED: 'entity_locked',
	ENTITY_UNLOCKED: 'entity_unlocked',
	SYSTEM_ALERT: 'system_alert',
	CONTENT_UPDATED: 'content_updated',
	FILE_PROCESSED: 'file_processed',
} as const

export const GP_EVENTS = {
	...MFE_EVENTS,
	...AUTH_EVENTS,
	...SYSTEM_EVENTS,
	...REALTIME_EVENTS,
} as const

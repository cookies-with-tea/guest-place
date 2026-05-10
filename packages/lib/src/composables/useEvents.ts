import { useEventListener } from '@vueuse/core'

import type { GP_EVENTS } from '../constants'
import { isBrowser } from '../utils'

export type GpEventName = (typeof GP_EVENTS)[keyof typeof GP_EVENTS]
export type AppEventName = GpEventName | 'storage'

/**
 * Composable for handling system-wide custom events
 */
export function useEvents() {
	/**
	 * Dispatch a custom event
	 */
	const dispatch = (eventName: AppEventName, detail?: any) => {
		if (!isBrowser) return false

		return window.dispatchEvent(
			new CustomEvent(eventName, {
				detail,
				bubbles: true,
				composed: true,
				cancelable: true,
			})
		)
	}

	/**
	 * Listen for a custom event (automatically cleans up on unmount)
	 */
	const on = (eventName: AppEventName, handler: (event: any) => void) => {
		if (!isBrowser) return

		return useEventListener(window, eventName, handler)
	}

	return {
		dispatch,
		on,
	}
}

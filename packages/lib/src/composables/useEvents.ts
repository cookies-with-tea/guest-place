import { useEventListener } from '@vueuse/core'

/**
 * Composable for handling system-wide custom events
 */
export function useEvents() {
	/**
	 * Dispatch a custom event
	 */
	const dispatch = (eventName: string, detail?: any) => {
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
	const on = (eventName: string, handler: (event: any) => void) => {
		return useEventListener(window, eventName, handler)
	}

	return {
		dispatch,
		on,
	}
}

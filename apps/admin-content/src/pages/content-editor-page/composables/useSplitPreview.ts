import { computed, reactive, ref, watch } from 'vue'

import type { ContentEntry } from './useContentEntry'

/** The split-screen live preview panel: device/URL controls and the postMessage
 * bridge that keeps the client iframe (or an opened tab) in sync with the draft. */
export const useSplitPreview = (entry: ContentEntry, schemaIdentifier: string) => {
	const isSplitPreview = ref(false)
	const previewDevice = ref<'desktop' | 'tablet' | 'mobile'>('desktop')
	const splitIframeRef = ref<HTMLIFrameElement | null>(null)
	const iframeReady = ref(false)

	const clientBaseUrl = computed(() => import.meta.env.VITE_CLIENT_URL || 'http://localhost:3000')
	const previewPathInput = ref('/about')
	const activePreset = ref('about')

	// Auto-detect default preset from schema slug/name
	const autoDetectPreset = () => {
		const currentSlug = (entry.schema?.slug || schemaIdentifier || '').toLowerCase()

		if (currentSlug.includes('guest')) {
			activePreset.value = 'guests'
			previewPathInput.value = '/guests'
		} else if (currentSlug.includes('platform') && !currentSlug.includes('about')) {
			activePreset.value = 'platforms'
			previewPathInput.value = '/platforms'
		} else {
			// Default to /about for any about schema, pageAbout, page_about or generic page
			activePreset.value = 'about'
			previewPathInput.value = '/about'
		}
	}

	const previewUrl = computed(() => {
		const base = clientBaseUrl.value.replace(/\/$/, '')
		let path = (previewPathInput.value || '/about').trim()

		if (!path.startsWith('/')) path = `/${path}`

		// Always append preview=true query so client composables know they are in preview mode
		const sep = path.includes('?') ? '&' : '?'

		if (!path.includes('preview=')) {
			return `${base}${path}${sep}preview=true`
		}

		return `${base}${path}`
	})

	const reloadIframe = () => {
		if (splitIframeRef.value) {
			iframeReady.value = false

			const targetUrl = previewUrl.value

			splitIframeRef.value.src = 'about:blank'

			setTimeout(() => {
				if (splitIframeRef.value) {
					splitIframeRef.value.src = targetUrl
				}
			}, 60)
		}
	}

	const selectPreset = (path: string) => {
		previewPathInput.value = path
		activePreset.value = path.replace('/', '')

		reloadIframe()
	}

	const applyCustomPath = () => {
		activePreset.value = ''

		reloadIframe()
	}

	const openedPreviewWindow = ref<Window | null>(null)

	const openInNewTab = () => {
		openedPreviewWindow.value = window.open(previewUrl.value, '_blank')
	}

	// Send draft data to iframe and opened tab
	const sendPreviewData = () => {
		const payload = JSON.parse(
			JSON.stringify({
				data: entry.formData,
				schema: entry.schema,
			})
		)

		const iframe = splitIframeRef.value

		if (isSplitPreview.value && iframe?.contentWindow) {
			iframe.contentWindow.postMessage({ type: 'CMS_PREVIEW_DATA', payload }, '*')
		}

		if (openedPreviewWindow.value && !openedPreviewWindow.value.closed) {
			openedPreviewWindow.value.postMessage({ type: 'CMS_PREVIEW_DATA', payload }, '*')
		}
	}

	const onIframeLoad = () => {
		iframeReady.value = true

		sendPreviewData()

		setTimeout(sendPreviewData, 200)
	}

	// Listen for PREVIEW_READY signal from client
	const handlePreviewMessage = (event: MessageEvent) => {
		if (event.data?.type === 'PREVIEW_READY') {
			iframeReady.value = true

			sendPreviewData()
		}
	}

	watch(isSplitPreview, (val) => {
		if (val) {
			autoDetectPreset()

			iframeReady.value = false

			window.addEventListener('message', handlePreviewMessage)

			// Small delay to ensure iframe receives draft once ready
			setTimeout(sendPreviewData, 350)
		} else {
			window.removeEventListener('message', handlePreviewMessage)

			iframeReady.value = false
		}
	})

	// Reactively push changes to iframe whenever formData changes
	watch(
		() => ({ ...entry.formData }),
		() => {
			if (isSplitPreview.value) {
				sendPreviewData()
			}
		},
		{ deep: true }
	)

	return reactive({
		isSplitPreview,
		previewDevice,
		splitIframeRef,
		clientBaseUrl,
		previewPathInput,
		activePreset,
		previewUrl,
		selectPreset,
		applyCustomPath,
		reloadIframe,
		openInNewTab,
		sendPreviewData,
		onIframeLoad,
		autoDetectPreset,
	})
}

export type SplitPreview = ReturnType<typeof useSplitPreview>

import { computed, onUnmounted, reactive, ref } from 'vue'

/**
 * Owns the split live-preview panel: the preview iframe, the responsive device toggle,
 * and the postMessage bridge that pushes page edits into the client's preview page in real time.
 */
export function useLivePreview(
	pageForm: { title: string; slug: string; seo: Record<string, any> },
	clientManifest: { value: any[] }
) {
	const isPreviewing = ref(false)
	const previewDevice = ref<'desktop' | 'tablet' | 'mobile'>('desktop')
	const previewIframe = ref<HTMLIFrameElement | null>(null)

	const clientBaseUrl = computed(() => import.meta.env.VITE_CLIENT_URL || 'http://localhost:3000')

	const previewUrl = computed(() => {
		const cleanSlug = pageForm.slug ? pageForm.slug.replace(/^\/+/, '') : 'about'
		const base = clientBaseUrl.value.replace(/\/$/, '')
		return `${base}/p/${cleanSlug}?preview=true`
	})

	function openInNewTab() {
		const cleanSlug = pageForm.slug ? pageForm.slug.replace(/^\/+/, '') : 'about'
		const base = clientBaseUrl.value.replace(/\/$/, '')
		window.open(`${base}/p/${cleanSlug}`, '_blank')
	}

	let previewDebounceTimer: ReturnType<typeof setTimeout> | null = null

	function sendPreviewUpdate() {
		if (previewDebounceTimer) clearTimeout(previewDebounceTimer)
		previewDebounceTimer = setTimeout(() => {
			if (!previewIframe.value || !previewIframe.value.contentWindow) return
			try {
				// Entire message payload MUST be deep cloned into plain objects/primitives to prevent DataCloneError
				const payload = JSON.parse(
					JSON.stringify({
						type: 'CMS_PAGE_PREVIEW_UPDATE',
						blocks: (pageForm as any).blocks || [],
						title: pageForm.title || '',
						seo: pageForm.seo || {},
					})
				)
				previewIframe.value.contentWindow.postMessage(payload, '*')
			} catch (err) {
				console.warn('[PageConstructor] sendPreviewUpdate error:', err)
			}
		}, 80)
	}

	function handleWindowMessage(event: MessageEvent) {
		if (!event.data || typeof event.data !== 'object') return
		const { type, manifest } = event.data
		if (type === 'CMS_PAGE_PREVIEW_READY') {
			if (Array.isArray(manifest) && manifest.length > 0) clientManifest.value = manifest
			sendPreviewUpdate()
		}
	}

	function togglePreview() {
		isPreviewing.value = !isPreviewing.value
		if (isPreviewing.value) setTimeout(sendPreviewUpdate, 200)
	}

	function reloadPreview() {
		if (previewIframe.value) previewIframe.value.src = previewUrl.value
	}

	window.addEventListener('message', handleWindowMessage)
	onUnmounted(() => {
		if (previewDebounceTimer) clearTimeout(previewDebounceTimer)
		window.removeEventListener('message', handleWindowMessage)
	})

	return reactive({
		isPreviewing,
		previewDevice,
		previewIframe,
		previewUrl,
		clientBaseUrl,
		sendPreviewUpdate,
		togglePreview,
		reloadPreview,
		openInNewTab,
	})
}

export type LivePreview = ReturnType<typeof useLivePreview>

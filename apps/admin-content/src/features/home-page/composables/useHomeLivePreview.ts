import { computed, reactive, ref } from 'vue'
import type { HomePageForm } from './useHomePageForm'

export type HomeSplitRatio = '50-50' | '60-40' | 'full'

/** Owns the home page editor's live-preview panel: the iframe, split ratio, and device toggle. */
export function useHomeLivePreview(homeForm: HomePageForm) {
	const splitRatio = ref<HomeSplitRatio>('50-50')
	const previewDevice = ref<'desktop' | 'tablet' | 'mobile'>('desktop')
	const previewIframeRef = ref<HTMLIFrameElement | null>(null)

	const clientBaseUrl = computed(() => (import.meta.env.VITE_CLIENT_URL || 'http://localhost:3000').replace(/\/$/, ''))
	const previewUrl = computed(() => `${clientBaseUrl.value}/?preview=true`)

	let syncTimer: ReturnType<typeof setTimeout> | null = null
	function syncLivePreview() {
		if (splitRatio.value === 'full') return
		if (syncTimer) clearTimeout(syncTimer)
		syncTimer = setTimeout(() => {
			const iframe = previewIframeRef.value
			if (!iframe?.contentWindow) return
			iframe.contentWindow.postMessage(
				{ type: 'GP_HOME_LIVE_PREVIEW', payload: JSON.parse(JSON.stringify(homeForm.form)) },
				'*'
			)
		}, 100)
	}

	function onIframeLoad() {
		syncLivePreview()
	}

	function reloadPreviewIframe() {
		if (!previewIframeRef.value) return
		const target = previewUrl.value
		previewIframeRef.value.src = 'about:blank'
		setTimeout(() => {
			if (previewIframeRef.value) previewIframeRef.value.src = target
		}, 80)
	}

	function openClientPreview() {
		window.open(clientBaseUrl.value, '_blank')
	}

	return reactive({
		splitRatio,
		previewDevice,
		previewIframeRef,
		previewUrl,
		clientBaseUrl,
		syncLivePreview,
		onIframeLoad,
		reloadPreviewIframe,
		openClientPreview,
	})
}

export type HomeLivePreview = ReturnType<typeof useHomeLivePreview>

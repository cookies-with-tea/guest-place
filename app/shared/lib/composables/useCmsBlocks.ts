import { onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAsyncData } from '#app'
import { getCmsBlocksManifest } from '#shared/ui/blocks'

export interface CmsPageData {
	id?: string
	title: string
	slug: string
	blocks: Array<{ id?: string; type: string; data: Record<string, any> }>
	status?: string
	seo?: Record<string, any>
}

export function useCmsBlocks(pageSlug?: string) {
	const route = useRoute()
	const slug = pageSlug || (Array.isArray(route.params.slug) ? route.params.slug.join('/') : (route.params.slug as string)) || 'about'

	const isPreview = ref(false)
	const isConnectedToCms = ref(false)
	const page = ref<CmsPageData>({
		title: '',
		slug,
		blocks: [],
		status: 'draft',
		seo: {},
	})

	const { data: remotePage, pending, refresh, error } = useAsyncData(`cms_page_${slug}`, async () => {
		try {
			const apiBase = import.meta.server ? (process.env.NUXT_BACKEND_BASE_URI || 'http://127.0.0.1:8000') : ''
			const cleanSlug = slug.replace(/^\/+/, '')
			const queryPreview = (route.query.preview === 'true') ? '?preview=true' : ''
			const res = await $fetch<any>(`${apiBase}/api/v1/pages/${cleanSlug}${queryPreview}`, {
				responseType: 'json',
			}).catch(() => null)

			if (res?.data) {
				return res.data as CmsPageData
			}
		} catch (err) {
			console.warn('[useCmsBlocks] Error fetching page:', err)
		}
		return null
	})

function interpolateBlockData(val: any, context: Record<string, any> = { city: 'Москва' }): any {
	if (typeof val === 'string') {
		let res = val
		if (res.startsWith('$t(') && res.endsWith(')')) {
			res = res.slice(3, -1).replace(/['"]/g, '')
		}
		return res.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, k) => {
			if (k === 'year') return String(new Date().getFullYear())
			return context[k] !== undefined ? String(context[k]) : `{{${k}}}`
		})
	} else if (Array.isArray(val)) {
		return val.map((v) => interpolateBlockData(v, context))
	} else if (val && typeof val === 'object') {
		const res: Record<string, any> = {}
		for (const k of Object.keys(val)) {
			res[k] = interpolateBlockData(val[k], context)
		}
		return res
	}
	return val
}

	const normalizeBlocks = (rawBlocks: any[]) => {
		if (!Array.isArray(rawBlocks)) return []
		return rawBlocks.map((b) => ({
			...b,
			data: interpolateBlockData(b.data || {}),
		}))
	}

	if (remotePage.value) {
		page.value = {
			...remotePage.value,
			blocks: normalizeBlocks(remotePage.value.blocks),
		}
	}

	watch(remotePage, (val) => {
		if (val) {
			page.value = {
				...val,
				blocks: normalizeBlocks(val.blocks),
			}
		}
	})

	// Live Preview postMessage bridge
	const sendReadySignal = () => {
		if (typeof window === 'undefined') return

		const isIframe = window.parent && window.parent !== window
		if (!isIframe && route.query.preview !== 'true') return

		isPreview.value = true

		const manifest = getCmsBlocksManifest()

		// Notify CMS that iframe is ready & transmit registered block types
		window.parent.postMessage({
			type: 'CMS_PAGE_PREVIEW_READY',
			slug,
			manifest,
			timestamp: Date.now(),
		}, '*')
	}

	const handleMessage = (event: MessageEvent) => {
		if (!event.data || typeof event.data !== 'object') return

		const { type, payload, blocks, title, seo } = event.data

		if (type === 'CMS_PAGE_PREVIEW_UPDATE' || type === 'CMS_PREVIEW_DATA') {
			isConnectedToCms.value = true
			isPreview.value = true

			const newBlocks = blocks || payload?.blocks || []
			const newTitle = title || payload?.title || page.value.title
			const newSeo = seo || payload?.seo || page.value.seo

			page.value = {
				...page.value,
				title: newTitle,
				blocks: normalizeBlocks(newBlocks),
				seo: newSeo,
			}
		} else if (type === 'PING') {
			isConnectedToCms.value = true
			sendReadySignal()
		}
	}

	onMounted(() => {
		if (typeof window !== 'undefined') {
			const isIframe = window.parent && window.parent !== window
			if (isIframe || route.query.preview === 'true') {
				isPreview.value = true
			}

			window.addEventListener('message', handleMessage)
			sendReadySignal()
			// Retry ready signal briefly in case CMS parent loaded after
			setTimeout(sendReadySignal, 300)
			setTimeout(sendReadySignal, 1000)
		}
	})

	onUnmounted(() => {
		if (typeof window !== 'undefined') {
			window.removeEventListener('message', handleMessage)
		}
	})

	return {
		page,
		blocks: page.value.blocks,
		pending,
		error,
		isPreview,
		isConnectedToCms,
		refresh,
	}
}

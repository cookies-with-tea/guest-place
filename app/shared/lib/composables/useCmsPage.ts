import { onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAsyncData } from '#app'

function interpolateValue(val: any, city = 'Москва'): any {
	if (typeof val === 'string') {
		let res = val

		if (res.startsWith('$t(') && res.endsWith(')')) {
			res = res.slice(3, -1).replace(/['"]/g, '')
		}

		return res.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, k) => {
			if (k === 'year') return String(new Date().getFullYear())
			if (k === 'city') return city

			return `{{${k}}}`
		})
	} else if (Array.isArray(val)) {
		return val.map((v) => interpolateValue(v, city))
	} else if (val && typeof val === 'object' && val !== null) {
		const obj: Record<string, any> = {}

		for (const [k, v] of Object.entries(val)) {
			obj[k] = interpolateValue(v, city)
		}

		return obj
	}

	return val
}

export function useCmsPage<T extends Record<string, any>>(schemaSlug: string, defaultData: T) {
	const route = useRoute()
	const isPreview = ref(false)
	const isConnectedToCms = ref(false)
	const pageData = reactive<T>({ ...defaultData })
	const isLoading = ref(true)

	// Helper to merge data with snake_case <-> camelCase normalization and interpolation
	const applyData = (source: Record<string, any>) => {
		const currentCity = (source as any).city || (pageData as any).city || 'Москва';
		const target = pageData as Record<string, any>;

		for (const [key, rawValue] of Object.entries(source)) {
			if (rawValue === undefined || rawValue === null) continue;
			const value = interpolateValue(rawValue, currentCity);

			target[key] = value;

			// Also provide snake_case version
			const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();

			if (snakeKey !== key) {
				target[snakeKey] = value;
			}

			// Also provide camelCase version
			const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());

			if (camelKey !== key) {
				target[camelKey] = value;
			}
		}
	};

	// Async Data for SSR + client hydration
	const { data: remoteData, refresh } = useAsyncData(`cms_page_${schemaSlug}`, async () => {
		try {
			const apiBase = import.meta.server ? (process.env.NUXT_BACKEND_BASE_URI || 'http://127.0.0.1:8000') : '';

			// Candidate slugs to support different naming conventions derived ONLY from schemaSlug
			const baseSlug = schemaSlug.replace(/^page_?/, '');
			const candidateSlugs = Array.from(
				new Set([
					schemaSlug,
					schemaSlug.replace(/-/g, '_'),
					schemaSlug.replace(/_/g, '-'),
					schemaSlug.toLowerCase(),
					schemaSlug.replace(/[-_]/g, ''),
					`page_${baseSlug}`,
					`page${baseSlug.charAt(0).toUpperCase()}${baseSlug.slice(1)}`,
					baseSlug,
				])
			).filter(Boolean);

			let schemaId: string | null = null;

			for (const slug of candidateSlugs) {
				const schemaRes = await $fetch<any>(`${apiBase}/api/v1/content/schemas/by-identifier/${slug}`, {
					responseType: 'json',
				}).catch(() => null);

				if (schemaRes?.data?.id) {
					schemaId = schemaRes.data.id;

					break;
				}
			}

			if (schemaId) {
				const entriesRes = await $fetch<any>(`${apiBase}/api/v1/content/schemas/${schemaId}/entries`, {
					responseType: 'json',
				}).catch(() => null);

				const entry = entriesRes?.data?.[0];

				return entry?.data || null;
			}
		} catch (err) {
			console.warn('[useCmsPage] Failed to fetch remote entry:', err);

			return null;
		}

		return null;
	});

	if (remoteData.value) {
		applyData(remoteData.value);

		isLoading.value = false;
	}

	watch(remoteData, (val) => {
		if (val) {
			applyData(val);

			isLoading.value = false;
		}
	});

	const sendReadySignal = () => {
		const signal = {
			type: 'PREVIEW_READY',
			schema: schemaSlug,
			slug: route.params.slug || schemaSlug,
			timestamp: Date.now(),
		};

		// Send to iframe parent (Split View in Admin)
		if (typeof window !== 'undefined' && window.parent && window.parent !== window) {
			window.parent.postMessage(signal, '*');
		}

		// Send to window opener (when opened in separate tab)
		if (typeof window !== 'undefined' && window.opener && !window.opener.closed) {
			window.opener.postMessage(signal, '*');
		}
	};

	const handleMessage = (event: MessageEvent) => {
		if (event.data?.type === 'CMS_PREVIEW_DATA') {
			const raw = event.data?.payload || event.data?.data || {};
			const draft = raw.data || raw.entry?.data || raw;
			const incomingSchema = raw.schema;

			const incomingSlug = (incomingSchema?.slug || incomingSchema?.name || '').toLowerCase().replace(/[-_]/g, '');
			const currentTargetSlug = schemaSlug.toLowerCase().replace(/[-_]/g, '');
			const incomingBase = incomingSlug.replace(/^page/, '');
			const currentBase = currentTargetSlug.replace(/^page/, '');

			// Match schema if identifier matches specifically to this page's schema
			const matchesSchema =
				!incomingSlug ||
				incomingSlug === currentTargetSlug ||
				(incomingBase && currentBase && incomingBase === currentBase);

			if (matchesSchema && draft && typeof draft === 'object') {
				applyData(draft);

				isConnectedToCms.value = true;

				isPreview.value = true;

				isLoading.value = false;
			}
		}
	};

	onMounted(() => {
		const isFrame = typeof window !== 'undefined' && window.parent && window.parent !== window
		const hasPreviewParam = route.query.preview === 'true'

		isPreview.value = Boolean(isFrame || hasPreviewParam)

		if (typeof window !== 'undefined') {
			window.addEventListener('message', handleMessage)

			// Signal CMS editor that this preview page is ready
			sendReadySignal()

			setTimeout(sendReadySignal, 200)

			setTimeout(sendReadySignal, 600)
		}
	})

	onUnmounted(() => {
		if (typeof window !== 'undefined') {
			window.removeEventListener('message', handleMessage)
		}
	})

	return {
		data: pageData,
		isPreview,
		isConnectedToCms,
		isLoading,
		refresh,
	}
}

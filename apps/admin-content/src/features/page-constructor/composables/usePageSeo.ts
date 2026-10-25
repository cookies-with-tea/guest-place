import { computed, reactive, ref } from 'vue'
import type { PageDocument } from './usePageDocument'

/**
 * Owns SEO-derived values for the page settings tab: effective title/description with their
 * length status, the SERP/social preview card, the canonical/sitemap URLs, and breadcrumb display.
 */
export function usePageSeo(pageDocument: PageDocument) {
	const pageForm = pageDocument.pageForm
	const serpPreviewTab = ref<'google' | 'social'>('google')

	const effectiveSeoTitle = computed(() => {
		if (pageForm.seo?.title && pageForm.seo.title.trim()) return pageForm.seo.title
		return pageForm.title ? `${pageForm.title} | Guest & Place` : 'Guest & Place — Каталог площадок и мероприятий'
	})

	const effectiveSeoDesc = computed(() => {
		if (pageForm.seo?.description && pageForm.seo.description.trim()) return pageForm.seo.description
		return 'Интерактивная платформа для поиска и бронирования залов, площадок для корпоративов, свадеб и деловых событий.'
	})

	const seoTitleLengthStatus = computed(() => {
		const l = effectiveSeoTitle.value.length
		if (l >= 30 && l <= 60) return 'success'
		if (l > 60) return 'danger'
		return 'warning'
	})

	const seoDescLengthStatus = computed(() => {
		const l = (pageForm.seo?.description || '').length
		if (l >= 100 && l <= 160) return 'success'
		if (l > 160) return 'danger'
		return 'info'
	})

	const breadcrumbSlugDisplay = computed(() => {
		const current = pageForm.slug ? pageForm.slug.replace(/^\/+/, '') : 'page'
		if (pageForm.parent_id) {
			const parent = pageDocument.availableParentPages.find((p) => p.id === pageForm.parent_id)
			if (parent) return `${parent.slug} › ${current}`
		}
		return current
	})

	const ogImageStyle = computed(() => {
		if (pageForm.seo?.og_image) {
			return { backgroundImage: `url(${pageForm.seo.og_image})`, backgroundSize: 'cover', backgroundPosition: 'center' }
		}
		return {}
	})

	const clientBaseUrl = computed(() => import.meta.env.VITE_CLIENT_URL || 'http://localhost:3000')

	const computedCanonicalUrl = computed(() => {
		const base = clientBaseUrl.value.replace(/\/$/, '')
		const cleanSlug = pageForm.slug ? pageForm.slug.replace(/^\/+/, '') : 'page'
		return `${base}/p/${cleanSlug}`
	})

	const sitemapUrl = computed(() => `${clientBaseUrl.value.replace(/\/$/, '')}/sitemap.xml`)

	function openSitemapXml() {
		window.open(sitemapUrl.value, '_blank')
	}

	return reactive({
		serpPreviewTab,
		effectiveSeoTitle,
		effectiveSeoDesc,
		seoTitleLengthStatus,
		seoDescLengthStatus,
		breadcrumbSlugDisplay,
		ogImageStyle,
		computedCanonicalUrl,
		sitemapUrl,
		openSitemapXml,
	})
}

export type PageSeo = ReturnType<typeof usePageSeo>

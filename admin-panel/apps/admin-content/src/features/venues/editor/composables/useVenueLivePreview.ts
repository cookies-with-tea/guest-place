import { computed, reactive, ref } from 'vue'
import { getClientBaseUrl, splitCommaList, splitLineList } from '../../lib/helpers'
import type { VenueForm } from './useVenueForm'

export type SplitRatio = '50-50' | '60-40' | 'full'

/**
 * Owns the split live-preview panel for the venue editor: the preview iframe, the split-ratio
 * and device toggles, and the postMessage bridge that pushes form edits into the preview page.
 */
export function useVenueLivePreview(venueForm: VenueForm) {
	const splitRatio = ref<SplitRatio>('50-50')
	const previewDevice = ref<'desktop' | 'tablet' | 'mobile'>('desktop')
	const previewIframeRef = ref<HTMLIFrameElement | null>(null)

	const previewIframeUrl = computed(() => {
		const slug = venueForm.form.slug || 'loft-forest-hall'
		return `${getClientBaseUrl()}/venues/${slug}?preview=true`
	})

	function reloadPreviewIframe() {
		if (!previewIframeRef.value) return
		const targetUrl = previewIframeUrl.value
		previewIframeRef.value.src = 'about:blank'
		setTimeout(() => {
			if (previewIframeRef.value) previewIframeRef.value.src = targetUrl
		}, 80)
	}

	function onIframeLoad() {
		syncLivePreview()
	}

	let syncTimeout: ReturnType<typeof setTimeout> | null = null
	function syncLivePreview() {
		if (splitRatio.value === 'full') return
		if (syncTimeout) clearTimeout(syncTimeout)
		syncTimeout = setTimeout(() => {
			const iframe = previewIframeRef.value
			if (!iframe?.contentWindow) return

			const form = venueForm.form
			const payload = {
				title: form.title,
				subtitle: form.subtitle,
				descriptionHtml: form.description_html,
				phone: form.phone,
				hallsCount: form.halls_count,
				location: {
					address: form.address,
					city: form.city,
					metro: form.metro_station
						? { station: form.metro_station, distanceText: form.metro_distance_text || '5 мин пешком' }
						: undefined,
				},
				workingHours: { weekdays: form.working_hours_weekdays, weekends: form.working_hours_weekends },
				pricing: {
					averageCheck: form.average_check,
					banquetMenuPriceFrom: form.banquet_price_from,
					rentPricePerHour: form.rent_price_hour,
					corkageFee: { hasFee: form.corkage_fee_has, description: form.corkage_fee_desc },
					priceLevel: form.price_level,
				},
				capacitySummary: {
					banquet: form.capacity_banquet,
					buffet: form.capacity_buffet,
					theater: form.capacity_theater,
					areaSqm: form.area_sqm,
				},
				gallery: {
					mainPhoto: splitLineList(venueForm.photosString)[0] || '',
					photos: splitLineList(venueForm.photosString),
					videoTourUrl: form.video_tour_url,
					hasOnlineTour: form.has_online_tour,
				},
				details: {
					venueTypes: splitCommaList(venueForm.typesString),
					features: splitCommaList(venueForm.featuresString),
					cuisines: splitCommaList(venueForm.cuisinesString),
					services: splitCommaList(venueForm.servicesString),
					equipment: splitCommaList(venueForm.equipmentString),
					parking: form.parking,
					halls: venueForm.formHalls,
					rooms: venueForm.formRooms,
				},
				faq: venueForm.formFaq,
				feed: venueForm.formFeed,
				reviews: venueForm.formReviews,
				menuPhotos: venueForm.formMenuPhotos,
				menuUrl: form.menu_url,
				riderUrl: form.rider_url,
			}

			iframe.contentWindow.postMessage({ type: 'VENUE_PREVIEW_DATA', payload }, '*')
		}, 120)
	}

	return reactive({
		splitRatio,
		previewDevice,
		previewIframeRef,
		previewIframeUrl,
		reloadPreviewIframe,
		onIframeLoad,
		syncLivePreview,
	})
}

export type VenueLivePreview = ReturnType<typeof useVenueLivePreview>

import { describe, expect, it } from 'vitest'

import { filterMediaItemLocally } from '../entities/media/lib/composables/useMedia'
import type { MediaItem } from '../entities/media/model'

describe('Media Filters and Smart Search Logic', () => {
	const sampleMedia: MediaItem[] = [
		{
			uuid: 'media-1',
			name: 'sunset_beach',
			title: 'Sunset at Golden Beach',
			alt: 'Warm ocean sunset',
			url: '/uploads/sunset.jpg',
			extension: 'jpg',
			category: 'Suites',
			tags: ['ocean', 'sunset', 'luxury'],
			sizeBytes: 850 * 1024, // 850 KB
			createdAt: '2026-05-10T12:00:00Z',
			source: 'site',
			mediaType: 'image',
		},
		{
			uuid: 'media-2',
			name: 'hotel_tour_video',
			title: 'Virtual Hotel Tour',
			alt: 'Video showing amenities',
			url: '/uploads/hotel_tour.mp4',
			extension: 'mp4',
			category: 'Amenities',
			tags: ['video', 'tour', 'promo'],
			sizeBytes: 15 * 1024 * 1024, // 15 MB
			createdAt: '2026-06-01T15:30:00Z',
			source: 'admin',
			mediaType: 'video',
		},
		{
			uuid: 'media-3',
			name: 'spa_brochure',
			title: 'Spa and Wellness Guide',
			alt: 'Brochure PDF',
			url: '/uploads/brochure.pdf',
			extension: 'pdf',
			category: 'Marketing',
			tags: ['spa', 'wellness', 'guide'],
			sizeBytes: 3 * 1024 * 1024, // 3 MB
			createdAt: '2026-07-20T10:00:00Z',
			source: 'site',
			mediaType: 'document',
		},
	]

	it('smart search finds items by tag, category, and extension as well as title/name', () => {
		// Search by tag
		const tagMatch = sampleMedia.filter((item) => filterMediaItemLocally(item, { search: 'luxury' }))

		expect(tagMatch).toHaveLength(1)

		expect(tagMatch[0].uuid).toBe('media-1')

		// Search by category
		const catMatch = sampleMedia.filter((item) => filterMediaItemLocally(item, { search: 'Amenities' }))

		expect(catMatch).toHaveLength(1)

		expect(catMatch[0].uuid).toBe('media-2')

		// Search by extension
		const extMatch = sampleMedia.filter((item) => filterMediaItemLocally(item, { search: 'pdf' }))

		expect(extMatch).toHaveLength(1)

		expect(extMatch[0].uuid).toBe('media-3')

		// Search by alt text
		const altMatch = sampleMedia.filter((item) => filterMediaItemLocally(item, { search: 'ocean' }))

		expect(altMatch).toHaveLength(1)

		expect(altMatch[0].uuid).toBe('media-1')
	})

	it('filters accurately by media types', () => {
		const imagesOnly = sampleMedia.filter((item) => filterMediaItemLocally(item, { mediaTypes: ['image'] }))

		expect(imagesOnly).toHaveLength(1)

		expect(imagesOnly[0].mediaType).toBe('image')

		const videoAndDoc = sampleMedia.filter((item) =>
			filterMediaItemLocally(item, { mediaTypes: ['video', 'document'] })
		)

		expect(videoAndDoc).toHaveLength(2)
	})

	it('filters accurately by category and tags', () => {
		const marketingItems = sampleMedia.filter((item) => filterMediaItemLocally(item, { category: ['Marketing'] }))

		expect(marketingItems).toHaveLength(1)

		expect(marketingItems[0].category).toBe('Marketing')

		const promoItems = sampleMedia.filter((item) => filterMediaItemLocally(item, { tags: ['promo'] }))

		expect(promoItems).toHaveLength(1)

		expect(promoItems[0].uuid).toBe('media-2')
	})

	it('filters accurately by file size range', () => {
		// Small files < 1MB
		const smallFiles = sampleMedia.filter((item) => filterMediaItemLocally(item, { maxSizeBytes: 1024 * 1024 }))

		expect(smallFiles).toHaveLength(1)

		expect(smallFiles[0].uuid).toBe('media-1')

		// Medium files 1MB - 5MB
		const mediumFiles = sampleMedia.filter((item) =>
			filterMediaItemLocally(item, {
				minSizeBytes: 1024 * 1024,
				maxSizeBytes: 5 * 1024 * 1024,
			})
		)

		expect(mediumFiles).toHaveLength(1)

		expect(mediumFiles[0].uuid).toBe('media-3')

		// Large files > 5MB
		const largeFiles = sampleMedia.filter((item) => filterMediaItemLocally(item, { minSizeBytes: 5 * 1024 * 1024 }))

		expect(largeFiles).toHaveLength(1)

		expect(largeFiles[0].uuid).toBe('media-2')
	})

	it('filters accurately by date range', () => {
		// Items created in May-June 2026
		const springItems = sampleMedia.filter((item) =>
			filterMediaItemLocally(item, {
				dateFrom: '2026-05-01T00:00:00Z',
				dateTo: '2026-06-15T00:00:00Z',
			})
		)

		expect(springItems).toHaveLength(2)

		expect(springItems.map((i) => i.uuid)).toEqual(['media-1', 'media-2'])

		// Items created after July 2026
		const summerItems = sampleMedia.filter((item) => filterMediaItemLocally(item, { dateFrom: '2026-07-01T00:00:00Z' }))

		expect(summerItems).toHaveLength(1)

		expect(summerItems[0].uuid).toBe('media-3')
	})

	it('combines multiple filters simultaneously', () => {
		const combined = sampleMedia.filter((item) =>
			filterMediaItemLocally(item, {
				mediaTypes: ['image', 'video'],
				minSizeBytes: 500 * 1024,
				maxSizeBytes: 2 * 1024 * 1024,
				category: ['Suites'],
				tags: ['ocean'],
			})
		)

		expect(combined).toHaveLength(1)

		expect(combined[0].uuid).toBe('media-1')
	})
})

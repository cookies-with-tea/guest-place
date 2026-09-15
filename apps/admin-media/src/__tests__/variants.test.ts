import { describe, expect, it, vi } from 'vitest'

const fetchDataMock = vi.fn()

vi.mock('@admin-panel/lib', () => ({
	createApi: () => ({
		fetchData: (...args: any[]) => fetchDataMock(...args),
	}),
}))

import { mediaApi, optimize, optimizeBulk } from '../entities/media/api'
import type { MediaItem } from '../entities/media/model'

describe('Media Variants and Optimization API', () => {
	it('calls optimize endpoint with POST /{uuid}/optimize', async () => {
		const mockResponse: MediaItem = {
			uuid: '11111111-2222-3333-4444-555555555555',
			url: 'http://localhost:8080/uploads/original.png',
			sizeBytes: 2048,
			createdAt: new Date().toISOString(),
			source: 'cms',
			mediaType: 'image',
			width: 1920,
			height: 1080,
			blurhash: 'LEHV6nWB2yk8pyo0adR*.7kCMdnj',
			optimizedPath: 'variants/11111111-2222-3333-4444-555555555555/original.webp',
			variants: {
				thumbnail: {
					path: 'variants/11111111-2222-3333-4444-555555555555/thumbnail.webp',
					url: 'http://localhost:8080/uploads/variants/11111111-2222-3333-4444-555555555555/thumbnail.webp',
					width: 256,
					height: 144,
					format: 'webp',
					sizeBytes: 15000,
				},
				medium: {
					path: 'variants/11111111-2222-3333-4444-555555555555/medium.webp',
					url: 'http://localhost:8080/uploads/variants/11111111-2222-3333-4444-555555555555/medium.webp',
					width: 800,
					height: 450,
					format: 'webp',
					sizeBytes: 45000,
				},
				large: {
					path: 'variants/11111111-2222-3333-4444-555555555555/large.webp',
					url: 'http://localhost:8080/uploads/variants/11111111-2222-3333-4444-555555555555/large.webp',
					width: 1600,
					height: 900,
					format: 'webp',
					sizeBytes: 120000,
				},
			},
		}

		fetchDataMock.mockResolvedValueOnce({ data: mockResponse })

		const res = await optimize('11111111-2222-3333-4444-555555555555')
		expect(fetchDataMock).toHaveBeenCalledWith('/11111111-2222-3333-4444-555555555555/optimize', {
			method: 'POST',
		})
		expect(res.data.variants?.thumbnail?.format).toBe('webp')
		expect(res.data.variants?.thumbnail?.width).toBe(256)
	})

	it('calls optimizeBulk endpoint with POST /optimize/bulk', async () => {
		const uuids = ['uuid-1', 'uuid-2']
		fetchDataMock.mockResolvedValueOnce({ data: [] })

		await optimizeBulk(uuids)
		expect(fetchDataMock).toHaveBeenCalledWith('/optimize/bulk', {
			method: 'POST',
			body: { uuids },
		})
	})

	it('correctly resolves responsive thumbnail url or falls back to original url', () => {
		const itemWithVariants: MediaItem = {
			uuid: 'u1',
			url: 'http://localhost:8080/uploads/orig.png',
			sizeBytes: 50000,
			createdAt: '',
			source: 'site',
			mediaType: 'image',
			variants: {
				thumbnail: {
					path: 'variants/u1/thumbnail.webp',
					url: 'http://localhost:8080/uploads/variants/u1/thumbnail.webp',
					width: 256,
					height: 256,
					format: 'webp',
					sizeBytes: 5000,
				},
			},
		}

		const itemWithoutVariants: MediaItem = {
			uuid: 'u2',
			url: 'http://localhost:8080/uploads/orig.png',
			sizeBytes: 50000,
			createdAt: '',
			source: 'site',
			mediaType: 'image',
		}

		const getPreviewUrl = (row: MediaItem) => row.variants?.thumbnail?.url || row.optimizedPath || row.url

		expect(getPreviewUrl(itemWithVariants)).toBe(
			'http://localhost:8080/uploads/variants/u1/thumbnail.webp'
		)
		expect(getPreviewUrl(itemWithoutVariants)).toBe('http://localhost:8080/uploads/orig.png')
	})
})

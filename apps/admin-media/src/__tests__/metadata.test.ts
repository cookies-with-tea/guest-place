import { describe, expect, it } from 'vitest'

import type { MediaItem } from '../entities/media/model'

describe('Media Metadata, Palette, and EXIF Handling', () => {
	it('correctly models item with dominantColor, palette, and sanitized EXIF', () => {
		const item: MediaItem = {
			uuid: 'test-uuid-metadata',
			url: 'http://localhost:8080/uploads/photo.jpg',
			sizeBytes: 1048576,
			createdAt: '2026-09-15T09:00:00Z',
			source: 'admin',
			mediaType: 'image',
			width: 3840,
			height: 2160,
			dominantColor: '#3a5f8b',
			palette: ['#3a5f8b', '#e2d5c3', '#1b2228', '#8a9ea7', '#d48b4c'],
			exif: {
				make: 'Canon',
				model: 'EOS R5',
				dateTime: '2026-08-20 14:32:10',
				iso: 100,
				fNumber: '2.8',
				exposureTime: '1/250',
				focalLength: '50',
				sanitized: true,
				gpsStripped: true,
			},
		}

		expect(item.dominantColor).toBe('#3a5f8b')

		expect(item.palette).toHaveLength(5)

		expect(item.palette).toContain('#3a5f8b')

		expect(item.palette).toContain('#e2d5c3')

		expect(item.exif?.make).toBe('Canon')

		expect(item.exif?.model).toBe('EOS R5')

		expect(item.exif?.sanitized).toBe(true)

		expect(item.exif?.gpsStripped).toBe(true)
	})

	it('detects when EXIF data is present vs empty', () => {
		const hasExifData = (exif?: Record<string, any>) => {
			if (!exif) return false

			return Boolean(
				exif.make ||
					exif.model ||
					exif.dateTime ||
					exif.iso ||
					exif.fNumber ||
					exif.exposureTime ||
					exif.sanitized ||
					exif.gpsStripped
			)
		}

		expect(hasExifData(undefined)).toBe(false)

		expect(hasExifData({})).toBe(false)

		expect(hasExifData({ make: 'Apple' })).toBe(true)

		expect(hasExifData({ sanitized: true })).toBe(true)

		expect(hasExifData({ gpsStripped: true })).toBe(true)
	})

	it('formats camera settings display string properly', () => {
		const formatCameraSettings = (exif: Record<string, any>) => {
			return [
				exif.fNumber ? `f/${exif.fNumber}` : '',
				exif.exposureTime ? `${exif.exposureTime}s` : '',
				exif.iso ? `ISO ${exif.iso}` : '',
				exif.focalLength ? `${exif.focalLength}mm` : '',
			]
				.filter(Boolean)
				.join(' · ')
		}

		const exif = {
			fNumber: '1.8',
			exposureTime: '1/500',
			iso: 200,
			focalLength: '35',
		}

		expect(formatCameraSettings(exif)).toBe('f/1.8 · 1/500s · ISO 200 · 35mm')
	})
})

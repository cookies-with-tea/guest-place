import { describe, expect, it, vi } from 'vitest'

const initMock = vi.fn().mockResolvedValue({
	data: {
		uploadId: 'test-upload-uuid',
		chunkSize: 400,
		totalChunks: 3,
		receivedChunks: [],
	},
})

const uploadChunkMock = vi.fn().mockResolvedValue({
	data: {
		uploadId: 'test-upload-uuid',
		chunkIndex: 0,
		receivedChunks: [0],
		totalChunks: 3,
	},
})

const getChunkStatusMock = vi.fn().mockResolvedValue({
	data: {
		uploadId: 'test-upload-uuid',
		totalChunks: 3,
		totalSize: 1000,
		receivedChunks: [],
		isComplete: false,
	},
})

const completeMock = vi.fn().mockResolvedValue({
	data: {
		uuid: 'final-media-uuid',
		url: 'http://localhost:8000/uploads/final.dat',
		name: 'sample',
		extension: 'dat',
		sizeBytes: 1000,
		createdAt: new Date().toISOString(),
		source: 'cms',
		mediaType: 'other',
	},
})

vi.mock('../entities/media/api', () => ({
	initChunkUpload: (...args: any[]) => initMock(...args),
	uploadChunk: (...args: any[]) => uploadChunkMock(...args),
	getChunkStatus: (...args: any[]) => getChunkStatusMock(...args),
	completeChunkUpload: (...args: any[]) => completeMock(...args),
}))

import { calculateSha256, uploadFileInChunks } from '../entities/media/lib/chunkUploader'

describe('chunkUploader', () => {
	it('calculates SHA-256 correctly for a text file', async () => {
		const content = 'Hello, chunk world!'
		const file = new File([content], 'hello.txt', { type: 'text/plain' })
		const hash = await calculateSha256(file)

		// Expected SHA-256 for 'Hello, chunk world!'
		expect(hash).toBe('0a69c09f7c1eca87a0a6fb108e3aeb1929a2e4bb732a021612730325fd5875b2')
	})

	it('uploads file in chunks calling API methods and reporting progress', async () => {
		const content = '1234567890'.repeat(100) // 1000 bytes
		const file = new File([content], 'sample.dat', { type: 'application/octet-stream' })

		const progressUpdates: any[] = []
		const result = await uploadFileInChunks({
			file,
			chunkSize: 400,
			title: 'Sample File',
			onProgress: (p) => progressUpdates.push(p),
		})

		expect(initMock).toHaveBeenCalledTimes(1)
		expect(uploadChunkMock).toHaveBeenCalledTimes(3)
		expect(completeMock).toHaveBeenCalledTimes(1)
		expect(result.uuid).toBe('final-media-uuid')
		expect(progressUpdates.some((p) => p.stage === 'hashing')).toBe(true)
		expect(progressUpdates.some((p) => p.stage === 'completed')).toBe(true)
	})
})

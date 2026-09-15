import { completeChunkUpload, getChunkStatus, initChunkUpload, uploadChunk } from '../api'
import type { MediaItem } from '../model'

export interface ChunkUploadProgress {
	percent: number
	currentChunk: number
	totalChunks: number
	stage: 'hashing' | 'uploading' | 'verifying' | 'completed' | 'error'
	message?: string
}

export interface ChunkUploadOptions {
	file: File
	chunkSize?: number // default 2MB
	title?: string
	alt?: string
	category?: string
	tags?: string[]
	source?: string
	convertToWebp?: boolean
	signal?: AbortSignal
	onProgress?: (progress: ChunkUploadProgress) => void
}

/**
 * Calculates SHA-256 checksum of a File using Web Crypto API.
 */
export async function calculateSha256(file: File): Promise<string> {
	let arrayBuffer: ArrayBuffer
	if (typeof file.arrayBuffer === 'function') {
		arrayBuffer = await file.arrayBuffer()
	} else {
		arrayBuffer = await new Response(file).arrayBuffer()
	}
	const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer)
	const hashArray = Array.from(new Uint8Array(hashBuffer))
	return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Uploads a file in chunks with resumable support and SHA-256 validation.
 */
export async function uploadFileInChunks(options: ChunkUploadOptions): Promise<MediaItem> {
	const {
		file,
		chunkSize = 2 * 1024 * 1024, // 2MB chunks
		title,
		alt,
		category,
		tags,
		source = 'cms',
		convertToWebp = true,
		signal,
		onProgress,
	} = options

	const totalSize = file.size
	const totalChunks = Math.max(1, Math.ceil(totalSize / chunkSize))

	// Step 1: Checksum calculation
	onProgress?.({
		percent: 5,
		currentChunk: 0,
		totalChunks,
		stage: 'hashing',
		message: 'Calculating SHA-256 checksum...',
	})

	let checksumSha256: string | undefined
	try {
		checksumSha256 = await calculateSha256(file)
	} catch (e) {
		console.warn('Could not calculate SHA-256 checksum:', e)
	}

	if (signal?.aborted) {
		throw new Error('Upload aborted by user')
	}

	// Step 2: Initialize chunk upload session on backend
	onProgress?.({
		percent: 10,
		currentChunk: 0,
		totalChunks,
		stage: 'uploading',
		message: 'Initializing upload session...',
	})

	const initRes = await initChunkUpload({
		filename: file.name,
		totalSize,
		chunkSize,
		totalChunks,
		checksumSha256,
		title,
		alt,
		category,
		tags,
		source,
		convertToWebp,
	})

	const uploadId = initRes.data.uploadId || (initRes.data as any).upload_id
	if (!uploadId) {
		throw new Error('Server did not return a valid uploadId')
	}

	// Check if any chunks are already uploaded (resuming support)
	let receivedChunks = new Set<number>(
		initRes.data.receivedChunks || (initRes.data as any).received_chunks || []
	)

	// If resuming later or reconnecting, query status
	if (receivedChunks.size === 0) {
		try {
			const statusRes = await getChunkStatus(uploadId)
			const statusReceived = statusRes.data.receivedChunks || (statusRes.data as any).received_chunks || []
			receivedChunks = new Set(statusReceived)
		} catch {
			// Start fresh if status check fails
		}
	}

	// Step 3: Upload each chunk
	for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
		if (signal?.aborted) {
			throw new Error('Upload aborted by user')
		}

		// Skip if already received by server (resumable)
		if (receivedChunks.has(chunkIndex)) {
			const progressPercent = Math.round(10 + ((chunkIndex + 1) / totalChunks) * 80)
			onProgress?.({
				percent: progressPercent,
				currentChunk: chunkIndex + 1,
				totalChunks,
				stage: 'uploading',
				message: `Chunk ${chunkIndex + 1}/${totalChunks} already uploaded, resuming...`,
			})
			continue
		}

		const start = chunkIndex * chunkSize
		const end = Math.min(start + chunkSize, totalSize)
		const chunkBlob = file.slice(start, end)

		// Upload with retry logic (up to 3 retries)
		let attempts = 0
		let success = false
		let lastError: any = null

		while (attempts < 3 && !success) {
			if (signal?.aborted) {
				throw new Error('Upload aborted by user')
			}
			try {
				attempts++
				await uploadChunk(uploadId, chunkIndex, chunkBlob)
				success = true
				receivedChunks.add(chunkIndex)
			} catch (err) {
				lastError = err
				if (attempts < 3) {
					await new Promise((resolve) => setTimeout(resolve, 1000 * attempts))
				}
			}
		}

		if (!success) {
			onProgress?.({
				percent: Math.round(10 + (chunkIndex / totalChunks) * 80),
				currentChunk: chunkIndex,
				totalChunks,
				stage: 'error',
				message: `Failed to upload chunk ${chunkIndex + 1}/${totalChunks}`,
			})
			throw lastError || new Error(`Failed to upload chunk ${chunkIndex}`)
		}

		const progressPercent = Math.round(10 + ((chunkIndex + 1) / totalChunks) * 80)
		onProgress?.({
			percent: progressPercent,
			currentChunk: chunkIndex + 1,
			totalChunks,
			stage: 'uploading',
			message: `Uploaded chunk ${chunkIndex + 1}/${totalChunks}`,
		})
	}

	// Step 4: Finalize and assemble
	onProgress?.({
		percent: 95,
		currentChunk: totalChunks,
		totalChunks,
		stage: 'verifying',
		message: 'Assembling file and verifying checksum...',
	})

	const completeRes = await completeChunkUpload(uploadId)

	onProgress?.({
		percent: 100,
		currentChunk: totalChunks,
		totalChunks,
		stage: 'completed',
		message: 'Upload and processing complete!',
	})

	return completeRes.data
}

export const MEDIA_QUERY_KEY = 'media'

export interface MediaVariant {
	path: string
	url: string
	width: number
	height: number
	format: string
	sizeBytes: number
}

export interface MediaVariants {
	thumbnail?: MediaVariant
	medium?: MediaVariant
	large?: MediaVariant
	original?: MediaVariant
}

export interface MediaItem {
	uuid: string
	title?: string
	alt?: string
	url: string
	name?: string
	extension?: string
	category?: string
	tags?: string[]
	sizeBytes: number
	createdAt: Date | string
	source: string
	mediaType: 'image' | 'video' | 'icon' | 'document' | 'archive' | 'other'
	width?: number
	height?: number
	blurhash?: string
	optimizedPath?: string
	variants?: MediaVariants
	dominantColor?: string
	palette?: string[]
	exif?: Record<string, any>
}

export interface MediaFilters {
	search?: string
	sortBy?: string
	sortOrder?: 'ASC' | 'DESC'
	mediaTypes?: string[]
	category?: string[]
	tags?: string[]
	source?: string[]
	minSizeBytes?: number
	maxSizeBytes?: number
	dateFrom?: string
	dateTo?: string
	page?: number
	limit?: number
}

export interface MediaFile {
	file: File
	name: string
	type: string
	size: number
	preview: string
}

export interface IMedia {
	uuid: string
	url: string
	title?: string
	alt?: string
}

export interface ICreateMedia {
	title?: string
	alt?: string
	file: File
}

export interface IUpdateMedia {
	uuid: string
	title?: string
	alt?: string
	category?: string
	tags?: string[]
}

export interface MediaResponse {
	data: {
		items: MediaItem[]
		pagination: {
			page: number
			limit: number
			total: number
			totalPages: number
		}
	}
}

export interface InitChunkUploadDTO {
	filename: string
	totalSize: number
	chunkSize: number
	totalChunks: number
	checksumSha256?: string
	title?: string
	alt?: string
	category?: string
	tags?: string[]
	source?: string
	convertToWebp?: boolean
}

export interface InitChunkUploadResponse {
	uploadId: string
	chunkSize: number
	totalChunks: number
	receivedChunks: number[]
}

export interface ChunkStatusResponse {
	uploadId: string
	totalChunks: number
	totalSize: number
	receivedChunks: number[]
	isComplete: boolean
}

export interface ChunkUploadResultDTO {
	uploadId: string
	chunkIndex: number
	receivedChunks: number[]
	totalChunks: number
}

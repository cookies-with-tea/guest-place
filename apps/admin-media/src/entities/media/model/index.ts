export const MEDIA_QUERY_KEY = 'media'

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
	mediaType: 'image' | 'video' | 'icon' | 'document' | 'archive' | 'other'
}

export interface MediaFilters {
	search?: string
	sortBy?: string
	sortOrder?: 'ASC' | 'DESC'
	mediaTypes?: string[]
	category?: string[]
	tags?: string[]
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

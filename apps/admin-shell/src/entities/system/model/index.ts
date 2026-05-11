export interface SearchResult {
	id: string
	title: string
	description?: string
	category: string
	path: string
	icon?: string
	metadata?: Record<string, any>
}

export interface SearchResponse {
	results: SearchResult[]
	total: number
}

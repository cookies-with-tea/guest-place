import { createApi } from '@admin-panel/lib'

export interface VenueHall {
	id: string
	name: string
	areaSqm: number
	capacityBanquet: number
	capacityBuffet: number
	capacityTheater: number
	extraDetails?: string
}

export interface VenueRoom {
	id: string
	roomType: string
	placement: string
	priceRub: number
	extraInfo?: string
}

export interface VenueFaq {
	id: string
	question: string
	answer: string
}

export interface VenueReview {
	id: string
	author: string
	avatar?: string
	date: string
	rating: number
	text: string
}

export interface VenueFeedItem {
	id: string
	author: string
	authorAvatar?: string
	publishedAgo: string
	text: string
	imageUrl?: string
	videoUrl?: string
	likesCount: number
	isLiked?: boolean
}

export interface VenuePricingCategory {
	label: string
	value?: string
	largeHall?: string
	smallHall?: string
	allVenue?: string
	type: 'merged' | 'split'
}

export interface VenuePricingTable {
	categories?: VenuePricingCategory[]
	notes?: string[]
}

export interface Venue {
	id: string
	slug: string
	title: string
	subtitle?: string
	description_html?: string
	phone?: string
	address: string
	city: string
	metro_station?: string
	metro_distance_minutes?: number
	metro_distance_text?: string
	metro_line_color?: string
	coordinates_lat?: number
	coordinates_lng?: number
	average_check?: number
	banquet_price_from?: number
	rent_price_hour?: number
	corkage_fee_has?: boolean
	corkage_fee_desc?: string
	price_level?: string
	halls_count?: number
	capacity_banquet?: string
	capacity_buffet?: string
	capacity_theater?: string
	area_sqm?: string
	working_hours_weekdays?: string
	working_hours_weekends?: string
	rating_score?: number
	rating_reviews_count?: number
	venue_types?: string[]
	features?: string[]
	cuisines?: string[]
	services?: string[]
	parking?: string
	equipment?: string[]
	halls?: VenueHall[]
	rooms?: VenueRoom[]
	gallery_photos?: string[]
	video_tour_url?: string
	has_online_tour?: boolean
	faq?: VenueFaq[]
	feed?: VenueFeedItem[]
	menu_photos?: string[]
	reviews?: VenueReview[]
	pricing_table?: VenuePricingTable
	menu_url?: string
	rider_url?: string
	status: string
	created_at: string
	updated_at: string
}

export type CreateVenueDTO = Omit<Venue, 'id' | 'created_at' | 'updated_at'>
export type UpdateVenueDTO = Partial<CreateVenueDTO>

export interface VenuesFilterQuery {
	search?: string
	status?: string
	venueTypes?: string | string[]
	features?: string | string[]
	cuisines?: string | string[]
	services?: string | string[]
	city?: string
	metroStation?: string
	minCapacity?: number
	maxCapacity?: number
	minPrice?: number
	maxPrice?: number
	priceLevel?: string
	hasOnlineTour?: boolean
	sortBy?: string
	sortOrder?: 'asc' | 'desc' | 'ASC' | 'DESC'
	page?: number
	limit?: number
	offset?: number
}

export interface VenuesPagination {
	page: number
	total?: number
	totalPages?: number
	limit?: number
}

export interface VenuesPaginatedResponse {
	items: Venue[]
	pagination: VenuesPagination
}

const { fetchData: fetchVenues } = createApi('venues')

export const venuesApi = {
	getVenues: (params?: VenuesFilterQuery) => {
		const query = new URLSearchParams()
		if (params?.search) query.append('search', params.search)
		if (params?.status) query.append('status', params.status)
		if (params?.venueTypes) {
			const vt = Array.isArray(params.venueTypes) ? params.venueTypes.join(',') : params.venueTypes
			query.append('venue_types', vt)
		}
		if (params?.features) {
			const ft = Array.isArray(params.features) ? params.features.join(',') : params.features
			query.append('features', ft)
		}
		if (params?.cuisines) {
			const c = Array.isArray(params.cuisines) ? params.cuisines.join(',') : params.cuisines
			query.append('cuisines', c)
		}
		if (params?.services) {
			const s = Array.isArray(params.services) ? params.services.join(',') : params.services
			query.append('services', s)
		}
		if (params?.city) query.append('city', params.city)
		if (params?.metroStation) query.append('metro_station', params.metroStation)
		if (params?.minCapacity != null) query.append('min_capacity', String(params.minCapacity))
		if (params?.maxCapacity != null) query.append('max_capacity', String(params.maxCapacity))
		if (params?.minPrice != null) query.append('min_price', String(params.minPrice))
		if (params?.maxPrice != null) query.append('max_price', String(params.maxPrice))
		if (params?.priceLevel) query.append('price_level', params.priceLevel)
		if (params?.hasOnlineTour != null) query.append('has_online_tour', String(params.hasOnlineTour))
		if (params?.sortBy) query.append('sort_by', params.sortBy)
		if (params?.sortOrder) query.append('sort_order', params.sortOrder)
		if (params?.page != null) query.append('page', String(params.page))
		if (params?.limit != null) query.append('limit', String(params.limit))
		if (params?.offset != null) query.append('offset', String(params.offset))

		const qs = query.toString()
		return fetchVenues<VenuesPaginatedResponse>(qs ? `?${qs}` : '')
	},

	getVenue: (idOrSlug: string) => fetchVenues<Venue>(`/${idOrSlug}`),

	createVenue: (payload: CreateVenueDTO) =>
		fetchVenues<Venue>('', {
			method: 'POST',
			body: payload,
		}),

	updateVenue: (id: string, payload: UpdateVenueDTO) =>
		fetchVenues<Venue>(`/${id}`, {
			method: 'PATCH',
			body: payload,
		}),

	deleteVenue: (id: string) =>
		fetchVenues(`/${id}`, {
			method: 'DELETE',
		}),
}


import { fetchData } from '#shared/api'
import type { VenueType, VenuePreviewType, VenueServerDto } from '../model/types'
import { MOCK_VENUE_FOREST_HALL, MOCK_NEARBY_VENUES } from '../mock/venue.mock'

export const mapServerDtoToVenue = (v: VenueServerDto): VenueType => {
  return {
    id: v.id,
    slug: v.slug,
    title: v.title,
    subtitle: v.subtitle || '',
    descriptionHtml: v.descriptionHtml || '',
    rating: {
      score: v.ratingScore || 5.0,
      reviewsCount: v.ratingReviewsCount || 0,
    },
    phone: v.phone || '',
    hallsCount: v.hallsCount || 1,
    location: {
      address: v.address,
      city: v.city || 'Москва',
      metro: v.metroStation
        ? {
            station: v.metroStation,
            walkMinutes: v.metroDistanceMinutes || 5,
            distanceText: v.metroDistanceText || '5 мин пешком',
            lineColor: v.metroLineColor || undefined,
          }
        : undefined,
      coordinates:
        v.coordinatesLat != null && v.coordinatesLng != null
          ? {
              lat: v.coordinatesLat,
              lng: v.coordinatesLng,
            }
          : undefined,
    },
    workingHours: {
      weekdays: v.workingHoursWeekdays || 'Пн - Чт: с 12:00 до 22:00',
      weekends: v.workingHoursWeekends || 'Пт - Вс: с 10:00 до 24:00',
    },
    pricing: {
      averageCheck: v.averageCheck || 0,
      banquetMenuPriceFrom: v.banquetPriceFrom || 0,
      rentPricePerHour: v.rentPriceHour || 0,
      corkageFee: {
        hasFee: v.corkageFeeHas ?? false,
        description: v.corkageFeeDesc || '',
      },
      priceLevel: (v.priceLevel as '$' | '$$' | '$$$' | '$$$$') || '$$$',
    },
    capacitySummary: {
      banquet: v.capacityBanquet || '20/40/60',
      buffet: v.capacityBuffet || '40/80/120',
      theater: v.capacityTheater || '60/100/140',
      areaSqm: v.areaSqm || '50/100/120',
    },
    gallery: {
      mainPhoto: v.galleryPhotos?.[0] || MOCK_VENUE_FOREST_HALL.gallery.mainPhoto,
      photos: v.galleryPhotos?.length ? v.galleryPhotos : MOCK_VENUE_FOREST_HALL.gallery.photos,
      videoTourUrl: v.videoTourUrl || '',
      hasOnlineTour: v.hasOnlineTour ?? true,
    },
    details: {
      venueTypes: v.venueTypes || [],
      features: v.features || [],
      cuisines: v.cuisines || [],
      services: v.services || [],
      parking: v.parking || '',
      equipment: v.equipment || [],
      halls: Array.isArray(v.halls) && v.halls.length ? v.halls : MOCK_VENUE_FOREST_HALL.details.halls,
      rooms: Array.isArray(v.rooms) && v.rooms.length ? v.rooms : MOCK_VENUE_FOREST_HALL.details.rooms,
    },
    faq: Array.isArray(v.faq) && v.faq.length ? v.faq : MOCK_VENUE_FOREST_HALL.faq,
    feed: Array.isArray(v.feed) && v.feed.length ? v.feed : MOCK_VENUE_FOREST_HALL.feed,
    menuPhotos:
      Array.isArray(v.menuPhotos || (v as any).menu_photos) && (v.menuPhotos || (v as any).menu_photos).length
        ? (v.menuPhotos || (v as any).menu_photos)
        : MOCK_VENUE_FOREST_HALL.menuPhotos,
    reviews:
      Array.isArray(v.reviews) && v.reviews.length ? v.reviews : MOCK_VENUE_FOREST_HALL.reviews,
    pricingTable: v.pricingTable || (v as any).pricing_table,
    menuUrl: v.menuUrl || (v as any).menu_url,
    riderUrl: v.riderUrl || (v as any).rider_url,
  }
}

export const getVenueBySlug = async (slug: string): Promise<VenueType> => {
  try {
    const res = await fetchData<VenueServerDto>(`/api/v1/venues/${slug}`, {
      method: 'GET',
    })
    const v = res.data
    if (v) {
      return mapServerDtoToVenue(v)
    }
    return MOCK_VENUE_FOREST_HALL
  } catch {
    return MOCK_VENUE_FOREST_HALL
  }
}

export interface VenuesQueryParams {
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

export interface VenuesListResponse {
  items: VenueType[]
  pagination: {
    page: number
    total: number
    totalPages: number
    limit: number
  }
}

export const getVenues = async (params?: VenuesQueryParams): Promise<VenuesListResponse> => {
  try {
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
    const url = `/api/v1/venues${qs ? `?${qs}` : ''}`
    const res = await fetchData<any>(url, { method: 'GET' })

    const rawData = res.data
    const rawItems: VenueServerDto[] = Array.isArray(rawData)
      ? rawData
      : Array.isArray(rawData?.items)
        ? rawData.items
        : []

    const items = rawItems.map(mapServerDtoToVenue)
    const pagination = rawData?.pagination || {
      page: params?.page || 1,
      total: items.length,
      totalPages: 1,
      limit: params?.limit || 10,
    }

    return {
      items,
      pagination: {
        page: pagination.page || 1,
        total: pagination.total ?? items.length,
        totalPages: pagination.totalPages || pagination.total_pages || 1,
        limit: pagination.limit || 10,
      },
    }
  } catch (error) {
    console.error('Failed to get venues:', error)
    return {
      items: [MOCK_VENUE_FOREST_HALL],
      pagination: {
        page: 1,
        total: 1,
        totalPages: 1,
        limit: 10,
      },
    }
  }
}

export const mapVenueToPreview = (item: any): VenuePreviewType => ({
  id: item.id,
  slug: item.slug,
  title: item.title,
  previewImage: item.galleryPhotos?.[0] || (item as any).gallery_photos?.[0] || MOCK_VENUE_FOREST_HALL.gallery.mainPhoto,
  rating: {
    score: item.ratingScore || (item as any).rating_score || 5.0,
    reviewsCount: item.ratingReviewsCount || (item as any).rating_reviews_count || 0,
  },
  metro: (item.metroStation || (item as any).metro_station)
    ? {
        station: item.metroStation || (item as any).metro_station,
        distanceText: item.metroDistanceText || (item as any).metro_distance_text || '5 мин пешком',
        lineColor: item.metroLineColor || (item as any).metro_line_color || undefined,
      }
    : undefined,
  capacityText: item.capacityBanquet || (item as any).capacity_banquet || '30/80/150',
  priceLevel: (item.priceLevel || (item as any).price_level || '$$$') as '$' | '$$' | '$$$' | '$$$$',
})

export const getNearbyVenues = async (currentVenueId?: string): Promise<VenuePreviewType[]> => {
  try {
    const res = await fetchData<any>('/api/v1/venues', {
      method: 'GET',
    })
    const rawData = res.data
    const rawList: VenueServerDto[] = Array.isArray(rawData)
      ? rawData
      : Array.isArray(rawData?.items)
        ? rawData.items
        : []

    if (rawList && rawList.length > 0) {
      return rawList
        .filter((item) => item.id !== currentVenueId && item.slug !== currentVenueId)
        .map(mapVenueToPreview)
    }
    return MOCK_NEARBY_VENUES.filter((item) => item.id !== currentVenueId)
  } catch {
    return MOCK_NEARBY_VENUES.filter((item) => item.id !== currentVenueId)
  }
}

export const toggleVenueFavorite = async (venueId: string): Promise<{ isFavorite: boolean }> => {
  try {
    const res = await fetchData<{ isFavorite: boolean }>(
      `/api/v1/venues/${venueId}/favorite`,
      { method: 'POST' }
    )
    return res.data
  } catch {
    return { isFavorite: true }
  }
}

export const venueApi = {
  getVenueBySlug,
  getVenues,
  getNearbyVenues,
  toggleVenueFavorite,
}


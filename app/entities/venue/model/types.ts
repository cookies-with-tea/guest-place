/**
 * Venue Entity Model Types
 * Defines data structures for Venue (Площадка) based on Figma design:
 * https://www.figma.com/design/N68k9rKIf7mPSqGBcbRfVE/?node-id=1199-51992
 */

export type VenueRatingType = {
  score: number
  reviewsCount: number
}

export type VenueMetroType = {
  station: string
  walkMinutes?: number
  distanceText?: string
  lineColor?: string
}

export type VenueLocationType = {
  address: string
  city: string
  metro?: VenueMetroType
  coordinates?: {
    lat: number
    lng: number
  }
}

export type VenueWorkingHoursType = {
  weekdays: string
  weekends: string
  raw?: string
}

export type VenueCorkageFeeType = {
  hasFee: boolean
  description?: string
  price?: number
}

export type VenuePricingType = {
  averageCheck: number
  banquetMenuPriceFrom: number
  rentPricePerHour: number
  corkageFee: VenueCorkageFeeType
  priceLevel?: '$' | '$$' | '$$$' | '$$$$'
}

export type VenueCapacitySummaryType = {
  banquet: string
  buffet: string
  theater: string
  areaSqm: string
}

export type VenueHallType = {
  id: string
  name: string
  areaSqm: number
  capacityBanquet: number
  capacityBuffet: number
  capacityTheater: number
  extraDetails?: string
  photos?: string[]
}

export type VenueRoomType = {
  id: string
  roomType: string
  placement: string
  priceRub: number
  extraInfo?: string
}

export type VenueMediaGalleryType = {
  mainPhoto: string
  photos: string[]
  videoTourUrl?: string
  hasOnlineTour?: boolean
}

export type VenueDetailsSectionType = {
  venueTypes: string[]
  features: string[]
  cuisines: string[]
  services: string[]
  parking: string
  equipment: string[]
  halls: VenueHallType[]
  rooms?: VenueRoomType[]
}

export type VenueFaqItemType = {
  id: string
  question: string
  answer: string
}

export type VenueFeedItemType = {
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

export type VenueReviewItemType = {
  id: string
  author: string
  avatar?: string
  date: string
  rating: number
  text: string
}

export type VenueActiveTabType = 'description' | 'pricing' | 'menu' | 'feed' | 'chat'

/**
 * Full Venue Aggregate Entity
 */
export type VenueType = {
  id: string
  slug: string
  title: string
  subtitle?: string
  descriptionHtml?: string
  rating: VenueRatingType
  isFavorite?: boolean
  phone: string
  hallsCount: number
  location: VenueLocationType
  workingHours: VenueWorkingHoursType
  pricing: VenuePricingType
  capacitySummary: VenueCapacitySummaryType
  gallery: VenueMediaGalleryType
  details: VenueDetailsSectionType
  faq?: VenueFaqItemType[]
  feed?: VenueFeedItemType[]
  reviews?: VenueReviewItemType[]
  menuPhotos?: string[]
  menuUrl?: string
  riderUrl?: string
  pricingTable?: any
}

/**
 * Lightweight Venue Preview Card (for Catalog / Related / Recently Viewed)
 */
export type VenuePreviewType = {
  id: string
  slug: string
  title: string
  previewImage: string
  rating: VenueRatingType
  metro?: VenueMetroType
  capacityText: string
  priceLevel: '$' | '$$' | '$$$' | '$$$$'
  isFavorite?: boolean
}

/**
 * Raw Venue DTO returned by the server API (before or during snake_case -> camelCase mapping)
 */
export type VenueServerDto = {
  id: string
  slug: string
  title: string
  subtitle?: string | null
  description_html?: string | null
  phone?: string | null
  address: string
  city?: string | null
  metro_station?: string | null
  metro_distance_minutes?: number | null
  metro_distance_text?: string | null
  metro_line_color?: string | null
  coordinates_lat?: number | null
  coordinates_lng?: number | null
  average_check?: number | null
  banquet_price_from?: number | null
  rent_price_hour?: number | null
  corkage_fee_has?: boolean | null
  corkage_fee_desc?: string | null
  price_level?: string | null
  halls_count?: number | null
  capacity_banquet?: string | null
  capacity_buffet?: string | null
  capacity_theater?: string | null
  area_sqm?: string | null
  working_hours_weekdays?: string | null
  working_hours_weekends?: string | null
  rating_score?: number | null
  rating_reviews_count?: number | null
  venue_types?: string[] | null
  features?: string[] | null
  cuisines?: string[] | null
  services?: string[] | null
  parking?: string | null
  equipment?: string[] | null
  halls?: any
  rooms?: any
  gallery_photos?: string[] | null
  video_tour_url?: string | null
  has_online_tour?: boolean | null
  faq?: any
  feed?: any
  menu_photos?: string[] | null
  reviews?: any
  pricing_table?: any
  menu_url?: string | null
  rider_url?: string | null
  status?: string
}


import { ref, computed } from 'vue'
import type { VenueType } from '#entities/venue/model/types'
import { toggleVenueFavorite } from '#entities/venue/api/venue.api'
import { MOCK_VENUE_FOREST_HALL } from '#entities/venue/mock/venue.mock'

export interface FavoriteItem {
  id: string
  venue: VenueType
  addedAt: number
}

export type FavoritesSortOption =
  | 'date_desc' // По дате добавления (сначала новые)
  | 'date_asc' // По дате добавления (сначала старые)
  | 'price_asc' // По возрастанию цены
  | 'price_desc' // По убыванию цены
  | 'rating_desc' // По рейтингу

// Initial mock venues matching Figma node 1199:54543
const initialSeed: FavoriteItem[] = [
  {
    id: MOCK_VENUE_FOREST_HALL.id,
    venue: {
      ...MOCK_VENUE_FOREST_HALL,
      title: 'Банкетный зал лофт Форест Холл',
      isFavorite: true,
      rating: {
        score: 3,
        reviewsCount: 23,
      },
      pricing: {
        averageCheck: 2500,
        banquetMenuPriceFrom: 4000,
        rentPricePerHour: 3000,
        corkageFee: {
          hasFee: true,
          description: 'есть',
        },
        priceLevel: '$$$',
      },
      details: {
        features: ['Летняя веранда', 'Парковая зона', 'удобный подъезд'],
        services: [
          'Wi-Fi',
          'Бизнес-ланч',
          'Выездная регистрация',
          'Банкеты',
          'Анимация',
          'Тимбилдинг',
          'Конференции',
          'Презентации',
          'Номерной фонд',
        ],
      },
    },
    addedAt: 1728300000000,
  },
  {
    id: 'venue-forest-hall-2',
    venue: {
      ...MOCK_VENUE_FOREST_HALL,
      id: 'venue-forest-hall-2',
      slug: 'loft-forest-hall-veranda',
      title: 'Банкетный зал лофт Форест Холл (Веранда)',
      isFavorite: true,
      rating: {
        score: 3,
        reviewsCount: 23,
      },
      gallery: {
        mainPhoto: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
        photos: [
          'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80',
        ],
        hasOnlineTour: true,
      },
      pricing: {
        averageCheck: 2500,
        banquetMenuPriceFrom: 4000,
        rentPricePerHour: 3000,
        corkageFee: {
          hasFee: true,
          description: 'есть',
        },
        priceLevel: '$$$',
      },
      details: {
        features: ['Летняя веранда', 'Парковая зона', 'удобный подъезд'],
        services: [
          'Wi-Fi',
          'Бизнес-ланч',
          'Выездная регистрация',
          'Банкеты',
          'Анимация',
          'Тимбилдинг',
        ],
      },
    },
    addedAt: 1728296400000,
  },
  {
    id: 'venue-forest-hall-3',
    venue: {
      ...MOCK_VENUE_FOREST_HALL,
      id: 'venue-forest-hall-3',
      slug: 'loft-forest-hall-palace',
      title: 'Банкетный зал лофт Форест Холл (Дворцовый)',
      isFavorite: true,
      rating: {
        score: 3,
        reviewsCount: 23,
      },
      gallery: {
        mainPhoto: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1200&q=80',
        photos: [
          'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80',
        ],
        hasOnlineTour: true,
      },
      pricing: {
        averageCheck: 2500,
        banquetMenuPriceFrom: 4000,
        rentPricePerHour: 3000,
        corkageFee: {
          hasFee: true,
          description: 'есть',
        },
        priceLevel: '$$$',
      },
      details: {
        features: ['Летняя веранда', 'Парковая зона', 'удобный подъезд'],
        services: [
          'Wi-Fi',
          'Бизнес-ланч',
          'Выездная регистрация',
          'Банкеты',
          'Конференции',
        ],
      },
    },
    addedAt: 1728292800000,
  },
]

// Pure in-memory reactive state
const favoritesState = ref<FavoriteItem[]>([...initialSeed])

export function useFavorites() {
  const favoriteVenues = computed(() => favoritesState.value.map((f) => f.venue))

  const favoriteCount = computed(() => favoritesState.value.length)

  const isFavorite = (venueIdOrSlug: string) => {
    if (!venueIdOrSlug) return false

    return favoritesState.value.some(
      (f) => f.id === venueIdOrSlug || f.venue.id === venueIdOrSlug || f.venue.slug === venueIdOrSlug
    )
  }

  const addFavorite = (venue: VenueType) => {
    if (!venue || isFavorite(venue.id) || isFavorite(venue.slug)) return

    const item: FavoriteItem = {
      id: venue.id,
      venue: { ...venue, isFavorite: true },
      addedAt: Date.now(),
    }

    favoritesState.value = [item, ...favoritesState.value]

    toggleVenueFavorite(venue.id).catch(() => {})
  }

  const removeFavorite = (venueIdOrSlug: string) => {
    favoritesState.value = favoritesState.value.filter(
      (f) => f.id !== venueIdOrSlug && f.venue.id !== venueIdOrSlug && f.venue.slug !== venueIdOrSlug
    )

    toggleVenueFavorite(venueIdOrSlug).catch(() => {})
  }

  const toggleFavorite = async (venue: VenueType): Promise<boolean> => {
    if (isFavorite(venue.id) || isFavorite(venue.slug)) {
      removeFavorite(venue.id)

      return false
    } else {
      addFavorite(venue)

      return true
    }
  }

  const clearFavorites = () => {
    favoritesState.value = []
  }

  const getSortedFavorites = (sortOption: FavoritesSortOption = 'date_desc'): VenueType[] => {
    const list = [...favoritesState.value]

    switch (sortOption) {
      case 'date_asc':
        list.sort((a, b) => a.addedAt - b.addedAt)

        break
      case 'price_asc':
        list.sort((a, b) => (a.venue.pricing?.averageCheck || 0) - (b.venue.pricing?.averageCheck || 0))

        break
      case 'price_desc':
        list.sort((a, b) => (b.venue.pricing?.averageCheck || 0) - (a.venue.pricing?.averageCheck || 0))

        break
      case 'rating_desc':
        list.sort((a, b) => (b.venue.rating?.score || 0) - (a.venue.rating?.score || 0))

        break
      case 'date_desc':
      default:
        list.sort((a, b) => b.addedAt - a.addedAt)

        break
    }

    return list.map((item) => ({ ...item.venue, isFavorite: true }))
  }

  return {
    favorites: favoriteVenues,
    favoritesList: favoritesState,
    favoriteCount,
    isFavorite,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    clearFavorites,
    getSortedFavorites,
  }
}

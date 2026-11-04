import { describe, expect, it, beforeEach, vi } from 'vitest'
import { useFavorites } from '../useFavorites'
import type { VenueType } from '#entities/venue/model/types'

// Mock toggleVenueFavorite
vi.mock('#entities/venue/api/venue.api', () => ({
  toggleVenueFavorite: vi.fn().mockResolvedValue({ isFavorite: true }),
  getVenues: vi.fn().mockResolvedValue({ items: [], pagination: { total: 0 } }),
}))

const sampleVenue: VenueType = {
  id: 'test-venue-1',
  slug: 'test-venue-1-slug',
  title: 'Тестовая площадка Лофт 1',
  rating: { score: 4.8, reviewsCount: 12 },
  location: {
    address: 'ул. Тестовая, 10',
    city: 'Москва',
  },
  pricing: {
    averageCheck: 3500,
    banquetMenuPriceFrom: 4500,
    rentPricePerHour: 3000,
    corkageFee: { hasFee: false },
    priceLevel: '$$$',
  },
  gallery: {
    mainPhoto: 'https://example.com/photo.jpg',
    photos: ['https://example.com/photo.jpg'],
  },
  capacitySummary: {
    banquet: '50/100',
  },
  details: {},
}

describe('useFavorites composable', () => {
  beforeEach(() => {
    const { clearFavorites } = useFavorites()

    clearFavorites()
  })

  it('adds a venue to favorites', () => {
    const { addFavorite, isFavorite, favoriteCount } = useFavorites()

    expect(isFavorite(sampleVenue.id)).toBe(false)

    expect(favoriteCount.value).toBe(0)

    addFavorite(sampleVenue)

    expect(isFavorite(sampleVenue.id)).toBe(true)

    expect(isFavorite(sampleVenue.slug)).toBe(true)

    expect(favoriteCount.value).toBe(1)
  })

  it('removes a venue from favorites', () => {
    const { addFavorite, removeFavorite, isFavorite, favoriteCount } = useFavorites()

    addFavorite(sampleVenue)

    expect(favoriteCount.value).toBe(1)

    removeFavorite(sampleVenue.id)

    expect(isFavorite(sampleVenue.id)).toBe(false)

    expect(favoriteCount.value).toBe(0)
  })

  it('toggles favorite state correctly', async () => {
    const { toggleFavorite, isFavorite, favoriteCount } = useFavorites()

    const added = await toggleFavorite(sampleVenue)

    expect(added).toBe(true)

    expect(isFavorite(sampleVenue.id)).toBe(true)

    expect(favoriteCount.value).toBe(1)

    const removed = await toggleFavorite(sampleVenue)

    expect(removed).toBe(false)

    expect(isFavorite(sampleVenue.id)).toBe(false)

    expect(favoriteCount.value).toBe(0)
  })

  it('sorts favorites by price correctly', () => {
    const { addFavorite, getSortedFavorites } = useFavorites()
    const cheapVenue = { ...sampleVenue, id: 'cheap', slug: 'cheap', pricing: { ...sampleVenue.pricing, averageCheck: 1000 } }
    const expensiveVenue = { ...sampleVenue, id: 'exp', slug: 'exp', pricing: { ...sampleVenue.pricing, averageCheck: 5000 } }

    addFavorite(cheapVenue)

    addFavorite(expensiveVenue)

    const sortedAsc = getSortedFavorites('price_asc')

    expect(sortedAsc[0].id).toBe('cheap')

    expect(sortedAsc[1].id).toBe('exp')

    const sortedDesc = getSortedFavorites('price_desc')

    expect(sortedDesc[0].id).toBe('exp')

    expect(sortedDesc[1].id).toBe('cheap')
  })
})

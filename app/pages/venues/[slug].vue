<template>
  <div class="venue-page">
    <!-- Breadcrumbs -->
    <nav class="venue-page__breadcrumbs" aria-label="Хлебные крошки">
      <div class="venue-page__container">
        <ol class="venue-page__breadcrumbs-list">
          <li class="venue-page__breadcrumbs-item">
            <NuxtLink to="/">Главная</NuxtLink>
          </li>
          <li class="venue-page__breadcrumbs-separator">/</li>
          <li class="venue-page__breadcrumbs-item venue-page__breadcrumbs-item--active" aria-current="page">
            {{ venue.title }}
          </li>
        </ol>
      </div>
    </nav>

    <!-- Header Section with Title, Rating, Favorite & Share -->
    <header class="venue-page__header">
      <div class="venue-page__container">
        <h1 class="venue-page__title">{{ venue.title }}</h1>

        <div class="venue-page__toolbar">
          <div class="venue-page__rating">
            <div class="venue-page__stars">
              <span
                v-for="star in 5"
                :key="star"
                class="venue-page__star"
                :class="{ 'venue-page__star--filled': star <= Math.round(venue.rating.score) }"
              >
                ★
              </span>
            </div>
            <span class="venue-page__reviews-count">{{ venue.rating.reviewsCount }} отзыва</span>
          </div>

          <div class="venue-page__toolbar-actions">
            <button
              type="button"
              class="venue-page__toolbar-btn"
              :class="{ 'venue-page__toolbar-btn--active': isFavorite }"
              @click="handleFavoriteToggle"
            >
              <UiIcon name="favourites" class="venue-page__toolbar-icon" />
              <span>{{ isFavorite ? 'В избранном' : 'В избранное' }}</span>
            </button>

            <button type="button" class="venue-page__toolbar-btn" @click="handleShare">
              <UiIcon name="export" class="venue-page__toolbar-icon" />
              <span>Поделиться</span>
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Hero Card (Node: 1199:52030) -->
    <main class="venue-page__main">
      <VenueHero
        :venue="venue"
        @inquiry="handleOpenInquiryModal"
        @chat="handleOpenChat"
        @play-tour="handleOpenTourModal"
      />

      <!-- Information Tabs (Node: 1199:52031) -->
      <VenueTabs :venue="venue" />

      <!-- Full Rich Text Description (Node: 1199:51994) -->
      <section v-if="venue.descriptionHtml" class="venue-page__description-section">
        <div class="venue-page__description-card">
          <div class="venue-page__description-content" v-html="venue.descriptionHtml"></div>
        </div>
      </section>

      <!-- Nearby Venues Section (Node: 1199:52012) -->
      <section class="venue-page__cards-section">
        <div class="venue-page__container">
          <h2 class="venue-page__section-title">Места поблизости</h2>
          <div class="venue-page__cards-grid">
            <VenueCardSmall
              v-for="item in nearbyVenues"
              :key="item.id"
              :venue="item"
            />
          </div>
          <div class="venue-page__section-actions">
            <button type="button" class="venue-page__more-btn">Показать еще</button>
          </div>
        </div>
      </section>

      <!-- Recently Viewed Venues Section (Node: 1199:52020) -->
      <section class="venue-page__cards-section">
        <div class="venue-page__container">
          <h2 class="venue-page__section-title">Недавно просмотренные</h2>
          <div class="venue-page__cards-grid">
            <VenueCardSmall
              v-for="item in recentlyViewedVenues"
              :key="item.id"
              :venue="item"
            />
          </div>
          <div class="venue-page__section-actions">
            <button type="button" class="venue-page__more-btn">Показать еще</button>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from '#imports'
import {
  MOCK_VENUE_FOREST_HALL,
  MOCK_NEARBY_VENUES,
  type VenueType,
  type VenuePreviewType,
  venueApi,
  VenueHero,
  VenueTabs,
  VenueCardSmall,
} from '#entities/venue'
import { UiIcon } from '#shared/ui'

const route = useRoute()
const slug = (route.params.slug as string) || 'loft-forest-hall'

const venue = ref<VenueType>(MOCK_VENUE_FOREST_HALL)
const nearbyVenues = ref<VenuePreviewType[]>(MOCK_NEARBY_VENUES)
const recentlyViewedVenues = ref<VenuePreviewType[]>([...MOCK_NEARBY_VENUES].reverse())
const isFavorite = ref(Boolean(venue.value.isFavorite))

// Load real venue data on client mount without blocking router
const loadVenue = async () => {
  try {
    const fetched = await venueApi.getVenueBySlug(slug)
    if (fetched) {
      venue.value = fetched
    }
  } catch (e) {
    console.warn('Failed to load venue from API:', e)
  }

  try {
    const nearby = await venueApi.getNearbyVenues(slug)
    if (nearby && nearby.length > 0) {
      nearbyVenues.value = nearby
    }
  } catch (e) {
    console.warn('Failed to load nearby venues:', e)
  }
}

// Live preview listener for admin panel postMessage
const onMessage = (event: MessageEvent) => {
  if (event.data?.type === 'VENUE_PREVIEW_DATA' && event.data?.payload) {
    venue.value = { ...venue.value, ...event.data.payload }
  }
}

onMounted(() => {
  loadVenue()
  window.addEventListener('message', onMessage)
})

onUnmounted(() => {
  window.removeEventListener('message', onMessage)
})

const handleFavoriteToggle = () => {
  isFavorite.value = !isFavorite.value
}

const handleShare = async () => {
  if (navigator.share) {
    try {
      await navigator.share({
        title: venue.value.title,
        url: window.location.href,
      })
    } catch {
      // User cancelled
    }
  } else {
    await navigator.clipboard.writeText(window.location.href)
    alert('Ссылка скопирована в буфер обмена!')
  }
}

const handleOpenInquiryModal = () => {
  alert('Заявка на бронирование площадки')
}

const handleOpenChat = () => {
  alert('Открыть гостевой чат с менеджером')
}

const handleOpenTourModal = () => {
  if (venue.value.gallery.videoTourUrl) {
    window.open(venue.value.gallery.videoTourUrl, '_blank')
  }
}
</script>

<style scoped lang="scss">
.venue-page {
  width: 100%;
  min-height: 100vh;
  background: #fbfbfb;
  padding-bottom: 60px;

  &__container {
    max-width: 1110px;
    margin: 0 auto;
    padding: 0 16px;
  }

  &__breadcrumbs {
    padding: 24px 0 12px;
  }

  &__breadcrumbs-list {
    display: flex;
    align-items: center;
    gap: 8px;
    list-style: none;
    padding: 0;
    margin: 0;
    font-size: 14px;
    color: #8f9499;
  }

  &__breadcrumbs-item {
    a {
      color: #8f9499;
      text-decoration: none;

      &:hover {
        color: #222222;
      }
    }

    &--active {
      color: #222222;
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 400px;
    }
  }

  &__breadcrumbs-separator {
    color: #cbd5e1;
  }

  &__header {
    padding: 12px 0 20px;
  }

  &__title {
    font-size: 32px;
    font-weight: 700;
    line-height: 1.25;
    color: #111827;
    margin: 0 0 16px;

    @media (max-width: 768px) {
      font-size: 24px;
    }
  }

  &__toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 16px;
  }

  &__rating {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__stars {
    display: flex;
    gap: 2px;
    color: #e2e8f0;
    font-size: 18px;
  }

  &__star {
    &--filled {
      color: #2563eb;
    }
  }

  &__reviews-count {
    font-size: 14px;
    color: #4b5563;
  }

  &__toolbar-actions {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  &__toolbar-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: #ffffff;
    border: 1px solid #e5e7eb;
    padding: 8px 16px;
    border-radius: 50px;
    font-size: 13px;
    font-weight: 500;
    color: #374151;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background: #f8fafc;
      border-color: #cbd5e1;
    }

    &--active {
      color: #ec4899;
      border-color: #fbcfe8;
      background: #fdf2f8;
    }
  }

  &__toolbar-icon {
    width: 16px;
    height: 16px;
  }

  &__main {
    display: flex;
    flex-direction: column;
    gap: 40px;
  }

  &__description-section {
    max-width: 1110px;
    margin: 0 auto;
    padding: 0 16px;
    width: 100%;
  }

  &__description-card {
    background: #ffffff;
    border-radius: 30px;
    padding: 36px 40px;
    box-shadow: 0 4px 24px rgba(105, 78, 75, 0.08);

    @media (max-width: 768px) {
      padding: 24px 20px;
      border-radius: 20px;
    }
  }

  &__description-content {
    font-size: 15px;
    line-height: 1.7;
    color: #4b5563;

    :deep(p) {
      margin-bottom: 16px;

      &:last-child {
        margin-bottom: 0;
      }
    }
  }

  &__cards-section {
    width: 100%;
    margin-top: 10px;
  }

  &__section-title {
    font-size: 24px;
    font-weight: 700;
    color: #111827;
    margin-bottom: 24px;
  }

  &__cards-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 24px;

    @media (max-width: 1024px) {
      grid-template-columns: repeat(2, 1fr);
    }

    @media (max-width: 640px) {
      grid-template-columns: 1fr;
    }
  }

  &__section-actions {
    display: flex;
    justify-content: center;
    margin-top: 32px;
  }

  &__more-btn {
    padding: 14px 44px;
    border-radius: 50px;
    background: linear-gradient(90deg, #e597c2 0%, #7d6ee8 100%);
    color: #ffffff;
    font-size: 15px;
    font-weight: 600;
    border: none;
    cursor: pointer;
    box-shadow: 0 4px 14px rgba(125, 110, 232, 0.25);
    transition: transform 0.2s ease, opacity 0.2s ease;

    &:hover {
      transform: translateY(-2px);
      opacity: 0.95;
    }
  }
}
</style>

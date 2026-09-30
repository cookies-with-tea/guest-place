<template>
  <article class="venue-card-big" :data-id="venue.id">
    <!-- 1. LEFT COLUMN: Photo Carousel & Badges -->
    <div class="venue-card-big__gallery">
      <div class="venue-card-big__image-container">
        <img
          :src="currentPhoto"
          :alt="venue.title"
          class="venue-card-big__image"
          loading="lazy"
        />

        <!-- Carousel navigation arrows -->
        <button
          v-if="photos.length > 1"
          type="button"
          class="venue-card-big__nav-btn venue-card-big__nav-btn--prev"
          aria-label="Предыдущее фото"
          @click.stop="prevPhoto"
        >
          ‹
        </button>
        <button
          v-if="photos.length > 1"
          type="button"
          class="venue-card-big__nav-btn venue-card-big__nav-btn--next"
          aria-label="Следующее фото"
          @click.stop="nextPhoto"
        >
          ›
        </button>

        <!-- Favorite button -->
        <button
          type="button"
          class="venue-card-big__favorite-btn"
          :class="{ 'venue-card-big__favorite-btn--active': isFavoriteState }"
          aria-label="Добавить в избранное"
          @click.stop="toggleFavorite"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="venue-card-big__heart-icon"
          >
            <path
              d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
            />
          </svg>
        </button>

        <!-- Online tour badge (desktop view on image or right side) -->
        <span
          v-if="venue.gallery.hasOnlineTour"
          class="venue-card-big__online-tour-pill"
          title="Доступен онлайн-показ площадки"
        >
          Онлайн-показ
        </span>

        <!-- Dots indicator -->
        <div v-if="photos.length > 1" class="venue-card-big__dots">
          <span
            v-for="(_, idx) in photos.slice(0, 5)"
            :key="idx"
            class="venue-card-big__dot"
            :class="{ 'venue-card-big__dot--active': photoIndex === idx }"
            @click.stop="photoIndex = idx"
          />
        </div>
      </div>
    </div>

    <!-- 2. CENTER COLUMN: Details, Attributes & Pricing -->
    <div class="venue-card-big__content">
      <NuxtLink :to="`/venues/${venue.slug}`" class="venue-card-big__title-link">
        <h2 class="venue-card-big__title">{{ venue.title }}</h2>
      </NuxtLink>

      <!-- Rating -->
      <div class="venue-card-big__rating-row">
        <div class="venue-card-big__stars" aria-label="Рейтинг площадки">
          <span
            v-for="star in 5"
            :key="star"
            class="venue-card-big__star"
            :class="{ 'venue-card-big__star--filled': star <= Math.round(venue.rating.score) }"
          >
            ★
          </span>
        </div>
        <span class="venue-card-big__reviews-count">({{ venue.rating.reviewsCount || 0 }})</span>
      </div>

      <!-- Specs / Meta rows -->
      <div class="venue-card-big__meta">
        <div v-if="venue.location.metro" class="venue-card-big__meta-row">
          <span class="venue-card-big__meta-label">Станция метро:</span>
          <span class="venue-card-big__meta-value">
            {{ venue.location.metro.station }}
            <span v-if="venue.location.metro.distanceText" class="venue-card-big__meta-extra">
              ({{ venue.location.metro.distanceText }})
            </span>
          </span>
        </div>

        <div v-if="venue.capacitySummary.banquet" class="venue-card-big__meta-row">
          <span class="venue-card-big__meta-label">Вместимость (чел.):</span>
          <span class="venue-card-big__meta-value">{{ venue.capacitySummary.banquet }}</span>
        </div>

        <div v-if="venue.details.services?.length" class="venue-card-big__meta-row">
          <span class="venue-card-big__meta-label">Услуги:</span>
          <span class="venue-card-big__meta-value venue-card-big__meta-value--truncate">
            {{ venue.details.services.join(', ') }}
          </span>
        </div>

        <div v-if="venue.details.features?.length" class="venue-card-big__meta-row">
          <span class="venue-card-big__meta-label">Особенности:</span>
          <span class="venue-card-big__meta-value venue-card-big__meta-value--truncate">
            {{ venue.details.features.join(', ') }}
          </span>
        </div>
      </div>

      <!-- Price columns -->
      <div class="venue-card-big__prices">
        <div class="venue-card-big__price-col">
          <span class="venue-card-big__price-title">Средний чек</span>
          <span class="venue-card-big__price-value">{{ formatPrice(venue.pricing.averageCheck) }} р.</span>
        </div>
        <div class="venue-card-big__price-col">
          <span class="venue-card-big__price-title">Банкетное меню</span>
          <span class="venue-card-big__price-value">от {{ formatPrice(venue.pricing.banquetMenuPriceFrom) }} р.</span>
        </div>
        <div class="venue-card-big__price-col">
          <span class="venue-card-big__price-title">Аренда/час</span>
          <span class="venue-card-big__price-value">от {{ formatPrice(venue.pricing.rentPricePerHour) }} р.</span>
        </div>
      </div>
    </div>

    <!-- 3. RIGHT COLUMN: Action Buttons -->
    <div class="venue-card-big__actions">
      <button
        type="button"
        class="venue-card-big__btn venue-card-big__btn--primary"
        @click="$emit('inquiry', venue)"
      >
        Оставить заявку
      </button>

      <button
        type="button"
        class="venue-card-big__btn venue-card-big__btn--outline"
        @click="$emit('chat', venue)"
      >
        Начать чат
      </button>

      <button
        v-if="venue.gallery.hasOnlineTour"
        type="button"
        class="venue-card-big__btn venue-card-big__btn--tour"
        @click="$emit('tour', venue)"
      >
        Онлайн-показ
      </button>
    </div>
  </article>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { VenueType } from '../../model/types'
import { toggleVenueFavorite } from '../../api/venue.api'

const props = defineProps<{
  venue: VenueType
}>()

defineEmits<{
  (e: 'inquiry', venue: VenueType): void
  (e: 'chat', venue: VenueType): void
  (e: 'tour', venue: VenueType): void
}>()

const photoIndex = ref(0)
const isFavoriteState = ref(Boolean(props.venue.isFavorite))

const photos = computed(() => {
  if (props.venue.gallery.photos?.length) {
    return props.venue.gallery.photos
  }
  if (props.venue.gallery.mainPhoto) {
    return [props.venue.gallery.mainPhoto]
  }
  return ['https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80']
})

const currentPhoto = computed(() => {
  return photos.value[photoIndex.value] || photos.value[0]
})

const prevPhoto = () => {
  if (photoIndex.value > 0) {
    photoIndex.value--
  } else {
    photoIndex.value = photos.value.length - 1
  }
}

const nextPhoto = () => {
  if (photoIndex.value < photos.value.length - 1) {
    photoIndex.value++
  } else {
    photoIndex.value = 0
  }
}

const toggleFavorite = async () => {
  isFavoriteState.value = !isFavoriteState.value
  try {
    await toggleVenueFavorite(props.venue.id)
  } catch (e) {
    console.error('Failed to toggle favorite:', e)
  }
}

const formatPrice = (price?: number) => {
  if (!price) return '0'
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}
</script>

<style lang="scss" scoped>
.venue-card-big {
  position: relative;
  display: grid;
  grid-template-columns: 440px 1fr 160px;
  gap: 32px;
  background-color: #ffffff;
  border-radius: 30px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  padding: 24px;
  margin-bottom: 28px;
  transition: transform 0.25s ease, box-shadow 0.25s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.09);
  }

  @media (max-width: 1200px) {
    grid-template-columns: 360px 1fr;
    grid-template-rows: auto auto;
    gap: 20px;
  }

  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
    padding: 16px;
    border-radius: 20px;
  }

  // --- GALLERY ---
  &__gallery {
    position: relative;
    width: 100%;
    height: 100%;
    min-height: 260px;
  }

  &__image-container {
    position: relative;
    width: 100%;
    height: 100%;
    min-height: 260px;
    border-radius: 24px;
    overflow: hidden;
    background-color: #f3f4f6;
  }

  &__image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    user-select: none;
    transition: opacity 0.2s ease;
  }

  &__nav-btn {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 34px;
    height: 34px;
    border-radius: 50%;
    background-color: rgba(255, 255, 255, 0.85);
    border: none;
    color: #333333;
    font-size: 20px;
    font-weight: 300;
    line-height: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    transition: all 0.2s ease;
    z-index: 2;

    &:hover {
      background-color: #ffffff;
      transform: translateY(-50%) scale(1.08);
    }

    &--prev {
      left: 12px;
    }

    &--next {
      right: 12px;
    }
  }

  &__favorite-btn {
    position: absolute;
    top: 14px;
    right: 14px;
    width: 38px;
    height: 38px;
    border-radius: 50%;
    background-color: rgba(255, 255, 255, 0.85);
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 3;
    transition: all 0.2s ease;
    color: #9ca3af;

    &:hover {
      background-color: #ffffff;
      color: #ef4444;
      transform: scale(1.06);
    }

    &--active {
      color: #ef4444;

      .venue-card-big__heart-icon {
        fill: #ef4444;
      }
    }
  }

  &__online-tour-pill {
    position: absolute;
    bottom: 14px;
    left: 14px;
    background-color: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(4px);
    color: #0066cc;
    font-size: 12px;
    font-weight: 600;
    padding: 4px 12px;
    border-radius: 30px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
    z-index: 2;
  }

  &__dots {
    position: absolute;
    bottom: 12px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 6px;
    z-index: 2;
  }

  &__dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: rgba(255, 255, 255, 0.6);
    cursor: pointer;
    transition: all 0.2s ease;

    &--active {
      background-color: #ffffff;
      width: 14px;
      border-radius: 4px;
    }
  }

  // --- CONTENT ---
  &__content {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-width: 0;
  }

  &__title-link {
    text-decoration: none;
    color: inherit;

    &:hover .venue-card-big__title {
      color: #0066cc;
    }
  }

  &__title {
    font-family: 'Raleway', sans-serif;
    font-size: 24px;
    font-weight: 500;
    line-height: 1.3;
    color: #333333;
    margin: 0 0 8px 0;
    transition: color 0.2s ease;
  }

  &__rating-row {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 16px;
  }

  &__stars {
    display: flex;
    gap: 2px;
    color: #d1d5db;
    font-size: 16px;
    line-height: 1;
  }

  &__star {
    &--filled {
      color: #0066cc;
    }
  }

  &__reviews-count {
    font-family: 'Raleway', sans-serif;
    font-size: 14px;
    color: #6b7280;
  }

  &__meta {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 20px;
  }

  &__meta-row {
    display: flex;
    align-items: baseline;
    gap: 8px;
    font-family: 'Raleway', sans-serif;
    font-size: 14px;
    line-height: 1.4;
  }

  &__meta-label {
    color: #a0a0a4;
    white-space: nowrap;
    flex-shrink: 0;
  }

  &__meta-value {
    color: #333333;

    &--truncate {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  &__meta-extra {
    color: #a0a0a4;
  }

  &__prices {
    display: flex;
    gap: 32px;
    padding-top: 14px;
    border-top: 1px solid #f1f2f4;

    @media (max-width: 600px) {
      gap: 16px;
      flex-wrap: wrap;
    }
  }

  &__price-col {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__price-title {
    font-family: 'Raleway', sans-serif;
    font-size: 14px;
    color: #a0a0a4;
  }

  &__price-value {
    font-family: 'Raleway', sans-serif;
    font-size: 18px;
    font-weight: 600;
    color: #333333;
  }

  // --- ACTIONS ---
  &__actions {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: flex-start;
    gap: 12px;

    @media (max-width: 1200px) {
      grid-column: 1 / -1;
      flex-direction: row;
      justify-content: flex-end;
    }

    @media (max-width: 768px) {
      flex-direction: column;
    }
  }

  &__btn {
    font-family: 'Raleway', sans-serif;
    font-size: 14px;
    font-weight: 600;
    border-radius: 50px;
    padding: 10px 18px;
    cursor: pointer;
    text-align: center;
    transition: all 0.25s ease;
    border: none;
    outline: none;

    &--primary {
      background: linear-gradient(135deg, #d870ad 0%, #8e2dbc 100%);
      color: #ffffff;
      box-shadow: 0 4px 12px rgba(142, 45, 188, 0.25);

      &:hover {
        background: linear-gradient(135deg, #e47ec0 0%, #a035d4 100%);
        box-shadow: 0 6px 16px rgba(142, 45, 188, 0.35);
        transform: translateY(-1px);
      }
    }

    &--outline {
      background-color: transparent;
      border: 1.5px solid #8e2dbc;
      color: #333333;

      &:hover {
        background-color: #fcf4ff;
        color: #8e2dbc;
      }
    }

    &--tour {
      background-color: #ecf4fd;
      color: #0066cc;

      &:hover {
        background-color: #dbeafe;
      }
    }
  }
}
</style>

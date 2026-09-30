<template>
  <article class="venue-card-small">
    <div class="venue-card-small__media">
      <img
        :src="venue.previewImage"
        :alt="venue.title"
        class="venue-card-small__image"
        loading="lazy"
      />
      <button
        type="button"
        class="venue-card-small__favorite"
        :class="{ 'venue-card-small__favorite--active': isFavoriteState }"
        aria-label="Добавить в избранное"
        @click.stop="handleFavoriteToggle"
      >
        <UiIcon
          name="favourites"
          class="venue-card-small__favorite-icon"
        />
      </button>
    </div>

    <div class="venue-card-small__content">
      <h3 class="venue-card-small__title" :title="venue.title">
        {{ venue.title }}
      </h3>

      <div class="venue-card-small__rating">
        <div class="venue-card-small__stars">
          <span
            v-for="star in 5"
            :key="star"
            class="venue-card-small__star"
            :class="{ 'venue-card-small__star--filled': star <= Math.round(venue.rating.score) }"
          >
            ★
          </span>
        </div>
        <span class="venue-card-small__reviews">({{ venue.rating.reviewsCount }})</span>
      </div>

      <div v-if="venue.metro" class="venue-card-small__meta-row">
        <UiIcon name="location" class="venue-card-small__meta-icon" />
        <div class="venue-card-small__metro">
          <span class="venue-card-small__metro-station">{{ venue.metro.station }}</span>
          <span v-if="venue.metro.distanceText" class="venue-card-small__metro-distance">
            {{ venue.metro.distanceText }}
          </span>
        </div>
      </div>

      <div class="venue-card-small__meta-row">
        <UiIcon name="user" class="venue-card-small__meta-icon" />
        <span class="venue-card-small__capacity">{{ venue.capacityText }}</span>
      </div>

      <div class="venue-card-small__footer">
        <div class="venue-card-small__price">
          <span class="venue-card-small__price-level">{{ venue.priceLevel }}</span>
        </div>

        <NuxtLink
          :to="`/venues/${venue.slug}`"
          class="venue-card-small__btn"
          @click="handleCardClick"
        >
          Подробнее
        </NuxtLink>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { VenuePreviewType } from '../../model/types'
import { UiIcon } from '#shared/ui'

interface IProps {
  venue: VenuePreviewType
}

interface IEmits {
  (e: 'favorite-change', payload: { id: string; isFavorite: boolean }): void
  (e: 'select', venue: VenuePreviewType): void
}

const props = defineProps<IProps>()
const emit = defineEmits<IEmits>()

const isFavoriteState = ref(Boolean(props.venue.isFavorite))

const handleFavoriteToggle = () => {
  isFavoriteState.value = !isFavoriteState.value
  emit('favorite-change', {
    id: props.venue.id,
    isFavorite: isFavoriteState.value,
  })
}

const handleCardClick = () => {
  emit('select', props.venue)
}
</script>

<style scoped lang="scss">
.venue-card-small {
  $root: &;

  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 255px;
  background: #ffffff;
  border-radius: 30px;
  overflow: hidden;
  transition: transform 0.25s ease, box-shadow 0.25s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(105, 78, 75, 0.08);

    #{$root}__btn {
      background: linear-gradient(90deg, #e597c2 0%, #7d6ee8 100%);
      color: #ffffff;
      border-color: transparent;
    }
  }

  &__media {
    position: relative;
    width: 100%;
    height: 180px;
    border-radius: 30px;
    overflow: hidden;
  }

  &__image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    border-radius: 30px;
  }

  &__favorite {
    position: absolute;
    top: 14px;
    right: 14px;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.9);
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(4px);
    transition: transform 0.2s ease, background-color 0.2s ease;

    &:hover {
      transform: scale(1.1);
      background: #ffffff;
    }

    &--active {
      color: #ff4785;
      fill: currentColor;
    }
  }

  &__favorite-icon {
    width: 18px;
    height: 18px;
  }

  &__content {
    padding: 16px 10px 10px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  &__title {
    font-size: 16px;
    font-weight: 600;
    line-height: 1.3;
    color: #222222;
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    min-height: 42px;
  }

  &__rating {
    display: flex;
    align-items: center;
    gap: 6px;
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
      color: #2563eb;
    }
  }

  &__reviews {
    font-size: 13px;
    color: #6b7280;
  }

  &__meta-row {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    font-size: 13px;
    color: #4b5563;
  }

  &__meta-icon {
    width: 16px;
    height: 16px;
    color: #9ca3af;
    flex-shrink: 0;
    margin-top: 2px;
  }

  &__metro {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  &__metro-station {
    font-weight: 500;
    color: #374151;
  }

  &__metro-distance {
    font-size: 12px;
    color: #9ca3af;
  }

  &__capacity {
    font-weight: 500;
    color: #374151;
  }

  &__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 4px;
    padding-top: 8px;
  }

  &__price-level {
    font-size: 14px;
    font-weight: 600;
    color: #374151;
    letter-spacing: 0.5px;
  }

  &__btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 8px 18px;
    border-radius: 50px;
    font-size: 13px;
    font-weight: 600;
    text-decoration: none;
    color: #374151;
    border: 1.5px solid transparent;
    background: linear-gradient(#ffffff, #ffffff) padding-box,
      linear-gradient(90deg, #e597c2 0%, #7d6ee8 100%) border-box;
    transition: all 0.25s ease;
    cursor: pointer;
  }
}
</style>

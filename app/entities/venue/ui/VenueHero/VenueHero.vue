<template>
  <section class="venue-hero">
    <div class="venue-hero__container">
      <!-- Media Gallery -->
      <div class="venue-hero__gallery">
        <div class="venue-hero__main-photo-wrapper">
          <img
            :src="activePhoto"
            :alt="venue.title"
            class="venue-hero__main-photo"
          />

          <button
            v-if="venue.gallery.photos.length > 1"
            type="button"
            class="venue-hero__nav-btn venue-hero__nav-btn--prev"
            aria-label="Предыдущее фото"
            @click="handlePrevPhoto"
          >
            ‹
          </button>
          <button
            v-if="venue.gallery.photos.length > 1"
            type="button"
            class="venue-hero__nav-btn venue-hero__nav-btn--next"
            aria-label="Следующее фото"
            @click="handleNextPhoto"
          >
            ›
          </button>

          <button
            v-if="venue.gallery.videoTourUrl || venue.gallery.hasOnlineTour"
            type="button"
            class="venue-hero__play-btn"
            aria-label="Смотреть онлайн-тур или видео"
            @click="handlePlayTour"
          >
            <span class="venue-hero__play-icon">▶</span>
          </button>
        </div>

        <!-- Thumbnails -->
        <div v-if="venue.gallery.photos.length > 0" class="venue-hero__thumbnails">
          <button
            v-for="(photo, index) in venue.gallery.photos.slice(0, 3)"
            :key="index"
            type="button"
            class="venue-hero__thumb-btn"
            :class="{ 'venue-hero__thumb-btn--active': activePhotoIndex === index }"
            @click="handleSelectPhoto(index)"
          >
            <img :src="photo" :alt="`${venue.title} фото ${index + 1}`" class="venue-hero__thumb-img" />
          </button>
        </div>
      </div>

      <!-- Venue Info & Attributes -->
      <div class="venue-hero__info">
        <div class="venue-hero__specs-grid">
          <!-- Left Column -->
          <div class="venue-hero__specs-col">
            <div class="venue-hero__spec-item">
              <span class="venue-hero__spec-label">Адрес:</span>
              <span class="venue-hero__spec-value">{{ venue.location.address }}</span>
            </div>

            <div v-if="venue.location.metro" class="venue-hero__spec-item">
              <span class="venue-hero__spec-label">Метро:</span>
              <span class="venue-hero__spec-value">{{ venue.location.metro.station }}</span>
            </div>

            <div class="venue-hero__spec-item">
              <span class="venue-hero__spec-label">Время работы:</span>
              <span class="venue-hero__spec-value">
                {{ venue.workingHours.weekdays }}, {{ venue.workingHours.weekends }}
              </span>
            </div>

            <div class="venue-hero__spec-item">
              <span class="venue-hero__spec-label">Средний чек:</span>
              <span class="venue-hero__spec-value">{{ formatPrice(venue.pricing.averageCheck) }} р.</span>
            </div>

            <div class="venue-hero__spec-item">
              <span class="venue-hero__spec-label">Банкетное меню от:</span>
              <span class="venue-hero__spec-value">{{ formatPrice(venue.pricing.banquetMenuPriceFrom) }} р.</span>
            </div>

            <div class="venue-hero__spec-item">
              <span class="venue-hero__spec-label">Телефон:</span>
              <a :href="`tel:${venue.phone.replace(/[^+\d]/g, '')}`" class="venue-hero__spec-link">
                {{ venue.phone }}
              </a>
            </div>
          </div>

          <!-- Right Column -->
          <div class="venue-hero__specs-col">
            <div class="venue-hero__spec-item">
              <span class="venue-hero__spec-label">Количество залов:</span>
              <span class="venue-hero__spec-value">{{ venue.hallsCount }}</span>
            </div>

            <div class="venue-hero__spec-item">
              <span class="venue-hero__spec-label">Количество мест:</span>
              <span class="venue-hero__spec-value">
                банкет {{ venue.capacitySummary.banquet }}, фуршет {{ venue.capacitySummary.buffet }}, конференция {{ venue.capacitySummary.theater }}
              </span>
            </div>

            <div class="venue-hero__spec-item">
              <span class="venue-hero__spec-label">Площадь кв.м.:</span>
              <span class="venue-hero__spec-value">{{ venue.capacitySummary.areaSqm }}</span>
            </div>

            <div class="venue-hero__spec-item">
              <span class="venue-hero__spec-label">Пробковый сбор:</span>
              <span class="venue-hero__spec-value">
                {{ venue.pricing.corkageFee.description || (venue.pricing.corkageFee.hasFee ? 'есть' : 'нет') }}
              </span>
            </div>

            <div class="venue-hero__spec-item">
              <span class="venue-hero__spec-label">Аренда от:</span>
              <span class="venue-hero__spec-value">{{ formatPrice(venue.pricing.rentPricePerHour) }} р./час</span>
            </div>
          </div>
        </div>

        <!-- CTA Buttons -->
        <div class="venue-hero__actions">
          <button type="button" class="venue-hero__action-btn venue-hero__action-btn--primary" @click="handleInquiryClick">
            Оставить заявку
          </button>
          <button type="button" class="venue-hero__action-btn venue-hero__action-btn--secondary" @click="handleChatClick">
            Начать чат
          </button>
        </div>

        <!-- Feature Banners -->
        <div class="venue-hero__feature-banners">
          <div class="venue-hero__feature-card">
            <div class="venue-hero__feature-header">
              <UiIcon name="monitor-play" class="venue-hero__feature-icon" />
              <h4 class="venue-hero__feature-title">Онлайн-показ</h4>
            </div>
            <p class="venue-hero__feature-text">
              Вы можете посмотреть площадку не выходя из дома! Менеджер площадки проведет онлайн-показ при помощи видеозвонка.
            </p>
          </div>

          <div class="venue-hero__feature-card">
            <div class="venue-hero__feature-header">
              <UiIcon name="question" class="venue-hero__feature-icon" />
              <h4 class="venue-hero__feature-title">Помощь эксперта</h4>
            </div>
            <p class="venue-hero__feature-text">
              Не хотите тратить время на самостоятельный поиск? Эксперт платформы бесплатно поможет подобрать место.
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { VenueType } from '../../model/types'
import { UiIcon } from '#shared/ui'

interface IProps {
  venue: VenueType
}

interface IEmits {
  (e: 'inquiry', venue: VenueType): void
  (e: 'chat', venue: VenueType): void
  (e: 'play-tour', venue: VenueType): void
}

const props = defineProps<IProps>()
const emit = defineEmits<IEmits>()

const activePhotoIndex = ref(0)

const activePhoto = computed(() => {
  return props.venue.gallery.photos[activePhotoIndex.value] || props.venue.gallery.mainPhoto
})

const handleSelectPhoto = (index: number) => {
  activePhotoIndex.value = index
}

const handlePrevPhoto = () => {
  const total = props.venue.gallery.photos.length
  activePhotoIndex.value = (activePhotoIndex.value - 1 + total) % total
}

const handleNextPhoto = () => {
  const total = props.venue.gallery.photos.length
  activePhotoIndex.value = (activePhotoIndex.value + 1) % total
}

const handlePlayTour = () => {
  emit('play-tour', props.venue)
}

const handleInquiryClick = () => {
  emit('inquiry', props.venue)
}

const handleChatClick = () => {
  emit('chat', props.venue)
}

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('ru-RU').format(price)
}
</script>

<style scoped lang="scss">
.venue-hero {
  width: 100%;
  max-width: 1110px;
  margin: 0 auto;
  padding: 24px 0;

  &__container {
    display: grid;
    grid-template-columns: 480px 1fr;
    gap: 40px;

    @media (max-width: 1024px) {
      grid-template-columns: 1fr;
      gap: 24px;
    }
  }

  &__gallery {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  &__main-photo-wrapper {
    position: relative;
    width: 100%;
    height: 380px;
    border-radius: 30px;
    overflow: hidden;
    background: #f3f4f6;
  }

  &__main-photo {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  &__nav-btn {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.85);
    border: none;
    font-size: 24px;
    color: #4b5563;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    backdrop-filter: blur(4px);
    transition: background-color 0.2s ease, transform 0.2s ease;

    &:hover {
      background: #ffffff;
      transform: translateY(-50%) scale(1.08);
    }

    &--prev {
      left: 16px;
    }

    &--next {
      right: 16px;
    }
  }

  &__play-btn {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 68px;
    height: 68px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.9);
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(6px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    transition: transform 0.25s ease, background 0.25s ease;

    &:hover {
      transform: translate(-50%, -50%) scale(1.1);
      background: #ffffff;
    }
  }

  &__play-icon {
    font-size: 22px;
    color: #8b5cf6;
    margin-left: 4px;
  }

  &__thumbnails {
    display: flex;
    gap: 14px;
  }

  &__thumb-btn {
    flex: 1;
    height: 80px;
    border-radius: 18px;
    overflow: hidden;
    border: 2px solid transparent;
    padding: 0;
    cursor: pointer;
    background: transparent;
    transition: border-color 0.2s ease, opacity 0.2s ease;

    &:hover {
      opacity: 0.9;
    }

    &--active {
      border-color: #8b5cf6;
    }
  }

  &__thumb-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  &__info {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  &__specs-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;

    @media (max-width: 640px) {
      grid-template-columns: 1fr;
    }
  }

  &__specs-col {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  &__spec-item {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  &__spec-label {
    font-size: 13px;
    color: #8f9499;
  }

  &__spec-value {
    font-size: 14px;
    color: #222222;
    font-weight: 500;
    line-height: 1.35;
  }

  &__spec-link {
    font-size: 15px;
    color: #222222;
    font-weight: 600;
    text-decoration: none;

    &:hover {
      color: #8b5cf6;
    }
  }

  &__actions {
    display: flex;
    gap: 16px;
    margin-top: 24px;
    margin-bottom: 24px;

    @media (max-width: 640px) {
      flex-direction: column;
    }
  }

  &__action-btn {
    flex: 1;
    height: 52px;
    border-radius: 50px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: all 0.25s ease;

    &--primary {
      background: linear-gradient(90deg, #e597c2 0%, #7d6ee8 100%);
      color: #ffffff;
      border: none;
      box-shadow: 0 4px 14px rgba(125, 110, 232, 0.3);

      &:hover {
        opacity: 0.95;
        transform: translateY(-2px);
      }
    }

    &--secondary {
      background: #ffffff;
      color: #333333;
      border: 1.5px solid #7d6ee8;

      &:hover {
        background: #fdf2f8;
        transform: translateY(-2px);
      }
    }
  }

  &__feature-banners {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    border-top: 1px solid #f0f0f0;
    padding-top: 20px;

    @media (max-width: 640px) {
      grid-template-columns: 1fr;
    }
  }

  &__feature-card {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  &__feature-header {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__feature-icon {
    width: 20px;
    height: 20px;
    color: #4b5563;
  }

  &__feature-title {
    font-size: 14px;
    font-weight: 600;
    color: #222222;
    margin: 0;
  }

  &__feature-text {
    font-size: 12px;
    color: #9ca3af;
    line-height: 1.4;
    margin: 0;
  }
}
</style>

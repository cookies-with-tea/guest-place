<template>
  <div class="venue-tabs">
    <!-- Tab Navigation -->
    <div class="venue-tabs__nav">
      <button
        v-for="tab in tabsList"
        :key="tab.key"
        type="button"
        class="venue-tabs__nav-item"
        :class="{ 'venue-tabs__nav-item--active': activeTab === tab.key }"
        @click="handleTabChange(tab.key)"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Tab Content -->
    <div class="venue-tabs__card">
      <!-- 1. Description Tab -->
      <div v-if="activeTab === 'description'" class="venue-tabs__pane">
        <!-- Tags & Attributes Section -->
        <div class="venue-tabs__attributes">
          <div class="venue-tabs__attr-row">
            <span class="venue-tabs__attr-label">Тип места:</span>
            <span class="venue-tabs__attr-value">{{ venue.details.venueTypes.join(', ') }}</span>
          </div>

          <div class="venue-tabs__attr-row">
            <span class="venue-tabs__attr-label">Особенности:</span>
            <span class="venue-tabs__attr-value">{{ venue.details.features.join(', ') }}</span>
          </div>

          <div class="venue-tabs__attr-row">
            <span class="venue-tabs__attr-label">Кухня:</span>
            <span class="venue-tabs__attr-value">{{ venue.details.cuisines.join(', ') }}</span>
          </div>

          <div class="venue-tabs__attr-row">
            <span class="venue-tabs__attr-label">Услуги:</span>
            <span class="venue-tabs__attr-value">{{ venue.details.services.join(', ') }}</span>
          </div>

          <div class="venue-tabs__attr-row">
            <span class="venue-tabs__attr-label">Парковка:</span>
            <span class="venue-tabs__attr-value">{{ venue.details.parking }}</span>
          </div>

          <div class="venue-tabs__attr-row">
            <span class="venue-tabs__attr-label">Оборудование:</span>
            <span class="venue-tabs__attr-value">{{ venue.details.equipment.join(', ') }}</span>
          </div>
        </div>

        <!-- Halls Table -->
        <div v-if="venue.details.halls.length > 0" class="venue-tabs__section">
          <div class="venue-tabs__table-wrapper">
            <table class="venue-tabs__table">
              <thead>
                <tr>
                  <th>Описание</th>
                  <th>Площадь/кв.м</th>
                  <th>Банкет</th>
                  <th>Фуршет</th>
                  <th>Рассадка «Театр»</th>
                  <th>Еще</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="hall in venue.details.halls" :key="hall.id">
                  <td class="venue-tabs__table-cell--bold">{{ hall.name }}</td>
                  <td>{{ hall.areaSqm }}</td>
                  <td>{{ hall.capacityBanquet }}</td>
                  <td>{{ hall.capacityBuffet }}</td>
                  <td>{{ hall.capacityTheater }}</td>
                  <td>{{ hall.extraDetails || '—' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Accommodation / Rooms Table -->
        <div v-if="venue.details.rooms && venue.details.rooms.length > 0" class="venue-tabs__section">
          <h3 class="venue-tabs__section-title">Номера</h3>
          <div class="venue-tabs__table-wrapper">
            <table class="venue-tabs__table">
              <thead>
                <tr>
                  <th>Тип номера</th>
                  <th>Размещение</th>
                  <th>Цена (р.)</th>
                  <th>Дополнительно</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="room in venue.details.rooms" :key="room.id">
                  <td class="venue-tabs__table-cell--bold">{{ room.roomType }}</td>
                  <td>{{ room.placement }}</td>
                  <td>{{ formatPrice(room.priceRub) }}</td>
                  <td>{{ room.extraInfo || '—' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- 2. Pricing / Rent Tab (Node: 1199:52117) -->
      <div v-else-if="activeTab === 'pricing'" class="venue-tabs__pane">
        <div class="venue-tabs__pricing-header">
          <h3 class="venue-tabs__pricing-title">Стоимость площадки</h3>
        </div>

        <div class="venue-tabs__table-wrapper">
          <table class="venue-tabs__table venue-tabs__pricing-table">
            <thead>
              <tr>
                <th class="col-category">Категория</th>
                <th class="col-center">Большой зал</th>
                <th class="col-center">Малый зал</th>
                <th class="col-center">Весь ресторан</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="cell-category">Средний чек</td>
                <td colspan="3" class="cell-merged">{{ formatPrice(venue.pricing.averageCheck || 2000) }} р.</td>
              </tr>
              <tr>
                <td class="cell-category">Стоимость банкетного меню от:</td>
                <td colspan="3" class="cell-merged">{{ formatPrice(venue.pricing.banquetMenuPriceFrom || 3500) }} р.</td>
              </tr>
              <tr>
                <td class="cell-category">Стоимость фуршетного меню от:</td>
                <td colspan="3" class="cell-merged">1200 р.</td>
              </tr>
              <tr>
                <td class="cell-category">Аренда / час. от:</td>
                <td colspan="3" class="cell-merged">{{ formatPrice(venue.pricing.rentPricePerHour || 3000) }} р.</td>
              </tr>
              <tr>
                <td class="cell-category">Аренда площадки под мероприятие</td>
                <td colspan="3" class="cell-merged">пт-сб. 100 000 р. будни 80 000 р.</td>
              </tr>
              <tr>
                <td class="cell-category">Депозит (минимальная стоимость закрытия площадки, зала под одно мероприятие):</td>
                <td class="cell-center">200 000 р.</td>
                <td class="cell-center">120 000 р.</td>
                <td class="cell-center">300 000 р.</td>
              </tr>
              <tr>
                <td class="cell-category">Что входит в депозит:</td>
                <td colspan="3" class="cell-merged">Еда, часть напитков</td>
              </tr>
              <tr>
                <td class="cell-category">Возможность своего алкоголя:</td>
                <td colspan="3" class="cell-merged">да</td>
              </tr>
              <tr>
                <td class="cell-category">Пробковый сбор:</td>
                <td colspan="3" class="cell-merged">500 р/чел</td>
              </tr>
              <tr>
                <td class="cell-category">Сервисный сбор:</td>
                <td colspan="3" class="cell-merged">10%</td>
              </tr>
              <tr>
                <td class="cell-category">Дополнительные затраты:</td>
                <td colspan="3" class="cell-merged">Оборудование, чехлы и т.д.</td>
              </tr>
              <tr>
                <td class="cell-category">Стоимость номера (если есть номера) от и до:</td>
                <td colspan="3" class="cell-merged">2500 р. - 15 000 р.</td>
              </tr>
              <tr>
                <td class="cell-category">Бонусы и скидки:</td>
                <td colspan="3" class="cell-merged">В будни нет аренды! Молодоженам номер в подарок, каравай.</td>
              </tr>
              <tr>
                <td class="cell-category">Дополнительно:</td>
                <td colspan="3" class="cell-merged">Если что-то не учтено в предыдущих полях, можно внести сюда.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Download Buttons -->
        <div class="venue-tabs__downloads">
          <button type="button" class="venue-tabs__download-btn" @click="handleDownload('menu')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            <span>Скачать меню</span>
          </button>

          <button type="button" class="venue-tabs__download-btn" @click="handleDownload('rider')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            <span>Скачать райдер</span>
          </button>
        </div>
      </div>

      <!-- 3. Menu Tab (Node: 1199:52151) -->
      <div v-else-if="activeTab === 'menu'" class="venue-tabs__pane">
        <div class="venue-tabs__menu-slider">
          <button
            type="button"
            class="venue-tabs__slider-arrow venue-tabs__slider-arrow--prev"
            :disabled="menuSlideIndex === 0"
            @click="prevMenuSlide"
            aria-label="Предыдущее фото"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>

          <div class="venue-tabs__slider-viewport">
            <div
              class="venue-tabs__slider-track"
              :style="{ transform: `translateX(-${menuSlideIndex * 300}px)` }"
            >
              <div
                v-for="(photo, index) in menuPhotosList"
                :key="index"
                class="venue-tabs__menu-card"
              >
                <img :src="photo" alt="Блюдо из меню" class="venue-tabs__menu-img" />
              </div>
            </div>
          </div>

          <button
            type="button"
            class="venue-tabs__slider-arrow venue-tabs__slider-arrow--next"
            :disabled="menuSlideIndex >= maxMenuSlideIndex"
            @click="nextMenuSlide"
            aria-label="Следующее фото"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>

        <!-- Slider Dots -->
        <div class="venue-tabs__slider-dots">
          <button
            v-for="dot in Math.max(1, maxMenuSlideIndex + 1)"
            :key="dot"
            type="button"
            class="venue-tabs__slider-dot"
            :class="{ 'venue-tabs__slider-dot--active': menuSlideIndex === dot - 1 }"
            @click="menuSlideIndex = dot - 1"
          ></button>
        </div>
      </div>

      <!-- 4. Feed Tab (Node: 5222:25052) -->
      <div v-else-if="activeTab === 'feed'" class="venue-tabs__pane">
        <div class="venue-tabs__feed-list">
          <article
            v-for="item in visibleFeedItems"
            :key="item.id"
            class="venue-tabs__feed-card"
          >
            <!-- Media left -->
            <div class="venue-tabs__feed-media-wrap">
              <img :src="item.imageUrl" alt="Новость площадки" class="venue-tabs__feed-media-img" />
              <button
                v-if="item.videoUrl"
                type="button"
                class="venue-tabs__feed-play-btn"
                aria-label="Воспроизвести видео"
                @click="handlePlayFeedVideo(item)"
              >
                <div class="venue-tabs__feed-play-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="6 3 20 12 6 21 6 3"></polygon>
                  </svg>
                </div>
              </button>
            </div>

            <!-- Content right -->
            <div class="venue-tabs__feed-body">
              <div class="venue-tabs__feed-header">
                <img
                  :src="item.authorAvatar || venue.gallery.mainPhoto"
                  alt="Аватар автора"
                  class="venue-tabs__feed-avatar"
                />
                <div class="venue-tabs__feed-author-meta">
                  <h4 class="venue-tabs__feed-author-title">{{ item.author }}</h4>
                  <span class="venue-tabs__feed-time">{{ item.publishedAgo }}</span>
                </div>
              </div>

              <div class="venue-tabs__feed-description">
                {{ item.text }}
              </div>

              <div class="venue-tabs__feed-actions">
                <button
                  type="button"
                  class="venue-tabs__like-button"
                  :class="{ 'venue-tabs__like-button--liked': likedMap[item.id] }"
                  @click="toggleLike(item.id)"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                  </svg>
                  <span>{{ (item.likesCount || 0) + (likedMap[item.id] ? 1 : 0) }} человек это оценили</span>
                </button>
              </div>
            </div>
          </article>
        </div>

        <!-- Load More Button -->
        <div v-if="hasMoreFeed" class="venue-tabs__center-action">
          <button type="button" class="venue-tabs__gradient-btn" @click="feedLimit += 4">
            Показать еще 4
          </button>
        </div>
      </div>

      <!-- 5. Guest Chat / Reviews & FAQ Tab (Node: 1199:52219) -->
      <div v-else-if="activeTab === 'chat'" class="venue-tabs__pane">
        <!-- Part 1: Reviews -->
        <div class="venue-tabs__reviews-section">
          <div class="venue-tabs__section-header-center">
            <h3 class="venue-tabs__reviews-title">Отзывы гостей</h3>
            <span class="venue-tabs__reviews-subtitle">23 отзыва (5.0)</span>
          </div>

          <div class="venue-tabs__reviews-list">
            <div
              v-for="rev in reviewsList"
              :key="rev.id"
              class="venue-tabs__review-item"
            >
              <div class="venue-tabs__review-header">
                <img :src="rev.avatar" alt="Аватар гостя" class="venue-tabs__review-avatar" />
                <div class="venue-tabs__review-user">
                  <span class="venue-tabs__review-name">{{ rev.author }}</span>
                  <span class="venue-tabs__review-date">{{ rev.date }}</span>
                </div>
                <div class="venue-tabs__review-stars">
                  <span v-for="star in 5" :key="star" class="venue-tabs__blue-star">★</span>
                </div>
              </div>

              <p class="venue-tabs__review-text">{{ rev.text }}</p>
            </div>
          </div>

          <div class="venue-tabs__btn-group">
            <button type="button" class="venue-tabs__gradient-btn" @click="handleMoreReviews">
              Больше отзывов
            </button>
            <button type="button" class="venue-tabs__outline-btn" @click="handleAddReview">
              Добавить отзыв
            </button>
          </div>
        </div>

        <!-- Part 2: FAQ Accordion -->
        <div class="venue-tabs__faq-section">
          <div class="venue-tabs__faq-intro">
            <p class="venue-tabs__faq-hint">
              Не нашли нужную информацию? Ознакомьтесь с часто задаваемыми вопросами или задайте свой вопрос ниже.
            </p>
            <span class="venue-tabs__faq-subhint">
              Сотрудники обычно отвечают в течение нескольких часов
            </span>
          </div>

          <div class="venue-tabs__accordion">
            <div
              v-for="(item, idx) in faqItemsList"
              :key="item.id"
              class="venue-tabs__accordion-item"
              :class="{ 'venue-tabs__accordion-item--open': expandedFaqIndex === idx }"
            >
              <button
                type="button"
                class="venue-tabs__accordion-header"
                @click="toggleFaq(idx)"
              >
                <span class="venue-tabs__accordion-question">{{ item.question }}</span>
                <span class="venue-tabs__accordion-icon" :class="{ 'venue-tabs__accordion-icon--open': expandedFaqIndex === idx }">
                  <span class="icon-line horizontal"></span>
                  <span class="icon-line vertical"></span>
                </span>
              </button>

              <div v-show="expandedFaqIndex === idx" class="venue-tabs__accordion-body">
                <p>{{ item.answer }}</p>
              </div>
            </div>
          </div>

          <div class="venue-tabs__btn-group">
            <button type="button" class="venue-tabs__gradient-btn" @click="handleMoreQuestions">
              Больше вопросов
            </button>
            <button type="button" class="venue-tabs__outline-btn" @click="handleAskQuestion">
              Задать вопрос
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { VenueType, VenueActiveTabType, VenueFeedItemType, VenueReviewItemType, VenueFaqItemType } from '../../model/types'

interface IProps {
  venue: VenueType
  initialTab?: VenueActiveTabType
}

interface IEmits {
  (e: 'tab-change', tab: VenueActiveTabType): void
  (e: 'like-feed', itemId: string): void
  (e: 'play-video', videoUrl: string): void
}

const props = withDefaults(defineProps<IProps>(), {
  initialTab: 'description',
})
const emit = defineEmits<IEmits>()

const activeTab = ref<VenueActiveTabType>(props.initialTab)

const tabsList: { key: VenueActiveTabType; label: string }[] = [
  { key: 'description', label: 'Описание' },
  { key: 'pricing', label: 'Цены/аренда' },
  { key: 'menu', label: 'Меню' },
  { key: 'feed', label: 'Лента' },
  { key: 'chat', label: 'Гостевой чат' },
]

const handleTabChange = (tab: VenueActiveTabType) => {
  activeTab.value = tab
  emit('tab-change', tab)
}

const formatPrice = (price?: number): string => {
  if (!price) return '0'
  return new Intl.NumberFormat('ru-RU').format(price)
}

// -------------------------------------------------------------
// 1. Pricing Downloads
// -------------------------------------------------------------
const handleDownload = (type: 'menu' | 'rider') => {
  const customUrl = type === 'menu' ? props.venue.menuUrl : props.venue.riderUrl
  if (customUrl && customUrl.startsWith('http') && !customUrl.includes('example.com')) {
    window.open(customUrl, '_blank')
    return
  }
  const fileName = type === 'menu' ? `${props.venue.slug || 'venue'}-menu.pdf` : `${props.venue.slug || 'venue'}-rider.pdf`
  const dummyContent = `Guest&Place: ${type.toUpperCase()} for ${props.venue.title}`
  const blob = new Blob([dummyContent], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  a.click()
  URL.revokeObjectURL(url)
}

// -------------------------------------------------------------
// 2. Menu Carousel
// -------------------------------------------------------------
const menuSlideIndex = ref(0)
const defaultMenuPhotos = [
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=600&q=80',
]

const menuPhotosList = computed(() => {
  return props.venue.menuPhotos?.length ? props.venue.menuPhotos : defaultMenuPhotos
})

const maxMenuSlideIndex = computed(() => {
  return Math.max(0, menuPhotosList.value.length - 3)
})

const prevMenuSlide = () => {
  if (menuSlideIndex.value > 0) menuSlideIndex.value--
}

const nextMenuSlide = () => {
  if (menuSlideIndex.value < maxMenuSlideIndex.value) menuSlideIndex.value++
}

// -------------------------------------------------------------
// 3. Feed Tab
// -------------------------------------------------------------
const feedLimit = ref(4)
const likedMap = ref<Record<string, boolean>>({})

const defaultFeedItems: VenueFeedItemType[] = [
  {
    id: 'feed-1',
    author: 'Банкетный зал Форест Холл',
    authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80',
    publishedAgo: '4 дня',
    text: 'Зимняя свадьба похожа на сказку. Пушистый снег на фотографиях, уютно оформленная площадка и романтичная атмосфера вечера при свечах.\n\nДекабрь уже подходит к концу, но впереди нас ждут январь и февраль с изобилием красивых дат!\n\nНапишите нам в Директ, чтобы узнать все детали и записаться на просмотр / Banquet hall Loft Forest Hall',
    imageUrl: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80',
    likesCount: 18,
  },
  {
    id: 'feed-2',
    author: 'Банкетный зал Форест Холл',
    authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80',
    publishedAgo: '4 дня',
    text: 'Зимняя свадьба похожа на сказку. Пушистый снег на фотографиях, уютно оформленная площадка и романтичная атмосфера вечера при свечах.\n\nДекабрь уже подходит к концу, но впереди нас ждут январь и февраль с изобилием красивых дат!\n\nНапишите нам в Директ, чтобы узнать все детали и записаться на просмотр / Banquet hall Loft Forest Hall',
    imageUrl: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    likesCount: 18,
  },
  {
    id: 'feed-3',
    author: 'Банкетный зал Форест Холл',
    authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80',
    publishedAgo: '4 дня',
    text: 'Зимняя свадьба похожа на сказку. Пушистый снег на фотографиях, уютно оформленная площадка и романтичная атмосфера вечера при свечах.\n\nДекабрь уже подходит к концу, но впереди нас ждут январь и февраль с изобилием красивых дат!\n\nНапишите нам в Директ, чтобы узнать все детали и записаться на просмотр / Banquet hall Loft Forest Hall',
    imageUrl: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80',
    likesCount: 18,
  },
  {
    id: 'feed-4',
    author: 'Банкетный зал Форест Холл',
    authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80',
    publishedAgo: '4 дня',
    text: 'Зимняя свадьба похожа на сказку. Пушистый снег на фотографиях, уютно оформленная площадка и романтичная атмосфера вечера при свечах.\n\nДекабрь уже подходит к концу, но впереди нас ждут январь и февраль с изобилием красивых дат!\n\nНапишите нам в Директ, чтобы узнать все детали и записаться на просмотр / Banquet hall Loft Forest Hall',
    imageUrl: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    likesCount: 18,
  },
]

const feedItemsList = computed(() => {
  return props.venue.feed?.length ? props.venue.feed : defaultFeedItems
})

const visibleFeedItems = computed(() => {
  return feedItemsList.value.slice(0, feedLimit.value)
})

const hasMoreFeed = computed(() => {
  return feedLimit.value < feedItemsList.value.length
})

const toggleLike = (id: string) => {
  likedMap.value[id] = !likedMap.value[id]
  emit('like-feed', id)
}

const handlePlayFeedVideo = (item: VenueFeedItemType) => {
  if (item.videoUrl) {
    emit('play-video', item.videoUrl)
  }
}

// -------------------------------------------------------------
// 4. Guest Chat: Reviews & FAQ
// -------------------------------------------------------------
const defaultReviews: VenueReviewItemType[] = [
  {
    id: 'rev-1',
    author: 'Юлия',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
    date: '20.03.2022',
    rating: 5,
    text: 'Очень красиво и стильное место! Сервис на высшем уровне. Все прозрачно, никаких непонятных доп. услуг нет, практически все включено в стоимость аренды. Шикарный ламповый звук, очень атмосферно. Пространство большое, бар удобный, бармены профессионалы своего дела! Рекомендую данный лофт. 10 из 10!!',
  },
  {
    id: 'rev-2',
    author: 'Юлия',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    date: '20.03.2022',
    rating: 5,
    text: 'Очень красиво и стильное место! Сервис на высшем уровне. Все прозрачно, никаких непонятных доп. услуг нет, практически все включено в стоимость аренды. Шикарный ламповый звук, очень атмосферно. Пространство большое, бар удобный, бармены профессионалы своего дела! Рекомендую данный лофт. 10 из 10!!',
  },
  {
    id: 'rev-3',
    author: 'Юлия',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80',
    date: '20.03.2022',
    rating: 5,
    text: 'Очень красиво и стильное место! Сервис на высшем уровне. Все прозрачно, никаких непонятных доп. услуг нет, практически все включено в стоимость аренды. Шикарный ламповый звук, очень атмосферно. Пространство большое, бар удобный, бармены профессионалы своего дела! Рекомендую данный лофт. 10 из 10!!',
  },
  {
    id: 'rev-4',
    author: 'Юлия',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=120&q=80',
    date: '20.03.2022',
    rating: 5,
    text: 'Очень красиво и стильное место! Сервис на высшем уровне. Все прозрачно, никаких непонятных доп. услуг нет, практически все включено в стоимость аренды. Шикарный ламповый звук, очень атмосферно. Пространство большое, бар удобный, бармены профессионалы своего дела! Рекомендую данный лофт. 10 из 10!!',
  },
]

const reviewsList = computed(() => {
  return props.venue.reviews?.length ? props.venue.reviews : defaultReviews
})

const defaultFaqList: VenueFaqItemType[] = [
  {
    id: 'faq-1',
    question: 'Каков процент за обслуживание банкета?',
    answer: 'В случае предварительного заказа банкета стоимость обслуживания (10%) автоматически добавляется к чеку.',
  },
  {
    id: 'faq-2',
    question: 'Каков процент за обслуживание банкета?',
    answer: 'В случае предварительного заказа банкета стоимость обслуживания (10%) автоматически добавляется к чеку.',
  },
  {
    id: 'faq-3',
    question: 'Каков процент за обслуживание банкета?',
    answer: 'В случае предварительного заказа банкета стоимость обслуживания (10%) автоматически добавляется к чеку.',
  },
  {
    id: 'faq-4',
    question: 'Каков процент за обслуживание банкета?',
    answer: 'В случае предварительного заказа банкета стоимость обслуживания (10%) автоматически добавляется к чеку.',
  },
]

const faqItemsList = computed(() => {
  return props.venue.faq?.length ? props.venue.faq : defaultFaqList
})

const expandedFaqIndex = ref<number | null>(1)

const toggleFaq = (index: number) => {
  if (expandedFaqIndex.value === index) {
    expandedFaqIndex.value = null
  } else {
    expandedFaqIndex.value = index
  }
}

const handleMoreReviews = () => {
  alert('Загрузка дополнительных отзывов гостей...')
}

const handleAddReview = () => {
  alert('Форма добавления отзыва скоро будет доступна!')
}

const handleMoreQuestions = () => {
  alert('Загрузка дополнительных вопросов...')
}

const handleAskQuestion = () => {
  alert('Задать вопрос менеджеру: менеджер свяжется с вами в течение нескольких часов.')
}
</script>

<style scoped lang="scss">
.venue-tabs {
  width: 100%;
  max-width: 1110px;
  margin: 32px auto 0;

  &__nav {
    display: flex;
    gap: 8px;
    background: transparent;
    overflow-x: auto;
    padding-bottom: 2px;
  }

  &__nav-item {
    padding: 16px 36px;
    font-size: 16px;
    font-weight: 500;
    color: #4b5563;
    background: #eef5fc;
    border: none;
    border-radius: 24px 24px 0 0;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;

    &:hover {
      background: #e2eaf5;
      color: #111827;
    }

    &--active {
      background: #ffffff;
      color: #111827;
      font-weight: 600;
      box-shadow: 0 -4px 12px rgba(105, 78, 75, 0.05);
    }
  }

  &__card {
    background: #ffffff;
    border-radius: 0 30px 30px 30px;
    padding: 40px 48px;
    box-shadow: 0 4px 24px rgba(105, 78, 75, 0.08);

    @media (max-width: 768px) {
      padding: 24px 20px;
      border-radius: 20px;
    }
  }

  &__pane {
    display: flex;
    flex-direction: column;
    gap: 32px;
  }

  // Common Section / Attributes
  &__attributes {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  &__attr-row {
    display: grid;
    grid-template-columns: 140px 1fr;
    gap: 16px;
    font-size: 14px;
    line-height: 1.5;

    @media (max-width: 640px) {
      grid-template-columns: 1fr;
      gap: 4px;
    }
  }

  &__attr-label {
    color: #8f9499;
  }

  &__attr-value {
    color: #222222;
    font-weight: 400;
  }

  &__section {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  &__section-title {
    font-size: 18px;
    font-weight: 600;
    color: #222222;
    margin: 0;
  }

  &__table-wrapper {
    width: 100%;
    overflow-x: auto;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
  }

  &__table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
    text-align: left;

    th,
    td {
      padding: 14px 18px;
      border-bottom: 1px solid #e5e7eb;
      border-right: 1px solid #e5e7eb;

      &:last-child {
        border-right: none;
      }
    }

    th {
      background: #f8fafc;
      color: #333333;
      font-weight: 500;
    }

    tbody tr:last-child td {
      border-bottom: none;
    }
  }

  &__table-cell--bold {
    font-weight: 600;
    color: #111827;
  }

  // -------------------------------------------------------------
  // 1. Pricing Tab Styles
  // -------------------------------------------------------------
  &__pricing-title {
    font-size: 18px;
    font-weight: 600;
    color: #333333;
    margin: 0 0 16px 0;
  }

  &__pricing-table {
    th.col-category {
      width: 28%;
      color: #333333;
      font-weight: 500;
    }

    th.col-center,
    td.cell-center {
      text-align: center;
      color: #585f66;
    }

    td.cell-category {
      color: #585f66;
      font-weight: 500;
      background: #ffffff;
    }

    td.cell-merged {
      text-align: center;
      color: #585f66;
    }
  }

  &__downloads {
    display: flex;
    gap: 36px;
    margin-top: 8px;
  }

  &__download-btn {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    background: transparent;
    border: none;
    font-size: 16px;
    color: #333333;
    font-weight: 400;
    cursor: pointer;
    transition: all 0.2s ease;
    padding: 0;

    svg {
      color: #585f66;
      transition: transform 0.2s ease;
    }

    &:hover {
      color: #7b2cbf;

      svg {
        transform: translateY(-2px);
        color: #7b2cbf;
      }
    }
  }

  // -------------------------------------------------------------
  // 2. Menu Carousel Styles
  // -------------------------------------------------------------
  &__menu-slider {
    display: flex;
    align-items: center;
    gap: 20px;
    position: relative;
    padding: 20px 0;
  }

  &__slider-viewport {
    flex: 1;
    overflow: hidden;
    border-radius: 30px;
  }

  &__slider-track {
    display: flex;
    gap: 30px;
    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }

  &__menu-card {
    flex: 0 0 270px;
    height: 320px;
    border-radius: 30px;
    overflow: hidden;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);

    @media (max-width: 640px) {
      flex: 0 0 240px;
      height: 280px;
    }
  }

  &__menu-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.3s ease;

    &:hover {
      transform: scale(1.04);
    }
  }

  &__slider-arrow {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: #ffffff;
    border: 1.5px solid #d1d5db;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #9ca3af;
    transition: all 0.2s ease;
    flex-shrink: 0;

    &:hover:not(:disabled) {
      border-color: #d9739f;
      color: #8757e6;
      box-shadow: 0 4px 12px rgba(135, 87, 230, 0.15);
      transform: scale(1.05);
    }

    &:disabled {
      opacity: 0.35;
      cursor: not-allowed;
    }

    &--next:not(:disabled) {
      border-color: #d9739f;
      color: #8757e6;
    }
  }

  &__slider-dots {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    margin-top: 10px;
  }

  &__slider-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: transparent;
    border: 1.5px solid #d1d5db;
    padding: 0;
    cursor: pointer;
    transition: all 0.2s ease;

    &--active {
      width: 14px;
      height: 14px;
      border-color: #d9739f;
      background: transparent;
    }
  }

  // -------------------------------------------------------------
  // 3. Feed Tab Styles
  // -------------------------------------------------------------
  &__feed-list {
    display: flex;
    flex-direction: column;
    gap: 40px;
  }

  &__feed-card {
    display: flex;
    gap: 32px;
    align-items: flex-start;

    @media (max-width: 900px) {
      flex-direction: column;
    }
  }

  &__feed-media-wrap {
    position: relative;
    width: 337px;
    height: 232px;
    border-radius: 30px;
    overflow: hidden;
    flex-shrink: 0;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);

    @media (max-width: 900px) {
      width: 100%;
      height: 260px;
    }
  }

  &__feed-media-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  &__feed-play-btn {
    position: absolute;
    inset: 0;
    margin: auto;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(8px);
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);

    &:hover {
      transform: scale(1.1);
      background: #ffffff;
    }
  }

  &__feed-play-icon {
    margin-left: 4px;
    color: #8757e6;
  }

  &__feed-body {
    display: flex;
    flex-direction: column;
    gap: 16px;
    flex: 1;
  }

  &__feed-header {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  &__feed-avatar {
    width: 58px;
    height: 58px;
    border-radius: 50%;
    object-fit: cover;
    border: 1px solid #e5e7eb;
  }

  &__feed-author-meta {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__feed-author-title {
    font-size: 24px;
    font-weight: 500;
    color: #111827;
    margin: 0;
  }

  &__feed-time {
    font-size: 15px;
    color: #a0a0a4;
  }

  &__feed-description {
    font-size: 14px;
    line-height: 1.6;
    color: #585f66;
    white-space: pre-line;
  }

  &__feed-actions {
    margin-top: 4px;
  }

  &__like-button {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: transparent;
    border: none;
    font-size: 14px;
    color: #a0a0a4;
    cursor: pointer;
    padding: 0;
    transition: color 0.2s ease;

    svg {
      transition: transform 0.2s ease;
    }

    &:hover,
    &--liked {
      color: #8757e6;

      svg {
        transform: scale(1.15);
      }
    }
  }

  &__center-action {
    display: flex;
    justify-content: center;
    margin-top: 16px;
  }

  // -------------------------------------------------------------
  // 4. Guest Chat / Reviews & FAQ Styles
  // -------------------------------------------------------------
  &__reviews-section {
    display: flex;
    flex-direction: column;
    gap: 28px;
  }

  &__section-header-center {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
  }

  &__reviews-title {
    font-size: 20px;
    font-weight: 600;
    color: #333333;
    margin: 0;
  }

  &__reviews-subtitle {
    font-size: 14px;
    color: #a0a0a4;
  }

  &__reviews-list {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  &__review-item {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding-bottom: 20px;
    border-bottom: 1px solid #f3f4f6;

    &:last-child {
      border-bottom: none;
    }
  }

  &__review-header {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  &__review-avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    object-fit: cover;
  }

  &__review-user {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  &__review-name {
    font-size: 15px;
    font-weight: 600;
    color: #111827;
  }

  &__review-date {
    font-size: 13px;
    color: #a0a0a4;
  }

  &__review-stars {
    margin-left: auto;
    display: flex;
    gap: 4px;
  }

  &__blue-star {
    color: #0066cc;
    font-size: 18px;
  }

  &__review-text {
    font-size: 14px;
    line-height: 1.6;
    color: #585f66;
    margin: 0;
  }

  &__btn-group {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-top: 12px;
    flex-wrap: wrap;
  }

  &__gradient-btn {
    padding: 16px 42px;
    background: linear-gradient(90deg, #d9739f 0%, #8757e6 100%);
    color: #ffffff;
    border: none;
    border-radius: 30px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 4px 16px rgba(135, 87, 230, 0.25);
    transition: all 0.2s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(135, 87, 230, 0.35);
    }
  }

  &__outline-btn {
    padding: 15px 42px;
    background: #ffffff;
    color: #8757e6;
    border: 1.5px solid #8757e6;
    border-radius: 30px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background: #fcf9ff;
      border-color: #d9739f;
      color: #d9739f;
      transform: translateY(-2px);
    }
  }

  &__faq-section {
    display: flex;
    flex-direction: column;
    gap: 24px;
    margin-top: 24px;
    padding-top: 36px;
    border-top: 1px solid #eef2f6;
  }

  &__faq-intro {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  &__faq-hint {
    font-size: 15px;
    color: #585f66;
    margin: 0;
  }

  &__faq-subhint {
    font-size: 13px;
    color: #a0a0a4;
  }

  &__accordion {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  &__accordion-item {
    border: 1px solid #e5e7eb;
    border-radius: 40px;
    padding: 16px 24px;
    background: #ffffff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
    transition: all 0.2s ease;

    &--open {
      border-radius: 24px;
      border-color: #e2e8f0;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
    }
  }

  &__accordion-header {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: transparent;
    border: none;
    padding: 0;
    cursor: pointer;
    text-align: left;
  }

  &__accordion-question {
    font-size: 15px;
    font-weight: 500;
    color: #333333;
  }

  &__accordion-icon {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    border: 1.5px solid #d9739f;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    flex-shrink: 0;

    .icon-line {
      position: absolute;
      background: #8757e6;
      border-radius: 2px;
      transition: transform 0.2s ease, opacity 0.2s ease;

      &.horizontal {
        width: 14px;
        height: 2px;
      }

      &.vertical {
        width: 2px;
        height: 14px;
      }
    }

    &--open {
      border-color: #8757e6;

      .icon-line.vertical {
        opacity: 0;
        transform: rotate(90deg);
      }
    }
  }

  &__accordion-body {
    padding-top: 14px;
    font-size: 14px;
    line-height: 1.6;
    color: #585f66;
    border-top: 1px solid #f3f4f6;
    margin-top: 14px;

    p {
      margin: 0;
    }
  }
}
</style>

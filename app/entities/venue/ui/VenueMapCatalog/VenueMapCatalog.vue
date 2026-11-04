<template>
  <div class="venue-map-catalog">
    <!-- Map Canvas Container -->
    <div
      ref="mapContainerRef"
      class="venue-map-catalog__map-container"
      :class="{ 'is-dragging': isDragging }"
      @pointerdown="handlePointerDown"
      @pointermove="handlePointerMove"
      @pointerup="handlePointerUp"
      @pointerleave="handlePointerUp"
      @wheel.prevent="handleWheel"
    >
      <!-- Interactive SVG Map Canvas -->
      <svg
        class="venue-map-catalog__svg-canvas"
        viewBox="0 0 1440 700"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <!-- Map Background & Street Gradients -->
          <linearGradient id="gpMapWaterGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#bfe4f7" />
            <stop offset="100%" stop-color="#a6d5f0" />
          </linearGradient>
          <linearGradient id="gpMapParkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#def1dc" />
            <stop offset="100%" stop-color="#cbe6c8" />
          </linearGradient>
          <linearGradient id="gpPinGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#d946ef" />
            <stop offset="100%" stop-color="#4f46e5" />
          </linearGradient>
          <filter id="gpPinShadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="rgba(0,0,0,0.25)" />
          </filter>
        </defs>

        <!-- World Transform Group for Pan & Zoom -->
        <g :transform="`translate(${panX}, ${panY}) scale(${zoom})`">
          <!-- Background Base Layer (City Canvas) -->
          <rect x="-1000" y="-1000" width="3440" height="2700" fill="#f4f3ef" />

          <!-- Parks & Green Areas (Moscow Zaryadye, Aleksandrovsky Sad, etc.) -->
          <path
            d="M 680 340 C 720 310, 780 330, 810 390 C 830 430, 790 480, 740 470 C 690 460, 660 380, 680 340 Z"
            fill="url(#gpMapParkGradient)"
            opacity="0.8"
          />
          <path
            d="M 520 280 C 560 270, 580 340, 560 410 C 540 450, 490 440, 480 390 C 470 340, 490 290, 520 280 Z"
            fill="url(#gpMapParkGradient)"
            opacity="0.7"
          />
          <path
            d="M 880 180 C 940 160, 1010 210, 990 270 C 970 320, 910 300, 880 260 Z"
            fill="url(#gpMapParkGradient)"
            opacity="0.6"
          />

          <!-- Moscow River (Река Москва) -->
          <path
            d="M -500 580 C 100 590, 320 540, 530 520 C 740 500, 930 530, 1150 500 C 1370 470, 1600 530, 2000 520 L 2000 580 C 1600 590, 1370 530, 1150 560 C 930 590, 740 560, 530 580 C 320 600, 100 650, -500 640 Z"
            fill="url(#gpMapWaterGradient)"
          />

          <!-- Street Network / Grid Lines -->
          <!-- Boulevard Ring / Sadovoye ring outlines -->
          <path
            d="M 200 120 C 550 40, 950 40, 1260 140 C 1380 340, 1340 520, 1200 620"
            fill="none"
            stroke="#ffffff"
            stroke-width="14"
            stroke-linecap="round"
          />
          <path
            d="M 200 120 C 550 40, 950 40, 1260 140 C 1380 340, 1340 520, 1200 620"
            fill="none"
            stroke="#fde047"
            stroke-width="4"
            stroke-linecap="round"
            opacity="0.6"
          />

          <!-- Tverskaya st. (Тверская) -->
          <line x1="380" y1="40" x2="680" y2="350" stroke="#ffffff" stroke-width="16" stroke-linecap="round" />
          <line x1="380" y1="40" x2="680" y2="350" stroke="#fef08a" stroke-width="5" stroke-linecap="round" />

          <!-- Okhotny Ryad & Teatralny passage (Охотный ряд / Театральный пр-д) -->
          <line x1="560" y1="330" x2="1020" y2="290" stroke="#ffffff" stroke-width="16" stroke-linecap="round" />
          <line x1="560" y1="330" x2="1020" y2="290" stroke="#fef08a" stroke-width="5" stroke-linecap="round" />

          <!-- Neglinnaya st. (ул. Неглинная) -->
          <line x1="780" y1="80" x2="740" y2="310" stroke="#ffffff" stroke-width="12" stroke-linecap="round" />

          <!-- Bolshaya Nikitskaya st. -->
          <line x1="280" y1="260" x2="650" y2="360" stroke="#ffffff" stroke-width="12" stroke-linecap="round" />

          <!-- Vozdvizhenka & Novy Arbat -->
          <line x1="160" y1="380" x2="640" y2="400" stroke="#ffffff" stroke-width="14" stroke-linecap="round" />

          <!-- Mokhovaya st. (ул. Моховая) -->
          <line x1="640" y1="400" x2="700" y2="520" stroke="#ffffff" stroke-width="14" stroke-linecap="round" />

          <!-- Secondary Streets -->
          <path
            d="M 400 160 L 520 280 L 640 260 M 740 180 L 880 260 L 980 340 M 820 310 L 890 420 L 1020 460"
            fill="none"
            stroke="#ffffff"
            stroke-width="8"
            stroke-linecap="round"
          />
          <path
            d="M 580 430 L 630 490 M 760 440 L 850 510 L 960 520"
            fill="none"
            stroke="#ffffff"
            stroke-width="8"
            stroke-linecap="round"
          />

          <!-- Street Names & Landmarks matching Figma node 1199:52354 -->
          <text x="440" y="160" font-family="'Raleway', sans-serif" font-size="11" fill="#78716c" transform="rotate(38 440 160)">
            Тверская ул.
          </text>
          <text x="790" y="190" font-family="'Raleway', sans-serif" font-size="10" fill="#a8a29e" transform="rotate(78 790 190)">
            Неглинная ул.
          </text>
          <text x="820" y="280" font-family="'Raleway', sans-serif" font-size="11" fill="#78716c">
            Театральный пр-д
          </text>
          <text x="610" y="325" font-family="'Raleway', sans-serif" font-size="11" font-weight="600" fill="#dc2626">
            🚇 Охотный Ряд
          </text>
          <text x="870" y="270" font-family="'Raleway', sans-serif" font-size="11" font-weight="600" fill="#2563eb">
            🚇 Театральная
          </text>
          <text x="940" y="315" font-family="'Raleway', sans-serif" font-size="11" font-weight="600" fill="#059669">
            🚇 Пл. Революции
          </text>

          <!-- Landmarks Labels -->
          <g transform="translate(680, 240)">
            <rect x="0" y="0" width="115" height="22" rx="4" fill="rgba(255,255,255,0.85)" />
            <text x="8" y="15" font-family="'Raleway', sans-serif" font-size="10" font-weight="600" fill="#e11d48">
              ★ Four Seasons Hotel
            </text>
          </g>

          <g transform="translate(560, 260)">
            <rect x="0" y="0" width="105" height="22" rx="4" fill="rgba(255,255,255,0.85)" />
            <text x="6" y="15" font-family="'Raleway', sans-serif" font-size="10" font-weight="600" fill="#e11d48">
              ★ The Ritz-Carlton
            </text>
          </g>

          <g transform="translate(730, 390)">
            <rect x="0" y="0" width="110" height="22" rx="4" fill="rgba(255,255,255,0.85)" />
            <text x="6" y="15" font-family="'Raleway', sans-serif" font-size="10" font-weight="600" fill="#475569">
              🏛️ Зарядье Парк
            </text>
          </g>

          <!-- Interactive Venue Pins -->
          <g
            v-for="venue in placedVenues"
            :key="venue.id"
            class="venue-map-catalog__pin-group"
            :class="{ 'is-selected': selectedVenue?.id === venue.id }"
            :transform="`translate(${venue.pixelX}, ${venue.pixelY})`"
            @click.stop="selectVenue(venue)"
          >
            <!-- Pin Glow Ring if Selected -->
            <circle
              v-if="selectedVenue?.id === venue.id"
              r="24"
              fill="rgba(217, 70, 239, 0.25)"
              class="venue-map-catalog__pulse-ring"
            />

            <!-- Pin Shape -->
            <path
              d="M 0 0 C -12 -12, -14 -28, 0 -38 C 14 -28, 12 -12, 0 0 Z"
              fill="url(#gpPinGradient)"
              filter="url(#gpPinShadow)"
              class="venue-map-catalog__pin-icon"
            />
            <circle cx="0" cy="-24" r="6" fill="#ffffff" />

            <!-- Price Tag Label over Pin -->
            <g transform="translate(16, -28)">
              <rect
                x="0"
                y="-10"
                :width="venue.badgeWidth"
                height="20"
                rx="10"
                fill="#ffffff"
                stroke="rgba(0,0,0,0.08)"
                filter="url(#gpPinShadow)"
                class="venue-map-catalog__pin-badge-bg"
              />
              <text
                x="8"
                y="4"
                font-family="'Raleway', sans-serif"
                font-size="10"
                font-weight="700"
                fill="#1e1b4b"
              >
                {{ venue.badgeText }}
              </text>
            </g>
          </g>
        </g>
      </svg>

      <!-- Selected Venue Preview Balloon Card -->
      <transition name="pop">
        <div
          v-if="selectedVenue"
          class="venue-map-catalog__popup-card"
          :style="popupPositionStyle"
          @click.stop
        >
          <button
            type="button"
            class="venue-map-catalog__popup-close"
            aria-label="Закрыть карточку"
            @click="selectedVenue = null"
          >
            ✕
          </button>

          <div class="venue-map-catalog__popup-media">
            <img
              :src="getVenuePhoto(selectedVenue)"
              :alt="selectedVenue.title"
              class="venue-map-catalog__popup-img"
            />
            <span class="venue-map-catalog__popup-rating">
              ★ {{ selectedVenue.rating?.score?.toFixed(1) || '5.0' }}
            </span>
          </div>

          <div class="venue-map-catalog__popup-content">
            <h3 class="venue-map-catalog__popup-title">
              {{ selectedVenue.title }}
            </h3>

            <div v-if="selectedVenue.location?.metro" class="venue-map-catalog__popup-metro">
              <span>🚇 {{ selectedVenue.location.metro.station }}</span>
              <small v-if="selectedVenue.location.metro.distanceText">
                • {{ selectedVenue.location.metro.distanceText }}
              </small>
            </div>

            <div class="venue-map-catalog__popup-meta">
              <span class="venue-map-catalog__popup-price">
                от {{ formatPrice(selectedVenue.pricing?.averageCheck || 2500) }} ₽/чел
              </span>
              <span v-if="selectedVenue.capacitySummary?.banquet" class="venue-map-catalog__popup-capacity">
                👥 до {{ selectedVenue.capacitySummary.banquet.split('/').pop() }} чел
              </span>
            </div>

            <div class="venue-map-catalog__popup-actions">
              <NuxtLink
                :to="`/venues/${selectedVenue.slug}`"
                class="venue-map-catalog__popup-btn"
              >
                Подробнее о площадке
              </NuxtLink>
            </div>
          </div>
        </div>
      </transition>

      <!-- Map Floating Controls (Zoom +/- & Geolocation) matching Figma 1199:52356 - 1199:52362 -->
      <div class="venue-map-catalog__controls">
        <div class="venue-map-catalog__zoom-box">
          <button
            type="button"
            class="venue-map-catalog__zoom-btn"
            title="Приблизить"
            aria-label="Приблизить карту"
            @click="zoomIn"
          >
            +
          </button>
          <div class="venue-map-catalog__zoom-divider" />
          <button
            type="button"
            class="venue-map-catalog__zoom-btn"
            title="Отдалить"
            aria-label="Отдалить карту"
            @click="zoomOut"
          >
            –
          </button>
        </div>

        <button
          type="button"
          class="venue-map-catalog__location-btn"
          title="Показать мое местоположение"
          aria-label="Мое местоположение"
          @click="resetView"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#4f4f4f"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polygon points="3 11 22 2 13 21 11 13 3 11" fill="#4f4f4f" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Bottom Actions Bar (Exact Figma nodes 1199:52360 - 1199:52370) -->
    <div class="venue-map-catalog__bottom-bar">
      <div class="venue-map-catalog__bottom-container">
        <!-- 1. Gradient Pill Button: Показать списком (Figma node 1199:52367) -->
        <button
          type="button"
          class="venue-map-catalog__list-view-btn"
          @click="$emit('toggle-view', 'list')"
        >
          Показать списком
        </button>

        <!-- 2. Action: Показать рядом со мной (Figma node 1199:52368) -->
        <button
          type="button"
          class="venue-map-catalog__sub-action-btn"
          @click="showNearby"
        >
          <UiIcon name="house" class="sub-action-icon" />
          <span>Показать рядом со мной</span>
        </button>

        <!-- 3. Action: Показать в выбранной области (Figma node 1199:52369) -->
        <button
          type="button"
          class="venue-map-catalog__sub-action-btn"
          @click="filterVisibleArea"
        >
          <UiIcon name="selection" class="sub-action-icon" />
          <span>Показать в выбранной области</span>
        </button>

        <!-- 4. Action: Помощь эксперта (Figma node 1199:52370) -->
        <button
          type="button"
          class="venue-map-catalog__sub-action-btn"
          @click="isExpertHelpOpen = true"
        >
          <UiIcon name="question" class="sub-action-icon" />
          <span>Помощь эксперта</span>
        </button>
      </div>
    </div>

    <!-- Toast Notification for Area Filter & Actions -->
    <transition name="fade">
      <div v-if="toastMessage" class="venue-map-catalog__toast">
        {{ toastMessage }}
      </div>
    </transition>

    <!-- Modal: Добавить место на карту -->
    <transition name="modal">
      <div v-if="isAddPlaceOpen" class="venue-modal-overlay" @click.self="isAddPlaceOpen = false">
        <div class="venue-modal-card">
          <button
            type="button"
            class="venue-modal-close"
            aria-label="Закрыть"
            @click="isAddPlaceOpen = false"
          >
            ✕
          </button>

          <header class="venue-modal-header">
            <h2 class="venue-modal-title">Добавить место на карту</h2>
            <p class="venue-modal-desc">
              Заполните основные данные о площадке, чтобы разместить ее на карте для гостей и организаторов
            </p>
          </header>

          <form class="venue-modal-form" @submit.prevent="submitAddPlace">
            <div class="venue-modal-form-group">
              <label class="venue-modal-label">Название площадки *</label>
              <input
                v-model="addPlaceForm.title"
                type="text"
                required
                placeholder="Например: Панорамный лофт SkyLine"
                class="venue-modal-input"
              />
            </div>

            <div class="venue-modal-form-row">
              <div class="venue-modal-form-group">
                <label class="venue-modal-label">Адрес в Москве *</label>
                <input
                  v-model="addPlaceForm.address"
                  type="text"
                  required
                  placeholder="ул. Тверская, д. 15"
                  class="venue-modal-input"
                />
              </div>

              <div class="venue-modal-form-group">
                <label class="venue-modal-label">Ближайшее метро</label>
                <input
                  v-model="addPlaceForm.metroStation"
                  type="text"
                  placeholder="Охотный ряд"
                  class="venue-modal-input"
                />
              </div>
            </div>

            <div class="venue-modal-form-row">
              <div class="venue-modal-form-group">
                <label class="venue-modal-label">Тип площадки</label>
                <select v-model="addPlaceForm.venueType" class="venue-modal-select">
                  <option value="Банкетный зал">Банкетный зал</option>
                  <option value="Лофт">Лофт</option>
                  <option value="Ресторан">Ресторан</option>
                  <option value="Загородный клуб">Загородный клуб</option>
                  <option value="Шатер">Шатер</option>
                  <option value="Веранда">Веранда</option>
                  <option value="Отель">Отель</option>
                </select>
              </div>

              <div class="venue-modal-form-group">
                <label class="venue-modal-label">Средний чек (₽)</label>
                <input
                  v-model.number="addPlaceForm.averageCheck"
                  type="number"
                  placeholder="3500"
                  class="venue-modal-input"
                />
              </div>
            </div>

            <div class="venue-modal-form-row">
              <div class="venue-modal-form-group">
                <label class="venue-modal-label">Широта (Lat)</label>
                <input
                  v-model.number="addPlaceForm.lat"
                  type="number"
                  step="0.0001"
                  placeholder="55.7558"
                  class="venue-modal-input"
                />
              </div>

              <div class="venue-modal-form-group">
                <label class="venue-modal-label">Долгота (Lng)</label>
                <input
                  v-model.number="addPlaceForm.lng"
                  type="number"
                  step="0.0001"
                  placeholder="37.6173"
                  class="venue-modal-input"
                />
              </div>
            </div>

            <div class="venue-modal-coords-hint">
              <button
                type="button"
                class="venue-modal-coords-btn"
                @click="setAddPlaceCenterCoords"
              >
                📍 Использовать центр текущей карты
              </button>
            </div>

            <div class="venue-modal-form-group">
              <label class="venue-modal-label">Телефон менеджера *</label>
              <input
                v-model="addPlaceForm.phone"
                type="tel"
                required
                placeholder="+7 (495) 000-00-00"
                class="venue-modal-input"
              />
            </div>

            <div class="venue-modal-actions">
              <button
                type="button"
                class="venue-modal-btn venue-modal-btn--cancel"
                @click="isAddPlaceOpen = false"
              >
                Отмена
              </button>
              <button
                type="submit"
                class="venue-modal-btn venue-modal-btn--primary"
                :disabled="isSubmittingPlace"
              >
                {{ isSubmittingPlace ? 'Добавление...' : 'Опубликовать на карте' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </transition>

    <!-- Modal: Помощь эксперта -->
    <transition name="modal">
      <div v-if="isExpertHelpOpen" class="venue-modal-overlay" @click.self="isExpertHelpOpen = false">
        <div class="venue-modal-card">
          <button
            type="button"
            class="venue-modal-close"
            aria-label="Закрыть"
            @click="isExpertHelpOpen = false"
          >
            ✕
          </button>

          <header class="venue-modal-header">
            <h2 class="venue-modal-title">Бесплатный подбор площадки</h2>
            <p class="venue-modal-desc">
              Наш эксперт подберет 3-5 идеальных локаций под ваш формат, дату и бюджет в течение 30 минут
            </p>
          </header>

          <form class="venue-modal-form" @submit.prevent="submitExpertHelp">
            <div class="venue-modal-form-group">
              <label class="venue-modal-label">Ваше имя *</label>
              <input
                v-model="expertForm.name"
                type="text"
                required
                placeholder="Как к вам обращаться?"
                class="venue-modal-input"
              />
            </div>

            <div class="venue-modal-form-group">
              <label class="venue-modal-label">Телефон для связи / WhatsApp *</label>
              <input
                v-model="expertForm.phone"
                type="tel"
                required
                placeholder="+7 (999) 000-00-00"
                class="venue-modal-input"
              />
            </div>

            <div class="venue-modal-form-group">
              <label class="venue-modal-label">Формат мероприятия</label>
              <input
                v-model="expertForm.eventFormat"
                type="text"
                placeholder="Свадьба, банкет, день рождения, корпоратив"
                class="venue-modal-input"
              />
            </div>

            <div class="venue-modal-actions">
              <button
                type="button"
                class="venue-modal-btn venue-modal-btn--cancel"
                @click="isExpertHelpOpen = false"
              >
                Отмена
              </button>
              <button
                type="submit"
                class="venue-modal-btn venue-modal-btn--primary"
              >
                Получить подборку
              </button>
            </div>
          </form>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import type { VenueType } from '#entities/venue/model/types'
import { createVenueRequest } from '#entities/venue/api/venue.api'
import UiIcon from '#shared/ui/ui-icon/ui/UiIcon.vue'

const props = defineProps<{
  venues: VenueType[]
  loading?: boolean
  initialCity?: string
}>()

const emit = defineEmits<{
  (e: 'toggle-view', mode: 'list' | 'map'): void
  (e: 'filter-bounds', bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number }): void
  (e: 'venue-click', venue: VenueType): void
  (e: 'add-venue-success', venue: VenueType): void
}>()

// Map Transformation State (Pan & Zoom)
const panX = ref(0)
const panY = ref(0)
const zoom = ref(1.0)
const isDragging = ref(false)
let dragStartX = 0
let dragStartY = 0
let initialPanX = 0
let initialPanY = 0

// Map Reference Element
const mapContainerRef = ref<HTMLDivElement | null>(null)

// Selected Venue Balloon
const selectedVenue = ref<VenueType | null>(null)

// Modals State
const isAddPlaceOpen = ref(false)
const isExpertHelpOpen = ref(false)
const isSubmittingPlace = ref(false)
const toastMessage = ref('')

const showToast = (msg: string) => {
  toastMessage.value = msg

  setTimeout(() => {
    if (toastMessage.value === msg) {
      toastMessage.value = ''
    }
  }, 3500)
}

// Map Coordinates to Canvas Pixels projection (WGS84 Moscow Center: lat 55.7558, lng 37.6173 -> SVG 720, 350)
const MOSCOW_CENTER_LAT = 55.7558
const MOSCOW_CENTER_LNG = 37.6173
const LAT_SCALE = 3600 // SVG pixels per degree latitude
const LNG_SCALE = 2200 // SVG pixels per degree longitude

// Generate deterministic canvas positions for venues
const placedVenues = computed(() => {
  return props.venues.map((venue, idx) => {
    const lat = venue.location?.coordinates?.lat
    const lng = venue.location?.coordinates?.lng

    let pixelX: number
    let pixelY: number

    if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
      // Precise geographic projection around central Moscow
      pixelX = 720 + (lng - MOSCOW_CENTER_LNG) * LNG_SCALE

      pixelY = 350 - (lat - MOSCOW_CENTER_LAT) * LAT_SCALE
    } else {
      // Deterministic layout in case venue has no coordinates yet
      const angle = (idx * (360 / Math.max(props.venues.length, 1)) * Math.PI) / 180
      const radius = 120 + (idx % 4) * 55

      pixelX = 720 + Math.cos(angle) * radius

      pixelY = 350 + Math.sin(angle) * radius
    }

    const price = venue.pricing?.averageCheck || 2500
    const badgeText = `${formatPrice(price)} ₽`
    const badgeWidth = Math.max(badgeText.length * 7 + 16, 58)

    return {
      ...venue,
      pixelX,
      pixelY,
      badgeText,
      badgeWidth,
    }
  })
})

// Popup Positioning
const popupPositionStyle = computed(() => {
  if (!selectedVenue.value) return {}
  const target = placedVenues.value.find((v) => v.id === selectedVenue.value?.id)

  if (!target) return {}

  // Calculate screen-relative coordinate based on current pan and zoom
  const screenX = target.pixelX * zoom.value + panX.value
  const screenY = target.pixelY * zoom.value + panY.value

  // Position above the pin, clamped within viewport bounds
  const clampedX = Math.min(Math.max(screenX, 160), 1280)
  const clampedY = Math.max(screenY - 200, 40)

  return {
    left: `${clampedX}px`,
    top: `${clampedY}px`,
    transform: 'translate(-50%, -100%)',
  }
})

// Mouse Pan / Drag Handlers
const handlePointerDown = (e: PointerEvent) => {
  // Ignore clicks on popups or buttons
  if ((e.target as HTMLElement).closest('.venue-map-catalog__controls, .venue-map-catalog__popup-card')) {
    return
  }

  isDragging.value = true

  dragStartX = e.clientX

  dragStartY = e.clientY

  initialPanX = panX.value

  initialPanY = panY.value
}

const handlePointerMove = (e: PointerEvent) => {
  if (!isDragging.value) return
  const dx = e.clientX - dragStartX
  const dy = e.clientY - dragStartY

  panX.value = initialPanX + dx

  panY.value = initialPanY + dy
}

const handlePointerUp = () => {
  isDragging.value = false
}

// Wheel Zoom Handler
const handleWheel = (e: WheelEvent) => {
  const zoomFactor = e.deltaY < 0 ? 1.12 : 0.88
  const nextZoom = Math.min(Math.max(zoom.value * zoomFactor, 0.6), 2.8)

  zoom.value = Number(nextZoom.toFixed(2))
}

// Zoom Controls
const zoomIn = () => {
  zoom.value = Math.min(Number((zoom.value + 0.2).toFixed(2)), 2.8)
}

const zoomOut = () => {
  zoom.value = Math.max(Number((zoom.value - 0.2).toFixed(2)), 0.6)
}

const resetView = () => {
  panX.value = 0

  panY.value = 0

  zoom.value = 1.0

  showToast('📍 Карта центрирована на Москве')
}

// Select Venue Pin
const selectVenue = (venue: VenueType) => {
  selectedVenue.value = venue

  emit('venue-click', venue)
}

// Bottom Bar Actions
const showNearby = () => {
  resetView()

  showToast('🔍 Отображаются площадки рядом с вами в центре Москвы')
}

const filterVisibleArea = () => {
  // Approximate bounds in Moscow coordinates
  const latDelta = 0.05 / zoom.value
  const lngDelta = 0.08 / zoom.value
  const centerLat = MOSCOW_CENTER_LAT - panY.value / (LAT_SCALE * zoom.value)
  const centerLng = MOSCOW_CENTER_LNG + panX.value / (LNG_SCALE * zoom.value)

  const bounds = {
    minLat: centerLat - latDelta,
    maxLat: centerLat + latDelta,
    minLng: centerLng - lngDelta,
    maxLng: centerLng + lngDelta,
  }

  emit('filter-bounds', bounds)

  const visibleCount = placedVenues.value.filter((v) => {
    const lat = v.location?.coordinates?.lat || MOSCOW_CENTER_LAT
    const lng = v.location?.coordinates?.lng || MOSCOW_CENTER_LNG

    return lat >= bounds.minLat && lat <= bounds.maxLat && lng >= bounds.minLng && lng <= bounds.maxLng
  }).length

  showToast(`✅ В выбранной области найдено ${visibleCount} мест`)
}

// Expose openAddPlaceModal to parent template
defineExpose({
  openAddPlaceModal: () => {
    isAddPlaceOpen.value = true
  },
})

// Add Place Form
const addPlaceForm = reactive({
  title: '',
  address: '',
  metroStation: '',
  venueType: 'Лофт',
  averageCheck: 3000,
  phone: '',
  lat: 55.7558,
  lng: 37.6173,
})

const setAddPlaceCenterCoords = () => {
  addPlaceForm.lat = Number((MOSCOW_CENTER_LAT - panY.value / (LAT_SCALE * zoom.value)).toFixed(4))

  addPlaceForm.lng = Number((MOSCOW_CENTER_LNG + panX.value / (LNG_SCALE * zoom.value)).toFixed(4))

  showToast('📍 Координаты установлены из центра карты')
}

const submitAddPlace = async () => {
  if (!addPlaceForm.title || !addPlaceForm.address || !addPlaceForm.phone) {
    showToast('⚠️ Пожалуйста, заполните обязательные поля')

    return
  }

  isSubmittingPlace.value = true

  try {
    const slug = `venue-${Date.now().toString(36)}`
    const payload = {
      slug,
      title: addPlaceForm.title,
      address: addPlaceForm.address,
      city: 'Москва',
      metro_station: addPlaceForm.metroStation || 'Охотный ряд',
      metro_distance_text: '5 мин пешком',
      coordinates_lat: addPlaceForm.lat || 55.7558,
      coordinates_lng: addPlaceForm.lng || 37.6173,
      average_check: addPlaceForm.averageCheck || 3000,
      phone: addPlaceForm.phone,
      venue_types: [addPlaceForm.venueType],
      status: 'published',
      rating_score: 5.0,
      rating_reviews_count: 1,
    }

    await createVenueRequest(payload)

    const newVenue: VenueType = {
      id: slug,
      slug,
      title: addPlaceForm.title,
      phone: addPlaceForm.phone,
      rating: { score: 5.0, reviewsCount: 1 },
      hallsCount: 1,
      location: {
        address: addPlaceForm.address,
        city: 'Москва',
        metro: addPlaceForm.metroStation
          ? { station: addPlaceForm.metroStation, distanceText: '5 мин пешком' }
          : undefined,
        coordinates: {
          lat: addPlaceForm.lat || 55.7558,
          lng: addPlaceForm.lng || 37.6173,
        },
      },
      workingHours: { weekdays: '10:00 - 23:00', weekends: '10:00 - 24:00' },
      pricing: {
        averageCheck: addPlaceForm.averageCheck || 3000,
        banquetMenuPriceFrom: (addPlaceForm.averageCheck || 3000) * 1.5,
        rentPricePerHour: (addPlaceForm.averageCheck || 3000) * 1.2,
        corkageFee: { hasFee: false },
        priceLevel: '$$$',
      },
      capacitySummary: {
        banquet: '50/100',
        buffet: '80/150',
        theater: '100/200',
        areaSqm: '120',
      },
      gallery: {
        mainPhoto: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80',
        photos: ['https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80'],
      },
      details: {
        types: [addPlaceForm.venueType],
        features: ['Летняя веранда', 'Панорамный вид'],
        cuisines: ['Европейская'],
        services: ['Wi-Fi', 'Банкеты'],
        parking: 'Своя парковка',
        equipment: ['Свет', 'Звук'],
      },
    }

    emit('add-venue-success', newVenue)

    selectedVenue.value = newVenue

    isAddPlaceOpen.value = false

    showToast(`🎉 Площадка «${newVenue.title}» успешно добавлена на карту!`)
  } catch (err) {
    console.error('Failed to add venue:', err)

    showToast('⚠️ Ошибка при добавлении места')
  } finally {
    isSubmittingPlace.value = false
  }
}

// Expert Form
const expertForm = reactive({
  name: '',
  phone: '',
  eventFormat: '',
})

const submitExpertHelp = () => {
  if (!expertForm.name || !expertForm.phone) {
    showToast('⚠️ Пожалуйста, укажите имя и телефон')

    return
  }

  isExpertHelpOpen.value = false

  showToast(`✨ Спасибо, ${expertForm.name}! Наш эксперт свяжется с вами в течение 30 минут.`)
}

// Format Helper
const formatPrice = (price: number) => {
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

const getVenuePhoto = (venue: VenueType) => {
  return venue.gallery?.mainPhoto || venue.gallery?.photos?.[0] || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=600&q=80'
}
</script>

<style scoped lang="scss">
.venue-map-catalog {
  position: relative;
  width: 100%;
  height: calc(100vh - 147px);
  min-height: 580px;
  max-height: 850px;
  overflow: hidden;
  background-color: #f4f3ef;
  user-select: none;

  // --- MAP CONTAINER ---
  &__map-container {
    position: absolute;
    inset: 0;
    cursor: grab;
    touch-action: none;

    &.is-dragging {
      cursor: grabbing;
    }
  }

  &__svg-canvas {
    width: 100%;
    height: 100%;
    display: block;
  }

  // --- MAP PIN ---
  &__pin-group {
    cursor: pointer;
    transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);

    &:hover {
      transform: scale(1.15) !important;
    }

    &.is-selected {
      transform: scale(1.22) !important;
    }
  }

  &__pin-icon {
    transition: filter 0.2s ease;
  }

  &__pin-badge-bg {
    transition: fill 0.2s ease;
  }

  &__pulse-ring {
    animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;
  }

  // --- POPUP CARD ---
  &__popup-card {
    position: absolute;
    width: 290px;
    background: #ffffff;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 12px 36px rgba(0, 0, 0, 0.16);
    border: 1px solid rgba(0, 0, 0, 0.06);
    z-index: 40;
    pointer-events: auto;
  }

  &__popup-close {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 26px;
    height: 26px;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.5);
    color: #ffffff;
    border: none;
    font-size: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 2;
    transition: background 0.2s;

    &:hover {
      background: rgba(0, 0, 0, 0.8);
    }
  }

  &__popup-media {
    position: relative;
    height: 140px;
    width: 100%;
  }

  &__popup-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &__popup-rating {
    position: absolute;
    bottom: 8px;
    left: 8px;
    background: rgba(0, 0, 0, 0.65);
    color: #ffd700;
    font-size: 11px;
    font-weight: 700;
    padding: 3px 8px;
    border-radius: 20px;
    backdrop-filter: blur(4px);
  }

  &__popup-content {
    padding: 14px 16px;
  }

  &__popup-title {
    font-family: 'Raleway', sans-serif;
    font-size: 15px;
    font-weight: 700;
    color: #1e1b4b;
    margin: 0 0 6px 0;
    line-height: 1.3;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  &__popup-metro {
    font-size: 12px;
    color: #64748b;
    margin-bottom: 8px;
  }

  &__popup-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
    margin-bottom: 12px;
  }

  &__popup-price {
    font-weight: 700;
    color: #0066cc;
  }

  &__popup-capacity {
    color: #64748b;
  }

  &__popup-actions {
    display: flex;
  }

  &__popup-btn {
    width: 100%;
    text-align: center;
    background: #0066cc;
    color: #ffffff;
    font-family: 'Raleway', sans-serif;
    font-size: 13px;
    font-weight: 600;
    padding: 9px 12px;
    border-radius: 8px;
    text-decoration: none;
    transition: background 0.2s;

    &:hover {
      background: #0052a3;
    }
  }

  // --- FLOATING CONTROLS (Figma 1199:52356 - 1199:52362) ---
  &__controls {
    position: absolute;
    right: 32px;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    flex-direction: column;
    gap: 16px;
    z-index: 20;
    pointer-events: auto;
  }

  &__zoom-box {
    width: 50px;
    height: 70px;
    background: #ffffff;
    border: 1px solid #bdbdbd;
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  &__zoom-btn {
    width: 100%;
    height: 35px;
    background: transparent;
    border: none;
    font-family: 'Roboto', sans-serif;
    font-size: 22px;
    color: #4f4f4f;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background 0.15s;

    &:hover {
      background: #f3f4f6;
    }
  }

  &__zoom-divider {
    height: 1px;
    background: #e5e7eb;
    width: 100%;
  }

  &__location-btn {
    width: 50px;
    height: 50px;
    background: #ffffff;
    border: 1px solid #bdbdbd;
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background: #f3f4f6;
      transform: scale(1.04);
    }
  }

  // --- BOTTOM BAR (Figma 1199:52360) ---
  &__bottom-bar {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 96px;
    background: #ffffff;
    box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.06);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 30;
    padding: 0 24px;
  }

  &__bottom-container {
    max-width: 1440px;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
  }

  &__list-view-btn {
    width: 190px;
    height: 56px;
    border-radius: 50px;
    border: none;
    font-family: 'Raleway', sans-serif;
    font-size: 16px;
    font-weight: 700;
    color: #ffffff;
    cursor: pointer;
    background: linear-gradient(135deg, #d870ad 0%, #8e2dbc 100%);
    box-shadow: 0 6px 18px rgba(142, 45, 188, 0.3);
    transition: all 0.25s ease;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 22px rgba(142, 45, 188, 0.4);
    }
  }

  &__sub-action-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: transparent;
    border: none;
    font-family: 'Raleway', sans-serif;
    font-size: 15px;
    font-weight: 500;
    color: #333333;
    cursor: pointer;
    padding: 8px 12px;
    border-radius: 8px;
    transition: all 0.15s ease;

    &:hover {
      color: #0066cc;
      background: rgba(0, 102, 204, 0.05);
    }

    .sub-action-icon {
      font-size: 20px;
      color: #4f4f4f;
    }
  }

  // --- TOAST NOTIFICATION ---
  &__toast {
    position: absolute;
    top: 24px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(15, 23, 42, 0.9);
    color: #ffffff;
    padding: 10px 20px;
    border-radius: 30px;
    font-family: 'Raleway', sans-serif;
    font-size: 14px;
    font-weight: 500;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
    z-index: 50;
    pointer-events: none;
  }
}

// --- MODAL STYLES ---
.venue-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(4px);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.venue-modal-card {
  position: relative;
  width: 100%;
  max-width: 560px;
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 20px 45px rgba(0, 0, 0, 0.2);
  padding: 32px;
  max-height: 90vh;
  overflow-y: auto;
}

.venue-modal-close {
  position: absolute;
  top: 18px;
  right: 18px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #f1f5f9;
  border: none;
  font-size: 14px;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;

  &:hover {
    background: #e2e8f0;
    color: #0f172a;
  }
}

.venue-modal-header {
  margin-bottom: 24px;
}

.venue-modal-title {
  font-family: 'Raleway', sans-serif;
  font-size: 22px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 8px 0;
}

.venue-modal-desc {
  font-size: 14px;
  color: #64748b;
  margin: 0;
  line-height: 1.45;
}

.venue-modal-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.venue-modal-form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}

.venue-modal-form-row {
  display: flex;
  gap: 16px;
}

.venue-modal-label {
  font-family: 'Raleway', sans-serif;
  font-size: 13px;
  font-weight: 600;
  color: #334155;
}

.venue-modal-input,
.venue-modal-select {
  height: 42px;
  padding: 0 14px;
  border-radius: 10px;
  border: 1px solid #cbd5e1;
  font-family: 'Raleway', sans-serif;
  font-size: 14px;
  color: #0f172a;
  background: #ffffff;
  outline: none;
  transition: border-color 0.15s;

  &:focus {
    border-color: #0066cc;
  }
}

.venue-modal-coords-hint {
  display: flex;
  align-items: center;
}

.venue-modal-coords-btn {
  background: transparent;
  border: 1px dashed #0066cc;
  color: #0066cc;
  font-family: 'Raleway', sans-serif;
  font-size: 12px;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    background: rgba(0, 102, 204, 0.08);
  }
}

.venue-modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 12px;
}

.venue-modal-btn {
  height: 44px;
  padding: 0 20px;
  border-radius: 10px;
  font-family: 'Raleway', sans-serif;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &--cancel {
    background: #f1f5f9;
    color: #475569;
    border: none;

    &:hover {
      background: #e2e8f0;
    }
  }

  &--primary {
    background: #0066cc;
    color: #ffffff;
    border: none;

    &:hover {
      background: #0052a3;
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }
}

// Transitions
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.pop-enter-active,
.pop-leave-active {
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.pop-enter-from,
.pop-leave-to {
  opacity: 0;
  transform: translate(-50%, -90%) scale(0.9);
}

.modal-enter-active,
.modal-leave-active {
  transition: all 0.25s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.96);
}

@keyframes ping {
  75%, 100% {
    transform: scale(1.6);
    opacity: 0;
  }
}
</style>

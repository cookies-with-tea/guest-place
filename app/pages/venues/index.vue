<template>
  <div class="venues-catalog">
    <div class="venues-catalog__container">
      <!-- 1. Breadcrumbs -->
      <nav class="venues-catalog__breadcrumbs" aria-label="Хлебные крошки">
        <ol class="venues-catalog__breadcrumbs-list">
          <li class="venues-catalog__breadcrumbs-item">
            <NuxtLink to="/">Главная</NuxtLink>
          </li>
          <li class="venues-catalog__breadcrumbs-separator">/</li>
          <li class="venues-catalog__breadcrumbs-item venues-catalog__breadcrumbs-item--active" aria-current="page">
            Поиск (показать списком)
          </li>
        </ol>
      </nav>

      <!-- 2. Heading Section (Figma node 1199:54528) -->
      <header class="venues-catalog__header">
        <h1 class="venues-catalog__title">
          НАЙДЕНО
          <span class="venues-catalog__title-accent">
            {{ totalVenues }} {{ pluralizeVenues(totalVenues) }}
          </span>
        </h1>
      </header>

      <!-- 3. Top Search & Filter Bar (Figma node 1199:54541 'Search bar FS') -->
      <section class="venues-catalog__filter-bar">
        <div class="venues-catalog__search-box">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="venues-catalog__search-icon"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            v-model="filters.search"
            type="text"
            placeholder="Введите название площадки"
            class="venues-catalog__search-input"
            @keyup.enter="applyFilters"
          />
        </div>

        <div class="venues-catalog__dropdowns">
          <!-- Dropdown: Venue Type -->
          <div class="venues-catalog__select-wrapper">
            <select v-model="filters.venueType" class="venues-catalog__select" @change="applyFilters">
              <option value="">Тип площадки</option>
              <option value="Банкетный зал">Банкетный зал</option>
              <option value="Лофт">Лофт</option>
              <option value="Ресторан">Ресторан</option>
              <option value="Загородный клуб">Загородный клуб</option>
              <option value="Шатер">Шатер</option>
              <option value="Веранда">Веранда</option>
              <option value="Отель">Отель</option>
            </select>
          </div>

          <!-- Dropdown: Features -->
          <div class="venues-catalog__select-wrapper">
            <select v-model="filters.feature" class="venues-catalog__select" @change="applyFilters">
              <option value="">Особенности</option>
              <option value="Летняя веранда">Летняя веранда</option>
              <option value="Парковая зона">Парковая зона</option>
              <option value="У воды">У воды</option>
              <option value="Панорамный вид">Панорамный вид</option>
              <option value="Своя территория">Своя территория</option>
            </select>
          </div>

          <!-- Dropdown: Capacity -->
          <div class="venues-catalog__select-wrapper">
            <select v-model="filters.capacity" class="venues-catalog__select" @change="applyFilters">
              <option value="">Вместимость</option>
              <option value="0-50">до 50 чел.</option>
              <option value="50-100">50 - 100 чел.</option>
              <option value="100-200">100 - 200 чел.</option>
              <option value="200-9999">от 200 чел.</option>
            </select>
          </div>

          <!-- Dropdown: Price -->
          <div class="venues-catalog__select-wrapper">
            <select v-model="filters.price" class="venues-catalog__select" @change="applyFilters">
              <option value="">Стоимость</option>
              <option value="0-2500">до 2 500 р.</option>
              <option value="2500-4000">2 500 - 4 000 р.</option>
              <option value="4000-99999">от 4 000 р.</option>
            </select>
          </div>

          <!-- Dropdown: Extra filters -->
          <div class="venues-catalog__select-wrapper">
            <select v-model="filters.extra" class="venues-catalog__select" @change="applyFilters">
              <option value="">Еще фильтры</option>
              <option value="online_tour">Онлайн-показ</option>
              <option value="corkage_free">Без пробкового сбора</option>
            </select>
          </div>

          <button
            v-if="hasActiveFilters"
            type="button"
            class="venues-catalog__reset-btn"
            title="Сбросить все фильтры"
            @click="resetFilters"
          >
            ✕ Сброс
          </button>
        </div>
      </section>

      <!-- 4. Sub-bar: Sorting & Map button (Figma node 1199:54518 & 1199:54542) -->
      <div class="venues-catalog__sub-bar">
        <div class="venues-catalog__sort-row">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="venues-catalog__sort-icon"
          >
            <path d="m3 16 4 4 4-4" />
            <path d="M7 20V4" />
            <path d="m21 8-4-4-4 4" />
            <path d="M17 4v16" />
          </svg>
          <select v-model="sortBy" class="venues-catalog__sort-select" @change="fetchVenuesData">
            <option value="created_at">По дате добавления (сначала новые)</option>
            <option value="price_asc">По цене (сначала дешевле)</option>
            <option value="price_desc">По цене (сначала дороже)</option>
            <option value="rating">По рейтингу</option>
            <option value="title">По названию (А-Я)</option>
          </select>
        </div>

        <button
          type="button"
          class="venues-catalog__map-btn"
          @click="showMap = !showMap"
        >
          {{ showMap ? 'Показать списком' : 'Показать на карте' }}
        </button>
      </div>

      <!-- 5. Venues List / Catalog Results -->
      <section v-if="loading" class="venues-catalog__loading">
        <div class="venues-catalog__spinner" />
        <p>Загрузка площадок...</p>
      </section>

      <section v-else-if="venues.length === 0" class="venues-catalog__empty">
        <div class="venues-catalog__empty-icon">🏰</div>
        <h2 class="venues-catalog__empty-title">Площадки не найдены</h2>
        <p class="venues-catalog__empty-desc">
          По вашему запросу не найдено подходящих вариантов. Попробуйте изменить параметры поиска или сбросить фильтры.
        </p>
        <button type="button" class="venues-catalog__reset-pill-btn" @click="resetFilters">
          Сбросить все фильтры
        </button>
      </section>

      <section v-else class="venues-catalog__list">
        <VenueCardBig
          v-for="venue in venues"
          :key="venue.id"
          :venue="venue"
          @inquiry="handleInquiry"
          @chat="handleChat"
          @tour="handleTour"
        />
      </section>

      <!-- 6. Pagination Bar (Figma node 1199:54531) -->
      <nav
        v-if="pagination.totalPages > 1"
        class="venues-catalog__pagination"
        aria-label="Пагинация площадок"
      >
        <button
          type="button"
          class="venues-catalog__page-nav-btn"
          :disabled="pagination.page <= 1"
          aria-label="Предыдущая страница"
          @click="goToPage(pagination.page - 1)"
        >
          ‹
        </button>

        <div class="venues-catalog__page-numbers">
          <template v-for="(p, idx) in visiblePages" :key="idx">
            <span v-if="p === '...'" class="venues-catalog__page-ellipsis">...</span>
            <button
              v-else
              type="button"
              class="venues-catalog__page-num"
              :class="{ 'venues-catalog__page-num--active': pagination.page === p }"
              @click="goToPage(Number(p))"
            >
              {{ p }}
            </button>
          </template>
        </div>

        <button
          type="button"
          class="venues-catalog__page-nav-btn"
          :disabled="pagination.page >= pagination.totalPages"
          aria-label="Следующая страница"
          @click="goToPage(pagination.page + 1)"
        >
          ›
        </button>
      </nav>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { VenueType } from '~/entities/venue/model/types'
import { getVenues, type VenuesQueryParams } from '~/entities/venue/api/venue.api'
import { VenueCardBig } from '~/entities/venue/ui'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const venues = ref<VenueType[]>([])
const showMap = ref(false)

const filters = reactive({
  search: (route.query.search as string) || '',
  venueType: (route.query.venue_type as string) || '',
  feature: (route.query.feature as string) || '',
  capacity: (route.query.capacity as string) || '',
  price: (route.query.price as string) || '',
  extra: (route.query.extra as string) || '',
})

const sortBy = ref((route.query.sort_by as string) || 'created_at')

const pagination = reactive({
  page: Number(route.query.page) || 1,
  limit: 10,
  total: 0,
  totalPages: 1,
})

const totalVenues = computed(() => pagination.total)

const hasActiveFilters = computed(() => {
  return Boolean(
    filters.search ||
    filters.venueType ||
    filters.feature ||
    filters.capacity ||
    filters.price ||
    filters.extra
  )
})

const pluralizeVenues = (n: number) => {
  const abs = Math.abs(n) % 100
  const rem = abs % 10
  if (abs > 10 && abs < 20) return 'площадок'
  if (rem > 1 && rem < 5) return 'площадки'
  if (rem === 1) return 'площадка'
  return 'площадок'
}

const buildQueryParams = (): VenuesQueryParams => {
  const params: VenuesQueryParams = {
    page: pagination.page,
    limit: pagination.limit,
    status: 'published',
  }

  if (filters.search.trim()) {
    params.search = filters.search.trim()
  }

  if (filters.venueType) {
    params.venueTypes = filters.venueType
  }

  if (filters.feature) {
    params.features = filters.feature
  }

  if (filters.capacity) {
    const [min, max] = filters.capacity.split('-').map(Number)
    if (min != null) params.minCapacity = min
    if (max != null) params.maxCapacity = max
  }

  if (filters.price) {
    const [min, max] = filters.price.split('-').map(Number)
    if (min != null) params.minPrice = min
    if (max != null) params.maxPrice = max
  }

  if (filters.extra === 'online_tour') {
    params.hasOnlineTour = true
  }

  if (sortBy.value) {
    params.sortBy = sortBy.value
  }

  return params
}

const fetchVenuesData = async () => {
  loading.value = true
  try {
    const params = buildQueryParams()
    const res = await getVenues(params)
    venues.value = res.items
    pagination.total = res.pagination.total
    pagination.totalPages = res.pagination.totalPages
    pagination.page = res.pagination.page
  } catch (e) {
    console.error('Error fetching venues:', e)
  } finally {
    loading.value = false
  }
}

const applyFilters = () => {
  pagination.page = 1
  syncUrlQuery()
  fetchVenuesData()
}

const resetFilters = () => {
  filters.search = ''
  filters.venueType = ''
  filters.feature = ''
  filters.capacity = ''
  filters.price = ''
  filters.extra = ''
  sortBy.value = 'created_at'
  pagination.page = 1
  syncUrlQuery()
  fetchVenuesData()
}

const goToPage = (p: number) => {
  if (p < 1 || p > pagination.totalPages || p === pagination.page) return
  pagination.page = p
  syncUrlQuery()
  fetchVenuesData()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const syncUrlQuery = () => {
  const query: Record<string, string> = {}
  if (filters.search) query.search = filters.search
  if (filters.venueType) query.venue_type = filters.venueType
  if (filters.feature) query.feature = filters.feature
  if (filters.capacity) query.capacity = filters.capacity
  if (filters.price) query.price = filters.price
  if (filters.extra) query.extra = filters.extra
  if (sortBy.value && sortBy.value !== 'created_at') query.sort_by = sortBy.value
  if (pagination.page > 1) query.page = String(pagination.page)

  router.replace({ query })
}

const visiblePages = computed(() => {
  const total = pagination.totalPages
  const current = pagination.page
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  if (current <= 3) {
    return [1, 2, 3, 4, '...', total]
  }

  if (current >= total - 2) {
    return [1, '...', total - 3, total - 2, total - 1, total]
  }

  return [1, '...', current - 1, current, current + 1, '...', total]
})

const handleInquiry = (venue: VenueType) => {
  router.push(`/venues/${venue.slug}?action=inquiry`)
}

const handleChat = (venue: VenueType) => {
  router.push(`/venues/${venue.slug}?action=chat`)
}

const handleTour = (venue: VenueType) => {
  router.push(`/venues/${venue.slug}?action=tour`)
}

onMounted(() => {
  fetchVenuesData()
})
</script>

<style lang="scss" scoped>
.venues-catalog {
  min-height: 100vh;
  background-color: #fafbfc;
  padding: 24px 0 80px 0;

  &__container {
    max-width: 1140px;
    margin: 0 auto;
    padding: 0 20px;
  }

  // --- BREADCRUMBS ---
  &__breadcrumbs {
    margin-bottom: 24px;
  }

  &__breadcrumbs-list {
    display: flex;
    align-items: center;
    gap: 8px;
    list-style: none;
    margin: 0;
    padding: 0;
    font-family: 'Raleway', sans-serif;
    font-size: 14px;
    color: #a0a0a4;
  }

  &__breadcrumbs-item {
    a {
      color: #a0a0a4;
      text-decoration: none;
      transition: color 0.2s ease;

      &:hover {
        color: #0066cc;
      }
    }

    &--active {
      color: #333333;
    }
  }

  &__breadcrumbs-separator {
    color: #4f4f4f;
  }

  // --- HEADER ---
  &__header {
    text-align: center;
    margin: 32px 0 40px 0;
  }

  &__title {
    font-family: 'Raleway', 'Poiret One', sans-serif;
    font-size: 42px;
    font-weight: 400;
    line-height: 1.3;
    color: #333333;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin: 0;

    @media (max-width: 768px) {
      font-size: 28px;
    }
  }

  &__title-accent {
    color: #0066cc;
    font-weight: 500;
  }

  // --- FILTER BAR (Search bar FS) ---
  &__filter-bar {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: #ffffff;
    border-radius: 50px;
    padding: 8px 16px 8px 24px;
    box-shadow: 0px 4px 15px rgba(105, 78, 75, 0.09);
    margin-bottom: 28px;
    gap: 16px;

    @media (max-width: 1024px) {
      flex-direction: column;
      align-items: stretch;
      border-radius: 24px;
      padding: 16px;
    }
  }

  &__search-box {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
    min-width: 220px;
  }

  &__search-icon {
    color: #a0a0a4;
    flex-shrink: 0;
  }

  &__search-input {
    width: 100%;
    border: none;
    outline: none;
    font-family: 'Raleway', sans-serif;
    font-size: 15px;
    color: #333333;
    background: transparent;

    &::placeholder {
      color: #a0a0a4;
    }
  }

  &__dropdowns {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;

    @media (max-width: 768px) {
      gap: 8px;
    }
  }

  &__select-wrapper {
    position: relative;

    &::after {
      content: '▾';
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 12px;
      color: #777;
      pointer-events: none;
    }
  }

  &__select {
    appearance: none;
    border: 1px solid #e5e7eb;
    border-radius: 30px;
    padding: 8px 28px 8px 14px;
    font-family: 'Raleway', sans-serif;
    font-size: 14px;
    color: #333333;
    background-color: #fafbfc;
    cursor: pointer;
    outline: none;
    transition: all 0.2s ease;

    &:hover,
    &:focus {
      border-color: #0066cc;
      background-color: #ffffff;
    }
  }

  &__reset-btn {
    border: none;
    background-color: #f3f4f6;
    color: #ef4444;
    font-family: 'Raleway', sans-serif;
    font-size: 13px;
    font-weight: 600;
    padding: 8px 14px;
    border-radius: 30px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background-color: #fee2e2;
    }
  }

  // --- SUB-BAR (Sorting + Map button) ---
  &__sub-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;
    gap: 16px;
    flex-wrap: wrap;
  }

  &__sort-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__sort-icon {
    color: #6b7280;
  }

  &__sort-select {
    appearance: none;
    background: transparent;
    border: none;
    font-family: 'Raleway', sans-serif;
    font-size: 14px;
    color: #333333;
    cursor: pointer;
    outline: none;
    padding-right: 18px;
    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23333' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
    background-repeat: no-repeat;
    background-position: right center;
    background-size: 12px;
  }

  &__map-btn {
    font-family: 'Raleway', sans-serif;
    font-size: 15px;
    font-weight: 700;
    color: #ffffff;
    padding: 12px 28px;
    border-radius: 50px;
    border: none;
    cursor: pointer;
    background: linear-gradient(135deg, #d870ad 0%, #8e2dbc 100%);
    box-shadow: 0 4px 15px rgba(142, 45, 188, 0.25);
    transition: all 0.25s ease;

    &:hover {
      box-shadow: 0 6px 20px rgba(142, 45, 188, 0.35);
      transform: translateY(-1px);
    }
  }

  // --- VENUES LIST ---
  &__list {
    margin-bottom: 40px;
  }

  // --- LOADING & EMPTY STATES ---
  &__loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 80px 20px;
    color: #6b7280;
    gap: 16px;
  }

  &__spinner {
    width: 40px;
    height: 40px;
    border: 3px solid #e5e7eb;
    border-top-color: #0066cc;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  &__empty {
    text-align: center;
    padding: 80px 20px;
    background-color: #ffffff;
    border-radius: 30px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
  }

  &__empty-icon {
    font-size: 48px;
    margin-bottom: 16px;
  }

  &__empty-title {
    font-family: 'Raleway', sans-serif;
    font-size: 24px;
    font-weight: 600;
    color: #333333;
    margin: 0 0 8px 0;
  }

  &__empty-desc {
    font-family: 'Raleway', sans-serif;
    font-size: 15px;
    color: #6b7280;
    max-width: 480px;
    margin: 0 auto 24px auto;
    line-height: 1.5;
  }

  &__reset-pill-btn {
    font-family: 'Raleway', sans-serif;
    font-size: 14px;
    font-weight: 600;
    color: #ffffff;
    background-color: #0066cc;
    padding: 10px 24px;
    border-radius: 50px;
    border: none;
    cursor: pointer;
    transition: background-color 0.2s ease;

    &:hover {
      background-color: #0052a3;
    }
  }

  // --- PAGINATION (Figma node 1199:54531) ---
  &__pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    margin-top: 48px;
  }

  &__page-nav-btn {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: 1px solid #e5e7eb;
    background-color: #ffffff;
    color: #333333;
    font-size: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover:not(:disabled) {
      border-color: #0066cc;
      color: #0066cc;
    }

    &:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
  }

  &__page-numbers {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__page-num {
    min-width: 32px;
    height: 32px;
    padding: 0 6px;
    border-radius: 8px;
    border: none;
    background: transparent;
    font-family: 'Raleway', sans-serif;
    font-size: 17px;
    font-weight: 500;
    color: #333333;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      color: #0066cc;
    }

    &--active {
      color: #0066cc;
      font-weight: 700;
      text-decoration: underline;
      text-underline-offset: 4px;
    }
  }

  &__page-ellipsis {
    color: #9ca3af;
    font-size: 16px;
    padding: 0 4px;
  }
}
</style>

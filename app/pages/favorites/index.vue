<template>
  <div class="favorites-page">
    <!-- 1. Site Header (Figma node 1199:50885 / 1199:54543) -->
    <header class="favorites-header">
      <!-- Top Utility Bar -->
      <div class="favorites-header__top-bar">
        <div class="favorites-header__top-container">
          <!-- City Selector -->
          <div class="city-selector">
            <svg class="icon-pin" width="14" height="18" viewBox="0 0 14 18" fill="none">
              <path
                d="M7 0C3.13401 0 0 3.13401 0 7C0 12.25 7 18 7 18C7 18 14 12.25 14 7C14 3.13401 10.866 0 7 0ZM7 9.5C5.61929 9.5 4.5 8.38071 4.5 7C4.5 5.61929 5.61929 4.5 7 4.5C8.38071 4.5 9.5 5.61929 9.5 7C9.5 8.38071 8.38071 9.5 7 9.5Z"
                fill="#333333"
              />
            </svg>
            <span class="city-name">Москва</span>
            <svg class="icon-caret" width="8" height="5" viewBox="0 0 8 5" fill="none">
              <path
                d="M1 1L4 4L7 1"
                stroke="#333333"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>

          <!-- User Icons (Favorites, Chat, Profile) -->
          <div class="user-actions">
            <NuxtLink
              to="/favorites"
              class="action-btn action-btn--active"
              aria-label="Избранное"
              title="Избранные площадки"
            >
              <UiIcon name="favourites" />
              <span v-if="favoriteCount > 0" class="action-btn__badge">
                {{ favoriteCount }}
              </span>
            </NuxtLink>
            <button
              type="button"
              class="action-btn"
              aria-label="Сообщения"
              title="Сообщения"
              @click="openDirectChat"
            >
              <UiIcon name="chat" />
            </button>
            <button
              type="button"
              class="action-btn"
              aria-label="Профиль"
              title="Профиль"
              @click="navigateTo('/guests')"
            >
              <UiIcon name="user" />
            </button>
          </div>
        </div>
      </div>

      <!-- Main Navigation Bar -->
      <div class="favorites-header__main-bar">
        <div class="favorites-header__main-container">
          <!-- Logo -->
          <NuxtLink to="/" class="catalog-logo">
            <span class="logo-guest">Guest</span>
            <span class="logo-amp">&</span>
            <span class="logo-place">Place</span>
          </NuxtLink>

          <!-- Nav Links -->
          <nav class="nav-links">
            <NuxtLink to="/about" class="nav-link">О платформе</NuxtLink>
            <NuxtLink to="/platforms" class="nav-link">Площадкам</NuxtLink>
            <NuxtLink to="/guests" class="nav-link">Гостям</NuxtLink>
          </nav>

          <!-- CTA Buttons -->
          <div class="header-cta-group">
            <button type="button" class="cta-link-btn" @click="handlePlaceRequest">
              + Разместить запрос
            </button>
            <button type="button" class="cta-link-btn cta-link-btn--add" @click="handleAddPlace">
              + Добавить место
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content Container -->
    <main class="favorites-main">
      <div class="favorites-container">
        <!-- 2. Breadcrumbs (Figma node 1199:54559) -->
        <nav class="breadcrumbs" aria-label="Хлебные крошки">
          <NuxtLink to="/" class="breadcrumbs__link">Главная</NuxtLink>
          <span class="breadcrumbs__separator">/</span>
          <span class="breadcrumbs__current">Избранное</span>
        </nav>

        <!-- 3. Title (Figma node 1199:54558) -->
        <h1 class="favorites-title">ИЗБРАННЫЕ ПЛОЩАДКИ</h1>

        <!-- 4. Sort Dropdown & Toolbar (Figma node 1199:54548) -->
        <div v-if="favoriteCount > 0" class="favorites-toolbar">
          <div ref="sortDropdownRef" class="favorites-sort">
            <button
              type="button"
              class="favorites-sort__button"
              aria-haspopup="listbox"
              :aria-expanded="isSortOpen"
              @click="isSortOpen = !isSortOpen"
            >
              <!-- ArrowsDownUp icon -->
              <svg
                class="favorites-sort__icon"
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
              >
                <path
                  d="M4.66667 2.66667V13.3333M4.66667 13.3333L2 10.6667M4.66667 13.3333L7.33333 10.6667M11.3333 13.3333V2.66667M11.3333 2.66667L8.66667 5.33333M11.3333 2.66667L14 5.33333"
                  stroke="#333333"
                  stroke-width="1.3"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              <span class="favorites-sort__label">{{ currentSortLabel }}</span>
              <svg
                class="favorites-sort__arrow"
                :class="{ 'favorites-sort__arrow--open': isSortOpen }"
                width="8"
                height="5"
                viewBox="0 0 8 5"
                fill="none"
              >
                <path
                  d="M1 1L4 4L7 1"
                  stroke="#333333"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </button>

            <!-- Dropdown Menu -->
            <transition name="dropdown-fade">
              <ul
                v-if="isSortOpen"
                class="favorites-sort__menu"
                role="listbox"
              >
                <li
                  v-for="option in sortOptions"
                  :key="option.value"
                  role="option"
                  :aria-selected="currentSort === option.value"
                  class="favorites-sort__option"
                  :class="{ 'favorites-sort__option--selected': currentSort === option.value }"
                  @click="selectSort(option.value)"
                >
                  {{ option.label }}
                </li>
              </ul>
            </transition>
          </div>

          <div class="favorites-toolbar__actions">
            <span class="favorites-toolbar__count">Всего: {{ favoriteCount }}</span>
            <button
              type="button"
              class="favorites-toolbar__clear-btn"
              @click="confirmClearFavorites"
            >
              Очистить всё
            </button>
          </div>
        </div>

        <!-- 5. Favorite Venues List (Figma nodes 1199:54545, 1199:54546, 1199:54547) -->
        <section v-if="favoriteCount > 0" class="favorites-list">
          <VenueCardBig
            v-for="venue in sortedFavorites"
            :key="venue.id"
            :venue="venue"
            class="favorites-card"
            @inquiry="openInquiryModal"
            @chat="openChatModal"
            @tour="openTourModal"
            @favorite-change="handleFavoriteChange"
          />
        </section>

        <!-- 6. Empty State -->
        <section v-else class="favorites-empty">
          <div class="favorites-empty__icon-wrap">
            <svg
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#0066cc"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path
                d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
              />
            </svg>
          </div>
          <h2 class="favorites-empty__title">У вас пока нет избранных площадок</h2>
          <p class="favorites-empty__desc">
            Сохраняйте понравившиеся места с помощью сердечка в каталоге или на интерактивной карте, чтобы вернуться к ним позже или сравнить.
          </p>
          <div class="favorites-empty__actions">
            <NuxtLink to="/venues" class="favorites-empty__btn favorites-empty__btn--primary">
              Перейти в каталог
            </NuxtLink>
            <NuxtLink to="/venues?view=map" class="favorites-empty__btn favorites-empty__btn--outline">
              Посмотреть на карте
            </NuxtLink>
          </div>
        </section>
      </div>
    </main>

    <!-- 7. Footer (Figma node 1199:48337 / 1199:54543) -->
    <footer class="favorites-footer">
      <!-- Border with festive decorative flags -->
      <div class="favorites-footer__flags-border">
        <div class="favorites-footer__line" />
        <svg class="favorites-footer__flags-left" width="140" height="25" viewBox="0 0 140 25" fill="none">
          <polygon points="10,0 30,0 20,25" fill="#EF8062" />
          <polygon points="40,0 60,0 50,22" fill="#F8DA75" />
          <polygon points="70,0 90,0 80,25" fill="#F8BF95" />
          <polygon points="100,0 120,0 110,24" fill="#AAB9ED" />
        </svg>
        <svg class="favorites-footer__flags-right" width="140" height="25" viewBox="0 0 140 25" fill="none">
          <polygon points="10,0 30,0 20,24" fill="#AAB9ED" />
          <polygon points="40,0 60,0 50,25" fill="#F8BF95" />
          <polygon points="70,0 90,0 80,22" fill="#EF8062" />
          <polygon points="100,0 120,0 110,25" fill="#0066CC" />
        </svg>
      </div>

      <div class="favorites-footer__container">
        <div class="favorites-footer__brand">
          <div class="catalog-logo">
            <span class="logo-guest">Guest</span>
            <span class="logo-amp">&</span>
            <span class="logo-place">Place</span>
          </div>
          <p class="favorites-footer__tagline">Интерактивная платформа</p>
        </div>

        <nav class="favorites-footer__nav">
          <NuxtLink to="/about" class="favorites-footer__link">О проекте</NuxtLink>
          <NuxtLink to="/platforms" class="favorites-footer__link">Площадкам</NuxtLink>
          <NuxtLink to="/guests" class="favorites-footer__link">Гостям</NuxtLink>
          <NuxtLink to="/about" class="favorites-footer__link">Контакты</NuxtLink>
          <NuxtLink to="/about" class="favorites-footer__link">Помощь</NuxtLink>
          <NuxtLink to="/about" class="favorites-footer__link">Вакансии</NuxtLink>
          <NuxtLink to="/about" class="favorites-footer__link">Техподдержка</NuxtLink>
        </nav>
      </div>
    </footer>

    <!-- Interactive Action Modals -->
    <!-- Modal 1: Оставить заявку -->
    <div v-if="activeModal === 'inquiry'" class="modal-overlay" @click.self="activeModal = null">
      <div class="modal-dialog">
        <div class="modal-header">
          <h3 class="modal-title">Оставить заявку</h3>
          <button type="button" class="modal-close" @click="activeModal = null">×</button>
        </div>
        <div class="modal-body">
          <p class="modal-subtitle">
            Площадка: <strong>{{ selectedVenue?.title }}</strong>
          </p>
          <form class="modal-form" @submit.prevent="submitInquiry">
            <div class="form-group">
              <label>Ваше имя</label>
              <input v-model="formInquiry.name" type="text" placeholder="Иван Иванов" required />
            </div>
            <div class="form-group">
              <label>Телефон</label>
              <input v-model="formInquiry.phone" type="tel" placeholder="+7 (999) 000-00-00" required />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Дата события</label>
                <input v-model="formInquiry.date" type="date" />
              </div>
              <div class="form-group">
                <label>Количество гостей</label>
                <input v-model="formInquiry.guests" type="number" placeholder="50" />
              </div>
            </div>
            <div class="form-group">
              <label>Пожелания к банкету</label>
              <textarea v-model="formInquiry.comment" rows="3" placeholder="Любые детали и пожелания..." />
            </div>
            <button type="submit" class="modal-submit-btn modal-submit-btn--gradient">
              Отправить заявку
            </button>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal 2: Начать чат -->
    <div v-if="activeModal === 'chat'" class="modal-overlay" @click.self="activeModal = null">
      <div class="modal-dialog">
        <div class="modal-header">
          <h3 class="modal-title">Чат с менеджером</h3>
          <button type="button" class="modal-close" @click="activeModal = null">×</button>
        </div>
        <div class="modal-body">
          <p class="modal-subtitle">
            Площадка: <strong>{{ selectedVenue?.title }}</strong>
          </p>
          <div class="chat-preview-box">
            <div class="chat-message chat-message--manager">
              <p>Здравствуйте! Готовы ответить на любые ваши вопросы по площадке и свободным датам.</p>
            </div>
          </div>
          <form class="modal-form" @submit.prevent="submitChatMessage">
            <div class="form-group">
              <textarea
                v-model="chatInput"
                rows="3"
                placeholder="Напишите ваш вопрос..."
                required
              />
            </div>
            <button type="submit" class="modal-submit-btn modal-submit-btn--purple">
              Отправить сообщение
            </button>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal 3: Онлайн-показ -->
    <div v-if="activeModal === 'tour'" class="modal-overlay" @click.self="activeModal = null">
      <div class="modal-dialog">
        <div class="modal-header">
          <h3 class="modal-title">Запись на онлайн-показ</h3>
          <button type="button" class="modal-close" @click="activeModal = null">×</button>
        </div>
        <div class="modal-body">
          <p class="modal-subtitle">
            Площадка: <strong>{{ selectedVenue?.title }}</strong>
          </p>
          <p class="tour-desc">
            Менеджер площадки проведет для вас персональную 3D-экскурсию или видео-тур через удобный мессенджер.
          </p>
          <form class="modal-form" @submit.prevent="submitTourBooking">
            <div class="form-group">
              <label>Ваше имя</label>
              <input v-model="formTour.name" type="text" placeholder="Иван" required />
            </div>
            <div class="form-group">
              <label>Телефон / Telegram / WhatsApp</label>
              <input v-model="formTour.contact" type="text" placeholder="+7 (999) 000-00-00" required />
            </div>
            <div class="form-group">
              <label>Удобное время показа</label>
              <input v-model="formTour.preferredTime" type="text" placeholder="Завтра в 15:00" />
            </div>
            <button type="submit" class="modal-submit-btn modal-submit-btn--blue">
              Записаться на онлайн-показ
            </button>
          </form>
        </div>
      </div>
    </div>

    <!-- Undo Toast Notification -->
    <transition name="toast-fade">
      <div v-if="toastMessage" class="toast-notification">
        <span>{{ toastMessage }}</span>
        <button
          v-if="lastRemovedVenue"
          type="button"
          class="toast-undo-btn"
          @click="undoRemove"
        >
          Отменить
        </button>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import type { VenueType } from '#entities/venue/model/types'
import { VenueCardBig } from '#entities/venue/ui'
import UiIcon from '#shared/ui/ui-icon/ui/UiIcon.vue'
import { useFavorites, type FavoritesSortOption } from '#shared/lib/composables'

// SEO Meta
useHead({
  title: 'Избранные площадки | Guest & Place',
  meta: [
    {
      name: 'description',
      content: 'Список сохраненных площадок для мероприятий и банкетов на интерактивной платформе Guest & Place.',
    },
  ],
})

const router = useRouter()
const {
  favoriteCount,
  getSortedFavorites,
  addFavorite,
  clearFavorites,
} = useFavorites()

// Sorting state
const currentSort = ref<FavoritesSortOption>('date_desc')
const isSortOpen = ref(false)
const sortDropdownRef = ref<HTMLElement | null>(null)

const sortOptions: { value: FavoritesSortOption; label: string }[] = [
  { value: 'date_desc', label: 'По дате добавления (сначала новые)' },
  { value: 'date_asc', label: 'По дате добавления (сначала старые)' },
  { value: 'price_asc', label: 'По цене (сначала дешевле)' },
  { value: 'price_desc', label: 'По цене (сначала дороже)' },
  { value: 'rating_desc', label: 'По рейтингу' },
]

const currentSortLabel = computed(() => {
  const found = sortOptions.find((opt) => opt.value === currentSort.value)

  return found ? found.label : 'По дате добавления (сначала новые)'
})

const sortedFavorites = computed(() => {
  return getSortedFavorites(currentSort.value)
})

const selectSort = (value: FavoritesSortOption) => {
  currentSort.value = value

  isSortOpen.value = false
}

// Click outside handler for dropdown
const handleClickOutside = (event: MouseEvent) => {
  if (sortDropdownRef.value && !sortDropdownRef.value.contains(event.target as Node)) {
    isSortOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// Modals state
const activeModal = ref<'inquiry' | 'chat' | 'tour' | null>(null)
const selectedVenue = ref<VenueType | null>(null)

const formInquiry = reactive({
  name: '',
  phone: '',
  date: '',
  guests: '',
  comment: '',
})

const formTour = reactive({
  name: '',
  contact: '',
  preferredTime: '',
})

const chatInput = ref('')

// Toast state for undo
const toastMessage = ref('')
const lastRemovedVenue = ref<VenueType | null>(null)
let toastTimer: ReturnType<typeof setTimeout> | null = null

const showToast = (message: string, venue?: VenueType) => {
  toastMessage.value = message

  if (venue) lastRemovedVenue.value = venue
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    toastMessage.value = ''

    lastRemovedVenue.value = null
  }, 4500)
}

const handleFavoriteChange = (payload: { id: string; isFavorite: boolean }) => {
  if (!payload.isFavorite) {
    const venue = sortedFavorites.value.find((v) => v.id === payload.id)

    if (venue) {
      showToast(`Площадка «${venue.title}» удалена из избранного`, venue)
    }
  }
}

const undoRemove = () => {
  if (lastRemovedVenue.value) {
    addFavorite(lastRemovedVenue.value)

    showToast(`Площадка «${lastRemovedVenue.value.title}» восстановлена в избранное!`)

    lastRemovedVenue.value = null
  }
}

const confirmClearFavorites = () => {
  if (confirm('Очистить весь список избранных площадок?')) {
    clearFavorites()

    showToast('Список избранного очищен')
  }
}

// Handlers for modal actions
const openInquiryModal = (venue: VenueType) => {
  selectedVenue.value = venue

  activeModal.value = 'inquiry'
}

const openChatModal = (venue: VenueType) => {
  selectedVenue.value = venue

  activeModal.value = 'chat'
}

const openTourModal = (venue: VenueType) => {
  selectedVenue.value = venue

  activeModal.value = 'tour'
}

const openDirectChat = () => {
  if (sortedFavorites.value.length > 0) {
    openChatModal(sortedFavorites.value[0])
  } else {
    router.push('/guests')
  }
}

const handlePlaceRequest = () => {
  router.push('/guests')
}

const handleAddPlace = () => {
  router.push('/venues?view=map&add=true')
}

const submitInquiry = () => {
  showToast(`Заявка на площадку «${selectedVenue.value?.title}» отправлена! Менеджер свяжется с вами.`)

  activeModal.value = null

  formInquiry.name = ''

  formInquiry.phone = ''

  formInquiry.comment = ''
}

const submitChatMessage = () => {
  showToast('Сообщение отправлено менеджеру площадки!')

  activeModal.value = null

  chatInput.value = ''
}

const submitTourBooking = () => {
  showToast(`Запись на онлайн-показ площадки «${selectedVenue.value?.title}» подтверждена!`)

  activeModal.value = null

  formTour.name = ''

  formTour.contact = ''

  formTour.preferredTime = ''
}
</script>

<style scoped lang="scss">
.favorites-page {
  min-height: 100vh;
  background-color: #ffffff;
  color: #333333;
  font-family: 'Raleway', sans-serif;
  display: flex;
  flex-direction: column;
}

// --- 1. SITE HEADER (Figma node 1199:50885) ---
.favorites-header {
  background: #ffffff;
  border-bottom: 1px solid rgba(51, 51, 51, 0.1);
  position: relative;
  z-index: 40;

  &__top-bar {
    border-bottom: 1px solid rgba(51, 51, 51, 0.08);
    padding: 10px 0;
  }

  &__top-container,
  &__main-container {
    max-width: 1140px;
    margin: 0 auto;
    padding: 0 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__main-bar {
    padding: 16px 0;
  }

  .city-selector {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    font-size: 16px;
    color: #333333;
    user-select: none;

    .icon-pin {
      flex-shrink: 0;
    }

    .city-name {
      font-weight: 400;
    }

    .icon-caret {
      margin-left: 2px;
      transition: transform 0.2s;
    }
  }

  .user-actions {
    display: flex;
    align-items: center;
    gap: 16px;

    .action-btn {
      background: transparent;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      padding: 4px;
      color: #333333;
      font-size: 18px;
      transition: opacity 0.2s;
      position: relative;
      text-decoration: none;

      &:hover {
        opacity: 0.7;
      }

      &--active {
        color: #0066cc;
      }

      &__badge {
        position: absolute;
        top: -4px;
        right: -6px;
        background: #0066cc;
        color: #ffffff;
        font-size: 10px;
        font-weight: 700;
        font-family: 'Raleway', sans-serif;
        min-width: 16px;
        height: 16px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 4px;
        line-height: 1;
        box-shadow: 0 1px 4px rgba(0, 102, 204, 0.4);
      }
    }
  }

  .catalog-logo {
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 24px;
    font-weight: 700;

    .logo-guest {
      color: #0066cc;
    }

    .logo-amp {
      color: #333333;
      font-weight: 400;
    }

    .logo-place {
      color: #333333;
    }
  }

  .nav-links {
    display: flex;
    align-items: center;
    gap: 32px;
  }

  .nav-link {
    text-decoration: none;
    font-family: 'Raleway', sans-serif;
    font-size: 16px;
    color: #333333;
    transition: color 0.2s;

    &:hover {
      color: #0066cc;
    }
  }

  .header-cta-group {
    display: flex;
    align-items: center;
    gap: 24px;

    .cta-link-btn {
      background: none;
      border: none;
      color: #0066cc;
      font-family: 'Raleway', sans-serif;
      font-size: 16px;
      font-weight: 500;
      cursor: pointer;
      padding: 0;
      transition: opacity 0.2s;

      &:hover {
        opacity: 0.8;
      }

      &--add {
        color: #333333;
      }
    }
  }
}

// --- 2. MAIN CONTAINER ---
.favorites-main {
  flex: 1;
  padding: 24px 0 80px 0;
}

.favorites-container {
  max-width: 1140px;
  margin: 0 auto;
  padding: 0 20px;
}

// --- 3. BREADCRUMBS (Figma node 1199:54559) ---
.breadcrumbs {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 24px;
  font-family: 'Raleway', sans-serif;
  font-size: 14px;
  line-height: 1.35;

  &__link {
    color: #a0a0a4;
    text-decoration: none;
    transition: color 0.2s;

    &:hover {
      color: #0066cc;
    }
  }

  &__separator {
    color: #4f4f4f;
  }

  &__current {
    color: #333333;
  }
}

// --- 4. TITLE (Figma node 1199:54558) ---
.favorites-title {
  font-family: 'Poiret One', cursive, sans-serif;
  font-size: 42px;
  font-weight: 400;
  line-height: 1.5;
  text-align: center;
  text-transform: uppercase;
  color: #333333;
  margin: 0 0 36px 0;
  letter-spacing: 1px;
}

// --- 5. SORT TOOLBAR (Figma node 1199:54548) ---
.favorites-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 28px;
  padding-bottom: 12px;

  &__count {
    font-size: 14px;
    color: #a0a0a4;
    font-family: 'Raleway', sans-serif;
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  &__clear-btn {
    background: none;
    border: none;
    color: #a0a0a4;
    font-size: 13px;
    cursor: pointer;
    text-decoration: underline;
    transition: color 0.2s;

    &:hover {
      color: #ef4444;
    }
  }
}

.favorites-sort {
  position: relative;

  &__button {
    background: none;
    border: none;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    font-family: 'Raleway', sans-serif;
    font-size: 14px;
    color: #333333;
    padding: 6px 0;
    transition: color 0.2s;

    &:hover {
      color: #0066cc;
    }
  }

  &__icon {
    flex-shrink: 0;
  }

  &__arrow {
    transition: transform 0.2s ease;

    &--open {
      transform: rotate(180deg);
    }
  }

  &__menu {
    position: absolute;
    top: 100%;
    left: 0;
    background: #ffffff;
    border: 1px solid rgba(0, 0, 0, 0.08);
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    min-width: 280px;
    margin-top: 6px;
    padding: 8px 0;
    list-style: none;
    z-index: 50;
  }

  &__option {
    padding: 10px 16px;
    font-size: 14px;
    cursor: pointer;
    color: #333333;
    transition: all 0.2s ease;

    &:hover {
      background-color: #f5f8ff;
      color: #0066cc;
    }

    &--selected {
      background-color: #ecf4fd;
      color: #0066cc;
      font-weight: 600;
    }
  }
}

// --- 6. VENUES LIST ---
.favorites-list {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.favorites-card {
  width: 100%;
  max-width: 1110px;
  margin: 0 auto;
}

// --- 7. EMPTY STATE ---
.favorites-empty {
  text-align: center;
  padding: 80px 20px;
  background: #fafbfc;
  border-radius: 24px;
  border: 1px dashed rgba(51, 51, 51, 0.15);
  max-width: 720px;
  margin: 40px auto;

  &__icon-wrap {
    width: 96px;
    height: 96px;
    border-radius: 50%;
    background: #ecf4fd;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 24px;
  }

  &__title {
    font-size: 24px;
    font-weight: 600;
    color: #333333;
    margin: 0 0 12px 0;
  }

  &__desc {
    font-size: 15px;
    line-height: 1.6;
    color: #71717a;
    max-width: 520px;
    margin: 0 auto 32px auto;
  }

  &__actions {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    flex-wrap: wrap;
  }

  &__btn {
    padding: 12px 28px;
    border-radius: 50px;
    font-size: 15px;
    font-weight: 600;
    text-decoration: none;
    transition: all 0.2s ease;

    &--primary {
      background: linear-gradient(135deg, #d870ad 0%, #8e2dbc 100%);
      color: #ffffff;
      box-shadow: 0 4px 14px rgba(142, 45, 188, 0.3);

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 18px rgba(142, 45, 188, 0.4);
      }
    }

    &--outline {
      background: #ffffff;
      color: #333333;
      border: 1.5px solid #8e2dbc;

      &:hover {
        background: #fbf5fc;
      }
    }
  }
}

// --- 8. FOOTER (Figma node 1199:48337) ---
.favorites-footer {
  margin-top: auto;
  background-color: #ffffff;
  position: relative;

  &__flags-border {
    position: relative;
    height: 25px;
    overflow: hidden;
  }

  &__line {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background-color: #333333;
    opacity: 0.1;
  }

  &__flags-left {
    position: absolute;
    top: 0;
    left: 40px;
  }

  &__flags-right {
    position: absolute;
    top: 0;
    right: 40px;
  }

  &__container {
    max-width: 1140px;
    margin: 0 auto;
    padding: 36px 20px 48px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 24px;
  }

  &__brand {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  &__tagline {
    font-size: 14px;
    color: #333333;
    margin: 0;
  }

  &__nav {
    display: flex;
    align-items: center;
    gap: 24px;
    flex-wrap: wrap;
  }

  &__link {
    font-size: 16px;
    color: #333333;
    text-decoration: none;
    transition: color 0.2s;

    &:hover {
      color: #0066cc;
    }
  }
}

// --- 9. MODALS ---
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.modal-dialog {
  background: #ffffff;
  border-radius: 24px;
  max-width: 520px;
  width: 100%;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  animation: modal-pop 0.25s ease;
}

@keyframes modal-pop {
  from {
    opacity: 0;
    transform: scale(0.96) translateY(10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-title {
  font-size: 20px;
  font-weight: 700;
  margin: 0;
  color: #333333;
}

.modal-close {
  background: none;
  border: none;
  font-size: 28px;
  line-height: 1;
  color: #999;
  cursor: pointer;

  &:hover {
    color: #333;
  }
}

.modal-body {
  padding: 24px;
}

.modal-subtitle {
  font-size: 14px;
  color: #666;
  margin: 0 0 16px 0;
}

.tour-desc {
  font-size: 14px;
  line-height: 1.5;
  color: #666;
  margin: 0 0 20px 0;
}

.chat-preview-box {
  background: #f8fafc;
  border-radius: 12px;
  padding: 12px 16px;
  margin-bottom: 16px;

  .chat-message {
    font-size: 13px;
    line-height: 1.4;
    color: #333;

    p {
      margin: 0;
    }
  }
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;

  label {
    font-size: 13px;
    font-weight: 600;
    color: #4b5563;
  }

  input,
  textarea {
    border: 1px solid #d1d5db;
    border-radius: 10px;
    padding: 10px 14px;
    font-size: 14px;
    font-family: inherit;
    outline: none;
    transition: border-color 0.2s;

    &:focus {
      border-color: #0066cc;
    }
  }
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.modal-submit-btn {
  margin-top: 8px;
  padding: 12px;
  border-radius: 50px;
  border: none;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  color: #ffffff;
  transition: opacity 0.2s, transform 0.2s;

  &:hover {
    opacity: 0.92;
    transform: translateY(-1px);
  }

  &--gradient {
    background: linear-gradient(135deg, #d870ad 0%, #8e2dbc 100%);
  }

  &--purple {
    background: #8e2dbc;
  }

  &--blue {
    background: #0066cc;
  }
}

// --- 10. TOAST NOTIFICATION ---
.toast-notification {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  background: #1f2937;
  color: #ffffff;
  padding: 12px 24px;
  border-radius: 50px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.25);
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 14px;
  z-index: 120;
}

.toast-undo-btn {
  background: none;
  border: none;
  color: #60a5fa;
  font-weight: 700;
  cursor: pointer;
  text-decoration: underline;
  padding: 0;

  &:hover {
    color: #93c5fd;
  }
}

// Transitions
.dropdown-fade-enter-active,
.dropdown-fade-leave-active,
.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: all 0.2s ease;
}

.dropdown-fade-enter-from,
.dropdown-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
  transform: translate(-50%, 12px);
}

// Responsive
@media (max-width: 992px) {
  .favorites-header {
    .nav-links {
      display: none;
    }
  }

  .favorites-footer {
    &__container {
      flex-direction: column;
      align-items: flex-start;
    }
  }
}
</style>

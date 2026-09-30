<template>
  <div class="home-page">
    <!-- 1. FIRST SCREEN / HERO -->
    <section class="home-hero">
      <div class="home-hero__container">
        <div class="home-hero__content">
          <h1 class="home-hero__title">
            <span class="home-hero__title-main">{{ heroTitleParts.main }}</span>
            <span v-if="heroTitleParts.accent" class="home-hero__title-accent">{{ heroTitleParts.accent }}</span>
          </h1>

          <p class="home-hero__subtitle">
            <span class="home-hero__subtitle-line">Соединяем <span class="text-accent">гостей и места</span></span>
            <span class="home-hero__subtitle-line">Общение, бронирование <span class="text-accent">здесь и сейчас</span></span>
          </p>

          <!-- Search Filter Bar -->
          <div class="home-hero__search-card">
            <form class="home-hero__search-form" @submit.prevent="handleSearchSubmit">
              <div class="search-input-wrap">
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Введите название площадки"
                  class="search-input"
                />
              </div>

              <div class="search-select-wrap">
                <select v-model="selectedVenueType" class="search-select">
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

              <div class="search-select-wrap">
                <select v-model="selectedFeature" class="search-select">
                  <option value="">Особенности</option>
                  <option value="У воды">У воды</option>
                  <option value="Панорамный вид">Панорамный вид</option>
                  <option value="Летняя веранда">Летняя веранда</option>
                  <option value="Парковая зона">Парковая зона</option>
                  <option value="Своя территория">Своя территория</option>
                </select>
              </div>

              <div class="search-select-wrap">
                <select v-model="selectedCapacity" class="search-select">
                  <option value="">Вместимость</option>
                  <option value="20-50">20 - 50 гостей</option>
                  <option value="50-100">50 - 100 гостей</option>
                  <option value="100-200">100 - 200 гостей</option>
                  <option value="200+">более 200 гостей</option>
                </select>
              </div>

              <div class="search-select-wrap">
                <select v-model="selectedPrice" class="search-select">
                  <option value="">Стоимость</option>
                  <option value="3000">до 3 000 ₽ / чел</option>
                  <option value="5000">до 5 000 ₽ / чел</option>
                  <option value="7000">до 7 000 ₽ / чел</option>
                </select>
              </div>

              <button type="submit" class="search-submit-btn">
                Найти
              </button>
            </form>
          </div>

          <!-- CTA Buttons -->
          <div class="home-hero__cta-buttons">
            <button
              type="button"
              class="cta-btn cta-btn--gradient"
              @click="goToCatalog('map')"
            >
              {{ homeData.heroMapButtonText }}
            </button>
            <button
              type="button"
              class="cta-btn cta-btn--outline"
              @click="goToCatalog('list')"
            >
              {{ homeData.heroListButtonText }}
            </button>
          </div>
        </div>

        <!-- Hero Illustration -->
        <div class="home-hero__visual">
          <div class="hero-pins">
            <div class="hero-pin hero-pin--hotel" title="Отели & Лофты">
              <span class="hero-pin__icon">🏠</span>
            </div>
            <div class="hero-pin hero-pin--food" title="Рестораны & Банкеты">
              <span class="hero-pin__icon">🍽️</span>
            </div>
            <div class="hero-pin hero-pin--health" title="Отдых & Релакс">
              <span class="hero-pin__icon">🧘</span>
            </div>
            <div class="hero-pin hero-pin--business" title="Бизнес & Конференции">
              <span class="hero-pin__icon">💼</span>
            </div>
          </div>
          <div class="hero-earth-bg"></div>
        </div>
      </div>
    </section>

    <!-- 2. CATEGORIES SECTION -->
    <section class="home-categories">
      <div class="home-container">
        <h2 class="section-heading">
          {{ homeData.categoriesTitle }}
        </h2>

        <div class="categories-grid">
          <NuxtLink
            v-for="cat in homeData.categories"
            :key="cat.slug"
            :to="cat.link"
            class="category-card"
          >
            <div class="category-card__content">
              <h3 class="category-card__title">{{ cat.title }}</h3>
            </div>
            <div class="category-card__visual">
              <div class="category-card__circle"></div>
              <div class="category-card__art">
                <span v-if="cat.slug === 'rest'" class="category-art-emoji">🧳👒</span>
                <span v-else-if="cat.slug === 'business'" class="category-art-emoji">🏢🎤</span>
                <span v-else-if="cat.slug === 'banquets'" class="category-art-emoji">🍾🥂</span>
                <span v-else class="category-art-emoji">🌿🧘</span>
              </div>
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- 3. LATEST VENUES -->
    <section class="home-venues-section">
      <div class="home-container">
        <h2 class="section-heading-stylish">
          ПОСЛЕДНИЕ <span class="heading-accent">ДОБАВЛЕННЫЕ</span>
        </h2>

        <div class="venues-cards-row">
          <VenueCardSmall
            v-for="venue in homeData.latestVenues"
            :key="venue.id"
            :venue="venue"
          />
        </div>

        <div class="section-actions-center">
          <NuxtLink :to="homeData.latestSectionButtonLink" class="action-btn-gradient">
            {{ homeData.latestSectionButtonText }}
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- 4. POPULAR VENUES -->
    <section class="home-venues-section">
      <div class="home-container">
        <h2 class="section-heading-stylish">
          САМЫЕ <span class="heading-accent">ПОПУЛЯРНЫЕ</span>
        </h2>

        <div class="venues-cards-row">
          <VenueCardSmall
            v-for="venue in homeData.popularVenues"
            :key="venue.id"
            :venue="venue"
          />
        </div>

        <div class="section-actions-center">
          <NuxtLink :to="homeData.popularSectionButtonLink" class="action-btn-outline">
            {{ homeData.popularSectionButtonText }}
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- 5. INTERACTION VARIANTS -->
    <section class="home-interactions">
      <div class="home-container">
        <h2 class="section-heading section-heading--center">
          {{ homeData.interactionsTitle }}
        </h2>

        <div class="interactions-grid">
          <div
            v-for="item in homeData.interactions"
            :key="item.stepNumber"
            class="interaction-card"
          >
            <div class="interaction-card__number">{{ item.stepNumber }}</div>
            <div class="interaction-card__body">
              <h3 class="interaction-card__title">{{ item.title }}</h3>
              <p class="interaction-card__text">{{ item.text }}</p>
              <div class="interaction-card__action">
                <NuxtLink
                  :to="item.link"
                  class="interaction-btn"
                  :class="item.isAccent ? 'interaction-btn--accent' : 'interaction-btn--outline'"
                >
                  {{ item.buttonText }}
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>

        <!-- Bottom Banner -->
        <div class="home-banner">
          <h3 class="home-banner__title">
            Для быстрого поиска Вы можете пользоваться всеми вариантами <span class="text-blue">одновременно</span>.
          </h3>
          <p class="home-banner__text">
            <span class="text-blue">GP Платформа</span> позволяет общаться напрямую здесь и сейчас. Мы за «прозрачные отношения»
          </p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getHomeData, type HomeData } from '~/entities/home/api/home.api'
import VenueCardSmall from '~/entities/venue/ui/VenueCardSmall/VenueCardSmall.vue'

const router = useRouter()

const searchQuery = ref('')
const selectedVenueType = ref('')
const selectedFeature = ref('')
const selectedCapacity = ref('')
const selectedPrice = ref('')

const homeData = reactive<HomeData>({
  title: 'СОЦИАЛЬНАЯ ИНТЕРАКТИВНАЯ ПЛАТФОРМА',
  subtitle: 'Соединяем гостей и места\nОбщение, бронирование здесь и сейчас',
  heroMapButtonText: 'Показать на карте',
  heroListButtonText: 'Показать списком',
  categoriesTitle: 'Места по категориям',
  categories: [],
  latestSectionTitle: 'Последние добавленные',
  latestSectionButtonText: 'Показать еще',
  latestSectionButtonLink: '/venues',
  latestVenues: [],
  popularSectionTitle: 'Самые популярные',
  popularSectionButtonText: 'В каталог',
  popularSectionButtonLink: '/venues',
  popularVenues: [],
  interactionsTitle: 'Варианты взаимодействия с GP Platform',
  interactions: [],
  bannerTitle: 'Для быстрого поиска Вы можете пользоваться всеми вариантами одновременно.',
  bannerText: 'GP Платформа позволяет общаться напрямую здесь и сейчас. Мы за «прозрачные отношения»',
})

const heroTitleParts = computed(() => {
  const full = homeData.title || 'СОЦИАЛЬНАЯ ИНТЕРАКТИВНАЯ ПЛАТФОРМА'
  const words = full.split(' ')
  if (words.length > 1) {
    const accent = words[words.length - 1]
    const main = words.slice(0, words.length - 1).join(' ')
    return { main, accent }
  }
  return { main: full, accent: '' }
})

const handleSearchSubmit = () => {
  const query: Record<string, string> = {}
  if (searchQuery.value) query.search = searchQuery.value
  if (selectedVenueType.value) query.venue_type = selectedVenueType.value
  if (selectedFeature.value) query.feature = selectedFeature.value
  if (selectedCapacity.value) query.capacity = selectedCapacity.value
  if (selectedPrice.value) query.price = selectedPrice.value

  router.push({ path: '/venues', query })
}

const goToCatalog = (viewMode: 'map' | 'list') => {
  if (viewMode === 'map') {
    router.push({ path: '/venues', query: { view: 'map' } })
  } else {
    router.push('/venues')
  }
}

onMounted(async () => {
  try {
    const data = await getHomeData()
    Object.assign(homeData, data)
  } catch (err) {
    console.error('Failed to load home page content:', err)
  }

  // Live preview postMessage listener from admin panel
  if (typeof window !== 'undefined') {
    window.addEventListener('message', (event) => {
      if (event.data?.type === 'GP_HOME_LIVE_PREVIEW' && event.data.payload) {
        const p = event.data.payload
        if (p.title !== undefined) homeData.title = p.title
        if (p.subtitle !== undefined) homeData.subtitle = p.subtitle
        if (p.heroMapButtonText !== undefined) homeData.heroMapButtonText = p.heroMapButtonText
        if (p.heroListButtonText !== undefined) homeData.heroListButtonText = p.heroListButtonText
        if (p.categoriesTitle !== undefined) homeData.categoriesTitle = p.categoriesTitle
        if (p.categories !== undefined) homeData.categories = p.categories
        if (p.latestSectionTitle !== undefined) homeData.latestSectionTitle = p.latestSectionTitle
        if (p.latestSectionButtonText !== undefined) homeData.latestSectionButtonText = p.latestSectionButtonText
        if (p.popularSectionTitle !== undefined) homeData.popularSectionTitle = p.popularSectionTitle
        if (p.popularSectionButtonText !== undefined) homeData.popularSectionButtonText = p.popularSectionButtonText
        if (p.interactionsTitle !== undefined) homeData.interactionsTitle = p.interactionsTitle
        if (p.interactions !== undefined) homeData.interactions = p.interactions
        if (p.bannerTitle !== undefined) homeData.bannerTitle = p.bannerTitle
        if (p.bannerText !== undefined) homeData.bannerText = p.bannerText
      }
    })
  }
})
</script>

<style scoped lang="scss">
.home-page {
  width: 100%;
  min-height: 100vh;
  background-color: #fafbfc;
  color: #2c3e50;
  font-family: inherit;
  overflow-x: hidden;
}

.home-container {
  max-width: 1140px;
  margin: 0 auto;
  padding: 0 20px;
}

/* 1. HERO SCREEN */
.home-hero {
  position: relative;
  width: 100%;
  padding: 80px 0 60px;
  background: radial-gradient(circle at 75% 30%, rgba(224, 237, 255, 0.6) 0%, rgba(250, 251, 252, 0) 65%);
  overflow: hidden;

  &__container {
    max-width: 1140px;
    margin: 0 auto;
    padding: 0 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
    min-height: 520px;
  }

  &__content {
    flex: 1;
    max-width: 600px;
    z-index: 2;
  }

  &__title {
    font-size: 44px;
    line-height: 1.15;
    font-weight: 300;
    letter-spacing: 0.04em;
    color: #333333;
    margin: 0 0 24px;
    text-transform: uppercase;

    &-main {
      display: block;
    }

    &-accent {
      display: block;
      color: #2f80ed;
      font-weight: 400;
    }
  }

  &__subtitle {
    font-size: 18px;
    line-height: 1.5;
    color: #666666;
    margin: 0 0 36px;

    &-line {
      display: block;
    }

    .text-accent {
      color: #2f80ed;
      font-weight: 500;
    }
  }

  &__search-card {
    background: #ffffff;
    border-radius: 50px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.07);
    padding: 8px 16px;
    margin-bottom: 30px;
    border: 1px solid rgba(0, 0, 0, 0.04);
  }

  &__search-form {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;

    .search-input-wrap {
      flex: 1.5;
      min-width: 160px;

      .search-input {
        width: 100%;
        border: none;
        outline: none;
        padding: 10px 14px;
        font-size: 14px;
        color: #333;

        &::placeholder {
          color: #999;
        }
      }
    }

    .search-select-wrap {
      flex: 1;
      min-width: 110px;

      .search-select {
        width: 100%;
        border: none;
        outline: none;
        background: transparent;
        font-size: 13px;
        color: #555;
        cursor: pointer;
        padding: 8px 4px;
      }
    }

    .search-submit-btn {
      background: linear-gradient(135deg, #a855f7 0%, #3b82f6 100%);
      color: #ffffff;
      border: none;
      padding: 10px 24px;
      border-radius: 40px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: opacity 0.2s;

      &:hover {
        opacity: 0.9;
      }
    }
  }

  &__cta-buttons {
    display: flex;
    gap: 16px;

    .cta-btn {
      padding: 14px 28px;
      border-radius: 40px;
      font-size: 15px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.25s ease;

      &--gradient {
        background: linear-gradient(135deg, #d946ef 0%, #3b82f6 100%);
        color: #ffffff;
        border: none;
        box-shadow: 0 4px 15px rgba(168, 85, 247, 0.35);

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(168, 85, 247, 0.45);
        }
      }

      &--outline {
        background: #ffffff;
        color: #333;
        border: 2px solid transparent;
        background-image: linear-gradient(#fff, #fff), linear-gradient(135deg, #d946ef, #3b82f6);
        background-origin: border-box;
        background-clip: padding-box, border-box;

        &:hover {
          transform: translateY(-2px);
          color: #2f80ed;
        }
      }
    }
  }

  &__visual {
    position: relative;
    width: 480px;
    height: 480px;

    .hero-pins {
      position: absolute;
      inset: 0;
      pointer-events: none;
      z-index: 2;

      .hero-pin {
        position: absolute;
        width: 52px;
        height: 52px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
        animation: floatPin 3s ease-in-out infinite alternate;

        &__icon {
          font-size: 22px;
        }

        &--hotel {
          top: 40px;
          left: 40px;
          background: #fdba74;
          animation-delay: 0s;
        }

        &--food {
          top: 20px;
          right: 120px;
          background: #f87171;
          animation-delay: 0.6s;
        }

        &--health {
          top: 90px;
          right: 30px;
          background: #c084fc;
          animation-delay: 1.2s;
        }

        &--business {
          bottom: 120px;
          right: 20px;
          background: #60a5fa;
          animation-delay: 1.8s;
        }
      }
    }

    .hero-earth-bg {
      width: 100%;
      height: 100%;
      background: radial-gradient(circle, rgba(219, 234, 254, 0.7) 0%, rgba(239, 246, 255, 0.1) 70%);
      border-radius: 50%;
      position: relative;

      &::after {
        content: '🌍';
        font-size: 200px;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        opacity: 0.25;
      }
    }
  }
}

@keyframes floatPin {
  0% { transform: translateY(0); }
  100% { transform: translateY(-10px); }
}

/* 2. CATEGORIES SECTION */
.home-categories {
  padding: 60px 0;

  .section-heading {
    font-size: 32px;
    font-weight: 300;
    color: #333;
    margin: 0 0 36px;
    letter-spacing: 0.02em;

    &--center {
      text-align: center;
      margin-bottom: 48px;
    }
  }

  .categories-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 24px;
  }

  .category-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 140px;
    background: #ffffff;
    border-radius: 28px;
    padding: 20px 28px;
    text-decoration: none;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
    border: 1px solid rgba(0, 0, 0, 0.03);
    position: relative;
    overflow: hidden;
    transition: transform 0.25s ease, box-shadow 0.25s ease;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 28px rgba(0, 0, 0, 0.08);

      .category-card__title {
        color: #2f80ed;
      }

      .category-card__circle {
        transform: scale(1.1);
      }
    }

    &__title {
      font-size: 22px;
      font-weight: 400;
      color: #333;
      margin: 0;
      transition: color 0.2s;
    }

    &__visual {
      position: relative;
      width: 90px;
      height: 90px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    &__circle {
      position: absolute;
      width: 90px;
      height: 90px;
      border-radius: 50%;
      background: #eff6ff;
      transition: transform 0.3s ease;
    }

    &__art {
      position: relative;
      z-index: 1;

      .category-art-emoji {
        font-size: 38px;
      }
    }
  }
}

/* 3 & 4. VENUES SECTIONS */
.home-venues-section {
  padding: 60px 0;

  .section-heading-stylish {
    font-size: 32px;
    font-weight: 300;
    color: #333;
    letter-spacing: 0.05em;
    margin: 0 0 36px;
    text-transform: uppercase;

    .heading-accent {
      color: #2f80ed;
      font-weight: 400;
    }
  }

  .venues-cards-row {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 24px;
    margin-bottom: 40px;
  }

  .section-actions-center {
    display: flex;
    justify-content: center;

    .action-btn-gradient {
      display: inline-block;
      padding: 14px 44px;
      background: linear-gradient(135deg, #d946ef 0%, #3b82f6 100%);
      color: #ffffff;
      border-radius: 40px;
      text-decoration: none;
      font-weight: 600;
      font-size: 15px;
      box-shadow: 0 4px 15px rgba(168, 85, 247, 0.35);
      transition: all 0.25s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(168, 85, 247, 0.45);
      }
    }

    .action-btn-outline {
      display: inline-block;
      padding: 14px 44px;
      background: #ffffff;
      color: #333;
      border-radius: 40px;
      text-decoration: none;
      font-weight: 600;
      font-size: 15px;
      border: 2px solid transparent;
      background-image: linear-gradient(#fff, #fff), linear-gradient(135deg, #d946ef, #3b82f6);
      background-origin: border-box;
      background-clip: padding-box, border-box;
      transition: all 0.25s ease;

      &:hover {
        transform: translateY(-2px);
        color: #2f80ed;
      }
    }
  }
}

/* 5. INTERACTIONS & BANNER */
.home-interactions {
  padding: 60px 0 100px;

  .interactions-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 36px 48px;
    margin-bottom: 60px;
  }

  .interaction-card {
    display: flex;
    gap: 24px;
    align-items: flex-start;

    &__number {
      font-size: 80px;
      line-height: 0.9;
      font-weight: 300;
      color: #dbeafe;
      user-select: none;
    }

    &__body {
      flex: 1;
    }

    &__title {
      font-size: 18px;
      font-weight: 500;
      color: #2563eb;
      margin: 0 0 10px;
    }

    &__text {
      font-size: 14px;
      line-height: 1.6;
      color: #64748b;
      margin: 0 0 18px;
    }

    &__action {
      .interaction-btn {
        display: inline-block;
        padding: 10px 26px;
        border-radius: 30px;
        font-size: 13px;
        font-weight: 500;
        text-decoration: none;
        transition: all 0.2s ease;

        &--accent {
          background: linear-gradient(135deg, #d946ef 0%, #3b82f6 100%);
          color: #ffffff;
          box-shadow: 0 4px 12px rgba(168, 85, 247, 0.25);

          &:hover {
            transform: translateY(-2px);
          }
        }

        &--outline {
          background: #ffffff;
          color: #333;
          border: 1px solid #c7d2fe;

          &:hover {
            border-color: #818cf8;
            color: #4f46e5;
          }
        }
      }
    }
  }

  .home-banner {
    background: #f1f5f9;
    border-radius: 36px;
    padding: 44px 40px;
    text-align: center;
    box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.02);

    &__title {
      font-size: 22px;
      font-weight: 400;
      color: #334155;
      margin: 0 0 14px;
    }

    &__text {
      font-size: 15px;
      color: #64748b;
      margin: 0;
    }

    .text-blue {
      color: #2563eb;
      font-weight: 500;
    }
  }
}

@media (max-width: 992px) {
  .home-hero {
    &__container {
      flex-direction: column;
      text-align: center;
    }

    &__content {
      max-width: 100%;
    }

    &__cta-buttons {
      justify-content: center;
    }

    &__visual {
      margin-top: 40px;
      width: 320px;
      height: 320px;
    }
  }

  .home-interactions .interactions-grid {
    grid-template-columns: 1fr;
  }
}
</style>

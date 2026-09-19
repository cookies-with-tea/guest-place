<template>
	<div class="about-page">
		<!-- Live Preview Floating Bar (shown when in CMS preview mode) -->
		<transition name="fade">
			<div v-if="isPreview" class="preview-banner">
				<div class="preview-banner-content">
					<span class="preview-dot" :class="{ 'is-connected': isConnectedToCms }"></span>
					<span class="preview-label">
						{{ isConnectedToCms ? 'Live Preview подключен (CMS Data Synced)' : 'Ожидание синхронизации с CMS...' }}
					</span>
					<span class="preview-schema-badge">schema: page_about</span>
				</div>
			</div>
		</transition>

		<!-- HEADER -->
		<header class="site-header">
			<!-- Top utility bar -->
			<div class="header-top-bar">
				<div class="header-container top-container">
					<div class="city-selector">
						<svg class="icon-pin" width="14" height="18" viewBox="0 0 14 18" fill="none">
							<path d="M7 0C3.13401 0 0 3.13401 0 7C0 12.25 7 18 7 18C7 18 14 12.25 14 7C14 3.13401 10.866 0 7 0ZM7 9.5C5.61929 9.5 4.5 8.38071 4.5 7C4.5 5.61929 5.61929 4.5 7 4.5C8.38071 4.5 9.5 5.61929 9.5 7C9.5 8.38071 8.38071 9.5 7 9.5Z" fill="#333333"/>
						</svg>
						<span class="city-name">{{ data.city || 'Москва' }}</span>
						<svg class="icon-caret" width="8" height="5" viewBox="0 0 8 5" fill="none">
							<path d="M1 1L4 4L7 1" stroke="#333333" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
						</svg>
					</div>

					<div class="user-actions">
						<button class="action-btn" aria-label="Избранное">
							<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#333333" stroke-width="2">
								<path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
							</svg>
						</button>
						<button class="action-btn" aria-label="Сообщения">
							<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#333333" stroke-width="2">
								<path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/>
							</svg>
						</button>
						<button class="action-btn" aria-label="Профиль">
							<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#333333" stroke-width="2">
								<path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
								<circle cx="12" cy="7" r="4"/>
							</svg>
						</button>
					</div>
				</div>
			</div>

			<!-- Main Navigation Bar -->
			<div class="header-main-bar">
				<div class="header-container main-container">
					<!-- Logo -->
					<NuxtLink to="/" class="logo">
						<span class="logo-guest">Guest</span>
						<span class="logo-amp">&</span>
						<span class="logo-place">Place</span>
					</NuxtLink>

					<!-- Center Navigation Links -->
					<nav class="nav-links">
						<NuxtLink to="/about" class="nav-link is-active">О платформе</NuxtLink>
						<NuxtLink to="/platforms" class="nav-link">Площадкам</NuxtLink>
						<NuxtLink to="/guests" class="nav-link">Гостям</NuxtLink>
					</nav>

					<!-- CTA Action Buttons -->
					<div class="header-cta-group">
						<button class="cta-link-btn">+ Разместить запрос</button>
						<button class="cta-link-btn">+ Добавить место</button>
					</div>
				</div>
			</div>
		</header>

		<!-- BREADCRUMBS -->
		<div class="breadcrumbs-section">
			<div class="container">
				<nav class="breadcrumbs">
					<NuxtLink to="/" class="crumb-link">Главная</NuxtLink>
					<span class="crumb-sep">/</span>
					<span class="crumb-current">О платформе</span>
				</nav>
			</div>
		</div>

		<!-- HERO SECTION -->
		<section class="hero-section">
			<div class="hero-decor decor-left">
				<svg width="140" height="280" viewBox="0 0 140 280" fill="none">
					<!-- Stylized Bride illustration silhouette -->
					<circle cx="70" cy="50" r="30" fill="#F8BF95" opacity="0.6"/>
					<path d="M40 70 Q70 30 100 70 Q120 180 70 270 Q20 180 40 70Z" fill="#F8BF95" opacity="0.4"/>
					<path d="M20 90 Q70 120 120 90 Q140 200 70 260 Q0 200 20 90Z" fill="#F8DA75" opacity="0.3"/>
					<circle cx="70" cy="45" r="12" fill="#EF8062" opacity="0.5"/>
				</svg>
			</div>

			<div class="hero-decor decor-right">
				<svg width="140" height="280" viewBox="0 0 140 280" fill="none">
					<!-- Stylized Groom illustration silhouette -->
					<circle cx="70" cy="50" r="26" fill="#AAB9ED" opacity="0.6"/>
					<path d="M45 80 L95 80 L110 270 L30 270 Z" fill="#0066CC" opacity="0.35"/>
					<path d="M55 80 L85 80 L70 120 Z" fill="#FFFFFF"/>
					<path d="M66 84 L74 84 L70 92 Z" fill="#EF8062"/>
				</svg>
			</div>

			<div class="container hero-container">
				<h1 class="hero-title">
					<span class="text-dark">{{ heroTitlePrefix }}</span>
					<span class="text-accent">{{ heroTitleAccent }}</span>
				</h1>

				<div class="hero-subtitle">
					<p v-for="(line, idx) in heroSubtitleLines" :key="idx">{{ line }}</p>
				</div>
			</div>
		</section>

		<!-- SECTION: GP PLATFORM CAPABILITIES -->
		<section class="capabilities-section">
			<div class="container">
				<h2 class="section-title">
					<span>Возможности </span>
					<span class="text-accent">GP Platform</span>
				</h2>

				<div class="cards-grid">
					<!-- Card 1: Guest -->
					<div class="feature-card">
						<div class="card-header">
							<div class="card-icon-wrap">
								<svg width="22" height="26" viewBox="0 0 24 28" fill="none">
									<rect x="2" y="2" width="20" height="24" rx="4" stroke="#333333" stroke-width="2"/>
									<circle cx="12" cy="10" r="4" stroke="#333333" stroke-width="2"/>
									<path d="M6 22C6 18.6863 8.68629 16 12 16C15.3137 16 18 18.6863 18 22" stroke="#333333" stroke-width="2" stroke-linecap="round"/>
								</svg>
							</div>
							<h3 class="card-title">{{ data.guest_title || 'Guest' }}</h3>
						</div>

						<ul class="features-list">
							<li v-for="(item, idx) in guestFeaturesList" :key="idx" class="feature-item">
								<span class="bullet-dot"></span>
								<span class="item-text">{{ item }}</span>
							</li>
						</ul>

						<div class="card-footer">
							<button class="btn-gradient">
								{{ data.guest_button_text || 'Зарегистрироваться' }}
							</button>
						</div>
					</div>

					<!-- Card 2: Place -->
					<div class="feature-card">
						<div class="card-header">
							<div class="card-icon-wrap">
								<svg width="24" height="26" viewBox="0 0 24 28" fill="none">
									<path d="M3 24V9L12 2L21 9V24H3Z" stroke="#333333" stroke-width="2" stroke-linejoin="round"/>
									<rect x="8" y="14" width="8" height="10" stroke="#333333" stroke-width="2"/>
									<line x1="12" y1="14" x2="12" y2="24" stroke="#333333" stroke-width="2"/>
								</svg>
							</div>
							<h3 class="card-title">{{ data.place_title || 'Place' }}</h3>
						</div>

						<ul class="features-list">
							<li v-for="(item, idx) in placeFeaturesList" :key="idx" class="feature-item">
								<span class="bullet-dot"></span>
								<span class="item-text">{{ item }}</span>
							</li>
						</ul>

						<div class="card-footer">
							<button class="btn-gradient">
								{{ data.place_button_text || 'Добавить место' }}
							</button>
						</div>
					</div>
				</div>
			</div>
		</section>

		<!-- SECTION: PROJECT FROM SOUL -->
		<section class="soul-section">
			<div class="container">
				<div class="soul-card">
					<div class="soul-header">
						<span class="soul-logo-guest">Guest</span>
						<span class="soul-logo-amp">&</span>
						<span class="soul-logo-place">Place</span>
						<span class="soul-title-text">{{ data.quote_title || ' - проект от души :)' }}</span>
					</div>

					<p class="soul-lead">
						{{ data.quote_description || 'Лидерство на рынке обеспечивается нашей талантливой командой, экспертами своего дела' }}
					</p>

					<div class="soul-values-grid">
						<div class="value-item">
							<div class="value-icon-box">
								<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0066CC" stroke-width="2">
									<path d="M9 18h6m-4 4h2M12 2a7 7 0 00-7 7c0 2.38 1.19 4.47 3 5.74V17a1 1 0 001 1h6a1 1 0 001-1v-2.26c1.81-1.27 3-3.36 3-5.74a7 7 0 00-7-7z"/>
								</svg>
							</div>
							<p class="value-text">
								{{ data.quote_val_1 || 'постоянный поиск новых решений и внедрение новых технологий' }}
							</p>
						</div>

						<div class="value-item">
							<div class="value-icon-box">
								<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0066CC" stroke-width="2">
									<circle cx="12" cy="12" r="10"/>
									<path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"/>
								</svg>
							</div>
							<p class="value-text">
								{{ data.quote_val_2 || 'мы хотим превзойти ожидания пользователей и свои тоже :)' }}
							</p>
						</div>
					</div>
				</div>
			</div>
		</section>

		<!-- SECTION: OUR MISSION -->
		<section class="story-section mission-section">
			<div class="container story-grid">
				<div class="story-content">
					<h2 class="section-title text-left">
						<span>НАША </span>
						<span class="text-accent">{{ data.mission_title_accent || 'МИССИЯ' }}</span>
					</h2>

					<div class="story-text" v-html="missionHtml"></div>
				</div>

				<div class="story-media">
					<img
						:src="data.mission_image || 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&auto=format&fit=crop&q=80'"
						alt="Наша миссия"
						class="story-img"
					/>
				</div>
			</div>
		</section>

		<!-- SECTION: CREATION STORY -->
		<section class="story-section history-section">
			<div class="container story-grid reverse-grid">
				<div class="story-media">
					<img
						:src="data.history_image || 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&auto=format&fit=crop&q=80'"
						alt="История создания"
						class="story-img"
					/>
				</div>

				<div class="story-content">
					<h2 class="section-title text-left">
						<span>ИСТОРИЯ </span>
						<span class="text-accent">{{ data.history_title_accent || 'СОЗДАНИЯ' }}</span>
					</h2>

					<div class="story-text" v-html="historyHtml"></div>
				</div>
			</div>
		</section>

		<!-- SECTION: OUR NEWS -->
		<section class="news-section">
			<div class="container">
				<h2 class="section-title">
					<span>НАШИ </span>
					<span class="text-accent">НОВОСТИ</span>
				</h2>

				<div class="news-grid">
					<!-- Card 1 -->
					<div class="news-card">
						<div class="news-badge-circle badge-yellow">
							<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#333333" stroke-width="2">
								<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
								<circle cx="9" cy="7" r="4"/>
								<path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
							</svg>
						</div>
						<h3 class="news-card-title">Площадкам</h3>
					</div>

					<!-- Card 2 -->
					<div class="news-card">
						<div class="news-badge-circle badge-orange">
							<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#333333" stroke-width="2">
								<path d="M21.5 2v6h-6M21.34 15.57a10 10 0 11-.57-8.38l5.67-5.67"/>
							</svg>
						</div>
						<h3 class="news-card-title">Обновления</h3>
					</div>

					<!-- Card 3 -->
					<div class="news-card">
						<div class="news-badge-circle badge-coral">
							<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#333333" stroke-width="2">
								<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
							</svg>
						</div>
						<h3 class="news-card-title">
							<span>Новые продукты </span>
							<span class="text-accent">GP</span>
						</h3>
					</div>
				</div>
			</div>
		</section>

		<!-- FOOTER -->
		<footer class="site-footer">
			<div class="footer-border-flags">
				<div class="flags-left">
					<svg width="120" height="30" viewBox="0 0 120 30" fill="none">
						<polygon points="0,0 20,0 10,25" fill="#EF8062"/>
						<polygon points="25,0 45,0 35,25" fill="#F8DA75"/>
						<polygon points="50,0 70,0 60,25" fill="#F8BF95"/>
						<polygon points="75,0 95,0 85,25" fill="#AAB9ED"/>
					</svg>
				</div>
				<div class="flags-divider"></div>
				<div class="flags-right">
					<svg width="120" height="30" viewBox="0 0 120 30" fill="none">
						<polygon points="25,0 45,0 35,25" fill="#EF8062"/>
						<polygon points="50,0 70,0 60,25" fill="#F8DA75"/>
						<polygon points="75,0 95,0 85,25" fill="#AAB9ED"/>
						<polygon points="100,0 120,0 110,25" fill="#0066CC"/>
					</svg>
				</div>
			</div>

			<div class="container footer-container">
				<div class="footer-brand">
					<div class="logo">
						<span class="logo-guest">Guest</span>
						<span class="logo-amp">&</span>
						<span class="logo-place">Place</span>
					</div>
					<p class="footer-tagline">Интерактивная платформа</p>
				</div>

				<nav class="footer-nav">
					<a href="#" class="footer-link">О проекте</a>
					<a href="#" class="footer-link">Площадкам</a>
					<a href="#" class="footer-link">Гостям</a>
					<a href="#" class="footer-link">Контакты</a>
					<a href="#" class="footer-link">Помощь</a>
					<a href="#" class="footer-link">Вакансии</a>
					<a href="#" class="footer-link">Техподдержка</a>
				</nav>
			</div>
		</footer>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCmsPage } from '#shared/lib/composables'

// Default fallback data directly transcribed from Figma node 1199-50982
const defaultAboutData = {
	city: 'Москва',
	hero_title: 'О платформе Guest & Place',
	hero_subtitle: 'Платформа, позволяющая общаться напрямую!\nПомогаем каждому Гостю найти “свое” место.\nМы за «прозрачные отношения»!',
	guest_title: 'Guest',
	guest_features: [
		'Прямая связь с площадкой в режиме реального времени',
		'Актуальная информация, меню, цены, свободные даты',
		'Прямое онлайн бронирование и оплата',
		'Заказ столика, банкета, доставка еды, аренда помещения под мероприятия — все в одном месте',
		'Онлайн просмотр',
		'Общение в чатах, видео-встречи, консультации менеджеров площадок',
		'Личный кабинет и вся информация в одном месте',
	],
	guest_button_text: 'Зарегистрироваться',
	place_title: 'Place',
	place_features: [
		'Чаты, видео-встречи',
		'Онлайн-показ площадки',
		'Прямые трансляции, новости, лента событий',
		'Прямое онлайн-бронирование и оплата',
		'Календарь бронирования в режиме реального времени',
		'Простое приложение в системе Учета (все в одном месте)',
	],
	place_button_text: 'Добавить место',
	quote_title: ' - проект от души :)',
	quote_description: 'Лидерство на рынке обеспечивается нашей талантливой командой, экспертами своего дела',
	quote_val_1: 'постоянный поиск новых решений и внедрение новых технологий',
	quote_val_2: 'мы хотим превзойти ожидания пользователей и свои тоже :)',
	mission_title_accent: 'МИССИЯ',
	mission_text:
		'<p>Соединяем гостей (людей) и места, создавая простоту и прозрачность в “отношениях”. Предоставляем самые современные технологии и инструменты для простого и легкого общения.</p><p>Наши эксперты помогают Гостям найти <strong><span style="color:#0066CC">«то самое»</span></strong> место.</p>',
	mission_image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&auto=format&fit=crop&q=80',
	history_title_accent: 'СОЗДАНИЯ',
	history_text:
		'<p>Соединяем гостей (людей) и места, создавая простоту и прозрачность в “отношениях”. Предоставляем самые современные технологии и инструменты для простого и легкого общения.</p><p>Наши эксперты помогают Гостям найти <strong><span style="color:#0066CC">“то самое”</span></strong> место.</p>',
	history_image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&auto=format&fit=crop&q=80',
}

const { data, isPreview, isConnectedToCms } = useCmsPage('page_about', defaultAboutData)

// Parsers for hero title
const heroTitlePrefix = computed(() => {
	const raw = data.hero_title || 'О платформе Guest & Place'
	if (raw.toLowerCase().includes('guest')) {
		return raw.split(/guest/i)[0]
	}
	return 'О платформе '
})

const heroTitleAccent = computed(() => {
	const raw = data.hero_title || 'О платформе Guest & Place'
	if (raw.toLowerCase().includes('guest')) {
		const match = raw.match(/guest.*/i)
		return match ? match[0] : 'Guest & Place'
	}
	return 'Guest & Place'
})

// Parsers for subtitle lines
const heroSubtitleLines = computed(() => {
	const raw = data.hero_subtitle || ''
	if (Array.isArray(raw)) return raw
	return String(raw).split('\n').filter(Boolean)
})

// Parsers for bullet points (handles either array or multiline string from textarea)
const guestFeaturesList = computed(() => {
	const raw = data.guest_features || data.guest_bullets || data.guestFeatures || data.guestBullets
	if (Array.isArray(raw)) return raw
	if (typeof raw === 'string') return raw.split('\n').map((s) => s.trim()).filter(Boolean)
	return defaultAboutData.guest_features
})

const placeFeaturesList = computed(() => {
	const raw = data.place_features || data.place_bullets || data.placeFeatures || data.placeBullets
	if (Array.isArray(raw)) return raw
	if (typeof raw === 'string') return raw.split('\n').map((s) => s.trim()).filter(Boolean)
	return defaultAboutData.place_features
})

const missionHtml = computed(() => {
	const raw = data.mission_text
	if (raw && (raw.includes('<p>') || raw.includes('<div>'))) return raw
	return `<p>${raw || defaultAboutData.mission_text}</p>`
})

const historyHtml = computed(() => {
	const raw = data.history_text
	if (raw && (raw.includes('<p>') || raw.includes('<div>'))) return raw
	return `<p>${raw || defaultAboutData.history_text}</p>`
})
</script>

<style scoped lang="scss">
@use 'styles/helpers/variables/fonts' as *;

.about-page {
	min-height: 100vh;
	background-color: #ffffff;
	color: #333333;
	font-family: $font-family-raleway, sans-serif;
	overflow-x: hidden;
	position: relative;
}

/* Container */
.container {
	max-width: 1140px;
	margin: 0 auto;
	padding: 0 20px;
}

/* Preview Bar */
.preview-banner {
	position: sticky;
	top: 0;
	z-index: 9999;
	background: rgba(15, 23, 42, 0.92);
	backdrop-filter: blur(10px);
	color: #ffffff;
	padding: 8px 16px;
	font-size: 12px;
	border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.preview-banner-content {
	max-width: 1140px;
	margin: 0 auto;
	display: flex;
	align-items: center;
	gap: 10px;
}

.preview-dot {
	width: 8px;
	height: 8px;
	border-radius: 50%;
	background: #eab308;
	box-shadow: 0 0 6px #eab308;

	&.is-connected {
		background: #10b981;
		box-shadow: 0 0 8px #10b981;
	}
}

.preview-schema-badge {
	margin-left: auto;
	padding: 2px 8px;
	border-radius: 4px;
	background: rgba(99, 102, 241, 0.3);
	color: #a5b4fc;
	font-family: monospace;
}

/* HEADER */
.site-header {
	width: 100%;
	border-bottom: 1px solid rgba(51, 51, 51, 0.08);
}

.header-container {
	max-width: 1140px;
	margin: 0 auto;
	padding: 0 20px;
}

.header-top-bar {
	border-bottom: 1px solid rgba(51, 51, 51, 0.06);
	padding: 10px 0;
}

.top-container {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.city-selector {
	display: flex;
	align-items: center;
	gap: 6px;
	font-size: 14px;
	color: #333333;
	cursor: pointer;

	.city-name {
		font-weight: 500;
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
		transition: opacity 0.2s;

		&:hover {
			opacity: 0.7;
		}
	}
}

.header-main-bar {
	padding: 18px 0;
}

.main-container {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

/* Logo */
.logo {
	text-decoration: none;
	display: inline-flex;
	align-items: center;
	gap: 4px;
	font-size: 24px;
	font-weight: 700;

	.logo-guest {
		color: #0066CC;
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
	font-size: 16px;
	color: #333333;
	transition: color 0.2s;

	&:hover,
	&.is-active {
		color: #0066CC;
		font-weight: 500;
	}
}

.header-cta-group {
	display: flex;
	align-items: center;
	gap: 24px;

	.cta-link-btn {
		background: transparent;
		border: none;
		color: #0066CC;
		font-size: 15px;
		font-weight: 500;
		cursor: pointer;
		padding: 6px 10px;
		border-radius: 6px;
		transition: background 0.2s;

		&:hover {
			background: rgba(0, 102, 204, 0.06);
		}
	}
}

/* Breadcrumbs */
.breadcrumbs-section {
	padding: 20px 0 10px;
}

.breadcrumbs {
	display: flex;
	align-items: center;
	gap: 8px;
	font-size: 14px;
	color: #a0a0a4;

	.crumb-link {
		color: #a0a0a4;
		text-decoration: none;

		&:hover {
			color: #333333;
		}
	}

	.crumb-current {
		color: #333333;
	}
}

/* HERO */
.hero-section {
	position: relative;
	padding: 40px 0 70px;
	text-align: center;
}

.hero-decor {
	position: absolute;
	top: 20px;
	pointer-events: none;
	z-index: 0;

	&.decor-left {
		left: 4%;
	}

	&.decor-right {
		right: 4%;
	}
}

.hero-container {
	position: relative;
	z-index: 1;
}

.hero-title {
	font-family: $font-family-poiret, cursive, sans-serif;
	font-size: 42px;
	font-weight: 400;
	text-transform: uppercase;
	line-height: 1.3;
	margin: 0 0 20px 0;
	letter-spacing: 0.02em;

	.text-dark {
		color: #333333;
	}

	.text-accent {
		color: #0066CC;
	}
}

.hero-subtitle {
	font-size: 16px;
	line-height: 1.6;
	color: #585f66;
	max-width: 620px;
	margin: 0 auto;

	p {
		margin: 0 0 4px 0;
	}
}

/* SECTION TITLE */
.section-title {
	font-family: $font-family-poiret, cursive, sans-serif;
	font-size: 34px;
	font-weight: 400;
	text-transform: uppercase;
	text-align: center;
	color: #333333;
	margin: 0 0 40px 0;

	&.text-left {
		text-align: left;
		margin-bottom: 24px;
	}

	.text-accent {
		color: #0066CC;
	}
}

/* CAPABILITIES CARDS */
.capabilities-section {
	padding: 30px 0 70px;
}

.cards-grid {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: 30px;
}

.feature-card {
	background: #ffffff;
	border-radius: 40px;
	padding: 40px 48px;
	box-shadow: 0px 4px 20px rgba(105, 78, 75, 0.1);
	display: flex;
	flex-direction: column;
	border: 1px solid rgba(0, 0, 0, 0.04);
	transition: transform 0.3s, box-shadow 0.3s;

	&:hover {
		transform: translateY(-4px);
		box-shadow: 0px 8px 30px rgba(105, 78, 75, 0.16);
	}
}

.card-header {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 10px;
	margin-bottom: 30px;

	.card-title {
		margin: 0;
		font-size: 26px;
		font-weight: 500;
		color: #333333;
	}
}

.features-list {
	list-style: none;
	padding: 0;
	margin: 0 0 36px 0;
	display: flex;
	flex-direction: column;
	gap: 14px;
	flex-grow: 1;
}

.feature-item {
	display: flex;
	align-items: flex-start;
	gap: 12px;
	font-size: 14px;
	line-height: 1.5;
	color: #585f66;

	.bullet-dot {
		width: 5px;
		height: 5px;
		border-radius: 50%;
		background-color: #0066CC;
		margin-top: 7px;
		flex-shrink: 0;
	}
}

.card-footer {
	display: flex;
	justify-content: center;
}

/* Buttons */
.btn-gradient {
	background: linear-gradient(135deg, #AAB9ED 0%, #A855F7 100%);
	color: #ffffff;
	border: none;
	font-size: 16px;
	font-weight: 700;
	padding: 14px 44px;
	border-radius: 50px;
	cursor: pointer;
	box-shadow: 0 4px 14px rgba(168, 85, 247, 0.3);
	transition: transform 0.2s, box-shadow 0.2s;

	&:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(168, 85, 247, 0.45);
	}
}

/* SOUL SECTION */
.soul-section {
	padding: 30px 0 70px;
}

.soul-card {
	background-color: #ecf4fd;
	border-radius: 40px;
	padding: 56px 48px;
	text-align: center;
}

.soul-header {
	display: inline-flex;
	align-items: baseline;
	gap: 4px;
	font-size: 26px;
	font-weight: 600;
	margin-bottom: 16px;

	.soul-logo-guest {
		color: #0066CC;
	}

	.soul-logo-amp {
		color: #333333;
		font-weight: 400;
	}

	.soul-logo-place {
		color: #333333;
	}

	.soul-title-text {
		color: #333333;
		font-weight: 400;
	}
}

.soul-lead {
	font-size: 16px;
	color: #333333;
	max-width: 560px;
	margin: 0 auto 36px;
	line-height: 1.5;
}

.soul-values-grid {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: 40px;
	max-width: 900px;
	margin: 0 auto;
	text-align: left;
}

.value-item {
	display: flex;
	align-items: center;
	gap: 16px;
}

.value-icon-box {
	width: 44px;
	height: 44px;
	flex-shrink: 0;
	border-radius: 12px;
	background: #ffffff;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 2px 10px rgba(0, 102, 204, 0.08);
}

.value-text {
	margin: 0;
	font-size: 15px;
	line-height: 1.4;
	color: #585f66;
}

/* STORY SECTIONS (Mission & Creation History) */
.story-section {
	padding: 50px 0;
}

.story-grid {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 50px;
	align-items: center;

	&.reverse-grid {
		grid-template-columns: 1fr 1fr;
	}
}

.story-content {
	.story-text {
		font-size: 16px;
		line-height: 1.6;
		color: #585f66;

		p {
			margin-bottom: 14px;
		}

		strong {
			font-weight: 600;
		}
	}
}

.story-media {
	.story-img {
		width: 100%;
		height: 320px;
		object-fit: cover;
		border-radius: 40px;
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
	}
}

/* NEWS SECTION */
.news-section {
	padding: 60px 0 90px;
}

.news-grid {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 30px;
}

.news-card {
	background: #ffffff;
	border-radius: 40px;
	padding: 40px 24px;
	box-shadow: 0px 4px 20px rgba(105, 78, 75, 0.1);
	display: flex;
	flex-direction: column;
	align-items: center;
	text-align: center;
	border: 1px solid rgba(0, 0, 0, 0.04);
	transition: transform 0.2s;

	&:hover {
		transform: translateY(-4px);
	}
}

.news-badge-circle {
	width: 90px;
	height: 90px;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-bottom: 24px;
	box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);

	&.badge-yellow {
		background: #F8DA75;
	}

	&.badge-orange {
		background: #F8BF95;
	}

	&.badge-coral {
		background: #EF8062;
	}
}

.news-card-title {
	margin: 0;
	font-size: 18px;
	font-weight: 600;
	color: #585f66;

	.text-accent {
		color: #0066CC;
	}
}

/* FOOTER */
.site-footer {
	border-top: 1px solid rgba(51, 51, 51, 0.08);
	padding: 40px 0 60px;
	position: relative;
}

.footer-border-flags {
	position: absolute;
	top: -15px;
	left: 0;
	right: 0;
	display: flex;
	justify-content: space-between;
	align-items: center;
	pointer-events: none;
	padding: 0 40px;
}

.flags-divider {
	flex-grow: 1;
	height: 1px;
	background: rgba(51, 51, 51, 0.08);
	margin: 0 10px;
}

.footer-container {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 40px;
}

.footer-brand {
	.footer-tagline {
		margin: 6px 0 0 0;
		font-size: 13px;
		color: #585f66;
	}
}

.footer-nav {
	display: flex;
	flex-wrap: wrap;
	gap: 20px;
}

.footer-link {
	color: #333333;
	text-decoration: none;
	font-size: 15px;
	transition: color 0.2s;

	&:hover {
		color: #0066CC;
	}
}

/* Responsive */
@media (max-width: 992px) {
	.cards-grid,
	.story-grid,
	.news-grid,
	.soul-values-grid {
		grid-template-columns: 1fr;
	}

	.story-grid.reverse-grid .story-media {
		order: 2;
	}

	.hero-decor {
		display: none;
	}

	.nav-links {
		display: none;
	}

	.footer-container {
		flex-direction: column;
		text-align: center;
	}
}
</style>

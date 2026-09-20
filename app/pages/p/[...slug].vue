<template>
	<div class="cms-dynamic-page">
		<!-- Live Preview Floating Bar -->
		<transition name="fade">
			<div v-if="isPreview" class="preview-banner">
				<div class="preview-banner-content">
					<span class="preview-dot" :class="{ 'is-connected': isConnectedToCms }"></span>
					<span class="preview-label">
						{{ isConnectedToCms ? 'Live Preview подключен (CMS Synced)' : 'Ожидание синхронизации с CMS...' }}
					</span>
					<span class="preview-status-pill" :class="`is-${page.status || 'draft'}`">
						{{ (page.status === 'published') ? '● ОПУБЛИКОВАНО' : (page.status === 'review') ? '● НА ПРОВЕРКЕ' : '● ЧЕРНОВИК' }}
					</span>
					<span class="preview-slug-badge">/p/{{ page.slug }}</span>
				</div>
			</div>
		</transition>

		<!-- HEADER -->
		<header class="site-header">
			<div class="header-top-bar">
				<div class="header-container top-container">
					<div class="city-selector">
						<svg class="icon-pin" width="14" height="18" viewBox="0 0 14 18" fill="none">
							<path d="M7 0C3.13401 0 0 3.13401 0 7C0 12.25 7 18 7 18C7 18 14 12.25 14 7C14 3.13401 10.866 0 7 0ZM7 9.5C5.61929 9.5 4.5 8.38071 4.5 7C4.5 5.61929 5.61929 4.5 7 4.5C8.38071 4.5 9.5 5.61929 9.5 7C9.5 8.38071 8.38071 9.5 7 9.5Z" fill="#333333"/>
						</svg>
						<span class="city-name">Москва</span>
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
						<button class="action-btn" aria-label="Профиль">
							<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#333333" stroke-width="2">
								<path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
								<circle cx="12" cy="12" r="4"/>
							</svg>
						</button>
					</div>
				</div>
			</div>

			<div class="header-main-bar">
				<div class="header-container main-container">
					<NuxtLink to="/" class="logo">
						<span class="logo-guest">Guest</span>
						<span class="logo-amp">&</span>
						<span class="logo-place">Place</span>
					</NuxtLink>

					<nav class="nav-links">
						<NuxtLink to="/about" class="nav-link">О платформе</NuxtLink>
						<NuxtLink to="/platforms" class="nav-link">Площадкам</NuxtLink>
						<NuxtLink to="/guests" class="nav-link">Гостям</NuxtLink>
					</nav>

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
					<span class="crumb-current">{{ page.title || 'Страница' }}</span>
				</nav>
			</div>
		</div>

		<!-- MAIN CONTENT: DYNAMIC BLOCK RENDERER -->
		<main class="page-content">
			<!-- Unpublished Placeholder for Public Visitors (Stage 2.1) -->
			<div v-if="!pending && page.status !== 'published' && !isPreview" class="empty-page-state">
				<div class="empty-icon">🚧</div>
				<h2>Страница находится в разработке</h2>
				<p>Эта страница ещё не опубликована администратором сайта и доступна только в режиме предпросмотра CMS.</p>
				<NuxtLink to="/" class="cta-link-btn" style="display:inline-block; margin-top: 12px">Вернуться на главную</NuxtLink>
			</div>

			<div v-else-if="page.blocks && page.blocks.length > 0">
				<BlockRenderer :blocks="page.blocks" />
			</div>

			<!-- Empty State -->
			<div v-else-if="!pending" class="empty-page-state">
				<div class="empty-icon">📄</div>
				<h2>{{ page.title || 'Страница пуста' }}</h2>
				<p>В этой странице пока нет добавленных блоков. Добавьте блоки через конструктор в админке.</p>
			</div>

			<!-- Loading State -->
			<div v-else class="loading-state">
				<div class="spinner"></div>
			</div>
		</main>

		<!-- FOOTER -->
		<footer class="site-footer">
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
					<NuxtLink to="/about" class="footer-link">О проекте</NuxtLink>
					<NuxtLink to="/platforms" class="footer-link">Площадкам</NuxtLink>
					<NuxtLink to="/guests" class="footer-link">Гостям</NuxtLink>
				</nav>
			</div>
		</footer>
	</div>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { useHead } from '#app'
import { useCmsBlocks } from '#shared/lib/composables'
import { BlockRenderer } from '#shared/ui/blocks'

const { page, pending, isPreview, isConnectedToCms } = useCmsBlocks()

// Dynamic SEO
watch(() => page.value, (curr) => {
	if (curr) {
		const seoTitle = curr.seo?.title || curr.title || 'Guest & Place'
		const seoDesc = curr.seo?.description || ''
		useHead({
			title: `${seoTitle} | Guest & Place`,
			meta: seoDesc ? [{ name: 'description', content: seoDesc }] : [],
		})
	}
}, { immediate: true, deep: true })
</script>

<style scoped>
.cms-dynamic-page {
	font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
	color: #333333;
	background-color: #FFFFFF;
	min-height: 100vh;
	display: flex;
	flex-direction: column;
}

.preview-banner {
	position: sticky;
	top: 0;
	z-index: 1000;
	background: #111827;
	color: #FFFFFF;
	padding: 8px 16px;
	border-bottom: 2px solid #0066CC;
}

.preview-banner-content {
	display: flex;
	align-items: center;
	gap: 10px;
	max-width: 1200px;
	margin: 0 auto;
	font-size: 13px;
}

.preview-dot {
	width: 8px;
	height: 8px;
	border-radius: 50%;
	background: #F59E0B;
}

.preview-dot.is-connected {
	background: #10B981;
}

.preview-status-pill {
	font-size: 11px;
	font-weight: 700;
	padding: 2px 8px;
	border-radius: 12px;
	background: #374151;
	color: #9ca3af;
}

.preview-status-pill.is-published {
	background: rgba(16, 185, 129, 0.2);
	color: #34d399;
	border: 1px solid rgba(16, 185, 129, 0.4);
}

.preview-status-pill.is-review {
	background: rgba(245, 158, 11, 0.2);
	color: #fbbf24;
	border: 1px solid rgba(245, 158, 11, 0.4);
}

.preview-status-pill.is-draft {
	background: rgba(156, 163, 175, 0.2);
	color: #d1d5db;
	border: 1px solid rgba(156, 163, 175, 0.4);
}

.preview-slug-badge {
	margin-left: auto;
	background: #1F2937;
	padding: 2px 8px;
	border-radius: 4px;
	font-family: monospace;
	font-size: 12px;
}

/* Site Header */
.site-header {
	background: #FFFFFF;
	border-bottom: 1px solid #EEEEEE;
}

.header-top-bar {
	border-bottom: 1px solid #F5F5F5;
	padding: 8px 0;
	font-size: 13px;
}

.header-container {
	max-width: 1200px;
	margin: 0 auto;
	padding: 0 20px;
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.city-selector {
	display: flex;
	align-items: center;
	gap: 6px;
	cursor: pointer;
}

.city-name {
	font-weight: 500;
}

.user-actions {
	display: flex;
	gap: 12px;
}

.action-btn {
	background: none;
	border: none;
	cursor: pointer;
	padding: 4px;
	display: flex;
	align-items: center;
}

.header-main-bar {
	padding: 16px 0;
}

.logo {
	font-size: 22px;
	font-weight: 800;
	text-decoration: none;
	letter-spacing: -0.02em;
}

.logo-guest {
	color: #333333;
}

.logo-amp {
	color: #0066CC;
	margin: 0 2px;
}

.logo-place {
	color: #333333;
}

.nav-links {
	display: flex;
	gap: 28px;
}

.nav-link {
	color: #555555;
	text-decoration: none;
	font-size: 15px;
	font-weight: 500;
	transition: color 0.2s;
}

.nav-link:hover {
	color: #0066CC;
}

.header-cta-group {
	display: flex;
	gap: 12px;
}

.cta-link-btn {
	background: none;
	border: none;
	color: #0066CC;
	font-size: 14px;
	font-weight: 600;
	cursor: pointer;
	padding: 6px 12px;
	border-radius: 6px;
	transition: background 0.2s;
}

.cta-link-btn:hover {
	background: #F0F6FF;
}

/* Breadcrumbs */
.breadcrumbs-section {
	padding: 16px 0;
	background: #FAFAFA;
}

.container {
	max-width: 1200px;
	margin: 0 auto;
	padding: 0 20px;
}

.breadcrumbs {
	font-size: 13px;
	display: flex;
	align-items: center;
	gap: 8px;
}

.crumb-link {
	color: #888888;
	text-decoration: none;
}

.crumb-sep {
	color: #CCCCCC;
}

.crumb-current {
	color: #333333;
	font-weight: 500;
}

.page-content {
	flex-grow: 1;
}

.empty-page-state {
	text-align: center;
	padding: 80px 20px;
	max-width: 500px;
	margin: 0 auto;
}

.empty-icon {
	font-size: 48px;
	margin-bottom: 16px;
}

.empty-page-state h2 {
	font-size: 22px;
	margin-bottom: 8px;
}

.empty-page-state p {
	font-size: 14px;
	color: #666666;
	line-height: 1.5;
}

.loading-state {
	display: flex;
	justify-content: center;
	padding: 80px 0;
}

.spinner {
	width: 36px;
	height: 36px;
	border: 3px solid #EEEEEE;
	border-top-color: #0066CC;
	border-radius: 50%;
	animation: spin 0.8s linear infinite;
}

@keyframes spin {
	to { transform: rotate(360deg); }
}

/* Footer */
.site-footer {
	background: #F9FAFB;
	border-top: 1px solid #EEEEEE;
	padding: 40px 0;
	margin-top: auto;
}

.footer-container {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.footer-tagline {
	font-size: 12px;
	color: #888888;
	margin-top: 4px;
}

.footer-nav {
	display: flex;
	gap: 20px;
}

.footer-link {
	color: #666666;
	text-decoration: none;
	font-size: 13px;
}

.footer-link:hover {
	color: #0066CC;
}

@media (max-width: 768px) {
	.nav-links, .header-cta-group {
		display: none;
	}
	.footer-container {
		flex-direction: column;
		gap: 20px;
		text-align: center;
	}
}
</style>

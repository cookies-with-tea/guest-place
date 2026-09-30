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

		<!-- HEADER (Stage 3.2 Dynamic Menus) -->
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

					<!-- Dynamic Header Links with Dropdowns -->
					<nav class="nav-links">
						<template v-if="headerItems && headerItems.length > 0">
							<div
								v-for="item in headerItems"
								:key="item.id"
								class="nav-item-wrapper"
								:class="{ 'has-children': item.children && item.children.length > 0 }"
							>
								<NuxtLink
									:to="item.url || '/'"
									:target="item.target || '_self'"
									class="nav-link"
								>
									{{ item.title }}
									<span v-if="item.children && item.children.length > 0" class="nav-caret">▾</span>
								</NuxtLink>

								<!-- Dropdown for nested items (3.2) -->
								<div v-if="item.children && item.children.length > 0" class="nav-dropdown">
									<NuxtLink
										v-for="sub in item.children"
										:key="sub.id"
										:to="sub.url || '/'"
										:target="sub.target || '_self'"
										class="dropdown-link"
									>
										{{ sub.title }}
									</NuxtLink>
								</div>
							</div>
						</template>
						<template v-else>
							<NuxtLink to="/about" class="nav-link">О платформе</NuxtLink>
							<NuxtLink to="/platforms" class="nav-link">Площадкам</NuxtLink>
							<NuxtLink to="/guests" class="nav-link">Гостям</NuxtLink>
						</template>
					</nav>

					<div class="header-cta-group">
						<button class="cta-link-btn">+ Разместить запрос</button>
						<button class="cta-link-btn">+ Добавить место</button>
					</div>
				</div>
			</div>
		</header>

		<!-- BREADCRUMBS (Stage 3.3 Dynamic Hierarchy) -->
		<div class="breadcrumbs-section">
			<div class="container">
				<nav class="breadcrumbs" aria-label="Хлебные крошки">
					<NuxtLink to="/" class="crumb-link">Главная</NuxtLink>
					<template v-for="(crumb, idx) in breadcrumbTrail" :key="crumb.id || idx">
						<span class="crumb-sep">/</span>
						<NuxtLink
							v-if="idx < breadcrumbTrail.length - 1"
							:to="`/p/${crumb.slug}`"
							class="crumb-link"
						>
							{{ crumb.title }}
						</NuxtLink>
						<span v-else class="crumb-current">{{ crumb.title }}</span>
					</template>
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

		<!-- FOOTER (Stage 3.2 Dynamic Footer Menu) -->
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
					<template v-if="footerItems && footerItems.length > 0">
						<NuxtLink
							v-for="item in footerItems"
							:key="item.id"
							:to="item.url || '/'"
							:target="item.target || '_self'"
							class="footer-link"
						>
							{{ item.title }}
						</NuxtLink>
					</template>
					<template v-else>
						<NuxtLink to="/about" class="footer-link">О проекте</NuxtLink>
						<NuxtLink to="/platforms" class="footer-link">Площадкам</NuxtLink>
						<NuxtLink to="/guests" class="footer-link">Гостям</NuxtLink>
					</template>
				</nav>
			</div>
		</footer>
	</div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useHead, useRoute } from '#app'
import { useCmsBlocks } from '#shared/lib/composables'
import { BlockRenderer } from '#shared/ui/blocks'

interface MenuItem {
	id: string
	title: string
	type: 'page' | 'url' | 'anchor'
	url?: string
	target?: '_self' | '_blank'
	children?: MenuItem[]
}

interface BreadcrumbItem {
	id: string
	title: string
	slug: string
}

const route = useRoute()
const { page, pending, isPreview, isConnectedToCms } = useCmsBlocks()

const headerItems = ref<MenuItem[]>([])
const footerItems = ref<MenuItem[]>([])
const breadcrumbs = ref<BreadcrumbItem[]>([])

// Load menus from API (Stage 3.2)
try {
	const [headerRes, footerRes] = await Promise.allSettled([
		$fetch<{ data?: { items?: MenuItem[] } }>('/api/v1/menus/header'),
		$fetch<{ data?: { items?: MenuItem[] } }>('/api/v1/menus/footer'),
	])

	if (headerRes.status === 'fulfilled' && headerRes.value?.data?.items) {
		headerItems.value = headerRes.value.data.items
	}
	if (footerRes.status === 'fulfilled' && footerRes.value?.data?.items) {
		footerItems.value = footerRes.value.data.items
	}
} catch {
	// Fallback to default static links in template
}

// Breadcrumb trail (Stage 3.3)
const slugParam = computed(() => {
	const s = route.params.slug
	return Array.isArray(s) ? s.join('/') : (s || '')
})

watch(
	() => slugParam.value,
	async (newSlug) => {
		if (!newSlug) return
		try {
			const res = await $fetch<{ data?: BreadcrumbItem[] }>(`/api/v1/pages/${encodeURIComponent(newSlug)}/breadcrumbs`)
			if (res?.data && res.data.length > 0) {
				breadcrumbs.value = res.data
			}
		} catch {
			breadcrumbs.value = []
		}
	},
	{ immediate: true },
)

const breadcrumbTrail = computed(() => {
	if (breadcrumbs.value.length > 0) {
		return breadcrumbs.value
	}
	return [
		{
			id: page.value?.id || 'current',
			title: page.value?.title || 'Страница',
			slug: page.value?.slug || slugParam.value,
		},
	]
})

// Dynamic SEO & Meta (Stage 3.1)
watch(
	() => page.value,
	(curr) => {
		if (curr) {
			const seoTitle = curr.seo?.title || curr.title || 'Guest & Place'
			const seoDesc = curr.seo?.description || ''
			const ogImage = curr.seo?.og_image || ''
			const canonical = curr.seo?.canonical || ''
			const noIndex = curr.seo?.no_index

			const metaList: any[] = [
				{ property: 'og:title', content: seoTitle },
				{ property: 'og:type', content: 'website' },
			]

			if (seoDesc) {
				metaList.push({ name: 'description', content: seoDesc })
				metaList.push({ property: 'og:description', content: seoDesc })
			}

			if (ogImage) {
				metaList.push({ property: 'og:image', content: ogImage })
			}

			if (noIndex) {
				metaList.push({ name: 'robots', content: 'noindex, nofollow' })
			} else {
				metaList.push({ name: 'robots', content: 'index, follow' })
			}

			const linkList: any[] = []
			if (canonical) {
				linkList.push({ rel: 'canonical', href: canonical })
			}

			const jsonLdBreadcrumb = {
				'@context': 'https://schema.org',
				'@type': 'BreadcrumbList',
				itemListElement: [
					{
						'@type': 'ListItem',
						position: 1,
						name: 'Главная',
						item: 'https://guestplace.ru/',
					},
					...breadcrumbTrail.value.map((crumb, idx) => ({
						'@type': 'ListItem',
						position: idx + 2,
						name: crumb.title,
						item: `https://guestplace.ru/p/${crumb.slug}`,
					})),
				],
			}

			useHead({
				title: `${seoTitle} | Guest & Place`,
				meta: metaList,
				link: linkList,
				script: [
					{
						type: 'application/ld+json',
						innerHTML: JSON.stringify(jsonLdBreadcrumb),
					},
				],
			})
		}
	},
	{ immediate: true, deep: true },
)
</script>

<style scoped>
.cms-dynamic-page {
	font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
	color: #333333;
	background-color: #ffffff;
	min-height: 100vh;
	display: flex;
	flex-direction: column;
}

.preview-banner {
	position: sticky;
	top: 0;
	z-index: 1000;
	background: #111827;
	color: #ffffff;
	padding: 8px 16px;
	border-bottom: 2px solid #0066cc;
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
	background: #f59e0b;
}

.preview-dot.is-connected {
	background: #10b981;
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
	background: #1f2937;
	padding: 2px 8px;
	border-radius: 4px;
	font-family: monospace;
	font-size: 12px;
}

/* Site Header */
.site-header {
	background: #ffffff;
	border-bottom: 1px solid #eeeeee;
}

.header-top-bar {
	border-bottom: 1px solid #f5f5f5;
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
	color: #0066cc;
	margin: 0 2px;
}

.logo-place {
	color: #333333;
}

.nav-links {
	display: flex;
	gap: 28px;
	align-items: center;
}

.nav-item-wrapper {
	position: relative;
	display: flex;
	align-items: center;
}

.nav-link {
	color: #555555;
	text-decoration: none;
	font-size: 15px;
	font-weight: 500;
	transition: color 0.2s;
	display: flex;
	align-items: center;
	gap: 4px;
	padding: 4px 0;
}

.nav-link:hover {
	color: #0066cc;
}

.nav-caret {
	font-size: 11px;
	color: #888888;
}

.nav-dropdown {
	display: none;
	position: absolute;
	top: 100%;
	left: 0;
	background: #ffffff;
	border: 1px solid #eeeeee;
	border-radius: 8px;
	box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
	padding: 8px 0;
	min-width: 190px;
	z-index: 100;
}

.nav-item-wrapper:hover .nav-dropdown {
	display: block;
}

.dropdown-link {
	display: block;
	padding: 8px 16px;
	color: #4b5563;
	font-size: 14px;
	text-decoration: none;
	transition: background 0.15s, color 0.15s;
}

.dropdown-link:hover {
	background: #f0f6ff;
	color: #0066cc;
}

.header-cta-group {
	display: flex;
	gap: 12px;
}

.cta-link-btn {
	background: none;
	border: none;
	color: #0066cc;
	font-size: 14px;
	font-weight: 600;
	cursor: pointer;
	padding: 6px 12px;
	border-radius: 6px;
	transition: background 0.2s;
}

.cta-link-btn:hover {
	background: #f0f6ff;
}

/* Breadcrumbs */
.breadcrumbs-section {
	padding: 16px 0;
	background: #fafafa;
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

.crumb-link:hover {
	color: #0066cc;
}

.crumb-sep {
	color: #cccccc;
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
	border: 3px solid #eeeeee;
	border-top-color: #0066cc;
	border-radius: 50%;
	animation: spin 0.8s linear infinite;
}

@keyframes spin {
	to {
		transform: rotate(360deg);
	}
}

/* Footer */
.site-footer {
	background: #f9fafb;
	border-top: 1px solid #eeeeee;
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
	color: #0066cc;
}

@media (max-width: 768px) {
	.nav-links,
	.header-cta-group {
		display: none;
	}
	.footer-container {
		flex-direction: column;
		gap: 20px;
		text-align: center;
	}
}
</style>

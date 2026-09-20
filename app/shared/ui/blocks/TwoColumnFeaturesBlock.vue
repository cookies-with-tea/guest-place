<template>
	<section class="two-column-features-block">
		<div class="container">
			<h2 class="section-title">
				<span>Возможности </span>
				<span class="text-accent">GP Platform</span>
			</h2>

			<div class="cards-grid">
				<!-- Left Card -->
				<div class="feature-card">
					<div class="card-header">
						<div class="card-icon-wrap">
							<svg width="22" height="26" viewBox="0 0 24 28" fill="none">
								<rect x="2" y="2" width="20" height="24" rx="4" stroke="#333333" stroke-width="2"/>
								<circle cx="12" cy="10" r="4" stroke="#333333" stroke-width="2"/>
								<path d="M6 22C6 18.6863 8.68629 16 12 16C15.3137 16 18 18.6863 18 22" stroke="#333333" stroke-width="2" stroke-linecap="round"/>
							</svg>
						</div>
						<h3 class="card-title">{{ data.left_title || 'Guest' }}</h3>
					</div>

					<ul class="features-list">
						<li v-for="(item, idx) in leftItems" :key="idx" class="feature-item">
							<span class="bullet-dot"></span>
							<span class="item-text">{{ item }}</span>
						</li>
					</ul>

					<div v-if="data.left_cta_text" class="card-footer">
						<NuxtLink :to="data.left_cta_link || '#'" class="btn-gradient">
							{{ data.left_cta_text }}
						</NuxtLink>
					</div>
				</div>

				<!-- Right Card -->
				<div class="feature-card">
					<div class="card-header">
						<div class="card-icon-wrap">
							<svg width="24" height="26" viewBox="0 0 24 28" fill="none">
								<path d="M3 24V9L12 2L21 9V24H3Z" stroke="#333333" stroke-width="2" stroke-linejoin="round"/>
								<rect x="8" y="14" width="8" height="10" stroke="#333333" stroke-width="2"/>
								<line x1="12" y1="14" x2="12" y2="24" stroke="#333333" stroke-width="2"/>
							</svg>
						</div>
						<h3 class="card-title">{{ data.right_title || 'Place' }}</h3>
					</div>

					<ul class="features-list">
						<li v-for="(item, idx) in rightItems" :key="idx" class="feature-item">
							<span class="bullet-dot"></span>
							<span class="item-text">{{ item }}</span>
						</li>
					</ul>

					<div v-if="data.right_cta_text" class="card-footer">
						<NuxtLink :to="data.right_cta_link || '#'" class="btn-gradient">
							{{ data.right_cta_text }}
						</NuxtLink>
					</div>
				</div>
			</div>
		</div>
	</section>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
	data: {
		left_title?: string
		left_items?: string | string[]
		left_cta_text?: string
		left_cta_link?: string
		right_title?: string
		right_items?: string | string[]
		right_cta_text?: string
		right_cta_link?: string
	}
}>()

function parseItems(items?: string | string[]): string[] {
	if (!items) return []
	if (Array.isArray(items)) return items
	if (typeof items === 'string') {
		try {
			const parsed = JSON.parse(items)
			if (Array.isArray(parsed)) return parsed
		} catch {
			// Plain text with newlines
			return items.split('\n').map(s => s.trim().replace(/^[-*•]\s*/, '')).filter(Boolean)
		}
	}
	return []
}

const leftItems = computed(() => {
	const parsed = parseItems(props.data.left_items)
	if (parsed.length) return parsed
	return [
		'Прямая связь с площадкой в режиме реального времени',
		'Актуальная информация, меню, цены, свободные даты',
		'Прямое онлайн бронирование и оплата',
		'Заказ столика, банкета, аренда помещения — все в одном месте',
		'Общение в чатах, видео-встречи, консультации менеджеров',
		'Личный кабинет и вся информация в одном месте',
	]
})

const rightItems = computed(() => {
	const parsed = parseItems(props.data.right_items)
	if (parsed.length) return parsed
	return [
		'Чаты, видео-встречи с клиентами',
		'Онлайн-показ площадки',
		'Прямые трансляции, новости, лента событий',
		'Прямое онлайн-бронирование и оплата',
		'Календарь бронирования в режиме реального времени',
		'Простое приложение в системе Учета',
	]
})
</script>

<style scoped>
.two-column-features-block {
	padding: 60px 0;
	background: #FAFAFA;
}

.container {
	max-width: 1200px;
	margin: 0 auto;
	padding: 0 20px;
}

.section-title {
	font-size: 32px;
	font-weight: 700;
	text-align: center;
	margin-bottom: 40px;
	color: #333333;
}

.text-accent {
	color: #0066CC;
}

.cards-grid {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 30px;
}

.feature-card {
	background: #FFFFFF;
	border-radius: 20px;
	padding: 40px;
	display: flex;
	flex-direction: column;
	box-shadow: 0 8px 24px rgba(0, 0, 0, 0.04);
	border: 1px solid #EEEEEE;
	transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.feature-card:hover {
	transform: translateY(-2px);
	box-shadow: 0 12px 30px rgba(0, 0, 0, 0.07);
}

.card-header {
	display: flex;
	align-items: center;
	gap: 16px;
	margin-bottom: 28px;
}

.card-icon-wrap {
	width: 48px;
	height: 48px;
	border-radius: 12px;
	background: #F4F7FB;
	display: flex;
	align-items: center;
	justify-content: center;
}

.card-title {
	font-size: 24px;
	font-weight: 700;
	color: #333333;
}

.features-list {
	list-style: none;
	padding: 0;
	margin: 0 0 32px 0;
	flex-grow: 1;
}

.feature-item {
	display: flex;
	align-items: flex-start;
	gap: 12px;
	margin-bottom: 16px;
}

.bullet-dot {
	width: 6px;
	height: 6px;
	border-radius: 50%;
	background: #0066CC;
	margin-top: 8px;
	flex-shrink: 0;
}

.item-text {
	font-size: 14px;
	line-height: 1.5;
	color: #555555;
}

.card-footer {
	margin-top: auto;
}

.btn-gradient {
	display: block;
	width: 100%;
	text-align: center;
	padding: 14px 24px;
	background: linear-gradient(135deg, #0066CC 0%, #0052A3 100%);
	color: #FFFFFF;
	font-weight: 600;
	font-size: 14px;
	border-radius: 30px;
	text-decoration: none;
	transition: opacity 0.2s;
}

.btn-gradient:hover {
	opacity: 0.95;
}

@media (max-width: 800px) {
	.cards-grid {
		grid-template-columns: 1fr;
	}
	.feature-card {
		padding: 24px;
	}
}
</style>

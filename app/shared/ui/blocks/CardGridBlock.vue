<template>
	<section class="card-grid-block">
		<div class="container">
			<h2 v-if="data.title" class="section-title">
				<span>{{ titlePrefix }} </span>
				<span v-if="titleAccent" class="text-accent">{{ titleAccent }}</span>
			</h2>

			<p v-if="data.subtitle" class="section-subtitle">{{ data.subtitle }}</p>

			<div class="news-grid">
				<div
					v-for="(card, idx) in cardsList"
					:key="idx"
					class="news-card"
				>
					<div class="news-badge-circle" :class="getBadgeClass(idx)">
						<span v-if="card.icon" class="badge-icon-text">{{ card.icon }}</span>
						<svg v-else width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#333333" stroke-width="2">
							<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
							<circle cx="9" cy="7" r="4"/>
						</svg>
					</div>
					<h3 class="news-card-title">{{ card.title }}</h3>
					<p v-if="card.desc" class="news-card-desc">{{ card.desc }}</p>
				</div>
			</div>
		</div>
	</section>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface CardItem {
	title: string
	desc?: string
	icon?: string
}

const props = defineProps<{
	data: {
		title?: string
		subtitle?: string
		cards?: string | CardItem[]
		card1_title?: string
		card1_desc?: string
		card1_icon?: string
		card2_title?: string
		card2_desc?: string
		card2_icon?: string
		card3_title?: string
		card3_desc?: string
		card3_icon?: string
	}
}>()

const titlePrefix = computed(() => {
	const raw = props.data.title || 'НАШИ НОВОСТИ'
	const words = raw.split(' ')
	if (words.length > 1) {
		return words.slice(0, -1).join(' ')
	}
	return raw
})

const titleAccent = computed(() => {
	const raw = props.data.title || 'НАШИ НОВОСТИ'
	const words = raw.split(' ')
	if (words.length > 1) {
		return words[words.length - 1]
	}
	return ''
})

const cardsList = computed<CardItem[]>(() => {
	// If cards JSON or array provided
	if (props.data.cards) {
		if (Array.isArray(props.data.cards)) return props.data.cards
		try {
			const parsed = JSON.parse(props.data.cards)
			if (Array.isArray(parsed)) return parsed
		} catch {
			// ignore
		}
	}

	// If explicit card1/card2/card3 fields provided
	const list: CardItem[] = []
	if (props.data.card1_title) {
		list.push({
			title: props.data.card1_title,
			desc: props.data.card1_desc,
			icon: props.data.card1_icon || '🏢',
		})
	}
	if (props.data.card2_title) {
		list.push({
			title: props.data.card2_title,
			desc: props.data.card2_desc,
			icon: props.data.card2_icon || '⚡',
		})
	}
	if (props.data.card3_title) {
		list.push({
			title: props.data.card3_title,
			desc: props.data.card3_desc,
			icon: props.data.card3_icon || '🎉',
		})
	}

	if (list.length > 0) return list

	// Default cards
	return [
		{ title: 'Площадкам', desc: 'Новые инструменты управления бронированиями', icon: '🏢' },
		{ title: 'Обновления', desc: 'Онлайн-просмотр и прямая связь с гостями', icon: '⚡' },
		{ title: 'События', desc: 'Мероприятия и банкеты без посредников', icon: '🎉' },
	]
})

function getBadgeClass(idx: number): string {
	const classes = ['badge-yellow', 'badge-orange', 'badge-coral']
	return classes[idx % classes.length] || 'badge-yellow'
}
</script>

<style scoped>
.card-grid-block {
	padding: 60px 0 80px;
	background: #FFFFFF;
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
	margin-bottom: 12px;
	color: #333333;
}

.section-subtitle {
	font-size: 16px;
	color: #666666;
	text-align: center;
	margin-bottom: 40px;
}

.text-accent {
	color: #0066CC;
}

.news-grid {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 30px;
}

.news-card {
	background: #FFFFFF;
	border: 1px solid #EEEEEE;
	border-radius: 20px;
	padding: 36px 24px;
	text-align: center;
	display: flex;
	flex-direction: column;
	align-items: center;
	box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03);
	transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.news-card:hover {
	transform: translateY(-4px);
	box-shadow: 0 12px 28px rgba(0, 0, 0, 0.07);
}

.news-badge-circle {
	width: 72px;
	height: 72px;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-bottom: 20px;
}

.badge-icon-text {
	font-size: 32px;
}

.badge-yellow {
	background: #FEF3C7;
}

.badge-orange {
	background: #FFEDD5;
}

.badge-coral {
	background: #FEE2E2;
}

.news-card-title {
	font-size: 18px;
	font-weight: 700;
	color: #333333;
	margin: 0 0 8px 0;
}

.news-card-desc {
	font-size: 14px;
	color: #666666;
	line-height: 1.5;
	margin: 0;
}

@media (max-width: 800px) {
	.news-grid {
		grid-template-columns: 1fr;
	}
}
</style>

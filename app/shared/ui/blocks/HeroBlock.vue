<template>
	<section class="hero-block">
		<!-- Left decorative illustration -->
		<div class="hero-decor decor-left">
			<svg width="140" height="280" viewBox="0 0 140 280" fill="none">
				<circle cx="70" cy="50" r="30" fill="#F8BF95" opacity="0.6"/>
				<path d="M40 70 Q70 30 100 70 Q120 180 70 270 Q20 180 40 70Z" fill="#F8BF95" opacity="0.4"/>
				<path d="M20 90 Q70 120 120 90 Q140 200 70 260 Q0 200 20 90Z" fill="#F8DA75" opacity="0.3"/>
				<circle cx="70" cy="45" r="12" fill="#EF8062" opacity="0.5"/>
			</svg>
		</div>

		<!-- Right decorative illustration -->
		<div class="hero-decor decor-right">
			<svg width="140" height="280" viewBox="0 0 140 280" fill="none">
				<circle cx="70" cy="50" r="26" fill="#AAB9ED" opacity="0.6"/>
				<path d="M45 80 L95 80 L110 270 L30 270 Z" fill="#0066CC" opacity="0.35"/>
				<path d="M55 80 L85 80 L70 120 Z" fill="#FFFFFF"/>
				<path d="M66 84 L74 84 L70 92 Z" fill="#EF8062"/>
			</svg>
		</div>

		<div class="container hero-container">
			<h1 class="hero-title">
				<span class="text-dark">{{ titlePrefix }}</span>
				<span class="text-accent">{{ titleAccent }}</span>
			</h1>

			<div v-if="subtitleLines.length" class="hero-subtitle">
				<p v-for="(line, idx) in subtitleLines" :key="idx">{{ line }}</p>
			</div>

			<div v-if="data.cta_text" class="hero-cta">
				<NuxtLink :to="data.cta_link || '#'" class="btn-gradient">
					{{ data.cta_text }}
				</NuxtLink>
			</div>
		</div>
	</section>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
	data: {
		title?: string
		subtitle?: string
		image?: string
		cta_text?: string
		cta_link?: string
	}
}>()

const titlePrefix = computed(() => {
	const raw = props.data.title || 'О платформе Guest & Place'
	if (raw.toLowerCase().includes('guest')) {
		return raw.split(/guest/i)[0]
	}
	return raw
})

const titleAccent = computed(() => {
	const raw = props.data.title || 'О платформе Guest & Place'
	if (raw.toLowerCase().includes('guest')) {
		const match = raw.match(/guest.*/i)
		return match ? match[0] : ''
	}
	return ''
})

const subtitleLines = computed(() => {
	const raw = props.data.subtitle || ''
	if (!raw) return []
	return raw.split('\n').filter(Boolean)
})
</script>

<style scoped>
.hero-block {
	position: relative;
	padding: 50px 0 60px;
	text-align: center;
	overflow: hidden;
	background: #FFFFFF;
}

.container {
	max-width: 1200px;
	margin: 0 auto;
	padding: 0 20px;
}

.hero-decor {
	position: absolute;
	top: 50%;
	transform: translateY(-50%);
	pointer-events: none;
}

.decor-left {
	left: 4%;
}

.decor-right {
	right: 4%;
}

.hero-title {
	font-size: 40px;
	font-weight: 700;
	margin-bottom: 24px;
	line-height: 1.2;
}

.text-dark {
	color: #333333;
}

.text-accent {
	color: #0066CC;
}

.hero-subtitle {
	font-size: 16px;
	line-height: 1.6;
	color: #666666;
	max-width: 680px;
	margin: 0 auto;
}

.hero-subtitle p {
	margin: 4px 0;
}

.hero-cta {
	margin-top: 32px;
}

.btn-gradient {
	display: inline-block;
	padding: 14px 32px;
	background: linear-gradient(135deg, #0066CC 0%, #0052A3 100%);
	color: #FFFFFF;
	font-weight: 600;
	font-size: 15px;
	border-radius: 30px;
	text-decoration: none;
	transition: opacity 0.2s ease, transform 0.2s ease;
	box-shadow: 0 4px 14px rgba(0, 102, 204, 0.3);
}

.btn-gradient:hover {
	opacity: 0.95;
	transform: translateY(-1px);
}

@media (max-width: 900px) {
	.hero-decor {
		display: none;
	}
	.hero-title {
		font-size: 30px;
	}
}
</style>

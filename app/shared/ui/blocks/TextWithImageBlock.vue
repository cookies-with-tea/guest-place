<template>
	<section class="text-with-image-block" :class="{ 'is-reversed': isReversed }">
		<div class="container story-grid" :class="{ 'reverse-grid': isReversed }">
			<!-- Text Content -->
			<div class="story-content">
				<h2 v-if="data.title_prefix || data.title_accent" class="section-title text-left">
					<span v-if="data.title_prefix">{{ data.title_prefix }} </span>
					<span v-if="data.title_accent" class="text-accent">{{ data.title_accent }}</span>
				</h2>

				<div class="story-text" v-html="sanitizedText"></div>
			</div>

			<!-- Image Media -->
			<div class="story-media">
				<img
					:src="imageUrl"
					:alt="data.title_accent || data.title_prefix || 'Иллюстрация'"
					class="story-img"
				/>
			</div>
		</div>
	</section>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
	data: {
		title_prefix?: string
		title_accent?: string
		text?: string
		image?: string
		image_position?: 'left' | 'right' | string
	}
}>()

const isReversed = computed(() => {
	const pos = (props.data.image_position || '').toLowerCase()
	return pos === 'left'
})

const imageUrl = computed(() => {
	return props.data.image || 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&auto=format&fit=crop&q=80'
})

const sanitizedText = computed(() => {
	const raw = props.data.text || ''
	if (!raw) {
		return '<p>Соединяем гостей и площадки, создавая простоту и прозрачность отношений.</p>'
	}
	// If plain text without tags, wrap in <p>
	if (!raw.includes('<p>') && !raw.includes('<div>')) {
		return `<p>${raw.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br/>')}</p>`
	}
	return raw
})
</script>

<style scoped>
.text-with-image-block {
	padding: 60px 0;
	background: #FFFFFF;
}

.text-with-image-block.is-reversed {
	background: #FAFAFA;
}

.container {
	max-width: 1200px;
	margin: 0 auto;
	padding: 0 20px;
}

.story-grid {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 60px;
	align-items: center;
}

.reverse-grid {
	direction: rtl;
}

.reverse-grid > * {
	direction: ltr;
}

.section-title {
	font-size: 32px;
	font-weight: 700;
	margin-bottom: 24px;
	color: #333333;
}

.text-left {
	text-align: left;
}

.text-accent {
	color: #0066CC;
}

.story-text {
	font-size: 15px;
	line-height: 1.7;
	color: #555555;
}

.story-text :deep(p) {
	margin-bottom: 16px;
}

.story-media {
	border-radius: 20px;
	overflow: hidden;
	box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08);
}

.story-img {
	width: 100%;
	height: 380px;
	object-fit: cover;
	display: block;
	transition: transform 0.3s ease;
}

.story-img:hover {
	transform: scale(1.02);
}

@media (max-width: 800px) {
	.story-grid {
		grid-template-columns: 1fr;
		gap: 32px;
	}
	.reverse-grid {
		direction: ltr;
	}
	.story-img {
		height: 260px;
	}
}
</style>

<template>
	<section
		class="cms-block block-video"
		:class="`theme-${style?.theme || 'light'}`"
		:style="customStyle"
	>
		<div class="video-container">
			<div v-if="data.title || data.subtitle" class="video-header">
				<h2 v-if="data.title" class="video-title">{{ data.title }}</h2>
				<p v-if="data.subtitle" class="video-subtitle">{{ data.subtitle }}</p>
			</div>

			<div class="video-player-wrapper" :style="{ aspectRatio: data.aspect_ratio || '16/9' }">
				<iframe
					v-if="isEmbed(data.video_url)"
					:src="getEmbedUrl(data.video_url)"
					class="video-frame"
					allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
					allowfullscreen
				/>
				<video
					v-else-if="data.video_url"
					:src="data.video_url"
					controls
					playsinline
					:poster="data.poster_url"
					class="video-element"
				/>
				<div v-else class="video-placeholder">
					<span class="video-icon">🎬</span>
					<span class="video-hint">Видео не выбрано</span>
				</div>
			</div>

			<p v-if="data.caption" class="video-caption">{{ data.caption }}</p>
		</div>
	</section>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
	data: {
		title?: string
		subtitle?: string
		video_url?: string
		poster_url?: string
		caption?: string
		aspect_ratio?: string
	}
	style?: {
		theme?: string
		padding?: string
		margin?: string
		backgroundColor?: string
		backgroundGradient?: string
		backgroundImage?: string
		customCss?: string
	}
}>()

const isEmbed = (url?: string) => {
	if (!url) return false
	return url.includes('youtube.com') || url.includes('youtu.be') || url.includes('vimeo.com')
}

const getEmbedUrl = (url?: string) => {
	if (!url) return ''
	if (url.includes('youtube.com/watch?v=')) {
		const id = url.split('v=')[1]?.split('&')[0]
		return `https://www.youtube.com/embed/${id}`
	}
	if (url.includes('youtu.be/')) {
		const id = url.split('youtu.be/')[1]?.split('?')[0]
		return `https://www.youtube.com/embed/${id}`
	}
	if (url.includes('vimeo.com/')) {
		const id = url.split('vimeo.com/')[1]?.split('?')[0]
		return `https://player.vimeo.com/video/${id}`
	}
	return url
}

const customStyle = computed(() => {
	const s: Record<string, string> = {}
	if (props.style?.backgroundColor) s.backgroundColor = props.style.backgroundColor
	if (props.style?.backgroundGradient) s.background = props.style.backgroundGradient
	if (props.style?.backgroundImage) {
		s.backgroundImage = `url(${props.style.backgroundImage})`
		s.backgroundSize = 'cover'
		s.backgroundPosition = 'center'
	}
	return s
})
</script>

<style scoped>
.block-video {
	padding: 48px 0;
}

.video-container {
	max-width: 1000px;
	margin: 0 auto;
	padding: 0 20px;
}

.video-header {
	text-align: center;
	margin-bottom: 24px;
}

.video-title {
	font-size: 32px;
	font-weight: 700;
	margin: 0 0 8px;
	color: inherit;
}

.video-subtitle {
	font-size: 16px;
	opacity: 0.8;
	margin: 0;
	color: inherit;
}

.video-player-wrapper {
	width: 100%;
	border-radius: 16px;
	overflow: hidden;
	box-shadow: 0 12px 36px rgba(0, 0, 0, 0.15);
	background: #000;
	display: flex;
	align-items: center;
	justify-content: center;
	position: relative;
}

.video-frame,
.video-element {
	width: 100%;
	height: 100%;
	border: none;
	display: block;
	object-fit: cover;
}

.video-placeholder {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 12px;
	color: #888;
}

.video-icon {
	font-size: 48px;
}

.video-caption {
	margin-top: 12px;
	font-size: 14px;
	text-align: center;
	opacity: 0.7;
}

.theme-dark {
	background: #0f172a;
	color: #fff;
}

.theme-accent {
	background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
	color: #fff;
}

.theme-muted {
	background: #f8fafc;
	color: #1e293b;
}
</style>

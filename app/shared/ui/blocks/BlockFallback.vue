<template>
	<div class="block-fallback-wrapper">
		<!-- Dev & Preview Mode Banner -->
		<div v-if="isDevOrPreview" class="block-fallback">
			<div class="block-fallback__header">
				<div class="block-fallback__badge">
					<span class="block-fallback__icon">⚠️</span>
					<span class="block-fallback__title">
						Блок <strong>«{{ blockType }}»</strong> ещё не свёрстан на фронтенде
					</span>
				</div>
				<span class="block-fallback__tag">CMS Fallback</span>
			</div>
			<p class="block-fallback__hint">
				Фронтенд-разработчик может зарегистрировать этот блок с помощью <code>registerCmsBlock({ type: '{{ blockType }}', ... })</code>.
			</p>
			<details v-if="hasData" class="block-fallback__details">
				<summary class="block-fallback__summary">Посмотреть данные блока (JSON)</summary>
				<pre class="block-fallback__pre">{{ formattedData }}</pre>
			</details>
		</div>

		<!-- Production Mode: Graceful silent container -->
		<div v-else class="block-fallback-prod" :data-missing-block="blockType" />
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
	blockType: string
	data?: Record<string, any>
	blockId?: string
}>()

const isDevOrPreview = computed(() => {
	if (import.meta.dev) return true
	if (typeof window !== 'undefined') {
		const isIframe = window.parent && window.parent !== window
		const urlParams = new URLSearchParams(window.location.search)
		if (isIframe || urlParams.get('preview') === 'true') {
			return true
		}
	}
	return false
})

const hasData = computed(() => {
	return props.data && Object.keys(props.data).length > 0
})

const formattedData = computed(() => {
	try {
		return JSON.stringify(props.data, null, 2)
	} catch {
		return String(props.data)
	}
})
</script>

<style scoped>
.block-fallback-wrapper {
	width: 100%;
	padding: 16px 0;
}

.block-fallback {
	max-width: 1200px;
	margin: 0 auto;
	padding: 20px 24px;
	background: #FFFBEB;
	border: 2px dashed #F59E0B;
	border-radius: 12px;
	font-family: inherit;
	color: #92400E;
}

.block-fallback__header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 12px;
	margin-bottom: 8px;
}

.block-fallback__badge {
	display: flex;
	align-items: center;
	gap: 10px;
}

.block-fallback__icon {
	font-size: 20px;
}

.block-fallback__title {
	font-size: 16px;
	font-weight: 500;
	color: #78350F;
}

.block-fallback__tag {
	font-size: 11px;
	text-transform: uppercase;
	letter-spacing: 0.05em;
	padding: 3px 8px;
	background: #FEF3C7;
	border: 1px solid #FDE68A;
	border-radius: 6px;
	font-weight: 600;
	color: #B45309;
}

.block-fallback__hint {
	font-size: 13px;
	color: #B45309;
	margin: 0 0 12px 0;
	line-height: 1.5;
}

.block-fallback__hint code {
	background: #FEF3C7;
	padding: 2px 6px;
	border-radius: 4px;
	font-family: monospace;
	font-size: 12px;
}

.block-fallback__details {
	margin-top: 10px;
}

.block-fallback__summary {
	font-size: 12px;
	cursor: pointer;
	color: #B45309;
	font-weight: 600;
	user-select: none;
}

.block-fallback__summary:hover {
	text-decoration: underline;
}

.block-fallback__pre {
	margin-top: 8px;
	padding: 12px;
	background: #1E293B;
	color: #F8FAFC;
	border-radius: 8px;
	font-size: 12px;
	overflow-x: auto;
}

.block-fallback-prod {
	display: none;
}
</style>

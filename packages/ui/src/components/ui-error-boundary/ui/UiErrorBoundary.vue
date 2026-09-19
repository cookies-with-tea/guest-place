<template>
	<!-- MFE Loading Failure (503) -->
	<UiMfeFallback
		v-if="error && isMfeLoadError"
		:error="error"
		:on-retry="retry"
	/>

	<!-- Generic Component Runtime Error (500) -->
	<div v-else-if="error" class="error-boundary-container glass-card">
		<div class="error-content">
			<div class="icon-wrapper">
				<el-icon class="status-icon"><WarningFilled /></el-icon>
			</div>

			<div class="badge-row">
				<el-tag effect="dark" size="small" type="warning">
					{{ errorStatus }}
				</el-tag>
			</div>

			<h2 class="error-title">Ошибка при отображении компонента</h2>

			<p class="error-desc">
				В работе этого раздела интерфейса произошла ошибка. Вы можете повторить попытку или вернуться на главную страницу.
			</p>

			<div v-if="errorDetails" class="error-accordion">
				<button class="error-toggle" type="button" @click="showDetails = !showDetails">
					<el-icon><component :is="showDetails ? ArrowDown : ArrowRight" /></el-icon>
					<span>Технические детали ошибки</span>
				</button>
				<el-collapse-transition>
					<div v-show="showDetails" class="error-details-box">
						<pre class="error-code"><code>{{ errorDetails }}</code></pre>
					</div>
				</el-collapse-transition>
			</div>

			<div class="error-actions">
				<el-button :icon="RefreshRight" size="large" type="primary" @click="retry">
					Повторить попытку
				</el-button>
				<el-button :icon="HomeFilled" size="large" @click="goHome">
					На главную
				</el-button>
			</div>
		</div>
	</div>

	<slot v-else></slot>
</template>

<script setup lang="ts">
import { computed, onErrorCaptured, ref } from 'vue'

import {
	ArrowDown,
	ArrowRight,
	HomeFilled,
	RefreshRight,
	WarningFilled,
} from '@element-plus/icons-vue'

import UiMfeFallback from '../../ui-mfe-fallback/ui/UiMfeFallback.vue'

const error = ref<any>(null)
const showDetails = ref(false)

onErrorCaptured((err) => {
	error.value = err
	console.error('[ErrorBoundary] Captured error:', err)
	return false // Prevent error from propagating further
})

const isMfeLoadError = computed(() => {
	if (!error.value) return false
	const str = String(error.value?.message || error.value?.original?.message || error.value || '')
	return (
		str.includes('Failed to fetch dynamically imported module') ||
		str.includes('remoteEntry') ||
		str.includes('Script load error') ||
		Boolean(error.value?.remoteName)
	)
})

const errorStatus = computed(() => {
	if (error.value?.status) return `${error.value.status} Error`
	if (error.value?.statusCode) return `${error.value.statusCode} Error`
	return 'Runtime Error'
})

const errorDetails = computed(() => {
	if (!error.value) return ''
	if (typeof error.value === 'string') return error.value
	if (error.value instanceof Error) {
		return `${error.value.name}: ${error.value.message}\n\nStack:\n${error.value.stack || 'No stack trace available'}`
	}
	try {
		return JSON.stringify(error.value, null, 2)
	} catch {
		return String(error.value)
	}
})

const retry = () => {
	error.value = null
	return true
}

const goHome = () => {
	window.location.href = '/'
}
</script>

<style scoped lang="scss">
.error-boundary-container {
	min-height: 380px;
	display: flex;
	align-items: center;
	justify-content: center;
	margin: 24px auto;
	max-width: 680px;
	padding: 40px;
	border-radius: 20px;
	background: var(--gp-bg-glass, rgba(255, 255, 255, 0.7));
	backdrop-filter: blur(16px);
	-webkit-backdrop-filter: blur(16px);
	border: 1px solid var(--gp-glass-border, rgba(255, 255, 255, 0.15));
	box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08);
	transition: all 0.3s ease;
}

.error-content {
	width: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;
	text-align: center;
}

.icon-wrapper {
	width: 64px;
	height: 64px;
	border-radius: 50%;
	background: rgba(230, 162, 60, 0.12);
	display: flex;
	align-items: center;
	justify-content: center;
	margin-bottom: 16px;
}

.status-icon {
	font-size: 36px;
	color: #e6a23c;
}

.badge-row {
	margin-bottom: 12px;
}

.error-title {
	font-size: 20px;
	font-weight: 700;
	color: var(--gp-text-main, #1e293b);
	margin: 0 0 8px 0;
}

.error-desc {
	font-size: 14px;
	line-height: 1.6;
	color: var(--gp-text-secondary, #64748b);
	max-width: 480px;
	margin: 0 0 24px 0;
}

.error-accordion {
	width: 100%;
	margin-bottom: 24px;
	text-align: left;
}

.error-toggle {
	display: inline-flex;
	align-items: center;
	gap: 6px;
	background: transparent;
	border: none;
	cursor: pointer;
	font-size: 13px;
	color: var(--gp-text-secondary, #64748b);
	padding: 6px 10px;
	border-radius: 6px;
	transition: all 0.2s ease;

	&:hover {
		color: var(--gp-primary, #409eff);
		background: rgba(64, 158, 255, 0.08);
	}
}

.error-details-box {
	margin-top: 10px;
	background: #0f172a;
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: 10px;
	padding: 14px;
	max-height: 220px;
	overflow-y: auto;
}

.error-code {
	margin: 0;
	font-family: 'JetBrains Mono', 'Fira Code', monospace;
	font-size: 12px;
	line-height: 1.5;
	color: #fca5a5;
	white-space: pre-wrap;
	word-break: break-all;
}

.error-actions {
	display: flex;
	gap: 12px;
	justify-content: center;
}
</style>

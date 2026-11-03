<template>
	<!-- MFE Loading Failure (503) -->
	<UiMfeFallback v-if="error && isMfeLoadError" :error="error" :on-retry="retry" />

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
				В работе этого раздела интерфейса произошла ошибка. Вы можете повторить попытку или вернуться на главную
				страницу.
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
				<el-button :icon="RefreshRight" size="large" type="primary" @click="retry"> Повторить попытку </el-button>
				<el-button :icon="HomeFilled" size="large" @click="goHome"> На главную </el-button>
			</div>
		</div>
	</div>

	<slot v-else></slot>
</template>

<script setup lang="ts">
import { computed, onErrorCaptured, ref } from 'vue'

import { ArrowDown, ArrowRight, HomeFilled, RefreshRight, WarningFilled } from '@element-plus/icons-vue'

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
	max-width: 680px;
	display: flex;
	align-items: center;
	justify-content: center;
	border: 1px solid var(--gp-glass-border, rgb(255, 255, 255, 0.15));
	border-radius: 20px;
	box-shadow: 0 12px 32px rgb(0, 0, 0, 0.08);
	background: var(--gp-bg-glass, rgb(255, 255, 255, 0.7));
	transition: all 0.3s ease;
	padding: 40px;
	margin: 24px auto;
	-webkit-backdrop-filter: blur(16px);
	backdrop-filter: blur(16px);
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
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 50%;
	background: rgb(230, 162, 60, 0.12);
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
	font-weight: 700;
	font-size: 20px;
	color: var(--gp-text-main, #1e293b);
	margin: 0 0 8px;
}

.error-desc {
	max-width: 480px;
	font-size: 14px;
	line-height: 1.6;
	color: var(--gp-text-secondary, #64748b);
	margin: 0 0 24px;
}

.error-accordion {
	width: 100%;
	text-align: left;
	margin-bottom: 24px;
}

.error-toggle {
	display: inline-flex;
	align-items: center;
	border: none;
	border-radius: 6px;
	font-size: 13px;
	color: var(--gp-text-secondary, #64748b);
	background: transparent;
	transition: all 0.2s ease;
	cursor: pointer;
	padding: 6px 10px;
	gap: 6px;

	&:hover {
		color: var(--gp-primary, #409eff);
		background: rgb(64, 158, 255, 0.08);
	}
}

.error-details-box {
	max-height: 220px;
	border: 1px solid rgb(255, 255, 255, 0.1);
	border-radius: 10px;
	background: #0f172a;
	padding: 14px;
	margin-top: 10px;
	overflow-y: auto;
}

.error-code {
	font-family: 'JetBrains Mono', 'Fira Code', monospace;
	font-size: 12px;
	line-height: 1.5;
	word-break: break-all;
	white-space: pre-wrap;
	color: #fca5a5;
	margin: 0;
}

.error-actions {
	display: flex;
	justify-content: center;
	gap: 12px;
}
</style>

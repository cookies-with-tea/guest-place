<template>
	<div class="mfe-fallback-container glass-card">
		<div class="ambient-glow" />

		<div class="mfe-fallback-content">
			<!-- Status Icon -->
			<div class="icon-wrapper">
				<el-icon class="status-icon"><WarningFilled /></el-icon>
				<div class="pulse-ring" />
			</div>

			<!-- Status Badges -->
			<div class="badge-row">
				<el-tag effect="dark" size="small" type="danger">503 Service Unavailable</el-tag>
				<el-tag v-if="remoteName" effect="plain" size="small" type="info">MFE: {{ remoteName }}</el-tag>
				<el-tag v-if="retryCount > 0" effect="plain" size="small" type="warning">
					Попыток: {{ retryCount }}
				</el-tag>
			</div>

			<!-- Heading -->
			<h2 class="fallback-title">Сервис временно недоступен</h2>

			<!-- Description -->
			<p class="fallback-desc">
				Не удалось подключиться к микрофронтенду
				<strong v-if="displayName">{{ displayName }}</strong>
				<span v-else>{{ remoteName || 'модулю' }}</span>.
				Локальный dev-сервер может быть остановлен или не отвечает на запросы.
			</p>

			<!-- Endpoint Card -->
			<div v-if="url" class="endpoint-card">
				<div class="endpoint-info">
					<span class="endpoint-label">Entry Point URL</span>
					<code class="endpoint-url">{{ url }}</code>
				</div>
				<el-tooltip :content="copied ? 'Скопировано!' : 'Скопировать URL'" placement="top">
					<el-button circle :icon="copied ? Check : CopyDocument" size="small" @click="copyUrl" />
				</el-tooltip>
			</div>

			<!-- Technical Error Details (Collapsible) -->
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

			<!-- Actions -->
			<div class="fallback-actions">
				<el-button
					:icon="RefreshRight"
					:loading="isRetrying"
					size="large"
					type="primary"
					@click="handleRetry"
				>
					Повторить попытку
				</el-button>

				<el-button
					v-if="showHomeButton"
					:icon="HomeFilled"
					plain
					size="large"
					@click="navigateHome"
				>
					На главную
				</el-button>

				<el-button
					v-if="showDiagnosticsButton"
					:icon="Monitor"
					plain
					size="large"
					@click="navigateOrchestrator"
				>
					Оркестратор
				</el-button>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

import {
	ArrowDown,
	ArrowRight,
	Check,
	CopyDocument,
	HomeFilled,
	Monitor,
	RefreshRight,
	WarningFilled,
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

interface Props {
	remoteName?: string
	displayName?: string
	url?: string
	error?: any
	showHomeButton?: boolean
	showDiagnosticsButton?: boolean
	onRetry?: () => Promise<boolean | void> | boolean | void
}

const props = withDefaults(defineProps<Props>(), {
	remoteName: '',
	displayName: '',
	url: '',
	error: null,
	showHomeButton: true,
	showDiagnosticsButton: true,
	onRetry: undefined,
})

const emit = defineEmits<{
	(e: 'retry'): void
}>()

const router = useRouter()
const isRetrying = ref(false)
const retryCount = ref(0)
const showDetails = ref(false)
const copied = ref(false)

const errorDetails = computed(() => {
	if (!props.error) return ''
	if (typeof props.error === 'string') return props.error
	if (props.error.stack) return props.error.stack
	if (props.error.message) return props.error.message

	try {
		return JSON.stringify(props.error, null, 2)
	} catch {
		return String(props.error)
	}
})

const copyUrl = async () => {
	if (!props.url) return

	try {
		await navigator.clipboard.writeText(props.url)
		copied.value = true
		setTimeout(() => {
			copied.value = false
		}, 2000)
		ElMessage.success('URL скопирован в буфер обмена')
	} catch {
		ElMessage.info('Не удалось скопировать URL')
	}
}

const handleRetry = async () => {
	isRetrying.value = true
	retryCount.value++

	try {
		if (props.onRetry) {
			const result = await props.onRetry()

			if (result === false) {
				ElMessage.warning('Сервис по-прежнему недоступен. Проверьте запуск dev-сервера.')
			} else {
				ElMessage.success('Успешное подключение к модулю!')
			}
		} else {
			emit('retry')

			// Ping entry URL if available
			if (props.url) {
				try {
					const res = await fetch(props.url, { method: 'GET' })

					if (res.ok) {
						ElMessage.success('Сервис ответил успешно! Перезагрузка модуля...')
						setTimeout(() => {
							window.location.reload()
						}, 600)

						return
					}
				} catch {
					// Fall through to warning
				}
			}

			ElMessage.warning('Сервис по-прежнему недоступен. Проверьте запуск dev-сервера.')
		}
	} catch (e: any) {
		ElMessage.error(`Ошибка при повторной попытке: ${e.message || 'Сбой сети'}`)
	} finally {
		isRetrying.value = false
	}
}

const navigateHome = () => {
	if (router) {
		router.push('/')
	} else {
		window.location.href = '/'
	}
}

const navigateOrchestrator = () => {
	if (router) {
		router.push('/orchestrator/modules')
	} else {
		window.location.href = '/orchestrator/modules'
	}
}
</script>

<style scoped lang="scss">
.mfe-fallback-container {
	position: relative;
	min-height: 480px;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 48px 24px;
	margin: 24px auto;
	max-width: 760px;
	border-radius: 16px;
	border: 1px solid rgba(255, 95, 95, 0.2);
	background: linear-gradient(145deg, rgba(30, 20, 20, 0.6) 0%, rgba(15, 15, 15, 0.9) 100%);
	backdrop-filter: blur(20px);
	box-shadow: 0 12px 36px rgba(0, 0, 0, 0.4), 0 0 24px rgba(255, 95, 95, 0.08) inset;
	overflow: hidden;
}

.ambient-glow {
	position: absolute;
	top: -30%;
	left: 50%;
	transform: translateX(-50%);
	width: 320px;
	height: 320px;
	border-radius: 50%;
	background: radial-gradient(circle, rgba(255, 95, 95, 0.15) 0%, transparent 70%);
	pointer-events: none;
	filter: blur(40px);
}

.mfe-fallback-content {
	position: relative;
	z-index: 1;
	width: 100%;
	max-width: 580px;
	display: flex;
	flex-direction: column;
	align-items: center;
	text-align: center;
}

.icon-wrapper {
	position: relative;
	width: 80px;
	height: 80px;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-bottom: 20px;
}

.status-icon {
	font-size: 52px;
	color: #ff5f5f;
	z-index: 2;
	filter: drop-shadow(0 0 12px rgba(255, 95, 95, 0.4));
}

.pulse-ring {
	position: absolute;
	width: 72px;
	height: 72px;
	border-radius: 50%;
	border: 2px solid rgba(255, 95, 95, 0.4);
	animation: pulse-ring 2.4s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
}

@keyframes pulse-ring {
	0% {
		transform: scale(0.8);
		opacity: 0.8;
	}
	50% {
		transform: scale(1.3);
		opacity: 0.2;
	}
	100% {
		transform: scale(1.6);
		opacity: 0;
	}
}

.badge-row {
	display: flex;
	align-items: center;
	gap: 8px;
	margin-bottom: 16px;
}

.fallback-title {
	font-size: 1.65rem;
	font-weight: 700;
	letter-spacing: -0.3px;
	color: var(--gp-text-main, #fff);
	margin: 0 0 12px;
}

.fallback-desc {
	font-size: 0.95rem;
	line-height: 1.6;
	color: var(--gp-text-secondary, #a0aec0);
	margin: 0 0 24px;

	strong {
		color: var(--gp-text-main, #fff);
	}
}

.endpoint-card {
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 10px 16px;
	border-radius: 10px;
	background: rgba(0, 0, 0, 0.3);
	border: 1px solid rgba(255, 255, 255, 0.08);
	margin-bottom: 20px;
	gap: 12px;
}

.endpoint-info {
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	overflow: hidden;
}

.endpoint-label {
	font-size: 0.7rem;
	font-weight: 600;
	text-transform: uppercase;
	letter-spacing: 0.5px;
	color: var(--gp-text-muted, #718096);
}

.endpoint-url {
	font-family: 'JetBrains Mono', monospace, ui-monospace;
	font-size: 0.8rem;
	color: var(--gp-primary, #42b883);
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	max-width: 440px;
}

.error-accordion {
	width: 100%;
	margin-bottom: 24px;
}

.error-toggle {
	background: transparent;
	border: none;
	cursor: pointer;
	display: flex;
	align-items: center;
	gap: 6px;
	font-size: 0.8rem;
	color: var(--gp-text-muted, #718096);
	padding: 4px 0;
	transition: color 0.2s;

	&:hover {
		color: var(--gp-text-secondary, #cbd5e0);
	}
}

.error-details-box {
	margin-top: 8px;
	padding: 12px;
	border-radius: 8px;
	background: rgba(0, 0, 0, 0.4);
	border: 1px solid rgba(255, 95, 95, 0.15);
	text-align: left;
	max-height: 160px;
	overflow-y: auto;
}

.error-code {
	margin: 0;
	font-family: monospace;
	font-size: 0.75rem;
	color: #ff9999;
	white-space: pre-wrap;
	word-break: break-all;
}

.fallback-actions {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	justify-content: center;
	gap: 12px;
}
</style>

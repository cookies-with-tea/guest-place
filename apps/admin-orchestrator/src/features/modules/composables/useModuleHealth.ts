import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import type { ComputedRef } from 'vue'

import { GP_EVENTS, useEvents } from '@admin-panel/lib'
import { ElMessage } from 'element-plus'

import { systemApi } from '#entities/mfe'

interface HealthItem {
	status: 'online' | 'offline' | 'checking'
	latency?: number | null
	chunkSize?: number | null
	statusCode?: number
	lastChecked: number
	error?: string
}

const AUTO_PING_INTERVAL_MS = 15000
const HEALTH_CHECK_TIMEOUT_MS = 6000

/** Live health-checking (ping), auto-ping lifecycle and dashboard metrics for the MFE list. */
export const useModuleHealth = (microfrontends: ComputedRef<any[]>) => {
	const { dispatch } = useEvents()

	const healthMap = ref<Record<string, HealthItem>>({})
	const backendHealth = ref<any>(null)
	const isCheckingAll = ref(false)
	const isAutoPingActive = ref(true)
	let autoPingTimer: ReturnType<typeof setInterval> | null = null

	const checkHealth = async (url: string) => {
		if (!url) return

		healthMap.value[url] = {
			...(healthMap.value[url] || {}),
			status: 'checking',
			lastChecked: Date.now(),
		}

		const startTime = performance.now()
		const controller = new AbortController()
		const timeoutId = setTimeout(() => controller.abort(), HEALTH_CHECK_TIMEOUT_MS)

		try {
			const res = await fetch(url, {
				method: 'GET',
				signal: controller.signal,
			})

			clearTimeout(timeoutId)

			const latency = Math.round(performance.now() - startTime)

			let chunkSize = 0
			const contentLength = res.headers.get('content-length')

			if (contentLength) {
				chunkSize = parseInt(contentLength, 10)
			} else {
				const blob = await res.blob()

				chunkSize = blob.size
			}

			healthMap.value[url] = {
				status: res.ok ? 'online' : 'offline',
				latency,
				chunkSize,
				statusCode: res.status,
				lastChecked: Date.now(),
			}
		} catch (err: any) {
			clearTimeout(timeoutId)

			healthMap.value[url] = {
				status: 'offline',
				latency: null,
				chunkSize: null,
				error: err.name === 'AbortError' ? 'Timeout (6s)' : err.message || 'Сбой сети',
				lastChecked: Date.now(),
			}
		}
	}

	const checkBackendHealth = async () => {
		try {
			const res = await systemApi.getHealth()

			if (res.data) {
				backendHealth.value = res.data
				healthMap.value.orchestrator = {
					status: 'online',
					latency: 2,
					lastChecked: Date.now(),
				}
			} else {
				healthMap.value.orchestrator = {
					status: 'offline',
					lastChecked: Date.now(),
				}
			}
		} catch {
			healthMap.value.orchestrator = {
				status: 'offline',
				lastChecked: Date.now(),
			}
		}
	}

	const checkAllHealth = async () => {
		isCheckingAll.value = true

		const promises = microfrontends.value.map((m: any) => {
			if (m.name === 'orchestrator') return checkBackendHealth()
			if (m.url) return checkHealth(m.url)
			return Promise.resolve()
		})

		await Promise.all(promises)

		isCheckingAll.value = false
	}

	const getStatus = (row: any): 'online' | 'offline' | 'checking' => {
		if (row.name === 'orchestrator') {
			return healthMap.value.orchestrator?.status || 'checking'
		}

		return healthMap.value[row.url]?.status || 'checking'
	}

	const onlineCount = computed(() => microfrontends.value.filter((m: any) => getStatus(m) === 'online').length)

	const offlineCount = computed(() => microfrontends.value.filter((m: any) => getStatus(m) === 'offline').length)

	const avgLatency = computed(() => {
		const latencies = Object.values(healthMap.value)
			.map((h) => h.latency)
			.filter((l): l is number => typeof l === 'number' && l > 0)

		if (!latencies.length) return null

		const sum = latencies.reduce((acc, curr) => acc + curr, 0)

		return Math.round(sum / latencies.length)
	})

	const totalChunkBytes = computed(() => Object.values(healthMap.value).reduce((acc, h) => acc + (h.chunkSize || 0), 0))

	const getLatencyType = (latency?: number | null) => {
		if (latency === undefined || latency === null) return 'info'
		if (latency < 50) return 'success'
		if (latency < 200) return 'warning'
		return 'danger'
	}

	const formatBytes = (bytes?: number | null) => {
		if (!bytes || bytes === 0) return '0 B'

		const k = 1024
		const sizes = ['B', 'KB', 'MB', 'GB']
		const i = Math.floor(Math.log(bytes) / Math.log(k))

		return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
	}

	const handleHotReload = async (mfe: any) => {
		ElMessage.info(`Инициирован сброс кэша для ${mfe.displayName}...`)

		const res = await systemApi.reloadModule(mfe.name)

		if (res) {
			ElMessage.success(`Backend кэш для ${mfe.name} успешно очищен`)
		}

		Object.keys(localStorage).forEach((key) => {
			if (key.includes(mfe.name) || key.includes(mfe.scope)) {
				localStorage.removeItem(key)
			}
		})

		Object.keys(sessionStorage).forEach((key) => {
			if (key.includes(mfe.name) || key.includes(mfe.scope)) {
				sessionStorage.removeItem(key)
			}
		})

		dispatch(GP_EVENTS.FORCE_RELOAD, { name: mfe.name })

		setTimeout(() => {
			window.location.reload()
		}, 800)
	}

	onMounted(() => {
		checkAllHealth()

		autoPingTimer = setInterval(() => {
			if (isAutoPingActive.value) checkAllHealth()
		}, AUTO_PING_INTERVAL_MS)
	})

	onUnmounted(() => {
		if (autoPingTimer) clearInterval(autoPingTimer)
	})

	return reactive({
		healthMap,
		backendHealth,
		isCheckingAll,
		isAutoPingActive,
		onlineCount,
		offlineCount,
		avgLatency,
		totalChunkBytes,
		checkAllHealth,
		checkHealth,
		getStatus,
		getLatencyType,
		formatBytes,
		handleHotReload,
	})
}

export type ModuleHealth = ReturnType<typeof useModuleHealth>

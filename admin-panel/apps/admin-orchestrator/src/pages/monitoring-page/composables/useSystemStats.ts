import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import type { ComputedRef } from 'vue'

import { snakeToCamel } from '@admin-panel/lib'

import type { SystemStats } from '#entities/system/model'

const MAX_HISTORY = 30

/** Live system/process stats over SSE, their sparkline history, and the MFE/system-process
 * views derived from them for the monitoring dashboard. */
export const useSystemStats = (microfrontends: ComputedRef<any[]>) => {
	const stats = ref<SystemStats>({
		cpuUsage: 0,
		memoryUsed: 0,
		memoryTotal: 0,
		uptime: 0,
		processes: [],
	})

	// History for sparklines
	const history = ref<Record<string, { cpu: number[]; mem: number[] }>>({})

	let eventSource: EventSource | null = null

	const connectStats = () => {
		eventSource = new EventSource('/api/v1/system/stats/stream')

		eventSource.onmessage = (event) => {
			try {
				const rawData = JSON.parse(event.data)
				const data = snakeToCamel(rawData) as SystemStats

				if (data) {
					stats.value = data

					// Update history
					data.processes.forEach((p: any) => {
						if (!history.value[p.name]) {
							history.value[p.name] = { cpu: [], mem: [] }
						}

						const h = history.value[p.name]

						h.cpu.push(p.cpuUsage)

						h.mem.push(p.memoryUsed)

						if (h.cpu.length > MAX_HISTORY) h.cpu.shift()
						if (h.mem.length > MAX_HISTORY) h.mem.shift()
					})
				}
			} catch {
				// eslint-disable-next-line no-console
				console.error('Failed to parse stats stream')
			}
		}

		eventSource.onerror = () => {
			eventSource?.close()

			setTimeout(connectStats, 5000)
		}
	}

	// Combined MFE + Process data
	const mfeMetrics = computed(() => {
		const allMfes = microfrontends.value || []

		return allMfes.map((m) => {
			const process = stats.value.processes.find(
				(p) => p.name.toLowerCase() === (m.displayName || m.name).toLowerCase()
			)

			return {
				...m,
				process,
				isOnline: !!process,
			}
		})
	})

	const systemProcesses = computed(() => stats.value.processes.filter((p) => p.isSystem))

	const memPercentage = computed(() => {
		if (stats.value.memoryTotal === 0) return 0

		return (stats.value.memoryUsed / stats.value.memoryTotal) * 100
	})

	const cpuTagType = computed(() => {
		if (stats.value.cpuUsage > 80) return 'danger'
		if (stats.value.cpuUsage > 50) return 'warning'

		return 'success'
	})

	const memTagType = computed(() => {
		if (memPercentage.value > 85) return 'danger'
		if (memPercentage.value > 60) return 'warning'

		return 'success'
	})

	onMounted(() => {
		connectStats()
	})

	onUnmounted(() => {
		eventSource?.close()
	})

	return reactive({
		stats,
		history,
		mfeMetrics,
		systemProcesses,
		memPercentage,
		cpuTagType,
		memTagType,
	})
}

export type SystemStatsState = ReturnType<typeof useSystemStats>

export const formatBytes = (bytes: number) => {
	if (bytes === 0) return '0 B'

	const k = 1024
	const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
	const i = Math.floor(Math.log(bytes) / Math.log(k))

	return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

export const formatUptime = (seconds: number) => {
	const days = Math.floor(seconds / (24 * 3600))
	const hours = Math.floor((seconds % (24 * 3600)) / 3600)
	const minutes = Math.floor((seconds % 3600) / 60)
	const secs = seconds % 60

	return `${days}d ${hours}h ${minutes}m ${secs}s`
}

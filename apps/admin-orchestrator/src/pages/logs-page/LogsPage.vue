<template>
	<div class="logs-page">
		<el-card class="logs-card glass-card">
			<template #header>
				<div class="logs-header">
					<div class="logs-header__left">
						<span>System Logs (Real-time)</span>
						<el-tag :type="status === 'connected' ? 'success' : 'danger'" size="small">
							{{ status }}
						</el-tag>
					</div>
					<div class="logs-header__right">
						<el-input v-model="filter" placeholder="Filter logs..." size="small" style="width: 200px">
							<template #prefix
								><el-icon><Search /></el-icon
							></template>
						</el-input>
						<el-button size="small" @click="logs = []">Clear</el-button>
						<el-checkbox v-model="autoScroll" size="small">Auto-scroll</el-checkbox>
					</div>
				</div>
			</template>
			<div ref="logContainer" class="log-viewport">
				<div v-for="(log, index) in filteredLogs" :key="index" class="log-line">
					<span class="log-timestamp">[{{ new Date().toLocaleTimeString() }}]</span>
					<span class="log-message">{{ log }}</span>
				</div>
				<div v-if="logs.length === 0" class="logs-empty"> Waiting for logs... </div>
			</div>
		</el-card>
	</div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

import { Search } from '@element-plus/icons-vue'

const logs = ref<string[]>([])
const filter = ref('')
const status = ref<'connecting' | 'connected' | 'disconnected'>('connecting')
const autoScroll = ref(true)
const logContainer = ref<HTMLElement | null>(null)

const filteredLogs = computed(() => {
	if (!filter.value) return logs.value
	const q = filter.value.toLowerCase()

	return logs.value.filter((l) => l.toLowerCase().includes(q))
})

let eventSource: EventSource | null = null

const connect = () => {
	status.value = 'connecting'

	eventSource = new EventSource('/api/v1/system/logs')

	eventSource.onopen = () => {
		status.value = 'connected'
	}

	eventSource.onmessage = (event) => {
		logs.value.push(event.data)

		if (logs.value.length > 1000) logs.value.shift()
	}

	eventSource.onerror = () => {
		status.value = 'disconnected'

		eventSource?.close()

		setTimeout(connect, 5000)
	}
}

watch(
	logs,
	() => {
		if (autoScroll.value && logContainer.value) {
			setTimeout(() => {
				if (logContainer.value) {
					logContainer.value.scrollTop = logContainer.value.scrollHeight
				}
			}, 0)
		}
	},
	{ deep: true }
)

onMounted(() => {
	connect()
})

onUnmounted(() => {
	eventSource?.close()
})
</script>

<style scoped>
.logs-page {
	height: 100%;
}

.logs-card {
	height: 100%;
	display: flex;
	flex-direction: column;
}

.logs-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.logs-header__left,
.logs-header__right {
	display: flex;
	align-items: center;
	gap: 12px;
}

.log-viewport {
	height: 600px;
	border-radius: 8px;
	font-family: 'Fira Code', monospace;
	font-size: 0.85rem;
	color: #e0e0e0;
	background: rgb(0, 0, 0, 0.3);
	padding: 12px;
	overflow-y: auto;
}

.log-line {
	line-height: 1.4;
	word-break: break-all;
	white-space: pre-wrap;
	margin-bottom: 4px;
}

.log-timestamp {
	color: var(--gp-text-disabled);
	margin-right: 8px;
}

.logs-empty {
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	color: var(--gp-text-disabled);
}
</style>

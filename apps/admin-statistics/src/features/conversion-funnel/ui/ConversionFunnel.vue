<template>
	<el-card class="conversion-funnel">
		<template #header>
			<div class="card-header">
				<span>Conversion Funnel</span>
			</div>
		</template>

		<div v-if="loading" class="loading-state">
			<el-skeleton :rows="3" animated />
		</div>

		<div v-else class="funnel-container">
			<div v-for="(step, index) in steps" :key="step.name" class="funnel-step">
				<div class="step-card" :style="{ width: `${80 - index * 15}%` }">
					<div class="step-name">{{ step.name }}</div>
					<div class="step-stats">
						<span class="count">{{ step.count }}</span>
						<span class="percentage">{{ step.percentage.toFixed(1) }}%</span>
					</div>
				</div>
				<div v-if="index < steps.length - 1" class="step-arrow">
					<el-icon><ArrowDown /></el-icon>
					<span class="dropoff">
						Drop off: {{ (steps[index].percentage - steps[index + 1].percentage).toFixed(1) }}%
					</span>
				</div>
			</div>
		</div>
	</el-card>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

import { ArrowDown } from '@element-plus/icons-vue'

import { analyticsApi, type FunnelStats } from '#entities/analytics'

const props = defineProps<{
	days: number
}>()

const steps = ref<FunnelStats>([])
const loading = ref(true)

const loadData = async () => {
	loading.value = true

	const res = await analyticsApi.getFunnel({ days: props.days })

	loading.value = false

	if (res.data) {
		steps.value = res.data
	}
}

watch(() => props.days, loadData)

onMounted(loadData)
</script>

<style scoped lang="scss">
.conversion-funnel {
	height: 100%;
}

.card-header {
	font-weight: 600;
}

.funnel-container {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 20px 0;
}

.funnel-step {
	width: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;
}

.step-card {
	min-width: 200px;
	display: flex;
	align-items: center;
	justify-content: space-between;
	border: 1px solid var(--gp-glass-border);
	border-radius: 8px;
	background: var(--gp-bg-page);
	transition: all 0.3s ease;
	padding: 16px;

	&:hover {
		border-color: var(--gp-primary);
		transform: translateY(-2px);
	}
}

.step-name {
	font-weight: 600;
	font-size: 14px;
}

.step-stats {
	display: flex;
	flex-direction: column;
	align-items: flex-end;
}

.count {
	font-weight: 700;
	font-size: 18px;
	color: var(--gp-primary);
}

.percentage {
	font-size: 12px;
	color: var(--gp-text-secondary);
}

.step-arrow {
	display: flex;
	flex-direction: column;
	align-items: center;
	color: var(--gp-text-secondary);
	padding: 10px 0;

	.el-icon {
		font-size: 20px;
	}
}

.dropoff {
	font-size: 11px;
	margin-top: 4px;
}
</style>

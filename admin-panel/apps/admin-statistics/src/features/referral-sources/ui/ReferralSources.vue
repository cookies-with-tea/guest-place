<template>
	<el-card class="referral-sources">
		<template #header>
			<div class="card-header">
				<span>Referral Sources</span>
			</div>
		</template>

		<div v-if="loading" class="loading-state">
			<el-skeleton :rows="5" animated />
		</div>

		<div v-else class="referral-list">
			<div v-for="item in referrals" :key="item.source" class="referral-item">
				<div class="referral-info">
					<span class="source">{{ item.source }}</span>
					<span class="percentage">{{ item.percentage.toFixed(1) }}%</span>
				</div>
				<el-progress :percentage="item.percentage" :show-text="false" :stroke-width="8" color="var(--gp-primary)" />
				<div class="referral-count">{{ item.count }} sessions</div>
			</div>
		</div>
	</el-card>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

import { analyticsApi, type ReferralStats } from '#entities/analytics'

const props = defineProps<{
	days: number
}>()

const referrals = ref<ReferralStats>([])
const loading = ref(true)

const loadData = async () => {
	loading.value = true

	const res = await analyticsApi.getReferrals({ days: props.days })

	loading.value = false

	if (res.data) {
		referrals.value = res.data
	}
}

watch(() => props.days, loadData)

onMounted(loadData)
</script>

<style scoped lang="scss">
.referral-sources {
	height: 100%;
}

.card-header {
	font-weight: 600;
	font-size: 16px;
}

.referral-list {
	display: flex;
	flex-direction: column;
	gap: 16px;
}

.referral-item {
	display: flex;
	flex-direction: column;
	gap: 4px;
}

.referral-info {
	display: flex;
	align-items: center;
	justify-content: space-between;
	font-size: 14px;
}

.source {
	font-weight: 500;
}

.percentage {
	color: var(--gp-text-secondary);
}

.referral-count {
	font-size: 12px;
	text-align: right;
	color: var(--gp-text-secondary);
	margin-top: 4px;
}
</style>

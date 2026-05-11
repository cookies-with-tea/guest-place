<template>
	<div class="analytics-page">
		<div class="page-header">
			<div class="header-info">
				<h1>Statistic Dashboard</h1>
				<p class="subtitle">Insights and performance metrics for Guest Place CMS</p>
			</div>
			<div class="header-actions">
				<ElRadioGroup v-model="days" size="large" class="period-selector">
					<ElRadioButton :label="7">7 Days</ElRadioButton>
					<ElRadioButton :label="30">30 Days</ElRadioButton>
					<ElRadioButton :label="90">90 Days</ElRadioButton>
				</ElRadioGroup>
				<ElButton type="primary" :icon="Refresh" @click="refreshData">Refresh</ElButton>
				<ElButton :icon="Download">Export Report</ElButton>
			</div>
		</div>

		<!-- Summary Widgets -->
		<AnalyticsSummary :days="days" />

		<!-- Main Charts Row -->
		<div class="charts-row">
			<TrafficChart :days="days" class="flex-2" />
			<EngagementStats :days="days" class="flex-1" />
		</div>

		<!-- Bottom Row (Advanced Analytics) -->
		<div class="charts-row">
			<RetentionCohorts :days="days" class="flex-2" />
			<div class="column-stack flex-1">
				<ConversionFunnel :days="days" />
				<ReferralSources :days="days" class="mt-24" />
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import { Download, Refresh } from '@element-plus/icons-vue'
import { ElButton, ElRadioButton,ElRadioGroup } from 'element-plus'

import ConversionFunnel from '../features/conversion-funnel/ui/ConversionFunnel.vue'
import ReferralSources from '../features/referral-sources/ui/ReferralSources.vue'
import RetentionCohorts from '../features/retention-cohorts/ui/RetentionCohorts.vue'
import AnalyticsSummary from '../widgets/analytics-summary/ui/AnalyticsSummary.vue'
import EngagementStats from '../widgets/engagement-stats/ui/EngagementStats.vue'
import TrafficChart from '../widgets/traffic-chart/ui/TrafficChart.vue'

const days = ref(30)

const refreshData = () => {
	// Logic to refresh data from API
	window.location.reload()
}
</script>

<style scoped lang="scss">
.analytics-page {
	display: flex;
	flex-direction: column;
	padding: 24px;
	gap: 24px;
}

.page-header {
	display: flex;
	justify-content: space-between;

	.header-actions {
		display: flex;
		align-items: center;
		gap: 16px;

		.period-selector {
			margin-right: 8px;
		}
	}

	.subtitle {
		color: var(--gp-text-secondary);
		margin: 4px 0 0;
	}
}

.charts-row {
	display: flex;
	gap: 24px;

	@media (width <= 1200px) {
		flex-direction: column;
	}
}

.flex-1 {
	flex: 1;
}

.flex-2 {
	flex: 2;
}

.column-stack {
	display: flex;
	flex-direction: column;
	gap: 24px;
}

.mt-24 {
	margin-top: 0; // Gap handles it
}
</style>

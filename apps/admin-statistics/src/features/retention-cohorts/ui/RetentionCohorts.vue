<template>
	<el-card class="retention-cohorts">
		<template #header>
			<div class="card-header">
				<span>User Retention (Cohorts)</span>
			</div>
		</template>

		<div v-if="loading" class="loading-state">
			<el-skeleton :rows="4" animated />
		</div>

		<div v-else class="table-wrapper">
			<table class="cohort-table">
				<thead>
					<tr>
						<th>Cohort</th>
						<th>Users</th>
						<th v-for="i in maxMonths" :key="i">Month {{ i - 1 }}</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="row in cohorts" :key="row.cohortMonth">
						<td class="cohort-label">{{ row.cohortMonth }}</td>
						<td class="total-users">{{ row.totalUsers }}</td>
						<td
							v-for="(rate, index) in row.retentionRates"
							:key="index"
							class="rate-cell"
							:style="{ backgroundColor: getBgColor(rate) }"
						>
							{{ rate.toFixed(0) }}%
						</td>
						<!-- Empty cells if cohort is too new -->
						<td v-for="i in maxMonths - (row.retentionRates?.length || 0)" :key="'empty-' + i"></td>
					</tr>
				</tbody>
			</table>
		</div>
	</el-card>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'

import { analyticsApi, type RetentionStats } from '#entities/analytics'

const props = defineProps<{
	days: number
}>()

const cohorts = ref<RetentionStats>([])
const loading = ref(true)

const maxMonths = computed(() => {
	if (!cohorts.value.length) return 0

	return Math.max(...cohorts.value.map((c) => c.retentionRates?.length || 0))
})

const getBgColor = (rate: number) => {
	const opacity = rate / 100

	return `rgba(66, 184, 131, ${opacity})` // Vue green with opacity
}

const loadData = async () => {
	loading.value = true

	const res = await analyticsApi.getRetention({ days: props.days })

	loading.value = false

	if (res.data) {
		cohorts.value = res.data
	}
}

watch(() => props.days, loadData)

onMounted(loadData)
</script>

<style scoped lang="scss">
.retention-cohorts {
	height: 100%;
}

.table-wrapper {
	overflow-x: auto;
}

.cohort-table {
	width: 100%;
	border-collapse: collapse;
	font-size: 13px;

	th,
	td {
		border: 1px solid var(--gp-glass-border);
		text-align: center;
		padding: 12px;
	}

	th {
		font-weight: 600;
		color: var(--gp-text-secondary);
		background: var(--gp-bg-page);
	}

	.cohort-label {
		font-weight: 600;
		text-align: left;
		background: var(--gp-bg-page);
	}

	.total-users {
		color: var(--gp-text-secondary);
	}

	.rate-cell {
		font-weight: 500;
		text-shadow: 0 1px 2px rgb(0, 0, 0, 0.1);
		color: var(--gp-text-primary);
	}
}
</style>

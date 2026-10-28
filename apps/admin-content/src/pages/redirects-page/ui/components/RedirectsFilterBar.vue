<template>
	<UiFilterBar :total-label="`Всего правил: ${redirects.filteredRedirects.length}`">
		<el-input
			v-model="redirects.searchQuery"
			placeholder="Поиск по исходному или целевому URL..."
			clearable
			style="width: 320px"
		>
			<template #prefix>🔍</template>
		</el-input>

		<el-select v-model="redirects.codeFilter" style="width: 180px">
			<el-option label="Все коды статуса" value="all" />
			<el-option label="301 Постоянный" :value="301" />
			<el-option label="302 Временный" :value="302" />
		</el-select>

		<el-select v-model="redirects.statusFilter" style="width: 160px">
			<el-option label="Все статусы" value="all" />
			<el-option label="Только активные" value="active" />
			<el-option label="Только неактивные" value="inactive" />
		</el-select>
	</UiFilterBar>
</template>

<script setup lang="ts">
import { UiFilterBar } from '@admin-panel/ui'

import type { RedirectsData } from '../../composables/useRedirectsData'

defineProps<{
	redirects: RedirectsData
}>()
</script>

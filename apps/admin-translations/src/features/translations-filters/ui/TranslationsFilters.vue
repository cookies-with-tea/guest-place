<template>
	<div class="translations-filters">
		<div class="translations-filters__main">
			<el-select
				v-model="filters.namespace"
				class="translations-filters__item"
				clearable
				filterable
				placeholder="Namespace"
				popper-class="dark-select"
			>
				<el-option v-for="ns in allNamespaces" :key="ns" :label="ns" :value="ns" />
			</el-select>

			<el-select
				v-model="filters.locale"
				class="translations-filters__item"
				clearable
				filterable
				placeholder="Language"
				popper-class="dark-select"
			>
				<el-option v-for="lang in allLanguages" :key="lang" :label="lang" :value="lang" />
			</el-select>

			<el-input v-model="filters.search" class="translations-filters__item search" clearable placeholder="Search..." />
		</div>

		<el-button type="primary" @click="openAddModal">
			<el-icon><Plus /></el-icon>
			Add translation
		</el-button>
	</div>
</template>

<script setup lang="ts">
import { Plus } from '@element-plus/icons-vue'

import { useTranslations } from '#entities/translation/lib/composables'

const { filters, openAddModal, allNamespaces, allLanguages } = useTranslations()
</script>

<style scoped>
.translations-filters {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 24px;
	gap: 20px;
}

.translations-filters__main {
	display: flex;
	gap: 12px;
	flex: 1;
}

.translations-filters__item {
	width: 180px;
}

.translations-filters__item.search {
	flex: 1;
	max-width: 400px;
}
</style>

<template>
	<div class="translations-filters">
		<el-select
			v-model="filters.namespace"
			class="translations-filters__select"
			clearable
			filterable
			placeholder="Namespace"
		>
			<el-option v-for="ns in allNamespaces" :key="ns" :label="ns" :value="ns" />
		</el-select>

		<el-select
			v-model="filters.locale"
			class="translations-filters__select"
			clearable
			filterable
			placeholder="Language"
		>
			<el-option v-for="lang in allLanguages" :key="lang" :label="lang" :value="lang" />
		</el-select>

		<el-input v-model="filters.search" class="translations-filters__search" clearable placeholder="Search by key" />

		<el-button class="translations-filters__add-btn" type="primary" @click="openAddModal"> Add translation </el-button>
	</div>
</template>

<script setup lang="ts">
import { useTranslations } from '#entities/translation/lib/composables'

const { filters, openAddModal, allNamespaces, allLanguages } = useTranslations()
</script>

<style scoped>
.translations-filters {
	display: flex;
	flex-wrap: wrap;
	align-items: end;
	margin-bottom: 24px;
	gap: 16px;
}

.translations-filters__select,
.translations-filters__search {
	width: 200px;
}

.translations-filters__add-btn {
	height: 40px;
}
</style>

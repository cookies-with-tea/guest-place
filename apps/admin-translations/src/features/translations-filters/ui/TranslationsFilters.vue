<template>
	<div class="translations-filters">
		<el-select
			v-model="filters.namespace"
			filterable
			clearable
			placeholder="Namespace"
			class="translations-filters__select"
		>
			<el-option v-for="ns in namespaces" :key="ns" :label="ns" :value="ns" />
		</el-select>

		<el-select
			v-model="filters.language"
			filterable
			clearable
			placeholder="Language"
			class="translations-filters__select"
		>
			<el-option v-for="lang in languages" :key="lang" :label="lang" :value="lang" />
		</el-select>

		<el-input v-model="filters.search" placeholder="Search by key" clearable class="translations-filters__search" />

		<el-button type="primary" @click="openAddModal" class="translations-filters__add-btn"> Add translation </el-button>
	</div>
</template>

<script setup lang="ts">
import { useTranslations } from '#entities/translation/lib/composables'

const { filters, openAddModal } = useTranslations()

const namespaces = ['common', 'auth', 'profile', 'admin']
const languages = ['ru', 'en', 'es', 'fr']
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

<template>
	<div class="page-list-view">
		<PageListHeader :actions="actions" />
		<ArchitectureInfoStrip />

		<div class="page-content">
			<div v-if="pagesAndSchemas.loading" class="loading-container">
				<el-skeleton animated :rows="4" />
			</div>

			<PageListFilterBar :list="list" :pages-and-schemas="pagesAndSchemas" />

			<PagesGrid :list="list" :pages-and-schemas="pagesAndSchemas" :actions="actions" />
		</div>
	</div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePageListActions } from '#features/page-list/composables/usePageListActions'
import { usePagesAndSchemas } from '#features/page-list/composables/usePagesAndSchemas'
import { useUnifiedPageList } from '#features/page-list/composables/useUnifiedPageList'
import ArchitectureInfoStrip from '#features/page-list/ui/ArchitectureInfoStrip.vue'
import PageListFilterBar from '#features/page-list/ui/PageListFilterBar.vue'
import PageListHeader from '#features/page-list/ui/PageListHeader.vue'
import PagesGrid from '#features/page-list/ui/PagesGrid.vue'

const router = useRouter()

const pagesAndSchemas = usePagesAndSchemas()
const list = useUnifiedPageList(pagesAndSchemas)
const actions = usePageListActions(pagesAndSchemas, router)

onMounted(() => {
	pagesAndSchemas.fetchData()
})
</script>

<style scoped>
.page-list-view {
	min-height: 100%;
	color: var(--text-primary);
	background: var(--bg-page, transparent);
	padding: 24px 32px;
}
</style>

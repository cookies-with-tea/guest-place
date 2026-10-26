<template>
	<div class="modules-page">
		<ModulesStatsGrid :total="mfe.microfrontends.length" :health="health" />

		<ModulesTable
			:microfrontends="mfe.microfrontends"
			:is-loading="mfe.isLoading"
			:health="health"
			:routes="routes"
			:mfe="mfe"
		/>

		<ModuleRoutesDrawer :routes="routes" />

		<ModuleFormDialog :mfe="mfe" />
	</div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useMfe } from '#entities/mfe'

import { useModuleHealth } from '#features/modules/composables/useModuleHealth'
import { useModuleRoutes } from '#features/modules/composables/useModuleRoutes'
import ModuleFormDialog from '#features/modules/ui/ModuleFormDialog.vue'
import ModuleRoutesDrawer from '#features/modules/ui/ModuleRoutesDrawer.vue'
import ModulesStatsGrid from '#features/modules/ui/ModulesStatsGrid.vue'
import ModulesTable from '#features/modules/ui/ModulesTable.vue'

const route = useRoute()
const router = useRouter()

const mfeRaw = useMfe()
const mfe = reactive(mfeRaw)
const health = useModuleHealth(mfeRaw.microfrontends)
const routes = useModuleRoutes()

watch(
	() => mfe.microfrontends,
	(newMfes) => {
		if (route.query.edit && newMfes.length > 0) {
			const mfeToEdit = newMfes.find((m: any) => m.id === route.query.edit)

			if (mfeToEdit) {
				mfe.handleEdit(mfeToEdit)
			}

			router.replace({ query: {} })
		}
	},
	{ immediate: true, deep: true }
)
</script>

<style scoped>
.modules-page {
	padding: 0;
}
</style>

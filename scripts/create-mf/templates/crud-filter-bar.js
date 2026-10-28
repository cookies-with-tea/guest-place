export function getCrudFilterBar(entityPlural, entityPluralCamel) {
	return `<template>
	<UiFilterBar :total-label="\`Total: \${${entityPluralCamel}.filteredItems.length}\`">
		<el-input v-model="${entityPluralCamel}.searchQuery" placeholder="Search by name..." clearable style="width: 280px">
			<template #prefix>🔍</template>
		</el-input>

		<el-select v-model="${entityPluralCamel}.statusFilter" style="width: 160px">
			<el-option label="All statuses" value="all" />
			<el-option label="Active only" value="active" />
			<el-option label="Inactive only" value="inactive" />
		</el-select>
	</UiFilterBar>
</template>

<script setup lang="ts">
import { UiFilterBar } from '@admin-panel/ui'

import type { ${entityPlural}Data } from '../../composables/use${entityPlural}Data'

defineProps<{
	${entityPluralCamel}: ${entityPlural}Data
}>()
</script>
`
}

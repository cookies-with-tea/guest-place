export function getCrudPageHeader(displayName, entityPlural, entityPluralCamel) {
	return `<template>
	<div class="page-header">
		<div class="page-header__left">
			<h1>${displayName}</h1>
			<p class="page-subtitle">Manage ${entityPluralCamel}.</p>
		</div>
		<div class="page-header__actions">
			<el-button type="primary" @click="${entityPluralCamel}.openCreateDialog"> + Create </el-button>
		</div>
	</div>
</template>

<script setup lang="ts">
import type { ${entityPlural}Data } from '../../composables/use${entityPlural}Data'

defineProps<{
	${entityPluralCamel}: ${entityPlural}Data
}>()
</script>

<style scoped>
.page-header {
	display: flex;
	align-items: flex-start;
	justify-content: space-between;
	margin-bottom: 20px;
}

.page-header__left h1 {
	font-weight: 700;
	font-size: 24px;
	margin: 0;
}

.page-subtitle {
	font-size: 13px;
	color: var(--text-muted);
	margin-top: 6px;
}
</style>
`
}

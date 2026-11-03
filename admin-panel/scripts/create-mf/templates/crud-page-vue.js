export function getCrudPageVue(entityPlural, entityPluralCamel) {
	return `<template>
	<div class="${entityPluralCamel}-page">
		<${entityPlural}PageHeader :${entityPluralCamel}="${entityPluralCamel}" />
		<${entityPlural}FilterBar :${entityPluralCamel}="${entityPluralCamel}" />
		<${entityPlural}Table :${entityPluralCamel}="${entityPluralCamel}" />
		<${entityPlural}FormDialog :${entityPluralCamel}="${entityPluralCamel}" />
	</div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

import { use${entityPlural}Data } from '../composables/use${entityPlural}Data'
import ${entityPlural}FilterBar from './components/${entityPlural}FilterBar.vue'
import ${entityPlural}FormDialog from './components/${entityPlural}FormDialog.vue'
import ${entityPlural}PageHeader from './components/${entityPlural}PageHeader.vue'
import ${entityPlural}Table from './components/${entityPlural}Table.vue'

const ${entityPluralCamel} = use${entityPlural}Data()

onMounted(() => {
	${entityPluralCamel}.loadItems()
})
</script>

<style scoped>
.${entityPluralCamel}-page {
	max-width: 1400px;
	padding: 24px;
	margin: 0 auto;
}
</style>
`
}

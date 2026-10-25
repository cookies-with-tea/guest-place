<template>
	<div class="schema-builder-page">
		<SchemasListView
			v-if="!schemaForm.builderOpen"
			:schema-list="schemaList"
			:seed-about-page="seedAboutPage"
			@add="startCreate"
			@edit="startEdit"
		/>

		<div v-else class="builder-layout">
			<SchemaBuilderHeader
				:schema-form="schemaForm"
				:field-builder="fieldBuilder"
				@close="schemaForm.closeBuilder"
				@slug-touched="schemaForm.slugTouched = true"
			/>

			<div class="builder-body">
				<FieldTypePalette :field-builder="fieldBuilder" />
				<FieldsCanvas :schema-form="schemaForm" :field-builder="fieldBuilder" />
				<FieldConfigPanel :field-builder="fieldBuilder" />
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { ContentSchema } from '@admin-panel/lib'
import { useFieldBuilder } from '#features/schema-builder/composables/useFieldBuilder'
import { useSchemaForm } from '#features/schema-builder/composables/useSchemaForm'
import { useSchemaList } from '#features/schema-builder/composables/useSchemaList'
import { useSeedAboutPage } from '#features/schema-builder/composables/useSeedAboutPage'
import FieldConfigPanel from '#features/schema-builder/ui/FieldConfigPanel.vue'
import FieldsCanvas from '#features/schema-builder/ui/FieldsCanvas.vue'
import FieldTypePalette from '#features/schema-builder/ui/FieldTypePalette.vue'
import SchemaBuilderHeader from '#features/schema-builder/ui/SchemaBuilderHeader.vue'
import SchemasListView from '#features/schema-builder/ui/SchemasListView.vue'

const router = useRouter()

const schemaList = useSchemaList(router)
const schemaForm = useSchemaForm(schemaList.apiFetch, () => schemaList.fetchSchemas())
const fieldBuilder = useFieldBuilder(schemaForm)
const seedAboutPage = useSeedAboutPage(schemaList, router)

function startCreate() {
	schemaForm.handleAddSchema()
	fieldBuilder.resetSelection()
}

function startEdit(schema: ContentSchema) {
	schemaForm.handleEditSchema(schema)
	fieldBuilder.resetSelection()
}

onMounted(() => {
	schemaList.fetchSchemas()
})
</script>

<style scoped>
.schema-builder-page {
	min-height: 100vh;
	color: var(--gp-text-main);
	background-color: transparent;
}

.builder-layout {
	height: 100vh;
	display: flex;
	flex-direction: column;
	overflow: hidden;
}

.builder-body {
	min-height: 0;
	display: grid;
	flex: 1;
	grid-template-columns: 220px 1fr 280px;
	overflow: hidden;
}
</style>

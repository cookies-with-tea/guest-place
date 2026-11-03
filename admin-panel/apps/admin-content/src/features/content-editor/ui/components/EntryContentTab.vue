<template>
	<div class="editor-content" :class="{ 'is-translation': translation.isTranslationMode }">
		<template v-if="!translation.isTranslationMode">
			<ContentFormGenerator
				v-if="schema"
				v-model="modelValue"
				:errors="errors"
				:fields="schema.fields"
				:translation-namespace="schema.slug"
			/>
		</template>
		<template v-else>
			<div class="translation-mode-container">
				<div class="translation-column source-column">
					<div class="column-header">
						<el-select v-model="translation.sourceLocale" placeholder="Source Language" size="small">
							<el-option v-for="lang in translation.languages" :key="lang.code" :label="lang.name" :value="lang.code" />
						</el-select>
						<span class="column-label">SOURCE</span>
					</div>
					<div class="column-body">
						<ContentFormGenerator
							v-if="schema"
							v-model="translation.sourceData"
							:fields="schema.fields"
							readonly
							:translation-namespace="schema.slug"
						/>
					</div>
				</div>

				<div class="translation-column target-column">
					<div class="column-header">
						<el-select v-model="translation.targetLocale" placeholder="Target Language" size="small">
							<el-option v-for="lang in translation.languages" :key="lang.code" :label="lang.name" :value="lang.code" />
						</el-select>
						<span class="column-label">TARGET</span>
					</div>
					<div class="column-body">
						<ContentFormGenerator
							v-if="schema"
							v-model="translation.targetData"
							:errors="errors"
							:fields="schema.fields"
							:translation-namespace="schema.slug"
						/>
					</div>
				</div>
			</div>
		</template>
	</div>
</template>

<script setup lang="ts">
import type { ContentSchema } from '@admin-panel/lib'

import type { TranslationMode } from '../../composables/useTranslationMode'
import ContentFormGenerator from './ContentFormGenerator.vue'

defineProps<{
	schema: ContentSchema | null
	errors?: Record<string, string[]>
	translation: TranslationMode
}>()

const modelValue = defineModel<Record<string, any>>({ required: true })
</script>

<style scoped>
.translation-mode-container {
	width: 100%;
	display: flex;
	gap: 24px;
}

.translation-column {
	min-width: 0;
	display: flex;
	flex: 1;
	flex-direction: column;
}

.column-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	border-bottom: 1px dashed var(--border-color);
	padding-bottom: 12px;
	margin-bottom: 16px;
}

.column-label {
	font-weight: 800;
	font-size: 10px;
	letter-spacing: 0.1em;
	color: var(--text-muted);
}

.column-body {
	flex: 1;
}

.source-column {
	opacity: 0.8;
}

.is-translation {
	max-width: 1200px !important;
}
</style>

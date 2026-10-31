<template>
	<div class="content-editor-page" :class="{ 'is-split': preview.isSplitPreview }">
		<div class="page-content" :class="{ 'is-split': preview.isSplitPreview }">
			<!-- Editor panel -->
			<div class="editor-panel">
				<EntryLockBanner v-if="entry.isLockedByOther" :entry="entry" />

				<ContentEditor
					v-if="entry.schema"
					v-model="entry.formData"
					v-model:status="entry.entryStatus"
					v-model:i18n="entry.i18nData"
					v-model:is-previewing="preview.isSplitPreview"
					:entry-id="entry.entryId"
					:errors="entry.errors"
					:is-edit="entry.isEdit"
					:is-saving="entry.isSaving"
					:schema="entry.schema"
					@cancel="entry.goBack"
					@rollback="fetchData"
					@save="onSave"
				/>
			</div>

			<!-- Split preview panel -->
			<SplitPreviewPanel :preview="preview" :schema-name="entry.schema?.name" />
		</div>
	</div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'

import { ContentEditor } from '#features/content-editor'

import { useContentEntry } from '../composables/useContentEntry'
import { useSplitPreview } from '../composables/useSplitPreview'
import EntryLockBanner from './components/EntryLockBanner.vue'
import SplitPreviewPanel from './components/SplitPreviewPanel.vue'

const route = useRoute()
const schemaIdentifier = route.params.schemaIdentifier as string

const entry = useContentEntry(schemaIdentifier, route.params.id as string | undefined)
const preview = useSplitPreview(entry, schemaIdentifier)

const fetchData = () => entry.fetchData(preview.autoDetectPreset)

const onSave = (seoData?: any) =>
	entry.onSave(seoData, {
		onSaved: preview.sendPreviewData,
		shouldGoBack: () => !preview.isSplitPreview,
	})

onMounted(fetchData)
</script>

<style scoped lang="scss">
.content-editor-page {
	height: calc(100vh - 64px);
	background: var(--gp-bg-main, #0f1117);
	overflow-y: auto;

	&.is-split {
		overflow: hidden;
	}
}

.page-content {
	height: 100%;
	max-width: 1400px;
	display: block;
	padding: 16px;
	margin: 0 auto;

	&.is-split {
		height: 100%;
		max-width: 100%;
		display: grid;
		grid-template-columns: 1fr 1fr;
		box-sizing: border-box;
		padding: 12px 16px;
		gap: 16px;
	}
}

.editor-panel {
	height: 100%;
	min-width: 0;
	overflow-y: auto;
}
</style>

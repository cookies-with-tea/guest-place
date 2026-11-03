<template>
	<div class="page-constructor" :class="{ 'is-previewing': livePreview.isPreviewing }">
		<PageConstructorHeader :document="pageDocument" :live-preview="livePreview" />

		<!-- Main Workspace: 3 Columns -->
		<div class="constructor-body">
			<BlockPalette
				:block-types="blockTypes"
				:canvas="blockCanvas"
				:presets="blockPresets"
				:client-manifest="clientManifest"
			/>

			<PageCanvas
				:page-form="pageDocument.pageForm"
				:block-types="blockTypes"
				:canvas="blockCanvas"
				:presets="blockPresets"
				:is-previewing="livePreview.isPreviewing"
			>
				<LivePreviewPanel
					v-if="livePreview.isPreviewing"
					:page-form="pageDocument.pageForm"
					:live-preview="livePreview"
				/>
			</PageCanvas>

			<BlockInspector
				:page-form="pageDocument.pageForm"
				:block-types="blockTypes"
				:canvas="blockCanvas"
				:presets="blockPresets"
				:document="pageDocument"
				:seo="pageSeo"
				:tabs="tabs"
			/>
		</div>

		<SavePresetDialog :presets="blockPresets" />
	</div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBlockCanvas } from '#features/page-constructor/composables/useBlockCanvas'
import { useBlockPresets } from '#features/page-constructor/composables/useBlockPresets'
import { useBlockTypes } from '#features/page-constructor/composables/useBlockTypes'
import { useInspectorTabs } from '#features/page-constructor/composables/useInspectorTabs'
import { useLivePreview } from '#features/page-constructor/composables/useLivePreview'
import { usePageDocument } from '#features/page-constructor/composables/usePageDocument'
import { usePageSeo } from '#features/page-constructor/composables/usePageSeo'
import BlockInspector from '#features/page-constructor/ui/BlockInspector.vue'
import BlockPalette from '#features/page-constructor/ui/BlockPalette.vue'
import LivePreviewPanel from '#features/page-constructor/ui/LivePreviewPanel.vue'
import PageCanvas from '#features/page-constructor/ui/PageCanvas.vue'
import PageConstructorHeader from '#features/page-constructor/ui/PageConstructorHeader.vue'
import SavePresetDialog from '#features/page-constructor/ui/SavePresetDialog.vue'

const route = useRoute()
const router = useRouter()

// Tab state shared between the canvas (which flips tabs on add/paste) and the inspector.
const tabs = useInspectorTabs()

// Populated by the live-preview postMessage bridge, read by the palette's "sync from client" action.
const clientManifest = ref<any[]>([])

const pageDocument = usePageDocument(route, router)
const blockTypes = useBlockTypes(clientManifest)
const blockCanvas = useBlockCanvas(pageDocument.pageForm, blockTypes, tabs)
const blockPresets = useBlockPresets(pageDocument.pageForm, blockTypes, blockCanvas, tabs)
const livePreview = useLivePreview(pageDocument.pageForm, clientManifest)
const pageSeo = usePageSeo(pageDocument)

onMounted(async () => {
	await blockTypes.fetchBlockTypes()
	await pageDocument.fetchParentPages()
	if (pageDocument.isEdit) {
		await pageDocument.fetchPage()
		if (pageDocument.pageForm.blocks.length > 0) {
			blockCanvas.selectedBlockIndex = 0
			tabs.inspector = 'block'
		}
	}
})
</script>

<style scoped>
.page-constructor {
	height: calc(100vh - var(--gp-header-height, 64px));
	display: flex;
	flex-direction: column;
	color: var(--text-primary);
	background: var(--bg-page, transparent);
	margin: -24px;
	overflow: hidden;
}

.constructor-body {
	display: flex;
	flex-grow: 1;
	overflow: hidden;
}
</style>

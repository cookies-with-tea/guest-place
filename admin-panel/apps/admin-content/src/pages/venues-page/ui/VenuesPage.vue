<template>
	<div class="venues-page">
		<VenuesCatalogView v-if="!isEditorOpen" :catalog="catalog" @create="startCreate" @edit="startEdit" />
		<VenueEditorView
			v-else
			:venue-form="venueForm"
			:live-preview="livePreview"
			:tabs="tabs"
			@close="isEditorOpen = false"
			@save="handleSave"
		/>
	</div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useVenuesCatalog } from '#features/venues/catalog/composables/useVenuesCatalog'
import VenuesCatalogView from '#features/venues/catalog/ui/VenuesCatalogView.vue'
import { useVenueEditorTabs } from '#features/venues/editor/composables/useVenueEditorTabs'
import { useVenueForm } from '#features/venues/editor/composables/useVenueForm'
import { useVenueLivePreview } from '#features/venues/editor/composables/useVenueLivePreview'
import VenueEditorView from '#features/venues/editor/ui/VenueEditorView.vue'

const isEditorOpen = ref(false)

const catalog = useVenuesCatalog()
const venueForm = useVenueForm(() => livePreview.syncLivePreview())
const livePreview = useVenueLivePreview(venueForm)
const tabs = useVenueEditorTabs(venueForm)

function startCreate() {
	venueForm.openCreate()
	tabs.activeFormTab = 'basic'
	isEditorOpen.value = true
	setTimeout(livePreview.reloadPreviewIframe, 150)
}

function startEdit(row: any) {
	venueForm.openEdit(row)
	tabs.activeFormTab = 'basic'
	isEditorOpen.value = true
	setTimeout(livePreview.reloadPreviewIframe, 150)
}

async function handleSave() {
	const ok = await venueForm.handleSave()
	if (ok) {
		livePreview.reloadPreviewIframe()
		catalog.fetchVenuesList()
	}
}

onMounted(() => {
	catalog.fetchVenuesList()
})
</script>

<style scoped>
.venues-page {
	width: 100%;
	min-height: 100%;
}
</style>

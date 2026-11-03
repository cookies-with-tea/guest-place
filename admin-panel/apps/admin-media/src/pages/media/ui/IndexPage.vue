<template>
	<div class="media-index-page">
		<MediaFilters />

		<div class="page-content">
			<MediaTable />
		</div>

		<!-- Dialogs -->
		<MediaUploadDialog />
		<MediaPreviewDialog />
	</div>
</template>

<script setup lang="ts">
import { MediaPreviewDialog, MediaUploadDialog } from '#features/media-dialogs'
import { MediaFilters } from '#features/media-filters'
import { MediaTable } from '#features/media-table'
</script>

<style scoped>
.media-index-page {
	min-height: 100vh;
	display: flex;
	flex-direction: column;
	padding: 24px;
	gap: 24px;
}

.page-content {
	flex: 1;
}
</style>

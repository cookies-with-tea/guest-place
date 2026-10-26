<template>
	<el-card class="global-settings-card" shadow="never">
		<template #header>
			<div class="card-header">
				<span class="header-title">Global Metadata & Destination</span>
				<div class="header-actions">
					<el-checkbox v-model="settings.useChunkedUpload">Resumable Chunked</el-checkbox>
					<el-checkbox v-model="settings.convertToWebP">Auto-convert to WebP</el-checkbox>
					<el-checkbox v-model="settings.isApplyToAll">Apply to all files</el-checkbox>
				</div>
			</div>
		</template>
		<div class="global-inputs">
			<div class="input-row">
				<el-input v-model="settings.globalTitle" placeholder="Shared Title" :disabled="!settings.isApplyToAll">
					<template #prepend>Title</template>
				</el-input>
				<el-input v-model="settings.globalAlt" placeholder="Shared Alt Text" :disabled="!settings.isApplyToAll">
					<template #prepend>Alt</template>
				</el-input>
			</div>
			<div class="input-row">
				<el-select
					v-model="settings.globalFolderId"
					clearable
					placeholder="Target Folder (Root)"
					:disabled="!settings.isApplyToAll"
				>
					<el-option :value="null" label="📁 Root (No folder)" />
					<el-option v-for="folder in folders || []" :key="folder.id" :value="folder.id" :label="`📁 ${folder.name}`">
						<div class="folder-option">
							<span class="folder-dot" :style="{ backgroundColor: folder.color || '#3b82f6' }" />
							<span>{{ folder.name }}</span>
						</div>
					</el-option>
				</el-select>
				<el-select
					v-model="settings.globalCategory"
					clearable
					filterable
					placeholder="Shared Category"
					:disabled="!settings.isApplyToAll"
				>
					<el-option label="Marketing" value="Marketing" />
					<el-option label="UI/UX" value="UI/UX" />
					<el-option label="Content" value="Content" />
					<el-option label="Documentation" value="Documentation" />
					<el-option label="Media" value="Media" />
				</el-select>
				<el-select
					v-model="settings.globalTags"
					allow-create
					clearable
					default-first-option
					filterable
					multiple
					placeholder="Shared Tags"
					:disabled="!settings.isApplyToAll"
				>
					<el-option label="Marketing" value="Marketing" />
					<el-option label="Product" value="Product" />
					<el-option label="UI/UX" value="UI/UX" />
					<el-option label="Hero" value="Hero" />
					<el-option label="Video" value="Video" />
					<el-option label="Doc" value="Doc" />
				</el-select>
			</div>
		</div>
	</el-card>
</template>

<script setup lang="ts">
import type { MediaUploadSubmit } from '../../composables/useMediaUploadSubmit'

defineProps<{
	settings: MediaUploadSubmit
	folders: any[]
}>()
</script>

<style scoped>
.global-settings-card {
	border: 1px solid var(--border-color);
	border-radius: 12px;
	background: var(--bg-surface);
}

.card-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.header-actions {
	display: flex;
	gap: 16px;
}

.header-title {
	font-weight: 600;
	color: var(--text-primary);
}

.global-inputs {
	display: flex;
	flex-direction: column;
	gap: 12px;
}

.input-row {
	display: flex;
	gap: 12px;
}

.input-row > * {
	flex: 1;
}

.folder-option {
	display: flex;
	align-items: center;
	gap: 8px;
}

.folder-dot {
	width: 8px;
	height: 8px;
	border-radius: 50%;
}

:deep(.el-input-group__prepend) {
	min-width: 60px;
	font-weight: 600;
	text-align: center;
	color: var(--text-muted);
	background-color: var(--bg-header);
}
</style>

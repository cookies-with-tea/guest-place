<template>
	<div class="media-filters__folders-bar">
		<div class="folder-pills">
			<button
				class="folder-pill"
				:class="{ 'is-active': !controls.filters.folderId }"
				type="button"
				@click="controls.selectFolder(undefined)"
			>
				<el-icon class="folder-pill-icon"><FolderOpened /></el-icon>
				<span class="folder-pill-name">All Files</span>
			</button>
			<button
				class="folder-pill"
				:class="{ 'is-active': controls.filters.folderId === 'root' }"
				type="button"
				@click="controls.selectFolder('root')"
			>
				<el-icon class="folder-pill-icon"><Folder /></el-icon>
				<span class="folder-pill-name">Unorganized</span>
			</button>
			<div v-for="folder in controls.folders" :key="folder.id" class="folder-pill-group">
				<button
					class="folder-pill"
					:class="{ 'is-active': controls.filters.folderId === folder.id }"
					type="button"
					@click="controls.selectFolder(folder.id)"
				>
					<span class="folder-dot" :style="{ backgroundColor: folder.color || '#409EFF' }" />
					<span class="folder-pill-name">{{ folder.name }}</span>
					<span v-if="folder.itemCount !== undefined" class="folder-pill-count">{{ folder.itemCount }}</span>
				</button>
				<el-dropdown trigger="click" @command="(cmd: string) => folderDialog.handleFolderCommand(cmd, folder)">
					<span class="folder-actions-trigger">⋮</span>
					<template #dropdown>
						<el-dropdown-menu>
							<el-dropdown-item command="edit">Edit Folder</el-dropdown-item>
							<el-dropdown-item command="delete" divided style="color: var(--el-color-danger)">
								Delete Folder
							</el-dropdown-item>
						</el-dropdown-menu>
					</template>
				</el-dropdown>
			</div>
			<el-button class="new-folder-btn" size="small" :icon="FolderAddIcon" @click="folderDialog.openCreateFolderDialog">
				+ Folder
			</el-button>
		</div>
		<div v-if="mediaConfig?.cdnUrl" class="cdn-status-badge" :title="`Media CDN active at: ${mediaConfig.cdnUrl}`">
			<span class="cdn-dot" />
			<span class="cdn-text">CDN Active</span>
		</div>
	</div>
</template>

<script setup lang="ts">
import { Folder, FolderAdd as FolderAddIcon, FolderOpened } from '@element-plus/icons-vue'

import type { MediaFilterControls } from '../../composables/useMediaFilterControls'
import type { MediaFolderDialog } from '../../composables/useMediaFolderDialog'

defineProps<{
	controls: MediaFilterControls
	folderDialog: MediaFolderDialog
	mediaConfig: any
}>()
</script>

<style scoped>
.media-filters__folders-bar {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	justify-content: space-between;
	border: 1px solid var(--border-color);
	border-radius: 12px;
	background: var(--bg-surface, rgb(255, 255, 255, 0.03));
	padding: 8px 12px;
	gap: 12px;
}

.folder-pills {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: 8px;
}

.folder-pill-group {
	position: relative;
	display: inline-flex;
	align-items: center;
}

.folder-pill {
	display: inline-flex;
	align-items: center;
	border: 1px solid var(--border-color);
	border-radius: 8px;
	font-weight: 500;
	font-size: 13px;
	color: var(--text-primary);
	background: var(--bg-surface);
	transition: all 0.2s ease;
	cursor: pointer;
	padding: 5px 10px;
	gap: 6px;
}

.folder-pill:hover {
	border-color: var(--accent-primary);
	color: var(--accent-primary);
}

.folder-pill.is-active {
	border-color: var(--accent-primary);
	font-weight: 600;
	color: var(--accent-primary);
	background: rgb(64, 158, 255, 0.15);
}

.folder-dot {
	width: 8px;
	height: 8px;
	display: inline-block;
	border-radius: 50%;
}

.folder-pill-icon {
	width: 1em;
	height: 1em;
	flex-shrink: 0;
	font-size: 14px;
}

.folder-pill-count {
	border-radius: 10px;
	font-weight: 600;
	font-size: 11px;
	background: rgb(0, 0, 0, 0.2);
	padding: 1px 6px;
	margin-left: 2px;
}

.folder-actions-trigger {
	border-radius: 4px;
	font-size: 14px;
	color: var(--text-muted);
	transition: all 0.15s ease;
	cursor: pointer;
	padding: 4px 6px;
}

.folder-actions-trigger:hover {
	color: var(--text-primary);
	background: rgb(255, 255, 255, 0.1);
}

.new-folder-btn {
	border-style: dashed !important;
	border-radius: 8px !important;
}

.cdn-status-badge {
	display: inline-flex;
	align-items: center;
	border: 1px solid rgb(103, 194, 58, 0.3);
	border-radius: 12px;
	font-weight: 500;
	font-size: 12px;
	color: #67c23a;
	background: rgb(103, 194, 58, 0.12);
	padding: 4px 10px;
	gap: 6px;
}

.cdn-dot {
	width: 6px;
	height: 6px;
	border-radius: 50%;
	box-shadow: 0 0 6px #67c23a;
	background: #67c23a;
}
</style>

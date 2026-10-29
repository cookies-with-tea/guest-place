<template>
	<el-descriptions
		border
		:column="1"
		label-width="100px"
		title="Information"
		:content-style="{ 'word-break': 'break-all' }"
	>
		<el-descriptions-item label="Title">
			{{ media.title || 'no title' }}
		</el-descriptions-item>
		<el-descriptions-item label="Alt Text">
			{{ media.alt || 'no alt text' }}
		</el-descriptions-item>
		<el-descriptions-item label="Type">
			<el-tag size="small" type="info">{{ media.mediaType }}</el-tag>
		</el-descriptions-item>
		<el-descriptions-item label="Dimensions">
			{{ media.width && media.height ? `${media.width} × ${media.height} px` : '—' }}
		</el-descriptions-item>
		<el-descriptions-item label="Category">
			{{ media.category || '—' }}
		</el-descriptions-item>
		<el-descriptions-item label="Tags">
			<div class="tags-list">
				<el-tag v-for="tag in media.tags" :key="tag" class="media-tag" size="small">
					{{ tag }}
				</el-tag>
				<span v-if="!media.tags?.length" class="no-tags">—</span>
			</div>
		</el-descriptions-item>
		<el-descriptions-item label="Name">
			{{ media.name || 'unknown' }}
		</el-descriptions-item>
		<el-descriptions-item v-if="media.dominantColor" label="Color">
			<div class="color-badge" @click="preview.copyHex(media.dominantColor)">
				<span class="color-dot" :style="{ backgroundColor: media.dominantColor }" />
				<span class="color-hex">{{ media.dominantColor }}</span>
			</div>
		</el-descriptions-item>
		<el-descriptions-item v-if="media.folderId" label="Folder">
			<el-tag size="small" type="primary">
				<el-icon class="folder-tag-icon"><Folder /></el-icon>
				{{ preview.folderName || 'Folder' }}
			</el-tag>
		</el-descriptions-item>
		<el-descriptions-item v-if="media.cdnUrl" label="CDN URL">
			<div class="cdn-row">
				<el-link type="primary" :href="media.cdnUrl" target="_blank" :underline="false">
					{{ media.cdnUrl }}
				</el-link>
				<el-button size="small" text @click="preview.copyUrl(media.cdnUrl)">Copy</el-button>
			</div>
		</el-descriptions-item>
		<el-descriptions-item v-if="media.contentHash" label="Content Hash">
			<el-tag size="small" type="info">{{ media.contentHash.substring(0, 16) }}...</el-tag>
		</el-descriptions-item>
		<el-descriptions-item label="Size">
			{{ preview.formatFileSize(media.sizeBytes) }}
		</el-descriptions-item>
		<el-descriptions-item label="Added">
			{{ preview.formatDate(media.createdAt) }}
		</el-descriptions-item>
	</el-descriptions>
</template>

<script setup lang="ts">
import { Folder } from '@element-plus/icons-vue'
import type { MediaPreview } from '../../composables/useMediaPreview'

defineProps<{
	media: any
	preview: MediaPreview
}>()
</script>

<style scoped>
.tags-list {
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
}

.media-tag {
	border-radius: 4px;
}

.no-tags {
	color: var(--text-muted);
}

.folder-tag-icon {
	width: 1em;
	height: 1em;
	flex-shrink: 0;
	vertical-align: -0.15em;
}

.color-badge {
	display: inline-flex;
	align-items: center;
	border-radius: 4px;
	transition: background 0.15s;
	cursor: pointer;
	padding: 2px 6px;
	gap: 6px;
}

.color-badge:hover {
	background: var(--gp-bg-glass-hover, rgb(0, 0, 0, 0.05));
}

.color-dot {
	width: 12px;
	height: 12px;
	display: inline-block;
	border: 1px solid rgb(0, 0, 0, 0.15);
	border-radius: 50%;
}

.color-hex {
	font-family: monospace;
	font-size: 12px;
}

.cdn-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 8px;
}
</style>

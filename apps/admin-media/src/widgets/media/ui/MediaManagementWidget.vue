<template>
	<div class="media-management-widget">
		<div class="widget-header">
			<h2>{{ title }}</h2>
			<div class="widget-actions">
				<el-button v-if="showAddButton" :icon="Plus" size="small" type="success" @click="addMedia">
					Add Media
				</el-button>
				<el-button
					v-if="showDeleteButton && selectedMedia.length > 0"
					:icon="Delete"
					size="small"
					type="danger"
					@click="deleteSelected"
				>
					Delete Selected
				</el-button>
			</div>
		</div>

		<div v-if="showSearch" class="table-toolbar">
			<el-input
				v-model="searchQuery"
				class="search-input"
				clearable
				:placeholder="searchPlaceholder"
				:prefix-icon="Search"
				@input="onSearch"
			/>
		</div>

		<el-table
			v-loading="loading"
			class="media-table"
			style="width: 100%"
			:data="mediaItems"
			@selection-change="handleSelectionChange"
		>
			<el-table-column v-if="showSelection" type="selection" width="55" />

			<el-table-column label="Thumbnail" width="120">
				<template #default="scope">
					<div class="media-thumbnail" @click="emit('preview-media', scope.row)">
						<el-image
							:alt="scope.row.alt || 'Media thumbnail'"
							class="thumbnail-image"
							fit="cover"
							:src="scope.row.url"
						>
							<template #error>
								<div class="image-slot">
									<el-icon><Picture /></el-icon>
								</div>
							</template>
						</el-image>
					</div>
				</template>
			</el-table-column>

			<el-table-column label="Title" prop="title" sortable>
				<template #default="scope">
					<span class="media-title" :title="scope.row.title">{{ scope.row.title || 'Untitled' }}</span>
				</template>
			</el-table-column>

			<el-table-column label="Alt Text" prop="alt" sortable>
				<template #default="scope">
					<span class="media-alt" :title="scope.row.alt">{{ scope.row.alt || '-' }}</span>
				</template>
			</el-table-column>

			<el-table-column label="Size" prop="size" sortable width="120">
				<template #default="scope">
					<span>{{ formatFileSize(scope.row.size) }}</span>
				</template>
			</el-table-column>

			<el-table-column label="Date Added" prop="createdAt" sortable width="180">
				<template #default="scope">
					<span>{{ formatDate(scope.row.createdAt) }}</span>
				</template>
			</el-table-column>

			<el-table-column v-if="showActions" fixed="right" label="Actions" width="150">
				<template #default="scope">
					<el-button-group>
						<el-button plain size="small" type="primary" @click="editMedia(scope.row)"> Edit </el-button>
						<el-button plain size="small" type="danger" @click="deleteMedia(scope.row)"> Delete </el-button>
					</el-button-group>
				</template>
			</el-table-column>
		</el-table>

		<div v-if="paginatorEnabled" class="pagination-container">
			<el-pagination
				v-model:current-page="currentPage"
				v-model:page-size="pageSize"
				layout="total, sizes, prev, pager, next, jumper"
				:page-sizes="rowsPerPageOptions"
				:total="mediaItems.length"
			/>
		</div>
	</div>
</template>

<script setup lang="ts" generic="T extends MediaItem">
import { ref, watch } from 'vue'

import { Delete, Picture, Plus, Search } from '@element-plus/icons-vue'

import type { MediaItem } from '#entities/media/model'

export interface Props<T> {
	title?: string
	mediaItems: T[]
	loading?: boolean
	showSelection?: boolean
	showActions?: boolean
	showAddButton?: boolean
	showDeleteButton?: boolean
	showSearch?: boolean
	searchPlaceholder?: string
	paginatorEnabled?: boolean
	rowsPerPage?: number
	rowsPerPageOptions?: number[]
}

const props = withDefaults(defineProps<Props<T>>(), {
	title: 'Media Management',
	loading: false,
	showSelection: true,
	showActions: true,
	showAddButton: true,
	showDeleteButton: true,
	showSearch: true,
	searchPlaceholder: 'Search media...',
	paginatorEnabled: true,
	rowsPerPage: 10,
	rowsPerPageOptions: () => [5, 10, 20, 50],
})

const emit = defineEmits<{
	'add-media': []
	'edit-media': [media: any]
	'delete-media': [media: any]
	'delete-selected': [media: any[]]
	'preview-media': [media: any]
	'selection-change': [media: any[]]
}>()

// State
const selectedMedia = ref<T[]>([])
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(props.rowsPerPage)

// Watch for external changes to mediaItems
watch(
	() => props.mediaItems,
	() => {
		// Reset selection when media items change
		selectedMedia.value = []
	},
	{ deep: true }
)

// Methods
const addMedia = () => emit('add-media')
const editMedia = (media: T) => emit('edit-media', media)
const deleteMedia = (media: T) => emit('delete-media', media)
const deleteSelected = () => emit('delete-selected', selectedMedia.value)

const handleSelectionChange = (val: T[]) => {
	selectedMedia.value = val

	emit('selection-change', val)
}

const onSearch = () => {
	// Logic for local filtering if needed, or emit to parent
	// Assuming parent handles it via props.mediaItems for now as per previous implementation
}

const formatFileSize = (bytes: number): string => {
	if (!bytes || bytes === 0) return '0 Bytes'
	const k = 1024
	const sizes = ['Bytes', 'KB', 'MB', 'GB']
	const i = Math.floor(Math.log(bytes) / Math.log(k))

	return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatDate = (date: Date): string => {
	return new Date(date).toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	})
}
</script>

<style scoped>
.media-management-widget {
	width: 100%;
}

.widget-header {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 1.5rem;
	gap: 1rem;
}

.widget-header h2 {
	font-weight: 600;
	font-size: 1.5rem;
	color: #303133;
	margin: 0;
}

.widget-actions {
	display: flex;
	gap: 0.5rem;
}

.table-toolbar {
	display: flex;
	justify-content: flex-end;
	margin-bottom: 1rem;
}

.search-input {
	width: 300px;
}

.media-table {
	border-radius: 8px;
	box-shadow: 0 2px 12px 0 rgb(0, 0, 0, 0.05);
	overflow: hidden;
}

.media-thumbnail {
	width: 80px;
	height: 60px;
	display: flex;
	align-items: center;
	justify-content: center;
	border: 1px solid var(--gp-glass-border);
	border-radius: 4px;
	background-color: var(--gp-bg-glass);
	transition: transform 0.2s ease;
	cursor: pointer;
	overflow: hidden;
}

.media-thumbnail:hover {
	transform: scale(1.05);
}

.thumbnail-image {
	width: 100%;
	height: 100%;
}

.image-slot {
	width: 100%;
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 20px;
	color: #909399;
}

.media-title,
.media-alt {
	display: block;
	white-space: nowrap;
	text-overflow: ellipsis;
	overflow: hidden;
}

.pagination-container {
	display: flex;
	justify-content: flex-end;
	margin-top: 1.5rem;
}

@media (width <= 768px) {
	.widget-header {
		flex-direction: column;
		align-items: flex-start;
	}

	.widget-actions {
		width: 100%;
		justify-content: flex-end;
	}

	.search-input {
		width: 100%;
	}
}
</style>

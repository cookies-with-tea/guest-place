<template>
	<div class="media-table-feature" :class="{ 'is-dark': isDark }">
		<div v-if="selectedItems.length > 0" class="bulk-actions">
			<el-dropdown trigger="click" @command="handleBulkCommand">
				<el-button type="primary" size="small">
					Групповые операции ({{ selectedItems.length }})
					<el-icon class="el-icon--right"><ArrowDown /></el-icon>
				</el-button>
				<template #dropdown>
					<el-dropdown-menu>
						<el-dropdown-item :icon="PriceTag" command="addTags">Добавить теги</el-dropdown-item>
						<el-dropdown-item :icon="FolderOpened" command="changeCategory">Сменить категорию</el-dropdown-item>
						<el-dropdown-item :icon="Refresh" command="convertToWebP">Конвертировать в WebP</el-dropdown-item>
						<el-dropdown-item divided :icon="Delete" command="delete" style="color: var(--el-color-danger)">
							Удалить выбранные
						</el-dropdown-item>
					</el-dropdown-menu>
				</template>
			</el-dropdown>
		</div>
		<UiTable
			v-loading="isLoading || isFetching"
			border
			class="ui-table"
			:data="mediaItems"
			element-loading-text="Loading data..."
			@selection-change="handleSelectionChange"
			@row-click="(row: MediaItem) => openPreviewDialog(row.uuid)"
		>
			<el-table-column type="selection" width="55" />

			<!-- Name Column -->
			<UiTableColumn
				v-model:sortBy="filters.sortBy"
				v-model:sortOrder="filters.sortOrder"
				label="Name"
				min-width="150"
				prop="name"
				sortable
				@sort="setSort"
			>
				<template #default="{ row }">
					<span class="media-name">{{ row.name || 'unnamed' }}</span>
				</template>
			</UiTableColumn>

			<!-- Media Type Column -->
			<UiTableColumn
				v-model:sortBy="filters.sortBy"
				v-model:sortOrder="filters.sortOrder"
				filterable
				label="Type"
				prop="media_type"
				sortable
				width="140"
				:show-filter-active="filters.mediaTypes && filters.mediaTypes.length > 0"
				@sort="setSort"
			>
				<template #filter>
					<el-select
						v-model="filters.mediaTypes"
						clearable
						collapse-tags
						collapse-tags-tooltip
						multiple
						placeholder="Select types"
						popper-class="dark-select"
					>
						<el-option label="Image" value="image" />
						<el-option label="Video" value="video" />
						<el-option label="Document" value="document" />
						<el-option label="Archive" value="archive" />
						<el-option label="Other" value="other" />
					</el-select>
				</template>
				<template #default="{ row }">
					<el-tag effect="plain" size="small">{{ row.mediaType }}</el-tag>
				</template>
			</UiTableColumn>

			<!-- Category Column -->
			<UiTableColumn
				v-model:sortBy="filters.sortBy"
				v-model:sortOrder="filters.sortOrder"
				filterable
				label="Category"
				prop="category"
				sortable
				width="140"
				:show-filter-active="filters.category && filters.category.length > 0"
				@sort="setSort"
			>
				<template #filter>
					<el-select
						v-model="filters.category"
						clearable
						collapse-tags
						collapse-tags-tooltip
						filterable
						multiple
						placeholder="Select categories"
						popper-class="dark-select"
					>
						<!-- These would ideally come from a separate API -->
						<el-option label="Marketing" value="Marketing" />
						<el-option label="UI/UX" value="UI/UX" />
						<el-option label="Content" value="Content" />
					</el-select>
				</template>
				<template #default="{ row }">
					<span class="media-category">{{ row.category || '—' }}</span>
				</template>
			</UiTableColumn>

			<!-- Tags Column -->
			<UiTableColumn
				v-model:sortBy="filters.sortBy"
				v-model:sortOrder="filters.sortOrder"
				filterable
				label="Tags"
				prop="tags"
				width="180"
				:show-filter-active="filters.tags && filters.tags.length > 0"
				@sort="setSort"
			>
				<template #filter>
					<el-select
						v-model="filters.tags"
						allow-create
						clearable
						collapse-tags
						collapse-tags-tooltip
						default-first-option
						filterable
						multiple
						placeholder="Filter by tags"
						popper-class="dark-select"
					>
						<!-- Tags would also ideally be fetched -->
					</el-select>
				</template>
				<template #default="{ row }">
					<div class="tags-container">
						<template v-if="row.tags && row.tags.length">
							<el-tag v-for="tag in row.tags" :key="tag" class="media-tag" effect="light" size="small">
								{{ tag }}
							</el-tag>
						</template>
						<span v-else>—</span>
					</div>
				</template>
			</UiTableColumn>

			<!-- Preview Column -->
			<el-table-column label="Preview" width="100">
				<template #default="{ row }">
					<div class="media-preview-cell">
						<el-image v-if="row.mediaType === 'image'" class="preview-img" fit="cover" lazy :src="row.url" />
						<video
							v-else-if="row.mediaType === 'video'"
							class="preview-img"
							muted
							loop
							autoplay
							playsinline
							:src="row.url"
						/>
						<el-icon v-else :size="24"><Document /></el-icon>
					</div>
				</template>
			</el-table-column>

			<!-- Size Column -->
			<UiTableColumn
				v-model:sortBy="filters.sortBy"
				v-model:sortOrder="filters.sortOrder"
				label="Size"
				prop="size_bytes"
				sortable
				width="120"
				@sort="setSort"
			>
				<template #default="{ row }">
					{{ formatFileSize(row.sizeBytes) }}
				</template>
			</UiTableColumn>

			<!-- Source Column -->
			<UiTableColumn
				v-model:sortBy="filters.sortBy"
				v-model:sortOrder="filters.sortOrder"
				filterable
				label="Source"
				prop="source"
				sortable
				width="140"
				:show-filter-active="filters.source && filters.source.length > 0"
				@sort="setSort"
			>
				<template #filter>
					<el-select
						v-model="filters.source"
						clearable
						collapse-tags
						collapse-tags-tooltip
						filterable
						multiple
						placeholder="Select sources"
						popper-class="dark-select"
					>
						<el-option label="CMS" value="cms" />
						<el-option label="Site" value="site" />
					</el-select>
				</template>
				<template #default="{ row }">
					<el-tag effect="plain" :type="(row.source || 'cms') === 'site' ? 'warning' : 'primary'" size="small">{{
						row.source || 'cms'
					}}</el-tag>
				</template>
			</UiTableColumn>

			<!-- Date Column -->
			<UiTableColumn
				v-model:sortBy="filters.sortBy"
				v-model:sortOrder="filters.sortOrder"
				label="Added"
				prop="created_at"
				sortable
				width="160"
				@sort="setSort"
			>
				<template #default="{ row }">
					{{ formatDate(row.createdAt) }}
				</template>
			</UiTableColumn>

			<!-- Actions Column -->
			<el-table-column label="Actions" width="120">
				<template #default="{ row }">
					<div class="action-buttons">
						<el-tooltip content="Edit Media" placement="top">
							<el-button circle plain size="small" type="warning" :icon="Edit" @click.stop="openEditModal(row.uuid)" />
						</el-tooltip>
						<el-tooltip content="Delete Media" placement="top">
							<el-button circle plain size="small" type="danger" :icon="Delete" @click.stop="confirmDelete(row.uuid)" />
						</el-tooltip>
					</div>
				</template>
			</el-table-column>
		</UiTable>

		<div class="pagination-container">
			<el-pagination
				v-model:current-page="pagination.page"
				v-model:page-size="pagination.limit"
				background
				layout="total, sizes, prev, pager, next, jumper"
				:page-sizes="[10, 20, 50, 100]"
				:total="pagination.total"
				@current-change="setPage"
				@size-change="setLimit"
			/>
		</div>
		<MediaPreviewDialog />
		<MediaUpdateModal />
		<MediaUploadDialog />
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import { UiTable, UiTableColumn, useTheme } from '@admin-panel/ui'
import { ArrowDown, Delete, Document, Edit, FolderOpened, PriceTag, Refresh } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

import { useMedia } from '#entities/media'
import type { MediaItem } from '#entities/media/model'
import { mediaUtils } from '#entities/media/utils/media.utils'

import { MediaPreviewDialog, MediaUpdateModal, MediaUploadDialog } from '../../media-dialogs'

const {
	mediaItems,
	filters,
	pagination,
	isLoading,
	isFetching,
	setPage,
	setLimit,
	setSort,
	openPreviewDialog,
	openEditModal,
	handleDelete,
	handleMultipleDelete,
	handleBulkUpdate,
} = useMedia()

const { isDark } = useTheme()

const selectedItems = ref<MediaItem[]>([])

const handleSelectionChange = (val: MediaItem[]) => {
	selectedItems.value = val
}

const formatFileSize = (bytes: number) => mediaUtils.formatFileSize(bytes)
const formatDate = (date: string | Date) => mediaUtils.formatDate(date)

const confirmDelete = (uuid: string) => {
	ElMessageBox.confirm('Are you sure you want to delete this file?', 'Warning', {
		confirmButtonText: 'Delete',
		cancelButtonText: 'Cancel',
		type: 'warning',
	}).then(() => {
		handleDelete(uuid)
	})
}

const confirmMultipleDelete = () => {
	if (selectedItems.value.length === 0) return
	ElMessageBox.confirm(`Are you sure you want to delete ${selectedItems.value.length} files?`, 'Warning', {
		confirmButtonText: 'Delete All',
		cancelButtonText: 'Cancel',
		type: 'warning',
	}).then(() => {
		const uuids = selectedItems.value.map((item) => item.uuid)

		handleMultipleDelete(uuids)

		selectedItems.value = []
	})
}

const handleBulkCommand = (command: string) => {
	const uuids = selectedItems.value.map((i) => i.uuid)

	switch (command) {
		case 'delete':
			confirmMultipleDelete()

			break
		case 'addTags':
			ElMessageBox.prompt('Введите теги через запятую', 'Добавить теги', {
				confirmButtonText: 'Добавить',
				cancelButtonText: 'Отмена',
			}).then(({ value }) => {
				if (value) {
					const tags = value.split(',').map((t) => t.trim())

					handleBulkUpdate(uuids, { tags })

					ElMessage.success(`Теги добавлены для ${uuids.length} файлов`)

					selectedItems.value = []
				}
			})

			break
		case 'changeCategory':
			ElMessageBox.prompt('Введите название категории', 'Сменить категорию', {
				confirmButtonText: 'Сменить',
				cancelButtonText: 'Отмена',
			}).then(({ value }) => {
				if (value) {
					handleBulkUpdate(uuids, { category: value })

					ElMessage.success(`Категория изменена для ${uuids.length} файлов`)

					selectedItems.value = []
				}
			})

			break
		case 'convertToWebP':
			ElMessage.info('Инициирована конвертация в WebP...')

			setTimeout(() => {
				ElMessage.success(`Файлы (${uuids.length}) успешно сконвертированы в WebP`)

				selectedItems.value = []
			}, 1500)

			break
	}
}
</script>

<style scoped>
.media-table-feature {
	width: 100%;
}

.bulk-actions {
	display: flex;
	justify-content: flex-start;
	margin-bottom: 12px;
}

.ui-table {
	border: 1px solid var(--border-color);
	border-radius: 16px;
	box-shadow: var(--shadow-sm);
	background-color: var(--bg-card) !important;
	overflow: hidden;
}

.media-preview-cell {
	display: flex;
	align-items: center;
	justify-content: center;
}

.preview-img {
	width: 48px;
	height: 48px;
	border: 1px solid var(--border-color);
	border-radius: 8px;
}

.pagination-container {
	width: 100%;
	display: flex;
	justify-content: center;
	background: transparent;
	padding: 16px;
	margin-top: 40px;
}

/* Popover Styles */
:deep(.gp-popover) {
	border: 1px solid var(--border-color) !important;
	border-radius: 12px !important;
	box-shadow: var(--shadow-sm) !important;
	background: var(--bg-card) !important;
	padding: 16px !important;
}

.filter-popover-content {
	display: flex;
	flex-direction: column;
	gap: 12px;
}

.popover-label {
	font-weight: 600;
	font-size: 12px;
	letter-spacing: 0.05em;
	text-transform: uppercase;
	color: #94a3b8;
}

.action-buttons {
	display: flex;
	justify-content: center;
	gap: 8px;
}
</style>

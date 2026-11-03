<template>
	<div v-if="bulk.selectedItems.length > 0" class="bulk-actions">
		<el-dropdown trigger="click" @command="bulk.handleBulkCommand">
			<el-button type="primary" size="small">
				Групповые операции ({{ bulk.selectedItems.length }})
				<el-icon class="el-icon--right"><ArrowDown /></el-icon>
			</el-button>
			<template #dropdown>
				<el-dropdown-menu>
					<el-dropdown-item :icon="FolderOpened" command="moveToFolder">Переместить в папку</el-dropdown-item>
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
</template>

<script setup lang="ts">
import { ArrowDown, Delete, FolderOpened, PriceTag, Refresh } from '@element-plus/icons-vue'

import type { MediaTableBulkActions } from '../../composables/useMediaTableBulkActions'

defineProps<{
	bulk: MediaTableBulkActions
}>()
</script>

<style scoped>
.bulk-actions {
	display: flex;
	justify-content: flex-start;
	margin-bottom: 12px;
}
</style>

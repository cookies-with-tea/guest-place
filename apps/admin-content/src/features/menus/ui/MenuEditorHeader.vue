<template>
	<div class="editor-header">
		<div class="editor-header-fields">
			<div class="field-item">
				<label>Название меню:</label>
				<el-input v-model="currentMenu.currentMenu!.name" placeholder="Главное меню" style="width: 260px" />
			</div>
			<div class="field-item">
				<label>Идентификатор расположения (location):</label>
				<el-input
					v-model="currentMenu.currentMenu!.location"
					placeholder="header"
					:disabled="menusList.isSystemLocation(currentMenu.currentMenu!.location)"
					style="width: 200px"
				/>
			</div>
		</div>
		<div class="editor-header-actions">
			<el-button type="success" plain @click="emit('add-item')"> + Добавить пункт меню </el-button>
			<el-button
				v-if="!menusList.isSystemLocation(currentMenu.currentMenu!.location)"
				type="danger"
				plain
				@click="emit('delete-menu')"
			>
				Удалить меню
			</el-button>
		</div>
	</div>
</template>

<script setup lang="ts">
import type { CurrentMenu } from '../composables/useCurrentMenu'
import type { MenusList } from '../composables/useMenusList'

defineProps<{
	menusList: MenusList
	currentMenu: CurrentMenu
}>()

const emit = defineEmits<{
	'add-item': []
	'delete-menu': []
}>()
</script>

<style scoped>
.editor-header {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	justify-content: space-between;
	border-bottom: 1px solid var(--border-color);
	padding-bottom: 20px;
	margin-bottom: 20px;
	gap: 16px;
}

.editor-header-fields {
	display: flex;
	flex-wrap: wrap;
	gap: 16px;
}

.field-item {
	display: flex;
	flex-direction: column;
	gap: 6px;
}

.field-item label {
	font-weight: 500;
	font-size: 12px;
	color: var(--text-muted);
}

.editor-header-actions {
	display: flex;
	flex-wrap: wrap;
	gap: 10px;
}
</style>

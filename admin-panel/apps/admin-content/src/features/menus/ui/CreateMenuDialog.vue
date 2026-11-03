<template>
	<el-dialog v-model="dialog.isOpen" title="Создать новое меню" width="460px">
		<el-form label-position="top">
			<el-form-item label="Название меню">
				<el-input v-model="dialog.form.name" placeholder="Меню мобильной версии" />
			</el-form-item>
			<el-form-item label="Идентификатор расположения (slug / location)">
				<el-input v-model="dialog.form.location" placeholder="mobile-drawer, header-secondary" />
			</el-form-item>
		</el-form>
		<template #footer>
			<el-button @click="dialog.isOpen = false">Отмена</el-button>
			<el-button
				type="primary"
				:disabled="!dialog.form.name.trim() || !dialog.form.location.trim()"
				@click="dialog.confirmCreate"
			>
				Создать меню
			</el-button>
		</template>
	</el-dialog>
</template>

<script setup lang="ts">
import type { CreateMenuDialog } from '../composables/useCreateMenuDialog'

defineProps<{
	dialog: CreateMenuDialog
}>()
</script>

<style scoped>
:deep(.el-dialog) {
	border: 1px solid var(--border-color);
	color: var(--text-primary);
	background-color: var(--gp-bg-main, #0f172a);
}

:deep(.el-dialog__title) {
	color: var(--text-primary);
}

:deep(.el-form-item__label) {
	color: var(--text-primary);
}
</style>

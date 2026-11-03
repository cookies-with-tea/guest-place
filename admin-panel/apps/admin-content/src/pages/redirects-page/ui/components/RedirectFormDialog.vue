<template>
	<el-dialog
		v-model="redirects.isDialogOpen"
		:title="redirects.editingId ? 'Редактировать редирект' : 'Создать новое правило редиректа'"
		width="520px"
	>
		<el-form label-position="top">
			<el-form-item label="Исходный путь (Source Path)">
				<el-input
					v-model="redirects.form.sourcePath"
					placeholder="/old-catalog, /about-us..."
					@blur="redirects.normalizeSourcePath"
				>
					<template #prepend>/</template>
				</el-input>
				<div class="field-hint">Старый URL адрес на сайте, с которого будет происходить перенаправление.</div>
			</el-form-item>

			<el-form-item label="Целевой путь (Target Path)">
				<el-input v-model="redirects.form.targetPath" placeholder="/platforms, /p/about или https://...">
					<template #append>
						<el-select placeholder="Выбрать из CMS" style="width: 140px" @change="redirects.onSelectPageTarget">
							<el-option v-for="p in redirects.pages" :key="p.id" :label="p.title" :value="`/p/${p.slug}`" />
						</el-select>
					</template>
				</el-input>
				<div class="field-hint">Новый адрес страницы или внешний URL.</div>
			</el-form-item>

			<el-form-item label="Тип перенаправления (HTTP Code)">
				<el-radio-group v-model="redirects.form.statusCode">
					<el-radio :label="301"> <strong>301 Moved Permanently</strong> (Постоянный, передаёт вес) </el-radio>
					<el-radio :label="302"> <strong>302 Temporary</strong> (Временный, для акций и тестов) </el-radio>
				</el-radio-group>
			</el-form-item>

			<el-form-item>
				<el-checkbox v-model="redirects.form.isActive"> Правило активно (включено) </el-checkbox>
			</el-form-item>
		</el-form>

		<template #footer>
			<el-button @click="redirects.isDialogOpen = false">Отмена</el-button>
			<el-button
				type="primary"
				:disabled="!redirects.form.sourcePath.trim() || !redirects.form.targetPath.trim()"
				@click="redirects.confirmSave"
			>
				{{ redirects.editingId ? 'Сохранить изменения' : 'Создать редирект' }}
			</el-button>
		</template>
	</el-dialog>
</template>

<script setup lang="ts">
import type { RedirectsData } from '../../composables/useRedirectsData'

defineProps<{
	redirects: RedirectsData
}>()
</script>

<style scoped>
.field-hint {
	font-size: 11px;
	color: var(--text-muted);
	margin-top: 4px;
}

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

<template>
	<el-dialog
		v-model="dialog.isOpen"
		:title="
			dialog.editingItem
				? 'Редактировать пункт меню'
				: dialog.parentItemForAdd
					? `Добавить подпункт для «${dialog.parentItemForAdd.title}»`
					: 'Добавить пункт меню'
		"
		width="520px"
	>
		<el-form label-position="top">
			<el-form-item label="Название пункта">
				<el-input v-model="dialog.itemForm.title" placeholder="О платформе, Каталог, Контакты..." />
			</el-form-item>

			<el-form-item label="Тип ссылки">
				<el-radio-group v-model="dialog.itemForm.type" size="default">
					<el-radio-button label="page">📄 Страница CMS</el-radio-button>
					<el-radio-button label="url">🔗 Произвольный URL</el-radio-button>
					<el-radio-button label="anchor">⚓ Якорь (#секторы)</el-radio-button>
				</el-radio-group>
			</el-form-item>

			<el-form-item v-if="dialog.itemForm.type === 'page'" label="Выберите страницу">
				<el-select
					v-model="dialog.itemForm.page_id"
					placeholder="Выберите опубликованную страницу"
					style="width: 100%"
					@change="dialog.onPageSelected"
				>
					<el-option
						v-for="p in menusList.availablePages"
						:key="p.id"
						:label="`${p.title} (/p/${p.slug})`"
						:value="p.id"
					/>
				</el-select>
			</el-form-item>

			<el-form-item v-if="dialog.itemForm.type === 'url'" label="URL адрес">
				<el-input v-model="dialog.itemForm.url" placeholder="/about, /platforms или https://..." />
			</el-form-item>

			<el-form-item v-if="dialog.itemForm.type === 'anchor'" label="ID якорного блока (начинается с #)">
				<el-input v-model="dialog.itemForm.url" placeholder="#features, #faq, #contact" />
			</el-form-item>

			<el-form-item label="Способ открытия (Target)">
				<el-select v-model="dialog.itemForm.target" style="width: 100%">
					<el-option label="В текущей вкладке (_self)" value="_self" />
					<el-option label="В новой вкладке (_blank)" value="_blank" />
				</el-select>
			</el-form-item>
		</el-form>

		<template #footer>
			<el-button @click="dialog.isOpen = false">Отмена</el-button>
			<el-button type="primary" :disabled="!dialog.itemForm.title.trim()" @click="dialog.confirmSaveItem">
				{{ dialog.editingItem ? 'Сохранить пункт' : 'Добавить пункт' }}
			</el-button>
		</template>
	</el-dialog>
</template>

<script setup lang="ts">
import type { MenuItemDialog } from '../composables/useMenuItemDialog'
import type { MenusList } from '../composables/useMenusList'

defineProps<{
	dialog: MenuItemDialog
	menusList: MenusList
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

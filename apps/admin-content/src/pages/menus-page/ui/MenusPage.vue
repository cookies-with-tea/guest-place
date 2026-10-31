<template>
	<div class="menus-page">
		<div class="page-header">
			<div class="page-header__left">
				<div class="header-title-row">
					<h1>Управление меню и навигацией</h1>
					<el-tag size="small" type="success" effect="plain" class="version-tag">Stage 3.2</el-tag>
				</div>
				<p class="page-subtitle">
					Настройка структур навигации для шапки (header), подвала (footer) и мобильного/бокового меню с поддержкой
					вложенности и ссылок
				</p>
			</div>
			<div class="page-header__actions">
				<el-button plain :icon="OfficeBuilding" @click="router.push('/venues')"> Площадки </el-button>
				<el-button plain :icon="Grid" @click="router.push('/pages')"> Страницы сайта </el-button>
				<el-button plain :icon="Switch" @click="router.push('/redirects')"> Редиректы (301/302) </el-button>
				<el-button plain :icon="Plus" @click="createMenuDialog.open"> Новое меню </el-button>
				<el-button
					type="primary"
					:icon="DocumentChecked"
					:loading="currentMenu.saving"
					@click="currentMenu.saveCurrentMenu"
				>
					Сохранить изменения
				</el-button>
			</div>
		</div>

		<div class="menus-layout">
			<MenuLocationsSidebar :menus-list="menusList" :current-menu="currentMenu" />

			<main class="menus-editor">
				<div v-if="!currentMenu.currentMenu" class="empty-selection">
					<el-icon class="empty-icon"><Compass /></el-icon>
					<h3>Выберите меню для редактирования</h3>
					<p>Выберите область из списка слева или создайте новую навигационную область.</p>
				</div>

				<div v-else class="editor-card">
					<MenuEditorHeader
						:menus-list="menusList"
						:current-menu="currentMenu"
						@add-item="itemDialog.openAddItemDialog(null)"
						@delete-menu="currentMenu.confirmDeleteMenu(currentMenu.currentMenu)"
					/>
					<MenuLivePreviewBar :current-menu="currentMenu" />
					<MenuItemsTree
						:current-menu="currentMenu"
						@add-sub-item="itemDialog.openAddItemDialog"
						@edit-item="itemDialog.openEditItemDialog"
					/>
				</div>
			</main>
		</div>

		<MenuItemDialog :dialog="itemDialog" :menus-list="menusList" />
		<CreateMenuDialog :dialog="createMenuDialog" />
	</div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Compass, DocumentChecked, Grid, OfficeBuilding, Plus, Switch } from '@element-plus/icons-vue'
import { useCreateMenuDialog } from '#features/menus/composables/useCreateMenuDialog'
import { useCurrentMenu } from '#features/menus/composables/useCurrentMenu'
import { useMenuItemDialog } from '#features/menus/composables/useMenuItemDialog'
import { useMenusList } from '#features/menus/composables/useMenusList'
import CreateMenuDialog from '#features/menus/ui/CreateMenuDialog.vue'
import MenuEditorHeader from '#features/menus/ui/MenuEditorHeader.vue'
import MenuItemDialog from '#features/menus/ui/MenuItemDialog.vue'
import MenuItemsTree from '#features/menus/ui/MenuItemsTree.vue'
import MenuLivePreviewBar from '#features/menus/ui/MenuLivePreviewBar.vue'
import MenuLocationsSidebar from '#features/menus/ui/MenuLocationsSidebar.vue'

const router = useRouter()

const menusList = useMenusList()
const currentMenu = useCurrentMenu(menusList)
const itemDialog = useMenuItemDialog(menusList, currentMenu)
const createMenuDialog = useCreateMenuDialog(menusList, currentMenu)

onMounted(async () => {
	await Promise.all([menusList.loadMenus(), menusList.loadPages()])
	if (menusList.menus.length > 0 && !currentMenu.currentMenu) {
		currentMenu.selectMenu(menusList.menus[0])
	}
})
</script>

<style scoped>
.menus-page {
	max-width: 1400px;
	padding: 24px;
	margin: 0 auto;
}

.page-header {
	display: flex;
	flex-wrap: wrap;
	align-items: flex-start;
	justify-content: space-between;
	margin-bottom: 24px;
	gap: 16px;
}

.header-title-row {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: 10px;
}

.header-title-row h1 {
	font-weight: 700;
	font-size: 24px;
	color: var(--text-primary);
	margin: 0;
}

.page-subtitle {
	font-size: 13px;
	color: var(--text-muted);
	margin-top: 6px;
}

.page-header__actions {
	display: flex;
	flex-wrap: wrap;
	gap: 10px;
}

.menus-layout {
	display: grid;
	grid-template-columns: 300px 1fr;
	gap: 24px;
}

.menus-editor {
	border: 1px solid var(--border-color);
	border-radius: 12px;
	background: var(--bg-card);
	padding: 24px;
}

.empty-selection {
	text-align: center;
	color: var(--text-muted);
	padding: 60px 20px;
}

.empty-icon {
	width: 48px;
	height: 48px;
	color: var(--text-muted);
	margin-bottom: 12px;
}

@media (width <= 900px) {
	.menus-layout {
		grid-template-columns: 1fr;
	}
}
</style>

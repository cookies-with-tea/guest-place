<template>
	<div class="page-header">
		<div class="page-header__left">
			<div class="header-title-row">
				<h1>Управление страницами сайта</h1>
				<el-tag size="small" type="primary" effect="plain" class="version-tag">Dual Architecture CMS</el-tag>
			</div>
			<p class="page-subtitle"
				>Единый реестр страниц сайта: визуальный блочный конструктор и Schema-driven страницы со сложной вёрсткой</p
			>
		</div>
		<div class="page-header__actions">
			<el-button :icon="HomeFilled" plain @click="router.push('/home')">Главная</el-button>
			<el-button :icon="OfficeBuilding" plain @click="router.push('/venues')">Площадки</el-button>
			<el-button :icon="Menu" plain @click="router.push('/menus')">Меню сайта</el-button>
			<el-button :icon="Sort" plain @click="router.push('/redirects')">Редиректы (301/302)</el-button>
			<el-button :icon="MapLocation" plain @click="actions.openSitemap">Sitemap.xml</el-button>
			<el-button :icon="Grid" plain @click="router.push({ name: ROUTES.content.name })">Конструктор схем</el-button>
			<el-button :icon="Plus" type="primary" @click="actions.goToCreate">Создать блочную страницу</el-button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Grid, HomeFilled, MapLocation, Menu, OfficeBuilding, Plus, Sort } from '@element-plus/icons-vue'
import { ROUTES } from '@admin-panel/lib'
import type { PageListActions } from '../composables/usePageListActions'

defineProps<{
	actions: PageListActions
}>()

const router = useRouter()
</script>

<style scoped>
.page-header {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 20px;
	gap: 16px;
}

.header-title-row {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	margin-bottom: 4px;
	gap: 12px;
}

.page-header h1 {
	font-weight: 700;
	font-size: 24px;
	color: var(--text-primary);
	margin: 0;
}

.version-tag {
	font-weight: 600;
}

.page-subtitle {
	font-size: 14px;
	color: var(--text-muted);
	margin: 0;
}

.page-header__actions {
	display: flex;
	flex-wrap: wrap;
	gap: 12px;
}
</style>

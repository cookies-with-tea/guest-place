<template>
	<div class="page-header">
		<div class="page-header__left">
			<div class="header-title-row">
				<h1>Управление редиректами</h1>
				<el-tag size="small" type="primary" effect="plain" class="version-tag">Stage 3.4</el-tag>
			</div>
			<p class="page-subtitle">
				Таблица правил перенаправления (301 Permanent / 302 Temporary) для сохранения SEO-позиций и удобной
				маршрутизации
			</p>
		</div>
		<div class="page-header__actions">
			<el-button plain :icon="Grid" @click="router.push('/pages')"> Страницы сайта </el-button>
			<el-button plain :icon="Compass" @click="router.push('/menus')"> Меню сайта </el-button>
			<el-button type="primary" :icon="Plus" @click="redirects.openCreateDialog"> Создать редирект </el-button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Compass, Grid, Plus } from '@element-plus/icons-vue'

import type { RedirectsData } from '../../composables/useRedirectsData'

defineProps<{
	redirects: RedirectsData
}>()

const router = useRouter()
</script>

<style scoped>
.page-header {
	display: flex;
	align-items: flex-start;
	justify-content: space-between;
	margin-bottom: 20px;
}

.header-title-row {
	display: flex;
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
	gap: 10px;
}
</style>

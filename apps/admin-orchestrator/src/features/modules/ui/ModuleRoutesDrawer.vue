<template>
	<el-drawer
		v-model="routes.routesDrawerVisible"
		direction="rtl"
		size="480px"
		:title="`Пункты меню: ${routes.activeMfe?.displayName || routes.activeMfe?.name}`"
	>
		<div v-if="routes.activeMfe" class="drawer-content">
			<div class="drawer-notice">
				<el-icon class="notice-icon"><InfoFilled /></el-icon>
				<span>
					Включение и отключение отдельных страниц микрофронтенда в боковом меню Shell без перезапуска сервера.
				</span>
			</div>

			<div class="routes-actions-bar">
				<el-button size="small" type="success" plain @click="routes.enableAllRoutes"> Включить все </el-button>
				<el-button size="small" type="danger" plain @click="routes.disableAllRoutes"> Отключить все </el-button>
			</div>

			<div class="routes-list">
				<div
					v-for="item in routes.activeMfeRoutes"
					:key="item.path"
					class="route-item glass-card"
					:class="{ 'is-disabled': routes.isRouteDisabled(item.path) }"
				>
					<div class="route-info">
						<div class="route-title">{{ item.title }}</div>
						<code class="route-path">{{ item.path }}</code>
					</div>
					<el-switch
						:model-value="!routes.isRouteDisabled(item.path)"
						active-color="var(--gp-primary)"
						@change="routes.toggleRoute(item.path)"
					/>
				</div>
			</div>

			<div class="custom-route-box mt-4">
				<span class="custom-route-label">Добавить пользовательский путь роута:</span>
				<div class="custom-route-input-row">
					<el-input v-model="routes.customRoutePath" :placeholder="`/${routes.activeMfe.name}/custom`" size="small" />
					<el-button :icon="Plus" size="small" type="primary" @click="routes.addCustomRoute"> Добавить </el-button>
				</div>
			</div>
		</div>

		<template #footer>
			<el-button @click="routes.routesDrawerVisible = false">Закрыть</el-button>
			<el-button :loading="routes.isSavingRoutes" type="primary" @click="routes.saveRoutesConfig">
				Сохранить в PostgreSQL
			</el-button>
		</template>
	</el-drawer>
</template>

<script setup lang="ts">
import { InfoFilled, Plus } from '@element-plus/icons-vue'

import type { ModuleRoutes } from '../composables/useModuleRoutes'

defineProps<{
	routes: ModuleRoutes
}>()
</script>

<style scoped lang="scss">
.drawer-content {
	display: flex;
	flex-direction: column;
	gap: 16px;
}

.drawer-notice {
	display: flex;
	align-items: center;
	border: 1px solid rgb(66, 184, 131, 0.2);
	border-radius: 8px;
	font-size: 0.8rem;
	color: var(--gp-text-secondary, #a0aec0);
	background: rgb(66, 184, 131, 0.1);
	padding: 10px 14px;
	gap: 8px;

	.notice-icon {
		flex-shrink: 0;
		font-size: 16px;
		color: var(--gp-primary, #42b883);
	}
}

.routes-actions-bar {
	display: flex;
	gap: 8px;
}

.routes-list {
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.route-item {
	display: flex;
	align-items: center;
	justify-content: space-between;
	border: 1px solid rgb(255, 255, 255, 0.08);
	border-radius: 8px;
	background: rgb(255, 255, 255, 0.02);
	transition: opacity 0.2s;
	padding: 12px 16px;

	&.is-disabled {
		border-color: rgb(255, 95, 95, 0.2);
		opacity: 0.55;
	}
}

.route-info {
	display: flex;
	flex-direction: column;
}

.route-title {
	font-weight: 500;
	font-size: 0.9rem;
	color: var(--gp-text-main, #fff);
}

.route-path {
	font-family: monospace;
	font-size: 0.75rem;
	color: var(--gp-text-muted, #718096);
	margin-top: 2px;
}

.custom-route-box {
	display: flex;
	flex-direction: column;
	border-top: 1px solid rgb(255, 255, 255, 0.08);
	padding-top: 12px;
	gap: 8px;
}

.custom-route-label {
	font-size: 0.8rem;
	color: var(--gp-text-secondary, #a0aec0);
}

.custom-route-input-row {
	display: flex;
	gap: 8px;
}
</style>

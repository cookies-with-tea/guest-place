<template>
	<div id="__MF_ORCHESTRATOR_PAGE__" class="orchestrator-page">
		<div class="page-header">
			<h1>Оркестрация Микрофронтендов</h1>
		</div>

		<el-tabs v-model="activeTab" class="orchestrator-tabs">
			<!-- Вкладка Топология -->
			<el-tab-pane label="Топология" name="topology">
				<el-card v-loading="isLoading" class="stats-card glass-card">
					<template #header>
						<div class="card-header">
							<span>Карта системы (D3.js Visualization)</span>
						</div>
					</template>
					<MfeStatsChart :data="chartData" />
				</el-card>
			</el-tab-pane>

			<!-- Вкладка Микрофронтенды -->
			<el-tab-pane label="Модули (MFE)" name="modules">
				<el-card v-loading="isLoading" class="mfe-list-card glass-card">
					<template #header>
						<div class="card-header">
							<span>Список подключенных модулей</span>
							<el-button size="small" type="primary" @click="handleCreate">Добавить MFE</el-button>
						</div>
					</template>

					<el-table :data="microfrontends" style="width: 100%">
						<el-table-column label="ID" prop="name" width="120" />
						<el-table-column label="Название" prop="displayName" />
						<el-table-column label="URL" prop="url" show-overflow-tooltip width="200" />
						<el-table-column label="Категория" prop="category" width="100">
							<template #default="scope">
								<el-tag size="small" :type="scope.row.category === 'system' ? 'info' : 'warning'">
									{{ scope.row.category }}
								</el-tag>
							</template>
						</el-table-column>
						<el-table-column align="center" label="Порядок" prop="orderIndex" width="90" />
						<el-table-column label="Статус" width="100">
							<template #default="scope">
								<el-tag :type="scope.row.enabled ? 'success' : 'info'">
									{{ scope.row.enabled ? 'Активен' : 'Отключен' }}
								</el-tag>
							</template>
						</el-table-column>
						<el-table-column label="Действия" width="180">
							<template #default="scope">
								<el-button
									:disabled="scope.row.name === 'orchestrator'"
									plain
									size="small"
									type="primary"
									@click="handleEdit(scope.row)"
									>Изменить</el-button
								>
								<el-button
									:disabled="scope.row.name === 'orchestrator'"
									plain
									size="small"
									type="danger"
									@click="handleDelete(scope.row)"
									>Удалить</el-button
								>
							</template>
						</el-table-column>
					</el-table>
				</el-card>
			</el-tab-pane>
		</el-tabs>

		<!-- Dialog for Add/Edit -->
		<el-dialog v-model="dialogVisible" :title="isEdit ? 'Редактировать MFE' : 'Добавить MFE'" width="500px">
			<el-form label-width="120px" :model="form">
				<el-form-item label="ID (name)">
					<el-input v-model="form.name" :disabled="isEdit" placeholder="напр. admin-about" />
				</el-form-item>
				<el-form-item label="Название">
					<el-input v-model="form.displayName" placeholder="напр. About Page" />
				</el-form-item>
				<el-form-item label="URL (entry)">
					<el-input v-model="form.url" placeholder="http://localhost:3006/assets/remoteEntry.js" />
				</el-form-item>
				<el-row :gutter="20">
					<el-col :span="12">
						<el-form-item label="Scope">
							<el-input v-model="form.scope" placeholder="about" />
						</el-form-item>
					</el-col>
					<el-col :span="12">
						<el-form-item label="Module">
							<el-input v-model="form.module" placeholder="./AboutRoutes" />
						</el-form-item>
					</el-col>
				</el-row>
				<el-row :gutter="20">
					<el-col :span="12">
						<el-form-item label="Icon">
							<el-input v-model="form.icon" placeholder="EditPen" />
						</el-form-item>
					</el-col>
					<el-col :span="12">
						<el-form-item label="Категория">
							<el-select v-model="form.category" placeholder="System/Website">
								<el-option label="System" value="system" />
								<el-option label="Website" value="website" />
							</el-select>
						</el-form-item>
					</el-col>
				</el-row>
				<el-form-item label="Порядок">
					<el-input-number v-model="form.orderIndex" :max="100" :min="0" />
				</el-form-item>
				<el-form-item label="Активен">
					<el-switch v-model="form.enabled" :disabled="form.name === 'orchestrator'" />
				</el-form-item>
			</el-form>
			<template #footer>
				<span class="dialog-footer">
					<el-button plain @click="dialogVisible = false">Отмена</el-button>
					<el-button type="primary" @click="saveMfe">Сохранить</el-button>
				</span>
			</template>
		</el-dialog>
	</div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

import { useMfe } from '../../../entities/mfe/lib/composables/useMfe'

import MfeStatsChart from './MfeStatsChart.vue'

const activeTab = ref('topology')

const { microfrontends, isLoading, dialogVisible, isEdit, form, handleCreate, handleEdit, handleDelete, saveMfe } =
	useMfe()

const chartData = computed(() => {
	const nodes = [
		{ id: 'Shell', group: 1, status: 'online' as const },
		...(microfrontends.value || []).map((m: any) => {
			const mId = m.displayName || m.name || `mfe-${m.id}`

			return {
				id: mId,
				group: 2,
				status: m.enabled ? ('online' as const) : ('offline' as const),
			}
		}),
	]

	const links = (microfrontends.value || []).map((m: any) => {
		const mId = m.displayName || m.name || `mfe-${m.id}`

		return {
			source: 'Shell',
			target: mId,
			value: 2,
		}
	})

	return { nodes, links }
})
</script>

<style scoped>
.orchestrator-page {
	height: 100%;
	display: flex;
	flex-direction: column;
	padding: 24px;
}

.page-header {
	margin-bottom: 24px;
}

.card-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

/* Customizing Element Plus Tabs for Glass Theme */
:deep(.el-tabs__nav-wrap::after) {
	background-color: var(--gp-glass-border);
}

:deep(.el-tabs__item) {
	font-weight: 500;
	font-size: 16px;
	color: var(--gp-text-secondary);
	transition: all 0.3s;
}

:deep(.el-tabs__item.is-active),
:deep(.el-tabs__item:hover) {
	color: var(--gp-primary);
}

:deep(.el-tabs__active-bar) {
	height: 3px;
	border-radius: 3px;
	background-color: var(--gp-primary);
}

:deep(.el-tabs__content) {
	padding-top: 16px;
}
</style>

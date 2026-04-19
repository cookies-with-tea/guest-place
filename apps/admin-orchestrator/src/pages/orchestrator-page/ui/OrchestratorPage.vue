<template>
	<div id="__MF_ORCHESTRATOR_PAGE__" class="orchestrator-page">
		<div class="page-header">
			<h1>Оркестрация Микрофронтендов</h1>
		</div>

		<el-tabs v-model="activeTab" class="orchestrator-tabs">
			<!-- Вкладка Топология -->
			<el-tab-pane label="Топология" name="topology">
				<el-card class="stats-card glass-card" v-loading="isLoading">
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
				<el-card class="mfe-list-card glass-card" v-loading="isLoading">
					<template #header>
						<div class="card-header">
							<span>Список подключенных модулей</span>
							<el-button type="primary" size="small" @click="handleCreate">Добавить MFE</el-button>
						</div>
					</template>

					<el-table :data="microfrontends" style="width: 100%">
						<el-table-column prop="name" label="ID" width="120" />
						<el-table-column prop="displayName" label="Название" />
						<el-table-column prop="url" label="URL" width="200" show-overflow-tooltip />
						<el-table-column prop="category" label="Категория" width="100">
							<template #default="scope">
								<el-tag size="small" :type="scope.row.category === 'system' ? 'info' : 'warning'">
									{{ scope.row.category }}
								</el-tag>
							</template>
						</el-table-column>
						<el-table-column prop="orderIndex" label="Порядок" width="90" align="center" />
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
									type="primary"
									size="small"
									@click="handleEdit(scope.row)"
									>Изменить</el-button
								>
								<el-button
									:disabled="scope.row.name === 'orchestrator'"
									plain
									type="danger"
									size="small"
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
			<el-form :model="form" label-width="120px">
				<el-form-item label="ID (name)">
					<el-input v-model="form.name" placeholder="напр. admin-about" :disabled="isEdit" />
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
					<el-input-number v-model="form.orderIndex" :min="0" :max="100" />
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
import { ref, computed } from 'vue'
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

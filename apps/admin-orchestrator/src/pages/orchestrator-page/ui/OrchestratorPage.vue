<template>
	<div id="__MF_ORCHESTRATOR_PAGE__" class="orchestrator-page">
		<h1>Оркестрация Микрофронтендов</h1>

		<el-card class="stats-card glass-card" style="margin-bottom: 24px;">
			<template #header>
				<div class="card-header">
					<span>Карта системы (D3.js Visualization)</span>
				</div>
			</template>
			<MfeStatsChart :data="chartData" />
		</el-card>
		
		<el-card class="mfe-list-card glass-card">
			<template #header>
				<div class="card-header">
					<span>Список подключенных модулей</span>
					<el-button type="primary" size="small" @click="handleCreate">Добавить MFE</el-button>
				</div>
			</template>
			
			<el-table :data="microfrontends" style="width: 100%">
				<el-table-column prop="name" label="ID" width="180" />
				<el-table-column prop="displayName" label="Название" />
				<el-table-column prop="url" label="URL (entry)" />
				<el-table-column label="Статус">
					<template #default="scope">
						<el-tag :type="scope.row.enabled ? 'success' : 'info'">
							{{ scope.row.enabled ? 'Активен' : 'Отключен' }}
						</el-tag>
					</template>
				</el-table-column>
				<el-table-column label="Действия">
					<template #default="scope">
						<el-button link type="primary" icon="Edit" @click="handleEdit(scope.row)">Изменить</el-button>
						<el-button link type="danger" icon="Delete" @click="handleDelete(scope.row)">Удалить</el-button>
					</template>
				</el-table-column>
			</el-table>
		</el-card>

		<!-- Dialog for Add/Edit -->
		<el-dialog v-model="dialogVisible" :title="isEdit ? 'Редактировать MFE' : 'Добавить MFE'" width="500px">
			<el-form :model="form" label-width="120px">
				<el-form-item label="ID (name)">
					<el-input v-model="form.name" placeholder="напр. admin-analytics" />
				</el-form-item>
				<el-form-item label="Название">
					<el-input v-model="form.displayName" placeholder="напр. Аналитика" />
				</el-form-item>
				<el-form-item label="URL (entry)">
					<el-input v-model="form.url" placeholder="http://localhost:3001/assets/remoteEntry.js" />
				</el-form-item>
				<el-form-item label="Активен">
					<el-switch v-model="form.enabled" />
				</el-form-item>
			</el-form>
			<template #footer>
				<span class="dialog-footer">
					<el-button @click="dialogVisible = false">Отмена</el-button>
					<el-button type="primary" @click="saveMfe">Сохранить</el-button>
				</span>
			</template>
		</el-dialog>

		<div class="feature-flags-section" style="margin-top: 32px;">
			<h2>Feature Flags (Фича-флаги)</h2>
			<el-table :data="flags" style="width: 100%">
				<el-table-column prop="name" label="Название" width="200" />
				<el-table-column prop="description" label="Описание" />
				<el-table-column label="Состояние" width="120">
					<template #default="scope">
						<el-switch :model-value="scope.row.enabled" @change="toggleFlag(scope.row.id)" />
					</template>
				</el-table-column>
			</el-table>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useFeatureFlags } from '@admin-panel/lib'
import MfeStatsChart from './MfeStatsChart.vue'

const { flags, toggleFlag } = useFeatureFlags()

const microfrontends = ref([
	{ id: 'statistics', name: 'statistics', displayName: 'Статистика', url: 'http://localhost:3001/assets/remoteEntry.js', enabled: true },
	{ id: 'translations', name: 'translations', displayName: 'Переводы', url: 'http://localhost:3002/assets/remoteEntry.js', enabled: true },
	{ id: 'users', name: 'users', displayName: 'Пользователи', url: 'http://localhost:3003/assets/remoteEntry.js', enabled: true },
	{ id: 'media', name: 'media', displayName: 'Медиа', url: 'http://localhost:4004/assets/remoteEntry.js', enabled: true },
])

const chartData = computed(() => {
	const nodes = [
		{ id: 'Shell', group: 1, status: 'online' as const },
		...microfrontends.value.map(m => ({
			id: m.displayName,
			group: 2,
			status: m.enabled ? 'online' as const : 'offline' as const
		}))
	]

	const links = microfrontends.value.map(m => ({
		source: 'Shell',
		target: m.displayName,
		value: 2
	}))

	return { nodes, links }
})

const dialogVisible = ref(false)
const isEdit = ref(false)
const form = reactive({
	id: '',
	name: '',
	displayName: '',
	url: '',
	enabled: true
})

const handleCreate = () => {
	isEdit.value = false
	Object.assign(form, { id: '', name: '', displayName: '', url: '', enabled: true })
	dialogVisible.value = true
}

const handleEdit = (row: any) => {
	isEdit.value = true
	Object.assign(form, row)
	dialogVisible.value = true
}

const handleDelete = (row: any) => {
	microfrontends.value = microfrontends.value.filter(m => m.id !== row.id)
}

const saveMfe = () => {
	if (isEdit.value) {
		const index = microfrontends.value.findIndex(m => m.id === form.id)
		if (index !== -1) microfrontends.value[index] = { ...form }
	} else {
		const newId = form.name || `mfe-${Date.now()}`
		microfrontends.value.push({ ...form, id: newId })
	}
	dialogVisible.value = false
}
</script>

<style scoped>
.orchestrator-page {
	padding: 24px;
}

.card-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
}
</style>

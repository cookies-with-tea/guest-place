<template>
	<div class="redirects-page">
		<!-- Header -->
		<div class="page-header">
			<div class="page-header__left">
				<div class="header-title-row">
					<h1>Управление редиректами</h1>
					<el-tag size="small" type="primary" effect="plain" class="version-tag">Stage 3.4</el-tag>
				</div>
				<p class="page-subtitle">
					Таблица правил перенаправления (301 Permanent / 302 Temporary) для сохранения SEO-позиций и удобной маршрутизации
				</p>
			</div>
			<div class="page-header__actions">
				<el-button plain @click="router.push('/pages')">
					🧱 Страницы сайта
				</el-button>
				<el-button plain @click="router.push('/menus')">
					🧭 Меню сайта
				</el-button>
				<el-button type="primary" @click="openCreateDialog">
					+ Создать редирект
				</el-button>
			</div>
		</div>

		<!-- Quick Info Card -->
		<div class="info-strip">
			<div class="info-item">
				<span class="info-icon">🎯</span>
				<div>
					<strong>301 Moved Permanently</strong>
					<span>Передаёт 95–99% ссылочного веса поисковых систем (Google, Яндекс). Используется при постоянной смене URL.</span>
				</div>
			</div>
			<div class="info-sep"></div>
			<div class="info-item">
				<span class="info-icon">⏳</span>
				<div>
					<strong>302 Found (Временный)</strong>
					<span>Не передаёт поисковый вес. Используется для временных акций, технических работ или A/B тестов.</span>
				</div>
			</div>
		</div>

		<!-- Filter Bar -->
		<div class="filter-card">
			<div class="filter-left">
				<el-input
					v-model="searchQuery"
					placeholder="Поиск по исходному или целевому URL..."
					clearable
					style="width: 320px"
				>
					<template #prefix>🔍</template>
				</el-input>

				<el-select v-model="codeFilter" style="width: 180px">
					<el-option label="Все коды статуса" value="all" />
					<el-option label="301 Постоянный" :value="301" />
					<el-option label="302 Временный" :value="302" />
				</el-select>

				<el-select v-model="statusFilter" style="width: 160px">
					<el-option label="Все статусы" value="all" />
					<el-option label="Только активные" value="active" />
					<el-option label="Только неактивные" value="inactive" />
				</el-select>
			</div>

			<div class="filter-right">
				<span class="total-badge">Всего правил: {{ filteredRedirects.length }}</span>
			</div>
		</div>

		<!-- Table -->
		<div class="table-card">
			<el-table v-loading="loading" :data="filteredRedirects" style="width: 100%">
				<el-table-column label="Исходный путь (Source)" min-width="200">
					<template #default="{ row }">
						<div class="path-cell">
							<code class="source-path">{{ row.source_path }}</code>
							<el-button size="small" text @click="copyPath(row.source_path)">📋</el-button>
						</div>
					</template>
				</el-table-column>

				<el-table-column label="→" width="50" align="center">
					<template #default>
						<span style="color: #9ca3af; font-size: 16px">➔</span>
					</template>
				</el-table-column>

				<el-table-column label="Целевой путь (Target)" min-width="220">
					<template #default="{ row }">
						<div class="path-cell">
							<code class="target-path">{{ row.target_path }}</code>
							<el-button size="small" text @click="copyPath(row.target_path)">📋</el-button>
						</div>
					</template>
				</el-table-column>

				<el-table-column label="Тип редиректа" width="160" align="center">
					<template #default="{ row }">
						<el-tag :type="row.status_code === 301 ? 'success' : 'warning'" effect="light">
							{{ row.status_code === 301 ? '301 Permanent' : '302 Temporary' }}
						</el-tag>
					</template>
				</el-table-column>

				<el-table-column label="Переходов" width="130" align="center">
					<template #default="{ row }">
						<span class="hits-counter">👁️ {{ row.hits || 0 }}</span>
					</template>
				</el-table-column>

				<el-table-column label="Активен" width="100" align="center">
					<template #default="{ row }">
						<el-switch
							v-model="row.is_active"
							@change="(val: boolean) => toggleActive(row, val)"
						/>
					</template>
				</el-table-column>

				<el-table-column label="Действия" width="220" align="right">
					<template #default="{ row }">
						<el-button size="small" plain type="info" @click="testRedirect(row)">
							⚡ Проверить
						</el-button>
						<el-button size="small" plain @click="openEditDialog(row)">
							Изменить
						</el-button>
						<el-button size="small" plain type="danger" @click="confirmDelete(row)">
							✕
						</el-button>
					</template>
				</el-table-column>
			</el-table>
		</div>

		<!-- Dialog: Create / Edit Redirect -->
		<el-dialog
			v-model="isDialogOpen"
			:title="editingId ? 'Редактировать редирект' : 'Создать новое правило редиректа'"
			width="520px"
		>
			<el-form label-position="top">
				<el-form-item label="Исходный путь (Source Path)">
					<el-input
						v-model="form.source_path"
						placeholder="/old-catalog, /about-us..."
						@blur="normalizeSourcePath"
					>
						<template #prepend>/</template>
					</el-input>
					<div class="field-hint">Старый URL адрес на сайте, с которого будет происходить перенаправление.</div>
				</el-form-item>

				<el-form-item label="Целевой путь (Target Path)">
					<el-input v-model="form.target_path" placeholder="/platforms, /p/about или https://...">
						<template #append>
							<el-select
								placeholder="Выбрать из CMS"
								style="width: 140px"
								@change="onSelectPageTarget"
							>
								<el-option
									v-for="p in pages"
									:key="p.id"
									:label="p.title"
									:value="`/p/${p.slug}`"
								/>
							</el-select>
						</template>
					</el-input>
					<div class="field-hint">Новый адрес страницы или внешний URL.</div>
				</el-form-item>

				<el-form-item label="Тип перенаправления (HTTP Code)">
					<el-radio-group v-model="form.status_code">
						<el-radio :label="301">
							<strong>301 Moved Permanently</strong> (Постоянный, передаёт вес)
						</el-radio>
						<el-radio :label="302">
							<strong>302 Temporary</strong> (Временный, для акций и тестов)
						</el-radio>
					</el-radio-group>
				</el-form-item>

				<el-form-item>
					<el-checkbox v-model="form.is_active">
						Правило активно (включено)
					</el-checkbox>
				</el-form-item>
			</el-form>

			<template #footer>
				<el-button @click="isDialogOpen = false">Отмена</el-button>
				<el-button
					type="primary"
					:disabled="!form.source_path.trim() || !form.target_path.trim()"
					@click="confirmSave"
				>
					{{ editingId ? 'Сохранить изменения' : 'Создать редирект' }}
				</el-button>
			</template>
		</el-dialog>
	</div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { redirectsApi, type RedirectItem } from '#entities/redirects'
import { pagesApi, type PageItem } from '#entities/pages'

const router = useRouter()

const loading = ref(true)
const redirects = ref<RedirectItem[]>([])
const pages = ref<PageItem[]>([])

const searchQuery = ref('')
const codeFilter = ref<string | number>('all')
const statusFilter = ref<'all' | 'active' | 'inactive'>('all')

const isDialogOpen = ref(false)
const editingId = ref<string | null>(null)

const form = reactive({
	source_path: '',
	target_path: '',
	status_code: 301,
	is_active: true,
})

onMounted(async () => {
	await Promise.all([loadRedirects(), loadPages()])
})

async function loadRedirects() {
	loading.value = true
	try {
		const res = await redirectsApi.getRedirects()
		redirects.value = res.data || []
	} catch (e: any) {
		ElMessage.error(e.message || 'Ошибка загрузки редиректов')
	} finally {
		loading.value = false
	}
}

async function loadPages() {
	try {
		const res = await pagesApi.getPages()
		pages.value = res.data || []
	} catch (e) {
		console.warn('Failed to load pages:', e)
	}
}

const filteredRedirects = computed(() => {
	let list = redirects.value

	if (searchQuery.value.trim()) {
		const q = searchQuery.value.trim().toLowerCase()
		list = list.filter(
			(r) =>
				r.source_path.toLowerCase().includes(q) ||
				r.target_path.toLowerCase().includes(q),
		)
	}

	if (codeFilter.value !== 'all') {
		list = list.filter((r) => r.status_code === Number(codeFilter.value))
	}

	if (statusFilter.value === 'active') {
		list = list.filter((r) => r.is_active)
	} else if (statusFilter.value === 'inactive') {
		list = list.filter((r) => !r.is_active)
	}

	return list
})

function normalizeSourcePath() {
	if (!form.source_path) return
	let p = form.source_path.trim()
	if (p.startsWith('/')) {
		p = p.substring(1)
	}
	form.source_path = p
}

function onSelectPageTarget(val: string) {
	if (val) {
		form.target_path = val
	}
}

function copyPath(text: string) {
	navigator.clipboard.writeText(text)
	ElMessage.success(`Скопировано: ${text}`)
}

async function toggleActive(row: RedirectItem, val: boolean) {
	try {
		await redirectsApi.updateRedirect(row.id, { is_active: val })
		ElMessage.success(`Редирект ${val ? 'активирован' : 'отключен'}`)
	} catch (e: any) {
		row.is_active = !val
		ElMessage.error(e.message || 'Ошибка изменения статуса')
	}
}

async function testRedirect(row: RedirectItem) {
	try {
		const res = await redirectsApi.checkRedirect(row.source_path)
		if (res.data?.matched) {
			ElMessage({
				type: 'success',
				message: `⚡ Проверка успешна! ${row.source_path} → ${res.data.target_path} (Код: ${res.data.status_code})`,
				duration: 4000,
			})
			row.hits++
		} else {
			ElMessage.warning(`Редирект для ${row.source_path} не найден или отключен.`)
		}
	} catch (e: any) {
		ElMessage.error(e.message || 'Ошибка проверки редиректа')
	}
}

function openCreateDialog() {
	editingId.value = null
	form.source_path = ''
	form.target_path = ''
	form.status_code = 301
	form.is_active = true
	isDialogOpen.value = true
}

function openEditDialog(row: RedirectItem) {
	editingId.value = row.id
	form.source_path = row.source_path.replace(/^\/+/, '')
	form.target_path = row.target_path
	form.status_code = row.status_code
	form.is_active = row.is_active
	isDialogOpen.value = true
}

async function confirmSave() {
	let fullSource = form.source_path.trim()
	if (!fullSource.startsWith('/')) {
		fullSource = `/${fullSource}`
	}

	try {
		if (editingId.value) {
			await redirectsApi.updateRedirect(editingId.value, {
				source_path: fullSource,
				target_path: form.target_path.trim(),
				status_code: form.status_code,
				is_active: form.is_active,
			})
			ElMessage.success('Редирект успешно обновлен')
		} else {
			await redirectsApi.createRedirect({
				source_path: fullSource,
				target_path: form.target_path.trim(),
				status_code: form.status_code,
				is_active: form.is_active,
			})
			ElMessage.success('Редирект успешно создан')
		}
		isDialogOpen.value = false
		await loadRedirects()
	} catch (e: any) {
		ElMessage.error(e.message || 'Ошибка сохранения редиректа')
	}
}

async function confirmDelete(row: RedirectItem) {
	try {
		await ElMessageBox.confirm(`Удалить редирект ${row.source_path} → ${row.target_path}?`, 'Подтверждение', {
			confirmButtonText: 'Удалить',
			cancelButtonText: 'Отмена',
			type: 'warning',
		})
		await redirectsApi.deleteRedirect(row.id)
		ElMessage.success('Редирект удален')
		await loadRedirects()
	} catch {}
}
</script>

<style scoped>
.redirects-page {
	padding: 24px;
	max-width: 1400px;
	margin: 0 auto;
}

.page-header {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	margin-bottom: 20px;
}

.header-title-row {
	display: flex;
	align-items: center;
	gap: 10px;
}

.header-title-row h1 {
	font-size: 24px;
	font-weight: 700;
	margin: 0;
	color: var(--text-primary);
}

.page-subtitle {
	color: var(--text-muted);
	font-size: 13px;
	margin-top: 6px;
}

.page-header__actions {
	display: flex;
	gap: 10px;
}

/* Info Strip */
.info-strip {
	display: flex;
	background: var(--bg-card);
	border: 1px solid var(--border-color);
	border-radius: 10px;
	padding: 14px 20px;
	margin-bottom: 20px;
	gap: 24px;
}

.info-item {
	display: flex;
	align-items: flex-start;
	gap: 12px;
	flex: 1;
}

.info-icon {
	font-size: 24px;
}

.info-item strong {
	display: block;
	font-size: 13px;
	color: var(--text-primary);
	margin-bottom: 2px;
}

.info-item span {
	font-size: 12px;
	color: var(--text-muted);
	line-height: 1.4;
}

.info-sep {
	width: 1px;
	background: var(--border-color);
}

/* Filter Card */
.filter-card {
	display: flex;
	justify-content: space-between;
	align-items: center;
	background: var(--bg-card);
	border: 1px solid var(--border-color);
	border-radius: 10px;
	padding: 14px 18px;
	margin-bottom: 16px;
}

.filter-left {
	display: flex;
	align-items: center;
	gap: 12px;
}

.total-badge {
	font-size: 13px;
	color: var(--text-muted);
	font-weight: 500;
}

/* Table */
.table-card {
	background: var(--bg-card);
	border: 1px solid var(--border-color);
	border-radius: 12px;
	overflow: hidden;
}

:deep(.el-table) {
	--el-table-header-bg-color: var(--bg-surface);
	--el-table-row-hover-bg-color: rgba(255, 255, 255, 0.05);
	--el-table-border-color: var(--border-color);
	--el-table-bg-color: transparent;
	--el-table-tr-bg-color: transparent;
	--el-table-text-color: var(--text-primary);
	--el-table-header-text-color: var(--text-muted);

	color: var(--text-primary);
	background-color: transparent !important;
}

:deep(.el-table th.el-table__cell) {
	background-color: var(--bg-surface) !important;
	border-bottom: 1px solid var(--border-color) !important;
	color: var(--text-muted) !important;
}

:deep(.el-table td.el-table__cell) {
	border-bottom: 1px solid var(--border-color) !important;
}

:deep(.el-table tr) {
	background-color: transparent !important;
}

.path-cell {
	display: flex;
	align-items: center;
	gap: 6px;
}

.source-path {
	font-family: monospace;
	font-size: 13px;
	background: rgba(239, 68, 68, 0.15);
	color: #f87171;
	border: 1px solid rgba(239, 68, 68, 0.3);
	padding: 2px 6px;
	border-radius: 4px;
}

.target-path {
	font-family: monospace;
	font-size: 13px;
	background: rgba(34, 197, 94, 0.15);
	color: #4ade80;
	border: 1px solid rgba(34, 197, 94, 0.3);
	padding: 2px 6px;
	border-radius: 4px;
}

.hits-counter {
	font-size: 12px;
	color: var(--text-primary);
	font-weight: 600;
	background: var(--bg-surface);
	border: 1px solid var(--border-color);
	padding: 2px 8px;
	border-radius: 12px;
}

.field-hint {
	font-size: 11px;
	color: var(--text-muted);
	margin-top: 4px;
}

:deep(.el-dialog) {
	background-color: var(--gp-bg-main, #0f172a);
	color: var(--text-primary);
	border: 1px solid var(--border-color);
}

:deep(.el-dialog__title) {
	color: var(--text-primary);
}

:deep(.el-form-item__label) {
	color: var(--text-primary);
}
</style>

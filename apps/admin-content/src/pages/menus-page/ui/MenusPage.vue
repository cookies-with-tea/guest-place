<template>
	<div class="menus-page">
		<!-- Header -->
		<div class="page-header">
			<div class="page-header__left">
				<div class="header-title-row">
					<h1>Управление меню и навигацией</h1>
					<el-tag size="small" type="success" effect="plain" class="version-tag">Stage 3.2</el-tag>
				</div>
				<p class="page-subtitle">
					Настройка структур навигации для шапки (header), подвала (footer) и мобильного/бокового меню с поддержкой вложенности и ссылок
				</p>
			</div>
			<div class="page-header__actions">
				<el-button plain @click="router.push('/venues')">
					🏰 Площадки
				</el-button>
				<el-button plain @click="router.push('/pages')">
					🧱 Страницы сайта
				</el-button>
				<el-button plain @click="router.push('/redirects')">
					🔀 Редиректы (301/302)
				</el-button>
				<el-button plain @click="openCreateMenuDialog">
					+ Новое меню
				</el-button>
				<el-button type="primary" :loading="saving" @click="saveCurrentMenu">
					💾 Сохранить изменения
				</el-button>
			</div>
		</div>

		<!-- Main content -->
		<div class="menus-layout">
			<!-- Sidebar: Location selector -->
			<aside class="menus-sidebar">
				<div class="sidebar-header">
					<span class="sidebar-title">Области навигации</span>
				</div>
				<div v-if="loading" class="sidebar-loading">
					<el-skeleton animated :rows="3" />
				</div>
				<div v-else class="locations-list">
					<div
						v-for="menu in menus"
						:key="menu.id"
						class="location-card"
						:class="{ active: currentMenu?.id === menu.id }"
						@click="selectMenu(menu)"
					>
						<div class="loc-card-header">
							<span class="loc-icon">{{ getLocationIcon(menu.location) }}</span>
							<div class="loc-card-info">
								<strong>{{ menu.name }}</strong>
								<code>{{ menu.location }}</code>
							</div>
						</div>
						<div class="loc-card-meta">
							<span>{{ countTotalItems(menu.items) }} пунктов</span>
							<el-tag v-if="isSystemLocation(menu.location)" size="small" type="info">Системное</el-tag>
						</div>
					</div>
				</div>
			</aside>

			<!-- Editor Column -->
			<main class="menus-editor">
				<div v-if="!currentMenu" class="empty-selection">
					<div class="empty-icon">🧭</div>
					<h3>Выберите меню для редактирования</h3>
					<p>Выберите область из списка слева или создайте новую навигационную область.</p>
				</div>

				<div v-else class="editor-card">
					<!-- Menu Info Header -->
					<div class="editor-header">
						<div class="editor-header-fields">
							<div class="field-item">
								<label>Название меню:</label>
								<el-input v-model="currentMenu.name" placeholder="Главное меню" style="width: 260px" />
							</div>
							<div class="field-item">
								<label>Идентификатор расположения (location):</label>
								<el-input
									v-model="currentMenu.location"
									placeholder="header"
									:disabled="isSystemLocation(currentMenu.location)"
									style="width: 200px"
								/>
							</div>
						</div>
						<div class="editor-header-actions">
							<el-button type="success" plain @click="openAddItemDialog(null)">
								+ Добавить пункт меню
							</el-button>
							<el-button
								v-if="!isSystemLocation(currentMenu.location)"
								type="danger"
								plain
								@click="confirmDeleteMenu(currentMenu)"
							>
								Удалить меню
							</el-button>
						</div>
					</div>

					<!-- Visual Navigation Preview Bar -->
					<div class="menu-live-preview">
						<div class="preview-label">
							<span>Предпросмотр навигации ({{ currentMenu.location }}):</span>
						</div>
						<div class="preview-bar-container" :class="`is-${currentMenu.location}`">
							<div v-if="currentMenu.location === 'header'" class="preview-header-mock">
								<div class="mock-logo">Guest &amp; Place</div>
								<div class="mock-nav">
									<div
										v-for="item in currentMenu.items"
										:key="item.id"
										class="mock-nav-item"
										:class="{ 'has-dropdown': item.children && item.children.length > 0 }"
									>
										<span>{{ item.title }}</span>
										<span v-if="item.children && item.children.length > 0" class="caret">▾</span>
									</div>
								</div>
							</div>
							<div v-else class="preview-simple-mock">
								<div v-for="item in currentMenu.items" :key="item.id" class="mock-simple-item">
									<span>{{ item.title }}</span>
									<span v-if="item.children?.length" class="mock-sub-count">({{ item.children.length }})</span>
								</div>
							</div>
						</div>
					</div>

					<!-- Items Tree / List -->
					<div class="items-list-container">
						<div class="items-list-header">
							<h3>Структура пунктов меню</h3>
							<span class="items-hint">Перемещайте пункты стрелками для изменения порядка и вложенности</span>
						</div>

						<div v-if="!currentMenu.items || currentMenu.items.length === 0" class="no-items-state">
							<span>Пункты меню ещё не добавлены. Нажмите «+ Добавить пункт меню».</span>
						</div>

						<div v-else class="items-tree">
							<template v-for="(item, idx) in currentMenu.items" :key="item.id">
								<!-- Root Level Item -->
								<div class="tree-item root-item">
									<div class="item-main-row">
										<div class="item-reorder-btns">
											<el-button
												size="small"
												circle
												:disabled="idx === 0"
												@click="moveItemUp(currentMenu.items, idx)"
											>
												▲
											</el-button>
											<el-button
												size="small"
												circle
												:disabled="idx === currentMenu.items.length - 1"
												@click="moveItemDown(currentMenu.items, idx)"
											>
												▼
											</el-button>
										</div>

										<div class="item-badge-type" :class="`type-${item.type}`">
											{{ getTypeLabel(item.type) }}
										</div>

										<div class="item-title-col">
											<strong>{{ item.title }}</strong>
											<span class="item-target-url">{{ formatItemUrl(item) }}</span>
										</div>

										<div class="item-target-flag">
											<el-tag size="small" :type="item.target === '_blank' ? 'warning' : 'info'" effect="plain">
												{{ item.target === '_blank' ? 'В новой вкладке ↗' : 'В этой вкладке' }}
											</el-tag>
										</div>

										<div class="item-actions">
											<el-button size="small" plain type="primary" @click="openAddItemDialog(item)">
												+ Подпункт
											</el-button>
											<el-button size="small" plain @click="openEditItemDialog(item, currentMenu.items)">
												Изменить
											</el-button>
											<el-button size="small" plain type="danger" @click="removeItem(currentMenu.items, idx)">
												✕
											</el-button>
										</div>
									</div>

									<!-- Nested Children Items -->
									<div v-if="item.children && item.children.length > 0" class="sub-items-container">
										<div
											v-for="(sub, subIdx) in item.children"
											:key="sub.id"
											class="tree-item sub-item"
										>
											<div class="item-main-row">
												<div class="sub-tree-indent">↳</div>

												<div class="item-reorder-btns">
													<el-button
														size="small"
														circle
														:disabled="subIdx === 0"
														@click="moveItemUp(item.children, subIdx)"
													>
														▲
													</el-button>
													<el-button
														size="small"
														circle
														:disabled="subIdx === item.children.length - 1"
														@click="moveItemDown(item.children, subIdx)"
													>
														▼
													</el-button>
												</div>

												<div class="item-badge-type" :class="`type-${sub.type}`">
													{{ getTypeLabel(sub.type) }}
												</div>

												<div class="item-title-col">
													<span>{{ sub.title }}</span>
													<span class="item-target-url">{{ formatItemUrl(sub) }}</span>
												</div>

												<div class="item-target-flag">
													<el-tag size="small" :type="sub.target === '_blank' ? 'warning' : 'info'" effect="plain">
														{{ sub.target === '_blank' ? '↗' : '—' }}
													</el-tag>
												</div>

												<div class="item-actions">
													<el-button size="small" plain @click="openEditItemDialog(sub, item.children)">
														Изменить
													</el-button>
													<el-button size="small" plain type="danger" @click="removeItem(item.children, subIdx)">
														✕
													</el-button>
												</div>
											</div>
										</div>
									</div>
								</div>
							</template>
						</div>
					</div>
				</div>
			</main>
		</div>

		<!-- Dialog: Add / Edit Item -->
		<el-dialog
			v-model="isItemDialogOpen"
			:title="editingItem ? 'Редактировать пункт меню' : parentItemForAdd ? `Добавить подпункт для «${parentItemForAdd.title}»` : 'Добавить пункт меню'"
			width="520px"
		>
			<el-form label-position="top">
				<el-form-item label="Название пункта">
					<el-input v-model="itemForm.title" placeholder="О платформе, Каталог, Контакты..." />
				</el-form-item>

				<el-form-item label="Тип ссылки">
					<el-radio-group v-model="itemForm.type" size="default">
						<el-radio-button label="page">📄 Страница CMS</el-radio-button>
						<el-radio-button label="url">🔗 Произвольный URL</el-radio-button>
						<el-radio-button label="anchor">⚓ Якорь (#секторы)</el-radio-button>
					</el-radio-group>
				</el-form-item>

				<!-- If type === 'page' -->
				<el-form-item v-if="itemForm.type === 'page'" label="Выберите страницу">
					<el-select v-model="itemForm.page_id" placeholder="Выберите опубликованную страницу" style="width: 100%" @change="onPageSelected">
						<el-option
							v-for="p in availablePages"
							:key="p.id"
							:label="`${p.title} (/p/${p.slug})`"
							:value="p.id"
						/>
					</el-select>
				</el-form-item>

				<!-- If type === 'url' -->
				<el-form-item v-if="itemForm.type === 'url'" label="URL адрес">
					<el-input v-model="itemForm.url" placeholder="/about, /platforms или https://..." />
				</el-form-item>

				<!-- If type === 'anchor' -->
				<el-form-item v-if="itemForm.type === 'anchor'" label="ID якорного блока (начинается с #)">
					<el-input v-model="itemForm.url" placeholder="#features, #faq, #contact" />
				</el-form-item>

				<el-form-item label="Способ открытия (Target)">
					<el-select v-model="itemForm.target" style="width: 100%">
						<el-option label="В текущей вкладке (_self)" value="_self" />
						<el-option label="В новой вкладке (_blank)" value="_blank" />
					</el-select>
				</el-form-item>
			</el-form>

			<template #footer>
				<el-button @click="isItemDialogOpen = false">Отмена</el-button>
				<el-button type="primary" :disabled="!itemForm.title.trim()" @click="confirmSaveItem">
					{{ editingItem ? 'Сохранить пункт' : 'Добавить пункт' }}
				</el-button>
			</template>
		</el-dialog>

		<!-- Dialog: Create New Menu -->
		<el-dialog v-model="isCreateMenuDialogOpen" title="Создать новое меню" width="460px">
			<el-form label-position="top">
				<el-form-item label="Название меню">
					<el-input v-model="newMenuForm.name" placeholder="Меню мобильной версии" />
				</el-form-item>
				<el-form-item label="Идентификатор расположения (slug / location)">
					<el-input v-model="newMenuForm.location" placeholder="mobile-drawer, header-secondary" />
				</el-form-item>
			</el-form>
			<template #footer>
				<el-button @click="isCreateMenuDialogOpen = false">Отмена</el-button>
				<el-button type="primary" :disabled="!newMenuForm.name.trim() || !newMenuForm.location.trim()" @click="confirmCreateMenu">
					Создать меню
				</el-button>
			</template>
		</el-dialog>
	</div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { menusApi, type Menu, type MenuItem } from '#entities/menus'
import { pagesApi, type PageItem } from '#entities/pages'

const router = useRouter()

const loading = ref(true)
const saving = ref(false)
const menus = ref<Menu[]>([])
const currentMenu = ref<Menu | null>(null)
const availablePages = ref<PageItem[]>([])

// Item Dialog
const isItemDialogOpen = ref(false)
const editingItem = ref<MenuItem | null>(null)
const parentItemForAdd = ref<MenuItem | null>(null)
let targetContainerArray: MenuItem[] = []

const itemForm = reactive({
	title: '',
	type: 'url' as 'page' | 'url' | 'anchor',
	page_id: '',
	url: '',
	target: '_self' as '_self' | '_blank',
})

// Create Menu Dialog
const isCreateMenuDialogOpen = ref(false)
const newMenuForm = reactive({
	name: '',
	location: '',
})

onMounted(async () => {
	await Promise.all([loadMenus(), loadPages()])
})

async function loadMenus() {
	loading.value = true
	try {
		const res = await menusApi.getMenus()
		menus.value = res.data || []
		if (menus.value.length > 0 && !currentMenu.value) {
			selectMenu(menus.value[0])
		}
	} catch (e: any) {
		ElMessage.error(e.message || 'Ошибка загрузки меню')
	} finally {
		loading.value = false
	}
}

async function loadPages() {
	try {
		const res = await pagesApi.getPages()
		availablePages.value = res.data || []
	} catch (e) {
		console.warn('Failed to load pages for selector:', e)
	}
}

function selectMenu(menu: Menu) {
	currentMenu.value = JSON.parse(JSON.stringify(menu))
}

function isSystemLocation(loc?: string): boolean {
	return ['header', 'footer', 'sidebar'].includes(loc || '')
}

function getLocationIcon(loc?: string): string {
	if (loc === 'header') return '🔝'
	if (loc === 'footer') return '🔻'
	if (loc === 'sidebar') return '📂'
	return '🧭'
}

function countTotalItems(items?: MenuItem[]): number {
	if (!items) return 0
	let total = items.length
	for (const it of items) {
		if (it.children?.length) {
			total += it.children.length
		}
	}
	return total
}

function getTypeLabel(type: string): string {
	if (type === 'page') return '📄 Страница'
	if (type === 'anchor') return '⚓ Якорь'
	return '🔗 URL'
}

function formatItemUrl(item: MenuItem): string {
	if (item.type === 'page') {
		const found = availablePages.value.find((p) => p.id === item.page_id)
		return found ? `/p/${found.slug}` : item.url || '/p/...'
	}
	return item.url || ''
}

function onPageSelected(pageId: string) {
	const found = availablePages.value.find((p) => p.id === pageId)
	if (found) {
		if (!itemForm.title) {
			itemForm.title = found.title
		}
		itemForm.url = `/p/${found.slug}`
	}
}

// Reordering
function moveItemUp(arr: MenuItem[], idx: number) {
	if (idx <= 0) return
	const temp = arr[idx]
	arr[idx] = arr[idx - 1]
	arr[idx - 1] = temp
}

function moveItemDown(arr: MenuItem[], idx: number) {
	if (idx >= arr.length - 1) return
	const temp = arr[idx]
	arr[idx] = arr[idx + 1]
	arr[idx + 1] = temp
}

function removeItem(arr: MenuItem[], idx: number) {
	arr.splice(idx, 1)
}

// Dialog openers
function openAddItemDialog(parent: MenuItem | null) {
	editingItem.value = null
	parentItemForAdd.value = parent
	if (parent) {
		if (!parent.children) parent.children = []
		targetContainerArray = parent.children
	} else if (currentMenu.value) {
		targetContainerArray = currentMenu.value.items
	}

	itemForm.title = ''
	itemForm.type = 'url'
	itemForm.page_id = ''
	itemForm.url = ''
	itemForm.target = '_self'
	isItemDialogOpen.value = true
}

function openEditItemDialog(item: MenuItem, container: MenuItem[]) {
	editingItem.value = item
	parentItemForAdd.value = null
	targetContainerArray = container

	itemForm.title = item.title
	itemForm.type = item.type || 'url'
	itemForm.page_id = item.page_id || ''
	itemForm.url = item.url || ''
	itemForm.target = item.target || '_self'
	isItemDialogOpen.value = true
}

function confirmSaveItem() {
	if (editingItem.value) {
		editingItem.value.title = itemForm.title.trim()
		editingItem.value.type = itemForm.type
		editingItem.value.page_id = itemForm.page_id || undefined
		editingItem.value.url = itemForm.url.trim()
		editingItem.value.target = itemForm.target
	} else {
		const newItem: MenuItem = {
			id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
			title: itemForm.title.trim(),
			type: itemForm.type,
			page_id: itemForm.page_id || undefined,
			url: itemForm.url.trim(),
			target: itemForm.target,
			children: [],
		}
		targetContainerArray.push(newItem)
	}
	isItemDialogOpen.value = false
}

// Save menu to server
async function saveCurrentMenu() {
	if (!currentMenu.value) return
	saving.value = true
	try {
		await menusApi.updateMenu(currentMenu.value.id, {
			name: currentMenu.value.name,
			location: currentMenu.value.location,
			items: currentMenu.value.items,
		})
		ElMessage.success('Меню успешно сохранено')
		await loadMenus()
	} catch (e: any) {
		ElMessage.error(e.message || 'Ошибка сохранения меню')
	} finally {
		saving.value = false
	}
}

// Create menu dialog
function openCreateMenuDialog() {
	newMenuForm.name = ''
	newMenuForm.location = ''
	isCreateMenuDialogOpen.value = true
}

async function confirmCreateMenu() {
	try {
		const res = await menusApi.createMenu({
			name: newMenuForm.name.trim(),
			location: newMenuForm.location.trim().toLowerCase(),
			items: [],
		})
		ElMessage.success('Меню создано')
		isCreateMenuDialogOpen.value = false
		await loadMenus()
		if (res.data) {
			selectMenu(res.data)
		}
	} catch (e: any) {
		ElMessage.error(e.message || 'Ошибка создания меню')
	}
}

async function confirmDeleteMenu(menu: Menu) {
	try {
		await ElMessageBox.confirm(`Удалить навигационное меню «${menu.name}»?`, 'Подтверждение удаления', {
			confirmButtonText: 'Удалить',
			cancelButtonText: 'Отмена',
			type: 'warning',
		})
		await menusApi.deleteMenu(menu.id)
		ElMessage.success('Меню удалено')
		currentMenu.value = null
		await loadMenus()
	} catch {}
}
</script>

<style scoped>
.menus-page {
	padding: 24px;
	max-width: 1400px;
	margin: 0 auto;
}

.page-header {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	margin-bottom: 24px;
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

.menus-layout {
	display: grid;
	grid-template-columns: 300px 1fr;
	gap: 24px;
}

.menus-sidebar {
	background: var(--bg-card);
	border: 1px solid var(--border-color);
	border-radius: 12px;
	padding: 16px;
	height: fit-content;
}

.sidebar-header {
	margin-bottom: 12px;
}

.sidebar-title {
	font-size: 13px;
	font-weight: 700;
	text-transform: uppercase;
	color: var(--text-muted);
	letter-spacing: 0.5px;
}

.locations-list {
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.location-card {
	padding: 12px;
	border-radius: 8px;
	border: 1px solid var(--border-color);
	background: var(--bg-surface);
	cursor: pointer;
	transition: all 0.2s;
}

.location-card:hover {
	border-color: var(--accent-primary, #6366f1);
	background: rgba(99, 102, 241, 0.1);
}

.location-card.active {
	border-color: var(--accent-primary, #6366f1);
	background: rgba(99, 102, 241, 0.15);
	box-shadow: 0 1px 3px rgba(99, 102, 241, 0.2);
}

.loc-card-header {
	display: flex;
	align-items: center;
	gap: 10px;
}

.loc-icon {
	font-size: 20px;
}

.loc-card-info {
	display: flex;
	flex-direction: column;
}

.loc-card-info strong {
	font-size: 14px;
	color: var(--text-primary);
}

.loc-card-info code {
	font-size: 11px;
	color: var(--accent-primary, #6366f1);
}

.loc-card-meta {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-top: 8px;
	font-size: 11px;
	color: var(--text-muted);
}

.menus-editor {
	background: var(--bg-card);
	border: 1px solid var(--border-color);
	border-radius: 12px;
	padding: 24px;
}

.empty-selection {
	text-align: center;
	padding: 60px 20px;
	color: var(--text-muted);
}

.empty-icon {
	font-size: 48px;
	margin-bottom: 12px;
}

.editor-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding-bottom: 20px;
	border-bottom: 1px solid var(--border-color);
	margin-bottom: 20px;
}

.editor-header-fields {
	display: flex;
	gap: 16px;
}

.field-item {
	display: flex;
	flex-direction: column;
	gap: 6px;
}

.field-item label {
	font-size: 12px;
	font-weight: 500;
	color: var(--text-muted);
}

.editor-header-actions {
	display: flex;
	gap: 10px;
}

/* Live Preview Mock */
.menu-live-preview {
	background: var(--bg-surface);
	border: 1px solid var(--border-color);
	border-radius: 10px;
	padding: 16px;
	margin-bottom: 24px;
}

.preview-label {
	font-size: 12px;
	font-weight: 600;
	color: var(--text-muted);
	margin-bottom: 10px;
}

.preview-header-mock {
	background: var(--bg-card);
	border: 1px solid var(--border-color);
	border-radius: 8px;
	padding: 12px 20px;
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.mock-logo {
	font-weight: 800;
	font-size: 16px;
	color: var(--text-primary);
}

.mock-nav {
	display: flex;
	gap: 20px;
}

.mock-nav-item {
	font-size: 14px;
	font-weight: 500;
	color: var(--text-muted);
	display: flex;
	align-items: center;
	gap: 4px;
}

.mock-simple-item {
	display: inline-flex;
	align-items: center;
	gap: 6px;
	background: var(--bg-card);
	padding: 6px 12px;
	border-radius: 6px;
	border: 1px solid var(--border-color);
	color: var(--text-primary);
	font-size: 13px;
	margin-right: 8px;
	margin-bottom: 8px;
}

.mock-sub-count {
	font-size: 11px;
	color: #6366f1;
}

/* Items List & Tree */
.items-list-header {
	display: flex;
	justify-content: space-between;
	align-items: baseline;
	margin-bottom: 16px;
}

.items-list-header h3 {
	margin: 0;
	font-size: 16px;
	font-weight: 600;
	color: var(--text-primary);
}

.items-hint {
	font-size: 12px;
	color: var(--text-muted);
}

.no-items-state {
	text-align: center;
	padding: 40px;
	color: var(--text-muted);
	border: 1px dashed var(--border-color);
	border-radius: 8px;
}

.items-tree {
	display: flex;
	flex-direction: column;
	gap: 10px;
}

.tree-item {
	background: var(--bg-card);
	border: 1px solid var(--border-color);
	border-radius: 8px;
	overflow: hidden;
}

.item-main-row {
	display: flex;
	align-items: center;
	padding: 12px 16px;
	gap: 12px;
}

.item-reorder-btns {
	display: flex;
	flex-direction: column;
	gap: 2px;
}

.item-badge-type {
	font-size: 11px;
	font-weight: 600;
	padding: 2px 8px;
	border-radius: 6px;
	white-space: nowrap;
}

.type-page {
	background: rgba(16, 185, 129, 0.15);
	color: #10b981;
}

.type-url {
	background: rgba(99, 102, 241, 0.15);
	color: #818cf8;
}

.type-anchor {
	background: rgba(245, 158, 11, 0.15);
	color: #fbbf24;
}

.item-title-col {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 2px;
}

.item-title-col strong {
	font-size: 14px;
	color: var(--text-primary);
}

.item-target-url {
	font-size: 12px;
	color: var(--text-muted);
	font-family: monospace;
}

.item-actions {
	display: flex;
	gap: 6px;
}

.sub-items-container {
	background: var(--bg-surface);
	border-top: 1px solid var(--border-color);
	padding: 8px 12px 8px 36px;
	display: flex;
	flex-direction: column;
	gap: 6px;
}

.sub-item {
	border: 1px solid var(--border-color);
	background: var(--bg-card);
}

.sub-tree-indent {
	font-size: 14px;
	color: var(--text-muted);
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

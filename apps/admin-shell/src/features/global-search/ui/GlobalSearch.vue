<template>
	<div v-if="isOpen" class="global-search-overlay" @click.self="close">
		<div class="global-search-container glass-card">
			<div class="search-input-wrapper">
				<el-icon class="search-icon"><Search /></el-icon>
				<input
					ref="searchInput"
					v-model="query"
					class="search-input"
					placeholder="Search everything... (Users, Content, Media, Translations)"
					type="text"
					@input="handleInput"
					@keydown.down="moveDown"
					@keydown.up="moveUp"
					@keydown.enter="handleEnter"
				/>
				<div class="search-kram">
					<span class="key">ESC</span>
				</div>
			</div>

			<div v-loading="isLoading" class="search-results">
				<template v-if="results.length > 0">
					<div v-for="(group, category) in groupedResults" :key="category" class="result-group">
						<div class="group-title">{{ category }}</div>
						<div
							v-for="item in group"
							:key="item.id"
							class="result-item"
							:class="{ active: activeIndex === flatResults.indexOf(item) }"
							@click="navigate(item)"
							@mouseenter="activeIndex = flatResults.indexOf(item)"
						>
							<div class="item-icon">
								<component :is="getIcon(item)" />
							</div>
							<div class="item-content">
								<div class="item-title-wrapper">
									<span v-if="item.parent" class="item-parent">{{ item.parent }}</span>
									<span v-if="item.parent" class="item-separator">/</span>
									<span class="item-title">{{ item.title }}</span>
								</div>
								<div class="item-desc">{{ item.description || item.path }}</div>
							</div>
						</div>
					</div>
				</template>
				<div v-else-if="query.length > 1" class="no-results"> No results found for "{{ query }}" </div>
				<div v-else class="search-placeholder"> Type to find pages and sections... </div>
			</div>

			<div class="search-footer">
				<div class="footer-item">
					<span class="key">↑↓</span>
					<span>Navigate</span>
				</div>
				<div class="footer-item">
					<span class="key">ENTER</span>
					<span>Open</span>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { onKeyStroke, useDebounceFn, useMagicKeys } from '@vueuse/core'

import { useI18n } from '@admin-panel/i18n'
import { useSidebar } from '@admin-panel/ui'
import * as Icons from '@element-plus/icons-vue'
import { Search } from '@element-plus/icons-vue'

import { systemApi } from '../../../entities/system/api'
import type { SearchResult } from '../../../entities/system/model'

const router = useRouter()
const { t } = useI18n()
const { sidebarData } = useSidebar()
const { escape } = useMagicKeys()

const isOpen = ref(false)
const query = ref('')
const results = ref<SearchResult[]>([])
const isLoading = ref(false)
const activeIndex = ref(0)
const searchInput = ref<HTMLInputElement | null>(null)

const open = () => {
	isOpen.value = true

	query.value = ''

	results.value = []

	activeIndex.value = 0

	nextTick(() => {
		searchInput.value?.focus()
	})
}

const close = () => {
	isOpen.value = false
}

// Global hotkeys
onKeyStroke(['k', 'K'], (e) => {
	if (e.ctrlKey || e.metaKey) {
		e.preventDefault()

		open()
	}
})

watch(escape, (esc) => {
	if (esc && isOpen.value) {
		close()
	}
})

const fetchResults = useDebounceFn(async () => {
	if (query.value.length < 2) {
		results.value = []

		return
	}

	isLoading.value = true

	const searchResults: SearchResult[] = []
	const q = query.value.toLowerCase()

	// 1. Search in Sidebar Navigation (Pages & Sections)
	sidebarData.value.forEach((item: any) => {
		// Main items
		const translatedTitle = t(item.title).toLowerCase()

		if (translatedTitle.includes(q)) {
			searchResults.push({
				id: `nav-${item.title}`,
				title: t(item.title),
				category: 'Pages',
				path: item.path,
				icon: item.icon,
			})
		}

		// Sub-menu items
		if (item.children) {
			item.children.forEach((child: any) => {
				const translatedChild = t(child.title).toLowerCase()

				if (translatedChild.includes(q)) {
					searchResults.push({
						id: `nav-${child.title}`,
						title: t(child.title),
						category: 'Sections',
						path: child.path,
						icon: item.icon,
						parent: t(item.title),
					})
				}
			})
		}
	})

	// 2. Search in API (Only for relevant "pages" or entities, filtering out raw content)
	const res = await systemApi.search(query.value)

	if (res.data?.results) {
		const apiResults = res.data.results
			.filter((item) => {
				// Only keep items that look like pages/modules or schemas
				const allowedCategories = ['Modules', 'Schemas', 'Tools']

				return allowedCategories.includes(item.category)
			})
			.map((item) => ({
				...item,
				id: `api-${item.id}`,
			}))

		searchResults.push(...apiResults)
	}

	// Filter duplicates by path
	const seenPaths = new Set()

	results.value = searchResults.filter((item) => {
		if (!item.path || seenPaths.has(item.path)) return false
		seenPaths.add(item.path)

		return true
	})

	activeIndex.value = 0

	isLoading.value = false
}, 200)

const handleInput = () => {
	fetchResults()
}

const groupedResults = computed(() => {
	const groups: Record<string, any[]> = {}

	results.value.forEach((item) => {
		if (!groups[item.category]) groups[item.category] = []
		groups[item.category].push(item)
	})

	return groups
})

const flatResults = computed(() => results.value)

const moveDown = (e: Event) => {
	e.preventDefault()

	if (activeIndex.value < flatResults.value.length - 1) {
		activeIndex.value++
	}
}

const moveUp = (e: Event) => {
	e.preventDefault()

	if (activeIndex.value > 0) {
		activeIndex.value--
	}
}

const handleEnter = () => {
	const activeItem = flatResults.value[activeIndex.value]

	if (activeItem) {
		navigate(activeItem)
	}
}

const navigate = (item: any) => {
	close()

	if (item.path) {
		router.push(item.path)
	}
}

const getIcon = (item: any) => {
	if (item.icon && (Icons as any)[item.icon]) {
		return (Icons as any)[item.icon]
	}

	switch (item.category) {
		case 'Pages':
		case 'Sections':
			return Icons.Document
		case 'Modules':
			return Icons.Box
		case 'Schemas':
			return Icons.Files
		default:
			return Icons.Search
	}
}
</script>

<style scoped lang="scss">
.global-search-overlay {
	position: fixed;
	display: flex;
	align-items: flex-start;
	justify-content: center;
	background: rgb(0, 0, 0, 0.4);
	transition: all 0.3s ease;
	padding-top: 15vh;
	z-index: 9999;
	backdrop-filter: blur(12px);
	inset: 0;
}

.global-search-container {
	width: 100%;
	max-width: 680px;
	display: flex;
	flex-direction: column;
	border: 1px solid var(--gp-glass-border-inner);
	border-radius: 20px;
	box-shadow: var(--gp-glass-shadow);
	background: var(--gp-glass-gradient);
	background-color: var(--gp-bg-glass);
	animation: slide-up 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
	overflow: hidden;
}

@keyframes slide-up {
	from {
		transform: translateY(20px);
		opacity: 0;
	}

	to {
		transform: translateY(0);
		opacity: 1;
	}
}

.search-input-wrapper {
	display: flex;
	align-items: center;
	border-bottom: 1px solid var(--gp-glass-border);
	padding: 20px 24px;
	gap: 16px;
}

.search-icon {
	font-size: 24px;
	color: var(--gp-primary);
}

.search-input {
	flex: 1;
	outline: none;
	border: none;
	font-weight: 500;
	font-size: 1.25rem;
	color: var(--gp-text-main);
	background: transparent;

	&::placeholder {
		color: var(--gp-text-secondary);
	}
}

.search-kram {
	display: flex;
	gap: 6px;
}

.key {
	border: 1px solid var(--gp-glass-border);
	border-radius: 6px;
	box-shadow: 0 2px 0 var(--gp-glass-border);
	font-weight: 600;
	font-size: 0.75rem;
	color: var(--gp-text-secondary);
	background: var(--gp-bg-glass-hover);
	padding: 4px 8px;
}

.search-results {
	max-height: 480px;
	padding: 16px;
	overflow-y: auto;

	&::-webkit-scrollbar {
		width: 6px;
	}

	&::-webkit-scrollbar-thumb {
		border-radius: 3px;
		background: var(--gp-glass-border);
	}
}

.result-group {
	margin-bottom: 20px;

	&:last-child {
		margin-bottom: 0;
	}
}

.group-title {
	font-weight: 700;
	font-size: 0.7rem;
	letter-spacing: 0.1em;
	text-transform: uppercase;
	color: var(--gp-text-secondary);
	padding: 0 12px 10px;
}

.result-item {
	display: flex;
	align-items: center;
	border-radius: 12px;
	transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
	cursor: pointer;
	padding: 12px;
	gap: 16px;

	&.active {
		box-shadow: 0 4px 12px rgb(0, 0, 0, 0.1);
		background: var(--gp-bg-glass-hover);
		transform: translateX(4px);

		.item-icon {
			color: var(--gp-white);
			background: var(--gp-primary);
			transform: scale(1.1);
		}
	}
}

.item-icon {
	width: 40px;
	height: 40px;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 10px;
	font-size: 18px;
	color: var(--gp-primary);
	background: var(--gp-bg-glass-hover);
	transition: all 0.2s ease;
}

.item-content {
	flex: 1;
}

.item-title-wrapper {
	display: flex;
	align-items: center;
	gap: 6px;
}

.item-parent {
	font-weight: 500;
	font-size: 11px;
	color: var(--gp-text-muted);
}

.item-separator {
	font-size: 10px;
	color: var(--gp-text-muted);
	opacity: 0.5;
}

.item-title {
	font-weight: 600;
	font-size: 1rem;
	color: var(--gp-text-main);
}

.item-desc {
	font-size: 0.85rem;
	color: var(--gp-text-secondary);
}

.no-results,
.search-placeholder {
	text-align: center;
	color: var(--gp-text-secondary);
	padding: 60px 40px;
}

.search-footer {
	display: flex;
	border-top: 1px solid var(--gp-glass-border);
	background: var(--gp-bg-surface);
	padding: 14px 24px;
	gap: 24px;
}

.footer-item {
	display: flex;
	align-items: center;
	font-size: 0.75rem;
	color: var(--gp-text-secondary);
	gap: 8px;

	.key {
		box-shadow: 0 1px 0 var(--gp-glass-border);
		padding: 2px 5px;
	}
}
</style>

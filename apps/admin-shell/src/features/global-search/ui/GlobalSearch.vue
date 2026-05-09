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
								<component :is="getIcon(category)" />
							</div>
							<div class="item-content">
								<div class="item-title">{{ item.title }}</div>
								<div class="item-desc">{{ item.description }}</div>
							</div>
						</div>
					</div>
				</template>
				<div v-else-if="query.length > 2" class="no-results"> No results found for "{{ query }}" </div>
				<div v-else class="search-placeholder"> Type at least 3 characters to search... </div>
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
import { useDebounceFn, useMagicKeys } from '@vueuse/core'

import { ChatDotRound, Document, Picture, Search, User } from '@element-plus/icons-vue'

import { systemApi } from '../../../entities/system/api'

const router = useRouter()
const { meta_k, ctrl_k, escape } = useMagicKeys()

const isOpen = ref(false)
const query = ref('')
const results = ref<any[]>([])
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
watch([meta_k, ctrl_k], ([mk, ck]) => {
	if (mk || ck) {
		open()
	}
})

watch(escape, (esc) => {
	if (esc && isOpen.value) {
		close()
	}
})

const fetchResults = useDebounceFn(async () => {
	if (query.value.length < 3) {
		results.value = []

		return
	}

	isLoading.value = true

	const res = await systemApi.search(query.value)

	if (res.data) {
		results.value = res.data.results || []

		activeIndex.value = 0
	}

	isLoading.value = false
}, 300)

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

	router.push(item.url)
}

const getIcon = (category: string) => {
	switch (category) {
		case 'Users':
			return User
		case 'Content':
			return Document
		case 'Media':
			return Picture
		case 'Translations':
			return ChatDotRound
		default:
			return Search
	}
}
</script>

<style scoped>
.global-search-overlay {
	position: fixed;
	display: flex;
	align-items: flex-start;
	justify-content: center;
	background: rgb(0, 0, 0, 0.4);
	padding-top: 15vh;
	z-index: 9999;
	backdrop-filter: blur(4px);
	inset: 0;
}

.global-search-container {
	width: 100%;
	max-width: 650px;
	display: flex;
	flex-direction: column;
	border-radius: 16px;
	box-shadow: 0 20px 40px rgb(0, 0, 0, 0.2);
	background: var(--gp-bg-card);
	overflow: hidden;
}

.search-input-wrapper {
	display: flex;
	align-items: center;
	border-bottom: 1px solid var(--gp-border-color);
	padding: 16px 20px;
	gap: 12px;
}

.search-icon {
	font-size: 20px;
	color: var(--gp-text-disabled);
}

.search-input {
	flex: 1;
	outline: none;
	border: none;
	font-size: 1.1rem;
	color: var(--gp-text-main);
	background: transparent;
}

.search-kram {
	display: flex;
	gap: 4px;
}

.key {
	border: 1px solid var(--gp-border-color);
	border-radius: 4px;
	box-shadow: 0 1px 0 var(--gp-border-color);
	font-weight: 700;
	font-size: 0.7rem;
	color: var(--gp-text-secondary);
	background: var(--gp-bg-lighter);
	padding: 2px 6px;
}

.search-results {
	max-height: 400px;
	padding: 12px 0;
	overflow-y: auto;
}

.result-group {
	margin-bottom: 12px;
}

.group-title {
	font-weight: 700;
	font-size: 0.75rem;
	letter-spacing: 0.05em;
	text-transform: uppercase;
	color: var(--gp-primary);
	padding: 4px 20px;
}

.result-item {
	display: flex;
	align-items: center;
	transition: background 0.1s;
	cursor: pointer;
	padding: 10px 20px;
	gap: 14px;
}

.result-item.active {
	background: var(--gp-bg-lighter);
}

.item-icon {
	width: 32px;
	height: 32px;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 8px;
	font-size: 16px;
	color: var(--gp-primary);
	background: var(--gp-bg-lighter);
}

.item-content {
	flex: 1;
}

.item-title {
	font-weight: 500;
	font-size: 0.95rem;
	color: var(--gp-text-main);
}

.item-desc {
	font-size: 0.8rem;
	color: var(--gp-text-secondary);
}

.no-results,
.search-placeholder {
	text-align: center;
	color: var(--gp-text-disabled);
	padding: 40px;
}

.search-footer {
	display: flex;
	border-top: 1px solid var(--gp-border-color);
	background: var(--gp-bg-lighter);
	padding: 12px 20px;
	gap: 20px;
}

.footer-item {
	display: flex;
	align-items: center;
	font-size: 0.75rem;
	color: var(--gp-text-secondary);
	gap: 6px;
}
</style>

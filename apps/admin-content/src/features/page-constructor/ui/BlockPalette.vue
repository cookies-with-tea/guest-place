<template>
	<aside class="palette-panel">
		<div class="palette-tabs">
			<button
				type="button"
				class="palette-tab-btn"
				:class="{ 'is-active': activeTab === 'blocks' }"
				@click="activeTab = 'blocks'"
			>
				📦 Блоки ({{ blockTypes.blockTypes.length }})
			</button>
			<button
				type="button"
				class="palette-tab-btn"
				:class="{ 'is-active': activeTab === 'presets' }"
				@click="activeTab = 'presets'"
			>
				⭐ Пресеты ({{ presets.savedPresets.length }})
			</button>
		</div>

		<!-- TAB 1: BLOCKS PALETTE -->
		<template v-if="activeTab === 'blocks'">
			<div class="palette-quick-add">
				<button type="button" class="quick-add-btn" @click="canvas.addWireframeBlock">
					<span class="quick-add-icon">📐</span>
					<span class="quick-add-text">
						<strong>Макет (Вайрфрейм)</strong>
						<small>Прямоугольник для прототипа</small>
					</span>
					<span class="quick-add-plus">+</span>
				</button>
			</div>

			<div class="palette-search">
				<el-input v-model="blockTypes.paletteSearch" placeholder="Поиск блоков..." clearable size="small" />
			</div>

			<div class="palette-list">
				<div
					v-for="bt in blockTypes.filteredBlockTypes"
					:key="bt.slug"
					class="palette-item"
					@click="canvas.addBlock(bt)"
				>
					<div class="palette-item__icon">{{ bt.icon || '📦' }}</div>
					<div class="palette-item__info">
						<div class="palette-item__name">{{ bt.name }}</div>
						<div v-if="bt.description" class="palette-item__desc">{{ bt.description }}</div>
					</div>
					<el-button size="small" circle type="primary" class="palette-item__add">+</el-button>
				</div>
			</div>

			<!-- Sync from Frontend Bridge -->
			<div v-if="clientManifest.length > 0" class="palette-sync-box">
				<div class="sync-info">
					<span>⚡ Фронтенд подключен: {{ clientManifest.length }} блоков</span>
				</div>
				<el-button
					size="small"
					plain
					type="success"
					style="width: 100%"
					:loading="blockTypes.syncingBlocks"
					@click="blockTypes.syncBlocksFromClient"
				>
					Синхронизировать блоки с фронтенда
				</el-button>
			</div>
		</template>

		<!-- TAB 2: SAVED PRESETS -->
		<template v-else>
			<div class="presets-container">
				<div class="presets-header-info">
					<span>Сохранённые шаблоны блоков для быстрого переиспользования</span>
				</div>

				<div v-if="presets.savedPresets.length === 0" class="presets-empty">
					<div class="presets-empty-icon">⭐</div>
					<p>Пресеты пока не сохранены.</p>
					<small>Кликните «⭐ Сохранить как пресет» на любом настроенном блоке в канвасе.</small>
				</div>

				<div v-else class="presets-list">
					<div
						v-for="preset in presets.savedPresets"
						:key="preset.id"
						class="preset-item-card"
						@click="presets.addPresetToCanvas(preset)"
					>
						<div class="preset-card__header">
							<span class="preset-card__icon">{{ blockTypes.getBlockType(preset.type)?.icon || '📦' }}</span>
							<div class="preset-card__info">
								<strong>{{ preset.name }}</strong>
								<code class="preset-type-badge">{{ preset.type }}</code>
							</div>
							<el-button
								size="small"
								circle
								type="danger"
								link
								title="Удалить пресет"
								@click.stop="presets.deletePreset(preset.id)"
							>
								✕
							</el-button>
						</div>
						<div class="preset-card__footer">
							<span class="preset-date">{{ formatDate(preset.createdAt) }}</span>
							<el-button size="small" type="primary" plain class="preset-add-btn"> + Добавить </el-button>
						</div>
					</div>
				</div>
			</div>
		</template>
	</aside>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { BlockTypesState } from '../composables/useBlockTypes'
import type { BlockCanvas } from '../composables/useBlockCanvas'
import type { BlockPresetsAndClipboard } from '../composables/useBlockPresets'
import { formatDate } from '../lib/helpers'

defineProps<{
	blockTypes: BlockTypesState
	canvas: BlockCanvas
	presets: BlockPresetsAndClipboard
	clientManifest: any[]
}>()

const activeTab = ref<'blocks' | 'presets'>('blocks')
</script>

<style scoped>
.palette-panel {
	min-width: 0;
	display: flex;
	flex-direction: column;
	border-right: 1px solid var(--border-color);
	background: var(--bg-card);
	overflow-y: auto;
}

.palette-tabs {
	display: flex;
	border-bottom: 1px solid var(--border-color);
}

.palette-tab-btn {
	flex: 1;
	border: none;
	font-weight: 500;
	font-size: 13px;
	color: var(--text-muted);
	background: transparent;
	transition: all 0.2s;
	cursor: pointer;
	padding: 12px 8px;
}

.palette-tab-btn.is-active {
	border-bottom: 2px solid var(--gp-primary);
	color: var(--gp-primary);
}

.palette-quick-add {
	padding: 12px;
}

.quick-add-btn {
	width: 100%;
	display: flex;
	align-items: center;
	border: 1px dashed var(--gp-primary);
	border-radius: 8px;
	background: rgb(99, 102, 241, 0.06);
	transition: all 0.2s;
	cursor: pointer;
	padding: 10px;
	gap: 10px;
}

.quick-add-btn:hover {
	background: rgb(99, 102, 241, 0.12);
}

.quick-add-icon {
	font-size: 20px;
}

.quick-add-text {
	min-width: 0;
	display: flex;
	flex: 1;
	flex-direction: column;
	text-align: left;
}

.quick-add-text strong {
	font-size: 13px;
	color: var(--text-primary);
}

.quick-add-text small {
	font-size: 11px;
	color: var(--text-muted);
}

.quick-add-plus {
	font-size: 18px;
	color: var(--gp-primary);
}

.wireframe-pill,
.style-pill {
	border-radius: 10px;
	font-size: 10px;
	color: var(--gp-primary);
	background: rgb(99, 102, 241, 0.12);
	padding: 1px 6px;
}

.palette-search {
	padding: 0 12px 12px;
}

.palette-list {
	display: flex;
	flex: 1;
	flex-direction: column;
	padding: 0 12px 12px;
	overflow-y: auto;
	gap: 6px;
}

.palette-item {
	display: flex;
	align-items: center;
	border: 1px solid var(--border-color);
	border-radius: 8px;
	transition: all 0.2s;
	cursor: pointer;
	padding: 8px;
	gap: 10px;
}

.palette-item:hover {
	border-color: var(--gp-primary);
	background: rgb(99, 102, 241, 0.06);
}

.palette-item__icon {
	font-size: 18px;
}

.palette-item__info {
	min-width: 0;
	flex: 1;
}

.palette-item__name {
	font-weight: 500;
	font-size: 13px;
	white-space: nowrap;
	text-overflow: ellipsis;
	color: var(--text-primary);
	overflow: hidden;
}

.palette-item__desc {
	font-size: 11px;
	white-space: nowrap;
	text-overflow: ellipsis;
	color: var(--text-muted);
	overflow: hidden;
}

.palette-item__add {
	flex-shrink: 0;
}

.palette-sync-box {
	border-top: 1px solid var(--border-color);
	padding: 12px;
}

.sync-info {
	font-size: 11px;
	color: var(--text-muted);
	margin-bottom: 8px;
}

.presets-container {
	min-height: 0;
	display: flex;
	flex: 1;
	flex-direction: column;
	padding: 12px;
}

.presets-header-info {
	font-size: 12px;
	color: var(--text-muted);
	margin-bottom: 10px;
}

.presets-empty {
	text-align: center;
	padding: 24px 12px;
}

.presets-empty-icon {
	font-size: 28px;
	margin-bottom: 8px;
}

.presets-list {
	display: flex;
	flex-direction: column;
	overflow-y: auto;
	gap: 8px;
}

.preset-item-card {
	border: 1px solid var(--border-color);
	border-radius: 8px;
	transition: all 0.2s;
	cursor: pointer;
	padding: 10px;
}

.preset-item-card:hover {
	border-color: var(--gp-primary);
	background: rgb(99, 102, 241, 0.06);
}

.preset-card__header {
	display: flex;
	align-items: center;
	gap: 8px;
}

.preset-card__icon {
	font-size: 18px;
}

.preset-card__info {
	min-width: 0;
	display: flex;
	flex: 1;
	flex-direction: column;
}

.preset-card__info strong {
	font-size: 13px;
	white-space: nowrap;
	text-overflow: ellipsis;
	overflow: hidden;
}

.preset-type-badge {
	font-size: 10px;
	color: var(--text-muted);
}

.preset-card__footer {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-top: 6px;
}

.preset-date {
	font-size: 11px;
	color: var(--text-muted);
}
</style>

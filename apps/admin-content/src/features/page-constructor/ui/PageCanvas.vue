<template>
	<main class="canvas-panel" :class="{ 'with-preview': isPreviewing }">
		<div
			class="canvas-scroll-area"
			:class="{ 'is-media-drag-active': canvas.isMediaDragActive }"
			@dragenter.prevent="canvas.onMediaDragEnter"
			@dragover.prevent="canvas.onMediaDragOver"
			@dragleave="canvas.onMediaDragLeave"
			@drop.prevent="canvas.onMediaCanvasDrop"
		>
			<!-- Drag & Drop overlay for direct media uploads -->
			<div v-if="canvas.isMediaDragActive" class="media-drag-overlay">
				<div class="media-drag-hint">
					<el-icon class="media-drag-icon"><Download /></el-icon>
					<strong>Отпустите файл для мгновенной загрузки</strong>
					<p>Изображения создадут Hero-блок, видео создадут Видео-блок</p>
				</div>
			</div>

			<div class="canvas-header">
				<div class="canvas-title">
					<span>Структура страницы</span>
					<el-tag size="small" type="info">{{ pageForm.blocks.length }} блоков</el-tag>
				</div>
				<div class="canvas-actions">
					<el-button
						v-if="presets.clipboardBlock"
						size="small"
						type="success"
						plain
						:icon="DocumentCopy"
						title="Вставить блок из буфера (Ctrl+V)"
						@click="presets.pasteBlock"
					>
						Вставить блок ({{
							blockTypes.getBlockType(presets.clipboardBlock.type)?.name || presets.clipboardBlock.type
						}})
					</el-button>

					<el-button size="small" link type="danger" @click="canvas.clearAllBlocks"> Очистить всё </el-button>
				</div>
			</div>

			<!-- Empty Canvas State -->
			<div v-if="pageForm.blocks.length === 0" class="canvas-empty">
				<el-icon class="canvas-empty__icon"><Grid /></el-icon>
				<h4>Канвас страницы пуст</h4>
				<p>Создайте структуру страницы из прямоугольников-макетов или готовых компонентов.</p>
				<div class="canvas-empty__btns">
					<el-button type="primary" :icon="Crop" @click="canvas.addWireframeBlock">
						Добавить первый макет-прямоугольник
					</el-button>
					<el-button
						v-if="presets.clipboardBlock"
						type="success"
						plain
						:icon="DocumentCopy"
						@click="presets.pasteBlock"
					>
						Вставить из буфера
					</el-button>
				</div>
			</div>

			<!-- Block list (Draggable) -->
			<div class="canvas-blocks">
				<div
					v-for="(block, index) in pageForm.blocks"
					:key="block.id"
					class="canvas-block-card"
					:class="{
						'is-selected': canvas.selectedBlockIndex === index,
						'is-dragging': canvas.draggingIndex === index,
						'is-drag-over': canvas.dragOverIndex === index,
					}"
					draggable="true"
					@dragstart="canvas.onDragStart(index, $event)"
					@dragover="canvas.onDragOver(index, $event)"
					@dragleave="canvas.onDragLeave(index)"
					@drop.prevent="canvas.onBlockCardDrop(index, $event)"
					@dragend="canvas.onDragEnd"
					@click="canvas.selectBlock(index)"
				>
					<div class="block-card__handle" title="Перетащить блок">
						<svg fill="currentColor" height="16" viewBox="0 0 24 24" width="16" xmlns="http://www.w3.org/2000/svg">
							<circle cx="9" cy="5" r="1.5" />
							<circle cx="15" cy="5" r="1.5" />
							<circle cx="9" cy="12" r="1.5" />
							<circle cx="15" cy="12" r="1.5" />
							<circle cx="9" cy="19" r="1.5" />
							<circle cx="15" cy="19" r="1.5" />
						</svg>
					</div>

					<el-icon class="block-card__icon">
						<component :is="resolveIcon(blockTypes.getBlockType(block.type)?.icon)" />
					</el-icon>

					<div class="block-card__details">
						<div class="block-card__name">
							<strong>{{ blockTypes.getBlockType(block.type)?.name || block.type }}</strong>
							<code class="block-card__slug">{{ block.type }}</code>
							<span v-if="block.type === 'wireframe'" class="wireframe-pill">
								<el-icon><Crop /></el-icon>Макет
							</span>
							<span v-if="block.style?.theme" class="style-pill">
								<el-icon><Brush /></el-icon>{{ block.style.theme }}
							</span>
							<span v-if="canvas.selectedBlockIndex === index" class="selected-pill">
								<el-icon><EditPen /></el-icon>Редактируется
							</span>
						</div>
						<div class="block-card__summary">
							{{ canvas.getBlockSummary(block) }}
						</div>
					</div>

					<div class="block-card__controls" @click.stop>
						<el-dropdown trigger="click" @command="(cmd: string) => canvas.changeBlockType(index, cmd)">
							<el-button size="small" circle :icon="Switch" title="Заменить на реальный компонент" />
							<template #dropdown>
								<el-dropdown-menu>
									<el-dropdown-item disabled>Заменить на компонент:</el-dropdown-item>
									<el-dropdown-item
										v-for="bt in blockTypes.blockTypes"
										:key="bt.slug"
										:command="bt.slug"
										:disabled="bt.slug === block.type"
										:icon="resolveIcon(bt.icon)"
									>
										{{ bt.name }}
									</el-dropdown-item>
								</el-dropdown-menu>
							</template>
						</el-dropdown>

						<el-button
							size="small"
							circle
							:icon="DocumentCopy"
							title="Скопировать в буфер (Ctrl+C)"
							@click="presets.copyBlock(index)"
						/>
						<el-button
							size="small"
							circle
							:icon="Star"
							title="Сохранить как пресет"
							@click="presets.openSavePresetDialog(index)"
						/>
						<el-button
							size="small"
							circle
							:icon="Top"
							:disabled="index === 0"
							title="Переместить выше"
							@click="canvas.moveBlock(index, -1)"
						/>
						<el-button
							size="small"
							circle
							:icon="Bottom"
							:disabled="index === pageForm.blocks.length - 1"
							title="Переместить ниже"
							@click="canvas.moveBlock(index, 1)"
						/>
						<el-button
							size="small"
							circle
							:icon="CopyDocument"
							title="Дублировать блок"
							@click="canvas.duplicateBlock(index)"
						/>
						<el-button
							size="small"
							circle
							type="danger"
							:icon="Delete"
							title="Удалить блок"
							@click="canvas.removeBlock(index)"
						/>
					</div>
				</div>
			</div>
		</div>

		<slot />
	</main>
</template>

<script setup lang="ts">
import {
	Bottom,
	Brush,
	CopyDocument,
	Crop,
	Delete,
	DocumentCopy,
	Download,
	EditPen,
	Grid,
	Star,
	Switch,
	Top,
} from '@element-plus/icons-vue'
import type { PageBlock } from '#entities/pages'
import type { BlockTypesState } from '../composables/useBlockTypes'
import type { BlockCanvas } from '../composables/useBlockCanvas'
import type { BlockPresetsAndClipboard } from '../composables/useBlockPresets'
import { resolveIcon } from '../lib/icons'

defineProps<{
	pageForm: { blocks: PageBlock[] } & Record<string, any>
	blockTypes: BlockTypesState
	canvas: BlockCanvas
	presets: BlockPresetsAndClipboard
	isPreviewing: boolean
}>()
</script>

<style scoped>
.canvas-panel {
	min-width: 0;
	position: relative;
	display: flex;
	flex-grow: 1;
	flex-direction: column;
	background: var(--bg-surface);
	overflow: hidden;
}

.canvas-panel.with-preview {
	display: grid;
	grid-template-columns: 1fr 1fr;
}

.canvas-scroll-area {
	position: relative;
	display: flex;
	flex-grow: 1;
	flex-direction: column;
	padding: 20px;
	overflow-y: auto;
	gap: 16px;
}

.is-media-drag-active {
	outline: 2px dashed var(--gp-primary);
	outline-offset: -2px;
}

.media-drag-overlay {
	position: absolute;
	display: flex;
	align-items: center;
	justify-content: center;
	background: rgb(99, 102, 241, 0.08);
	z-index: 5;
	backdrop-filter: blur(2px);
	inset: 0;
}

.media-drag-hint {
	display: flex;
	flex-direction: column;
	align-items: center;
	border-radius: 12px;
	text-align: center;
	background: var(--bg-card);
	padding: 24px;
	gap: 6px;
}

.media-drag-icon {
	width: 32px;
	height: 32px;
	color: var(--gp-primary);
}

.bg-image-upload-row {
	display: flex;
	gap: 8px;
}

.canvas-header {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 12px;
	gap: 8px;
}

.canvas-title {
	display: flex;
	align-items: center;
	font-weight: 600;
	gap: 8px;
}

.canvas-actions {
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
}

.canvas-empty {
	display: flex;
	flex-direction: column;
	align-items: center;
	border: 2px dashed var(--border-color);
	border-radius: 12px;
	text-align: center;
	background: var(--bg-card);
	padding: 40px 20px;
	margin: auto 0;
}

.canvas-empty__icon {
	width: 40px;
	height: 40px;
	color: var(--text-muted);
	margin-bottom: 8px;
}

.canvas-empty__btns {
	display: flex;
	flex-wrap: wrap;
	justify-content: center;
	margin-top: 12px;
	gap: 8px;
}

.canvas-blocks {
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.canvas-block-card {
	position: relative;
	display: flex;
	align-items: center;
	border: 1px solid var(--border-color);
	border-radius: 10px;
	background: var(--bg-card);
	transition: all 0.15s ease;
	cursor: pointer;
	padding: 12px 16px;
	gap: 12px;
}

.canvas-block-card:hover {
	border-color: var(--gp-primary);
	box-shadow: 0 2px 10px rgb(0, 0, 0, 0.05);
}

.canvas-block-card.is-selected {
	border-color: var(--gp-primary);
	box-shadow: 0 0 0 2px rgb(99, 102, 241, 0.2);
	background: rgb(99, 102, 241, 0.02);
}

.canvas-block-card.is-drag-over {
	border-top: 2px solid var(--gp-primary);
}

.block-card__handle {
	flex-shrink: 0;
	color: var(--text-muted);
	transition: opacity 0.15s;
	cursor: grab;
	opacity: 0.5;
}

.block-card__handle:hover {
	opacity: 1;
}

.block-card__icon {
	width: 1em;
	height: 1em;
	flex-shrink: 0;
	font-size: 18px;
}

.block-card__details {
	min-width: 0;
	display: flex;
	flex: 1;
	flex-direction: column;
	gap: 4px;
}

.block-card__name {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: 6px;
}

.block-card__slug {
	font-size: 11px;
	color: var(--text-muted);
}

.wireframe-pill,
.style-pill,
.selected-pill {
	display: inline-flex;
	align-items: center;
	gap: 2px;
}

.wireframe-pill .el-icon,
.style-pill .el-icon,
.selected-pill .el-icon {
	width: 1em;
	height: 1em;
	font-size: 10px;
}

.selected-pill {
	border-radius: 10px;
	font-size: 10px;
	color: #10b981;
	background: rgb(16, 185, 129, 0.15);
	padding: 1px 6px;
}

.block-card__summary {
	font-size: 12px;
	white-space: nowrap;
	text-overflow: ellipsis;
	color: var(--text-muted);
	overflow: hidden;
}

.block-card__controls {
	max-width: 220px;
	display: flex;
	flex-shrink: 0;
	flex-wrap: wrap;
	gap: 4px;
}
</style>

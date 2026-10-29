<template>
	<aside class="inspector-panel">
		<div class="inspector-nav-tabs">
			<button
				type="button"
				class="inspector-nav-tab"
				:class="{ 'is-active': tabs.inspector === 'block' }"
				@click="tabs.inspector = 'block'"
			>
				<el-icon><EditPen /></el-icon>Контент блока
			</button>
			<button
				type="button"
				class="inspector-nav-tab"
				:class="{ 'is-active': tabs.inspector === 'page' }"
				@click="tabs.inspector = 'page'"
			>
				<el-icon><Setting /></el-icon>Настройки страницы
			</button>
		</div>

		<!-- TAB 1: BLOCK INSPECTOR -->
		<div v-if="tabs.inspector === 'block'" class="inspector-tab-pane">
			<div v-if="canvas.selectedBlock" class="inspector-content">
				<div class="inspector-header">
					<el-icon class="inspector-icon">
						<component :is="resolveIcon(canvas.selectedBlockType?.icon)" />
					</el-icon>
					<div class="inspector-header__info">
						<h3>{{ canvas.selectedBlockType?.name || canvas.selectedBlock.type }}</h3>
						<div class="inspector-type-row">
							<code class="inspector-type">{{ canvas.selectedBlock.type }}</code>
							<span v-if="canvas.selectedBlock.type === 'wireframe'" class="wireframe-pill">
								<el-icon><Crop /></el-icon>Макет
							</span>
						</div>
					</div>
					<el-button size="small" circle :icon="Close" title="Снять выбор" @click="canvas.selectedBlockIndex = null" />
				</div>

				<div class="inspector-swap-bar">
					<div class="swap-bar-label">
						<span>Компонент:</span>
						<small class="swap-bar-hint">Заменить на другой</small>
					</div>
					<el-select
						:model-value="canvas.selectedBlock.type"
						size="small"
						class="swap-bar-select"
						placeholder="Сменить тип блока..."
						@update:model-value="(val: string) => canvas.changeBlockType(canvas.selectedBlockIndex!, val)"
					>
						<el-option v-for="bt in blockTypes.blockTypes" :key="bt.slug" :label="bt.name" :value="bt.slug">
							<span style="display: inline-flex; align-items: center; float: left; gap: 4px">
								<el-icon style="width: 1em; height: 1em"><component :is="resolveIcon(bt.icon)" /></el-icon>
								{{ bt.name }}
							</span>
							<span style="float: right; font-size: 11px; color: var(--text-muted)"
								><code>{{ bt.slug }}</code></span
							>
						</el-option>
					</el-select>
				</div>

				<div class="inspector-sub-tabs">
					<button
						type="button"
						class="sub-tab-btn"
						:class="{ 'is-active': tabs.blockSub === 'content' }"
						@click="tabs.blockSub = 'content'"
					>
						<el-icon><EditPen /></el-icon>Поля данных
					</button>
					<button
						type="button"
						class="sub-tab-btn"
						:class="{ 'is-active': tabs.blockSub === 'style' }"
						@click="tabs.blockSub = 'style'"
					>
						<el-icon><Brush /></el-icon>Стилизация блока
					</button>
				</div>

				<!-- SUB-PANE 1: CONTENT FIELDS -->
				<div v-if="tabs.blockSub === 'content'" class="sub-tab-pane">
					<div class="inspector-notice"
						><el-icon><EditPen /></el-icon>Заполните поля блока. Изменения видны в Live Preview:</div
					>
					<div class="inspector-form">
						<ContentFormGenerator
							v-if="canvas.selectedBlockType?.schema && canvas.selectedBlockType.schema.length"
							:key="canvas.selectedBlock.id"
							v-model="canvas.selectedBlock.data"
							:fields="canvas.selectedBlockType.schema"
						/>
						<div v-else class="inspector-no-schema">
							<p>У этого типа блока нет настроенных полей схемы.</p>
						</div>
					</div>
				</div>

				<!-- SUB-PANE 2: BLOCK STYLING -->
				<BlockStyleEditor v-else :canvas="canvas" :presets="presets" />
			</div>

			<!-- No block selected helper guide -->
			<div v-else class="inspector-guide">
				<el-icon class="guide-icon"><Pointer /></el-icon>
				<h3>Как заполнять контент:</h3>
				<p class="guide-desc">
					Страница собирается из блоков. Кликните на любой блок в канвасе по центру, чтобы открыть его поля для
					редактирования.
				</p>

				<div class="guide-steps-list">
					<div class="guide-step-item">
						<span class="step-num">1</span>
						<div class="step-text"> <strong>Выберите блок</strong> в левой палитре (нажмите «+») </div>
					</div>
					<div class="guide-step-item">
						<span class="step-num">2</span>
						<div class="step-text"> <strong>Нажмите на карточку блока</strong> в центральном канвасе </div>
					</div>
					<div class="guide-step-item">
						<span class="step-num">3</span>
						<div class="step-text"> <strong>Заполните тексты, медиа и стиль</strong> в этой правой панели </div>
					</div>
				</div>

				<div v-if="pageForm.blocks.length > 0" class="guide-action">
					<el-button type="primary" plain style="width: 100%" @click="canvas.selectBlock(0)">
						Выбрать 1-й блок «{{ blockTypes.getBlockType(pageForm.blocks[0].type)?.name || pageForm.blocks[0].type }}»
					</el-button>
				</div>
			</div>
		</div>

		<!-- TAB 2: PAGE SETTINGS & SEO -->
		<PageSettingsPanel v-else :document="document" :seo="seo" />
	</aside>
</template>

<script setup lang="ts">
import { Brush, Close, Crop, EditPen, Pointer, Setting } from '@element-plus/icons-vue'
import type { PageBlock } from '#entities/pages'
import type { BlockTypesState } from '../composables/useBlockTypes'
import type { BlockCanvas } from '../composables/useBlockCanvas'
import type { BlockPresetsAndClipboard } from '../composables/useBlockPresets'
import type { InspectorTabs } from '../composables/useInspectorTabs'
import type { PageDocument } from '../composables/usePageDocument'
import type { PageSeo } from '../composables/usePageSeo'
import ContentFormGenerator from '#features/content-editor/ui/components/ContentFormGenerator.vue'
import BlockStyleEditor from './BlockStyleEditor.vue'
import PageSettingsPanel from './PageSettingsPanel.vue'
import { resolveIcon } from '../lib/icons'

defineProps<{
	pageForm: { blocks: PageBlock[] }
	blockTypes: BlockTypesState
	canvas: BlockCanvas
	presets: BlockPresetsAndClipboard
	document: PageDocument
	seo: PageSeo
	tabs: InspectorTabs
}>()
</script>

<style scoped>
.inspector-panel {
	width: 380px;
	display: flex;
	flex-shrink: 0;
	flex-direction: column;
	border-left: 1px solid var(--border-color);
	background: var(--bg-card);
	overflow: hidden;
}

.inspector-nav-tabs {
	display: flex;
	border-bottom: 1px solid var(--border-color);
	background: var(--bg-surface);
}

.inspector-nav-tab {
	display: flex;
	flex: 1;
	align-items: center;
	justify-content: center;
	border: none;
	border-bottom: 2px solid transparent;
	font-weight: 600;
	font-size: 13px;
	color: var(--text-muted);
	background: transparent;
	transition: all 0.2s ease;
	cursor: pointer;
	padding: 12px;
	gap: 6px;
}

.inspector-nav-tab .el-icon {
	width: 1em;
	height: 1em;
	flex-shrink: 0;
}

.inspector-nav-tab.is-active {
	border-bottom-color: var(--gp-primary);
	color: var(--gp-primary);
	background: var(--bg-card);
}

.inspector-tab-pane {
	display: flex;
	flex-grow: 1;
	flex-direction: column;
	overflow-y: auto;
}

.inspector-content {
	display: flex;
	flex-direction: column;
	padding: 16px;
	gap: 16px;
}

.inspector-header {
	display: flex;
	align-items: center;
	border-bottom: 1px solid var(--border-color);
	padding-bottom: 12px;
	gap: 12px;
}

.inspector-icon {
	width: 28px;
	height: 28px;
	flex-shrink: 0;
	color: var(--gp-primary, #6366f1);
}

.inspector-header__info {
	min-width: 0;
	flex-grow: 1;
}

.inspector-header__info h3 {
	font-weight: 600;
	font-size: 15px;
	margin: 0;
}

.inspector-type-row {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	margin-top: 2px;
	gap: 6px;
}

.inspector-type {
	font-size: 11px;
	color: var(--text-muted);
}

.wireframe-pill {
	display: inline-flex;
	align-items: center;
	border-radius: 10px;
	font-size: 10px;
	color: var(--gp-primary);
	background: rgb(99, 102, 241, 0.12);
	padding: 1px 6px;
	gap: 2px;
}

.wireframe-pill .el-icon {
	width: 1em;
	height: 1em;
}

.inspector-swap-bar {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	justify-content: space-between;
	border: 1px solid var(--border-color);
	border-radius: 8px;
	background: var(--bg-surface);
	padding: 8px 12px;
	gap: 8px;
}

.swap-bar-label {
	font-weight: 600;
	font-size: 12px;
}

.swap-bar-hint {
	display: block;
	font-size: 10px;
	color: var(--text-muted);
}

.swap-bar-select {
	width: 100%;
	max-width: 170px;
}

.inspector-sub-tabs {
	display: flex;
	border: 1px solid var(--border-color);
	border-radius: 8px;
	background: var(--bg-surface);
	padding: 3px;
	gap: 4px;
}

.sub-tab-btn {
	display: flex;
	flex: 1;
	align-items: center;
	justify-content: center;
	border: none;
	border-radius: 6px;
	font-weight: 600;
	font-size: 12px;
	color: var(--text-muted);
	background: transparent;
	transition: all 0.15s ease;
	cursor: pointer;
	padding: 6px 10px;
	gap: 5px;
}

.sub-tab-btn .el-icon {
	width: 1em;
	height: 1em;
	flex-shrink: 0;
}

.sub-tab-btn.is-active {
	box-shadow: 0 1px 3px rgb(0, 0, 0, 0.05);
	color: var(--gp-primary);
	background: var(--bg-card);
}

.sub-tab-pane {
	display: flex;
	flex-direction: column;
	gap: 14px;
}

.inspector-notice {
	display: flex;
	align-items: center;
	font-size: 12px;
	color: var(--text-muted);
	gap: 5px;
}

.inspector-notice .el-icon {
	width: 1em;
	height: 1em;
	flex-shrink: 0;
}

.inspector-guide {
	display: flex;
	flex-direction: column;
	align-items: center;
	text-align: center;
	color: var(--text-muted);
	padding: 30px 20px;
	gap: 12px;
}

.guide-icon {
	width: 36px;
	height: 36px;
	color: var(--text-muted);
}

.guide-desc {
	font-size: 13px;
	line-height: 1.5;
	margin: 0;
}

.guide-steps-list {
	width: 100%;
	display: flex;
	flex-direction: column;
	text-align: left;
	margin-top: 10px;
	gap: 10px;
}

.guide-step-item {
	display: flex;
	align-items: center;
	border-radius: 8px;
	font-size: 12px;
	background: var(--bg-surface);
	padding: 8px 12px;
	gap: 10px;
}

.step-num {
	width: 20px;
	height: 20px;
	display: flex;
	flex-shrink: 0;
	align-items: center;
	justify-content: center;
	border-radius: 50%;
	font-weight: 700;
	font-size: 11px;
	color: #fff;
	background: var(--gp-primary);
}

.guide-action {
	width: 100%;
	margin-top: 10px;
}
</style>

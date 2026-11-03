<template>
	<div class="editor-toolbar">
		<div class="toolbar-group">
			<el-tooltip content="Жирный {b}...{/b}" placement="top">
				<button class="tool-btn" type="button" @click="editor.applyTag('b')">
					<strong>B</strong>
				</button>
			</el-tooltip>
			<el-tooltip content="Курсив {i}...{/i}" placement="top">
				<button class="tool-btn" type="button" @click="editor.applyTag('i')">
					<em>I</em>
				</button>
			</el-tooltip>
			<el-tooltip content="Подчёркивание {u}...{/u}" placement="top">
				<button class="tool-btn" type="button" @click="editor.applyTag('u')">
					<u>U</u>
				</button>
			</el-tooltip>
			<el-tooltip content="Стилизованный спан {span}...{/span}" placement="top">
				<button class="tool-btn highlight-btn" type="button" @click="editor.applyTag('span')">
					<span>{span}</span>
				</button>
			</el-tooltip>
			<el-tooltip content="Моноширинный код {code}...{/code}" placement="top">
				<button class="tool-btn" type="button" @click="editor.applyTag('code')">
					<code>&lt;/&gt;</code>
				</button>
			</el-tooltip>
		</div>

		<div class="toolbar-divider" />

		<div class="toolbar-group">
			<!-- Insert Slot Popover -->
			<el-popover v-model:visible="editor.isSlotPopoverOpen" placement="bottom" trigger="click" width="220">
				<template #reference>
					<button class="tool-btn slot-btn" type="button">
						<span>+ Слот</span>
					</button>
				</template>
				<div class="slot-popover-content">
					<p class="popover-title">Вставить параметр (слот):</p>
					<div class="quick-slots">
						<el-tag
							v-for="s in editor.quickSlots"
							:key="s"
							class="quick-slot-tag"
							size="small"
							@click="editor.insertSlot(s)"
						>
							{{ s }}
						</el-tag>
					</div>
					<el-input
						v-model="editor.customSlotName"
						placeholder="Имя слота (напр. count)"
						size="small"
						@keydown.enter="editor.handleInsertCustomSlot"
					>
						<template #append>
							<el-button size="small" @click="editor.handleInsertCustomSlot">Ок</el-button>
						</template>
					</el-input>
				</div>
			</el-popover>

			<!-- Insert Custom Tag Popover -->
			<el-popover v-model:visible="editor.isTagPopoverOpen" placement="bottom" trigger="click" width="220">
				<template #reference>
					<button class="tool-btn custom-tag-btn" type="button">
						<span>+ Тег</span>
					</button>
				</template>
				<div class="slot-popover-content">
					<p class="popover-title">Пользовательский тег:</p>
					<el-input
						v-model="editor.customTagName"
						placeholder="напр. mark, small, a"
						size="small"
						@keydown.enter="editor.handleInsertCustomTag"
					>
						<template #append>
							<el-button size="small" @click="editor.handleInsertCustomTag">Применить</el-button>
						</template>
					</el-input>
				</div>
			</el-popover>

			<el-tooltip content="Очистить форматирование выделения" placement="top">
				<button class="tool-btn" type="button" @click="editor.handleStripFormatting">
					<el-icon><CloseBold /></el-icon>
				</button>
			</el-tooltip>
		</div>

		<div class="toolbar-divider" />

		<!-- View Mode Switch -->
		<div class="toolbar-group mode-toggle-group">
			<button
				class="tool-btn mode-btn"
				:class="{ 'is-active': editor.activeMode === 'visual' }"
				type="button"
				@click="editor.switchMode('visual')"
			>
				Визуальный
			</button>
			<button
				class="tool-btn mode-btn"
				:class="{ 'is-active': editor.activeMode === 'source' }"
				type="button"
				@click="editor.switchMode('source')"
			>
				Теги / Исходник
			</button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { CloseBold } from '@element-plus/icons-vue'
import type { TagEditor } from '../../composables/useTagEditor'

defineProps<{
	editor: TagEditor
}>()
</script>

<style scoped>
.editor-toolbar {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	border-bottom: 1px solid var(--border-color, #e2e8f0);
	background: var(--bg-surface, #f8fafc);
	padding: 8px 12px;
	gap: 8px;
}

.toolbar-group {
	display: flex;
	align-items: center;
	gap: 4px;
}

.toolbar-divider {
	width: 1px;
	height: 20px;
	background: var(--border-color, #cbd5e1);
	margin: 0 4px;
}

.tool-btn {
	height: 30px;
	min-width: 30px;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	border: 1px solid transparent;
	border-radius: 6px;
	font-weight: 500;
	font-size: 13px;
	color: var(--text-primary, #1e293b);
	background: transparent;
	transition: all 0.15s ease;
	cursor: pointer;
	padding: 0 8px;
}

.tool-btn:hover {
	color: var(--accent-primary, #3b82f6);
	background: var(--border-color, #e2e8f0);
}

.tool-btn .el-icon {
	width: 1em;
	height: 1em;
	flex-shrink: 0;
}

.highlight-btn {
	font-family: monospace;
	font-size: 12px;
	color: #2563eb;
	background: #eff6ff;
}

.slot-btn,
.custom-tag-btn {
	font-weight: 600;
	font-size: 12px;
	color: #475569;
	background: #f1f5f9;
}

.slot-btn:hover,
.custom-tag-btn:hover {
	color: #0f172a;
	background: #e2e8f0;
}

.mode-toggle-group {
	border-radius: 6px;
	background: #e2e8f0;
	padding: 2px;
	margin-left: auto;
}

.mode-btn {
	height: 24px;
	border-radius: 4px;
	font-size: 11px;
	padding: 0 8px;
}

.mode-btn.is-active {
	box-shadow: 0 1px 2px rgb(0, 0, 0, 0.1);
	font-weight: 600;
	color: #0f172a;
	background: #fff;
}

.slot-popover-content {
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.popover-title {
	font-weight: 600;
	font-size: 12px;
	color: #334155;
	margin: 0;
}

.quick-slots {
	display: flex;
	flex-wrap: wrap;
	gap: 4px;
}

.quick-slot-tag {
	cursor: pointer;
}

.quick-slot-tag:hover {
	opacity: 0.8;
}
</style>

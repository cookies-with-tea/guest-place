<template>
	<div class="translation-editor">
		<!-- Toolbar -->
		<div class="editor-toolbar">
			<div class="toolbar-group">
				<el-tooltip content="Жирный {b}...{/b}" placement="top">
					<button class="tool-btn" type="button" @click="applyTag('b')">
						<strong>B</strong>
					</button>
				</el-tooltip>
				<el-tooltip content="Курсив {i}...{/i}" placement="top">
					<button class="tool-btn" type="button" @click="applyTag('i')">
						<em>I</em>
					</button>
				</el-tooltip>
				<el-tooltip content="Подчёркивание {u}...{/u}" placement="top">
					<button class="tool-btn" type="button" @click="applyTag('u')">
						<u>U</u>
					</button>
				</el-tooltip>
				<el-tooltip content="Стилизованный спан {span}...{/span}" placement="top">
					<button class="tool-btn highlight-btn" type="button" @click="applyTag('span')">
						<span>{span}</span>
					</button>
				</el-tooltip>
				<el-tooltip content="Моноширинный код {code}...{/code}" placement="top">
					<button class="tool-btn" type="button" @click="applyTag('code')">
						<code>&lt;/&gt;</code>
					</button>
				</el-tooltip>
			</div>

			<div class="toolbar-divider" />

			<div class="toolbar-group">
				<!-- Insert Slot Popover -->
				<el-popover v-model:visible="isSlotPopoverOpen" placement="bottom" trigger="click" width="220">
					<template #reference>
						<button class="tool-btn slot-btn" type="button">
							<span>+ Слот</span>
						</button>
					</template>
					<div class="slot-popover-content">
						<p class="popover-title">Вставить параметр (слот):</p>
						<div class="quick-slots">
							<el-tag v-for="s in quickSlots" :key="s" class="quick-slot-tag" size="small" @click="insertSlot(s)">
								{{ s }}
							</el-tag>
						</div>
						<el-input
							v-model="customSlotName"
							placeholder="Имя слота (напр. count)"
							size="small"
							@keydown.enter="handleInsertCustomSlot"
						>
							<template #append>
								<el-button size="small" @click="handleInsertCustomSlot">Ок</el-button>
							</template>
						</el-input>
					</div>
				</el-popover>

				<!-- Insert Custom Tag Popover -->
				<el-popover v-model:visible="isTagPopoverOpen" placement="bottom" trigger="click" width="220">
					<template #reference>
						<button class="tool-btn custom-tag-btn" type="button">
							<span>+ Тег</span>
						</button>
					</template>
					<div class="slot-popover-content">
						<p class="popover-title">Пользовательский тег:</p>
						<el-input
							v-model="customTagName"
							placeholder="напр. mark, small, a"
							size="small"
							@keydown.enter="handleInsertCustomTag"
						>
							<template #append>
								<el-button size="small" @click="handleInsertCustomTag">Применить</el-button>
							</template>
						</el-input>
					</div>
				</el-popover>

				<el-tooltip content="Очистить форматирование выделения" placement="top">
					<button class="tool-btn" type="button" @click="handleStripFormatting">
						<span>✕</span>
					</button>
				</el-tooltip>
			</div>

			<div class="toolbar-divider" />

			<!-- View Mode Switch -->
			<div class="toolbar-group mode-toggle-group">
				<button
					class="tool-btn mode-btn"
					:class="{ 'is-active': activeMode === 'visual' }"
					type="button"
					@click="switchMode('visual')"
				>
					Визуальный
				</button>
				<button
					class="tool-btn mode-btn"
					:class="{ 'is-active': activeMode === 'source' }"
					type="button"
					@click="switchMode('source')"
				>
					Теги / Исходник
				</button>
			</div>
		</div>

		<!-- Editor Area -->
		<div class="editor-body">
			<!-- Visual Mode (Contenteditable) -->
			<div
				v-show="activeMode === 'visual'"
				ref="visualEditorRef"
				class="visual-editor"
				contenteditable="true"
				@blur="handleVisualBlur"
				@input="handleVisualInput"
			/>

			<!-- Source / Tag Mode (Textarea) -->
			<div v-show="activeMode === 'source'" class="source-editor-wrapper">
				<textarea
					ref="textareaRef"
					v-model="localValue"
					class="source-textarea"
					placeholder="Введите текст перевода с тегами, напр. Привет, {span}мир{/span}!"
					rows="4"
					@input="handleSourceInput"
					@select="updateSelectionRange"
				/>
			</div>
		</div>

		<!-- Tag Inspector & Validation Status -->
		<div class="editor-footer">
			<div class="footer-left">
				<div v-if="validation.isValid" class="validation-status is-valid">
					<span class="status-dot valid-dot" />
					<span>Синтаксис тегов корректен</span>
				</div>
				<div v-else class="validation-status is-invalid">
					<span class="status-dot invalid-dot" />
					<span class="error-msg">{{ validation.errors[0] }}</span>
				</div>
			</div>

			<div class="footer-right">
				<button class="preview-toggle-btn" type="button" @click="showPreview = !showPreview">
					{{ showPreview ? 'Скрыть предпросмотр' : 'Предпросмотр' }}
				</button>
			</div>
		</div>

		<!-- Live Preview Card -->
		<div v-if="showPreview" class="editor-preview-card">
			<div class="preview-header">
				<span class="preview-title">Живой предпросмотр (Live Preview)</span>
				<div v-if="detectedSlots.length > 0" class="slot-params-row">
					<span class="slot-params-label">Тестовые значения:</span>
					<div v-for="slot in detectedSlots" :key="slot" class="slot-param-item">
						<span class="param-key">{{ slot }}:</span>
						<input v-model="mockParams[slot]" class="param-input" :placeholder="slot" type="text" />
					</div>
				</div>
			</div>
			<div class="preview-content">
				<div class="rendered-translation">
					<!-- Renders parsed nodes safely with mock params -->
					<component :is="renderPreviewNodes" />
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, h, nextTick, onMounted, ref, watch } from 'vue'

import {
	htmlToTranslation,
	type I18nNode,
	parseTranslation,
	translationToHtml,
	unwrapTag,
	validateTranslation,
	wrapWithTag,
} from '@admin-panel/i18n'

const props = withDefaults(
	defineProps<{
		modelValue: string
		placeholder?: string
	}>(),
	{
		modelValue: '',
		placeholder: '',
	}
)

const emit = defineEmits<{
	(e: 'update:modelValue', val: string): void
}>()

const localValue = ref(props.modelValue || '')
const activeMode = ref<'visual' | 'source'>('visual')
const showPreview = ref(false)

const visualEditorRef = ref<HTMLDivElement>()
const textareaRef = ref<HTMLTextAreaElement>()

const isSlotPopoverOpen = ref(false)
const isTagPopoverOpen = ref(false)
const customSlotName = ref('')
const customTagName = ref('')
const quickSlots = ['userName', 'count', 'date', 'link', 'status']

const selectionRange = ref<{ start: number; end: number }>({ start: 0, end: 0 })
const mockParams = ref<Record<string, string>>({})

// Sync with incoming modelValue
watch(
	() => props.modelValue,
	(newVal) => {
		if (newVal !== localValue.value) {
			localValue.value = newVal || ''

			updateVisualHtmlFromModel()
		}
	}
)

const validation = computed(() => validateTranslation(localValue.value))

// Detect slots in text for testing in preview
const detectedSlots = computed(() => {
	const regex = /\{([a-zA-Z0-9_.-]+)\}/g
	const set = new Set<string>()
	let match: RegExpExecArray | null

	while ((match = regex.exec(localValue.value)) !== null) {
		const name = match[1]

		if (!['b', 'i', 'u', 'span', 'code', 'br', 'hr', 'p', 'div'].includes(name.toLowerCase())) {
			set.add(name)
		}
	}

	return Array.from(set)
})

// Initialize mock params when new slots appear
watch(
	detectedSlots,
	(slots) => {
		slots.forEach((s) => {
			if (!mockParams.value[s]) {
				mockParams.value[s] = s === 'count' ? '5' : s === 'userName' ? 'Иван' : `[${s}]`
			}
		})
	},
	{ immediate: true }
)

const updateModelValue = (val: string) => {
	localValue.value = val

	emit('update:modelValue', val)
}

const updateVisualHtmlFromModel = () => {
	if (visualEditorRef.value) {
		visualEditorRef.value.innerHTML = translationToHtml(localValue.value)
	}
}

onMounted(() => {
	updateVisualHtmlFromModel()
})

const switchMode = (mode: 'visual' | 'source') => {
	if (mode === activeMode.value) return

	if (mode === 'source') {
		// Sync visual changes to model before switching
		if (visualEditorRef.value) {
			const text = htmlToTranslation(visualEditorRef.value.innerHTML)

			updateModelValue(text)
		}
	} else {
		// Switching to visual mode, render html
		updateVisualHtmlFromModel()
	}

	activeMode.value = mode
}

const handleVisualInput = () => {
	if (visualEditorRef.value) {
		const text = htmlToTranslation(visualEditorRef.value.innerHTML)

		localValue.value = text

		emit('update:modelValue', text)
	}
}

const handleVisualBlur = () => {
	if (visualEditorRef.value) {
		const text = htmlToTranslation(visualEditorRef.value.innerHTML)

		updateModelValue(text)
	}
}

const handleSourceInput = () => {
	emit('update:modelValue', localValue.value)
}

const updateSelectionRange = () => {
	if (textareaRef.value) {
		selectionRange.value = {
			start: textareaRef.value.selectionStart,
			end: textareaRef.value.selectionEnd,
		}
	}
}

const applyTag = (tag: string) => {
	if (activeMode.value === 'visual') {
		// Use document.execCommand in visual mode
		if (tag === 'b') {
			document.execCommand('bold')
		} else if (tag === 'i') {
			document.execCommand('italic')
		} else if (tag === 'u') {
			document.execCommand('underline')
		} else if (tag === 'span') {
			const selection = window.getSelection()

			if (selection && selection.rangeCount > 0) {
				const range = selection.getRangeAt(0)
				const span = document.createElement('span')

				span.className = 'gp-highlight-span'

				span.appendChild(range.extractContents())

				range.insertNode(span)
			}
		} else if (tag === 'code') {
			const selection = window.getSelection()

			if (selection && selection.rangeCount > 0) {
				const range = selection.getRangeAt(0)
				const code = document.createElement('code')

				code.appendChild(range.extractContents())

				range.insertNode(code)
			}
		}

		handleVisualInput()
	} else {
		// Source mode
		const textarea = textareaRef.value

		if (!textarea) return

		const start = textarea.selectionStart
		const end = textarea.selectionEnd

		const res = wrapWithTag(localValue.value, start, end, tag)

		updateModelValue(res.newText)

		nextTick(() => {
			textarea.focus()

			textarea.setSelectionRange(res.newStart, res.newEnd)

			updateSelectionRange()
		})
	}
}

const insertSlot = (slotName: string) => {
	isSlotPopoverOpen.value = false

	if (activeMode.value === 'visual') {
		const chipHtml = `<span class="gp-slot-chip" data-slot="${slotName}" contenteditable="false">{${slotName}}</span>`

		document.execCommand('insertHTML', false, chipHtml)

		handleVisualInput()
	} else {
		const textarea = textareaRef.value

		if (!textarea) return
		const start = textarea.selectionStart
		const end = textarea.selectionEnd
		const insertion = `{${slotName}}`
		const newText = localValue.value.substring(0, start) + insertion + localValue.value.substring(end)

		updateModelValue(newText)

		nextTick(() => {
			textarea.focus()

			const pos = start + insertion.length

			textarea.setSelectionRange(pos, pos)

			updateSelectionRange()
		})
	}
}

const handleInsertCustomSlot = () => {
	const name = customSlotName.value.trim()

	if (name) {
		insertSlot(name)

		customSlotName.value = ''
	}
}

const handleInsertCustomTag = () => {
	const tag = customTagName.value.trim()

	if (tag) {
		isTagPopoverOpen.value = false

		applyTag(tag)

		customTagName.value = ''
	}
}

const handleStripFormatting = () => {
	if (activeMode.value === 'visual') {
		document.execCommand('removeFormat')

		handleVisualInput()
	} else {
		const textarea = textareaRef.value

		if (!textarea) return
		const start = textarea.selectionStart
		const end = textarea.selectionEnd

		if (start === end) {
			// Strip all tags from entire text
			const res = unwrapTag(localValue.value, 0, localValue.value.length)

			updateModelValue(res.newText)
		} else {
			const res = unwrapTag(localValue.value, start, end)

			updateModelValue(res.newText)
		}
	}
}

// Live Preview Renderer
const renderPreviewNodes = () => {
	const nodes = parseTranslation(localValue.value)

	const renderNode = (node: I18nNode): any => {
		if (node.type === 'text') {
			return node.content
		}

		if (node.type === 'slot') {
			if (node.name === 'br') return h('br')
			if (node.name === 'hr') return h('hr')

			return h('span', { class: 'preview-slot-value' }, mockParams.value[node.name] || `{${node.name}}`)
		}

		if (node.type === 'tag') {
			const children = (node.children || []).map(renderNode)
			const tag = node.name.toLowerCase()

			if (tag === 'span') return h('span', { class: 'preview-span-highlight' }, children)
			const allowed = ['b', 'i', 'u', 'strong', 'em', 'code', 'p', 'div', 'small']
			const validTag = allowed.includes(tag) ? tag : 'span'

			return h(validTag, {}, children)
		}

		return null
	}

	return h('div', {}, nodes.map(renderNode))
}
</script>

<style scoped>
.translation-editor {
	width: 100%;
	display: flex;
	flex-direction: column;
	border: 1px solid var(--border-color, #e2e8f0);
	border-radius: 12px;
	box-shadow: var(--shadow-sm, 0 1px 3px rgb(0, 0, 0, 0.05));
	background: var(--bg-card, #fff);
	overflow: hidden;
}

/* Toolbar */
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

/* Editor Body */
.editor-body {
	min-height: 90px;
	position: relative;
}

.visual-editor {
	min-height: 90px;
	outline: none;
	font-size: 14px;
	line-height: 1.6;
	color: var(--text-primary, #0f172a);
	cursor: text;
	padding: 12px 14px;
}

:deep(.gp-highlight-span) {
	border-radius: 4px;
	color: #0369a1;
	background: #e0f2fe;
	padding: 1px 4px;
}

:deep(.gp-slot-chip) {
	display: inline-flex;
	align-items: center;
	border: 1px solid #d8b4fe;
	border-radius: 12px;
	font-family: monospace;
	font-size: 12px;
	color: #7e22ce;
	background: #f3e8ff;
	user-select: none;
	padding: 1px 6px;
	margin: 0 2px;
}

.source-editor-wrapper {
	width: 100%;
}

.source-textarea {
	width: 100%;
	min-height: 90px;
	outline: none;
	border: none;
	box-sizing: border-box;
	font-family: ui-monospace, 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', monospace;
	font-size: 13px;
	line-height: 1.6;
	color: var(--text-primary, #0f172a);
	background: transparent;
	resize: vertical;
	padding: 12px 14px;
}

/* Footer & Status */
.editor-footer {
	display: flex;
	align-items: center;
	justify-content: space-between;
	border-top: 1px solid var(--border-color, #e2e8f0);
	font-size: 12px;
	background: var(--bg-surface, #f8fafc);
	padding: 6px 12px;
}

.validation-status {
	display: flex;
	align-items: center;
	gap: 6px;
}

.status-dot {
	width: 8px;
	height: 8px;
	border-radius: 50%;
}

.valid-dot {
	background: #10b981;
}

.invalid-dot {
	background: #ef4444;
}

.is-valid {
	color: #059669;
}

.is-invalid {
	color: #dc2626;
}

.preview-toggle-btn {
	border: none;
	border-radius: 4px;
	font-weight: 500;
	font-size: 12px;
	color: var(--accent-primary, #2563eb);
	background: transparent;
	cursor: pointer;
	padding: 2px 6px;
}

.preview-toggle-btn:hover {
	text-decoration: underline;
}

/* Preview Card */
.editor-preview-card {
	border-top: 1px dashed var(--border-color, #cbd5e1);
	background: #fafafa;
	padding: 12px 14px;
}

.preview-header {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 8px;
	gap: 8px;
}

.preview-title {
	font-weight: 600;
	font-size: 12px;
	letter-spacing: 0.5px;
	text-transform: uppercase;
	color: #64748b;
}

.slot-params-row {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: 8px;
}

.slot-params-label {
	font-size: 11px;
	color: #64748b;
}

.slot-param-item {
	display: flex;
	align-items: center;
	font-size: 11px;
	gap: 4px;
}

.param-key {
	font-weight: 500;
	color: #475569;
}

.param-input {
	width: 70px;
	outline: none;
	border: 1px solid #cbd5e1;
	border-radius: 4px;
	font-size: 11px;
	padding: 2px 6px;
}

.param-input:focus {
	border-color: #3b82f6;
}

.preview-content {
	border: 1px solid #e2e8f0;
	border-radius: 8px;
	font-size: 14px;
	line-height: 1.5;
	background: #fff;
	padding: 10px 12px;
}

:deep(.preview-slot-value) {
	font-weight: 600;
	color: #7c3aed;
}

:deep(.preview-span-highlight) {
	font-weight: 500;
	color: #0284c7;
}

/* Popover Content */
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

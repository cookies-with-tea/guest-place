<template>
	<div class="sub-tab-pane styling-pane">
		<div class="styling-section">
			<label class="styling-label">Цветовая схема (Тема)</label>
			<div class="theme-selector-grid">
				<button
					type="button"
					class="theme-card theme-light"
					:class="{ 'is-active': canvas.getBlockStyle().theme === 'light' }"
					@click="canvas.setBlockTheme('light')"
				>
					<el-icon><Sunny /></el-icon>Светлая
				</button>
				<button
					type="button"
					class="theme-card theme-dark"
					:class="{ 'is-active': canvas.getBlockStyle().theme === 'dark' }"
					@click="canvas.setBlockTheme('dark')"
				>
					<el-icon><Moon /></el-icon>Тёмная
				</button>
				<button
					type="button"
					class="theme-card theme-accent"
					:class="{ 'is-active': canvas.getBlockStyle().theme === 'accent' }"
					@click="canvas.setBlockTheme('accent')"
				>
					<el-icon><Lightning /></el-icon>Акцент
				</button>
				<button
					type="button"
					class="theme-card theme-muted"
					:class="{ 'is-active': canvas.getBlockStyle().theme === 'muted' }"
					@click="canvas.setBlockTheme('muted')"
				>
					<el-icon><Cloudy /></el-icon>Приглушённая
				</button>
				<button
					type="button"
					class="theme-card theme-transparent"
					:class="{ 'is-active': canvas.getBlockStyle().theme === 'transparent' }"
					@click="canvas.setBlockTheme('transparent')"
				>
					<el-icon><Crop /></el-icon>Прозрачная
				</button>
			</div>
		</div>

		<div class="styling-section">
			<label class="styling-label">Внутренний отступ (Padding)</label>
			<el-radio-group v-model="canvas.getBlockStyle().padding" size="small" class="spacing-radio-group">
				<el-radio-button label="none">0</el-radio-button>
				<el-radio-button label="sm">SM</el-radio-button>
				<el-radio-button label="md">MD</el-radio-button>
				<el-radio-button label="lg">LG</el-radio-button>
				<el-radio-button label="xl">XL</el-radio-button>
			</el-radio-group>
		</div>

		<div class="styling-section">
			<label class="styling-label">Внешний отступ (Margin)</label>
			<el-radio-group v-model="canvas.getBlockStyle().margin" size="small" class="spacing-radio-group">
				<el-radio-button label="none">0</el-radio-button>
				<el-radio-button label="sm">SM</el-radio-button>
				<el-radio-button label="md">MD</el-radio-button>
				<el-radio-button label="lg">LG</el-radio-button>
			</el-radio-group>
		</div>

		<div class="styling-section">
			<label class="styling-label">Цвет фона (Background Color)</label>
			<div class="color-picker-row">
				<el-color-picker v-model="canvas.getBlockStyle().backgroundColor" show-alpha size="default" />
				<el-input
					v-model="canvas.getBlockStyle().backgroundColor"
					placeholder="#ffffff или rgba(...)"
					size="small"
					clearable
					style="flex: 1"
				/>
			</div>
		</div>

		<div class="styling-section">
			<label class="styling-label">Градиент фона (Background Gradient)</label>
			<div class="gradient-presets-chips">
				<span
					v-for="(grad, idx) in canvas.gradientPresets"
					:key="idx"
					class="grad-chip"
					:style="{ background: grad.value }"
					:title="grad.name"
					@click="canvas.getBlockStyle().backgroundGradient = grad.value"
				></span>
				<el-button
					v-if="canvas.getBlockStyle().backgroundGradient"
					size="small"
					link
					type="danger"
					@click="canvas.getBlockStyle().backgroundGradient = ''"
				>
					Сбросить
				</el-button>
			</div>
			<el-input
				v-model="canvas.getBlockStyle().backgroundGradient"
				placeholder="linear-gradient(...)"
				size="small"
				clearable
				style="margin-top: 6px"
			/>
		</div>

		<div class="styling-section">
			<label class="styling-label">Фоновое изображение (Background Image URL)</label>
			<div class="bg-image-upload-row">
				<el-input
					v-model="canvas.getBlockStyle().backgroundImage"
					placeholder="https://... или перетащите файл"
					size="small"
					clearable
					@dragover.prevent
					@drop.prevent="canvas.onBgImageDrop"
				>
					<template #append>
						<el-upload
							action="#"
							:auto-upload="false"
							:show-file-list="false"
							accept="image/*"
							:on-change="canvas.onBgImageSelected"
						>
							<el-button size="small">Файл</el-button>
						</el-upload>
					</template>
				</el-input>
			</div>
		</div>

		<div class="styling-section">
			<el-button
				type="primary"
				plain
				:icon="Star"
				style="width: 100%"
				@click="presets.openSavePresetDialog(canvas.selectedBlockIndex!)"
			>
				Сохранить блок и стиль как пресет
			</el-button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { Cloudy, Crop, Lightning, Moon, Star, Sunny } from '@element-plus/icons-vue'
import type { BlockCanvas } from '../composables/useBlockCanvas'
import type { BlockPresetsAndClipboard } from '../composables/useBlockPresets'

defineProps<{
	canvas: BlockCanvas
	presets: BlockPresetsAndClipboard
}>()
</script>

<style scoped>
.styling-pane {
	display: flex;
	flex-direction: column;
	gap: 16px;
}

.styling-section {
	display: flex;
	flex-direction: column;
	border: 1px solid var(--border-color);
	border-radius: 8px;
	background: var(--bg-surface);
	padding: 12px;
	gap: 8px;
}

.styling-label {
	font-weight: 600;
	font-size: 12px;
	color: var(--text-primary);
}

.theme-selector-grid {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
	gap: 6px;
}

.theme-card {
	display: flex;
	align-items: center;
	justify-content: center;
	border: 1px solid var(--border-color);
	border-radius: 6px;
	font-weight: 500;
	font-size: 12px;
	text-align: center;
	transition: all 0.15s ease;
	cursor: pointer;
	padding: 8px 10px;
	gap: 5px;
}

.theme-card .el-icon {
	width: 1em;
	height: 1em;
	flex-shrink: 0;
}

.theme-card.theme-light {
	color: #1e293b;
	background: #fff;
}

.theme-card.theme-dark {
	border-color: #334155;
	color: #f8fafc;
	background: #0f172a;
}

.theme-card.theme-accent {
	color: #fff;
	background: var(--gp-primary);
}

.theme-card.theme-muted {
	color: #475569;
	background: #f1f5f9;
}

.theme-card.theme-transparent {
	color: var(--text-primary);
	background: transparent;
}

.theme-card.is-active {
	box-shadow: 0 0 0 2px var(--gp-primary);
	font-weight: 700;
}

.spacing-radio-group {
	width: 100%;
}

.spacing-radio-group :deep(.el-radio-button) {
	flex: 1;
}

.spacing-radio-group :deep(.el-radio-button__inner) {
	width: 100%;
}

.color-picker-row {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: 10px;
}

.gradient-presets-chips {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: 8px;
}

.grad-chip {
	width: 24px;
	height: 24px;
	border: 1px solid rgb(0, 0, 0, 0.15);
	border-radius: 6px;
	transition: transform 0.15s ease;
	cursor: pointer;
}

.grad-chip:hover {
	transform: scale(1.15);
}

.bg-image-upload-row {
	display: flex;
	gap: 8px;
}
</style>

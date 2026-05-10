<template>
	<div class="ui-theme-builder">
		<div class="theme-builder-section">
			<label class="section-label">Accent Color</label>
			<div class="color-picker-wrapper">
				<el-color-picker v-model="accentColor" :predefine="predefinedColors" color-format="hex" />
				<span class="color-value">{{ accentColor }}</span>
			</div>
		</div>

		<div class="theme-builder-section">
			<div class="section-header">
				<label class="section-label">Glass Blur</label>
				<span class="section-value">{{ glassBlur }}px</span>
			</div>
			<el-slider v-model="glassBlur" :max="40" :min="0" />
		</div>

		<div class="theme-builder-actions">
			<el-button size="small" type="info" variant="text" @click="resetTheme"> Reset to Default </el-button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useThemeBuilder } from '../lib/composables/useThemeBuilder'

const { accentColor, glassBlur, resetTheme } = useThemeBuilder()

const predefinedColors = [
	'#42b883', // Vue Green
	'#3498db', // Blue
	'#9b59b6', // Purple
	'#e67e22', // Orange
	'#e74c3c', // Red
	'#f1c40f', // Yellow
	'#2c3e50', // Dark Blue
	'#ff78b4', // Pink
]
</script>

<style lang="scss" scoped>
.ui-theme-builder {
	display: flex;
	flex-direction: column;
	padding: 8px;
	gap: 20px;
}

.theme-builder-section {
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.section-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.section-label {
	font-weight: 600;
	font-size: 13px;
	color: var(--gp-text-main);
}

.section-value {
	font-size: 12px;
	color: var(--gp-text-secondary);
}

.color-picker-wrapper {
	display: flex;
	align-items: center;
	gap: 12px;
}

.color-value {
	font-family: monospace;
	font-size: 12px;
	color: var(--gp-text-secondary);
}

.theme-builder-actions {
	display: flex;
	justify-content: flex-end;
	border-top: 1px solid var(--gp-glass-border);
	padding-top: 12px;
	margin-top: 8px;
}

:deep(.el-slider) {
	--el-slider-main-bg-color: var(--gp-primary);
}
</style>

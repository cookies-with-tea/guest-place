<template>
	<el-dialog v-model="presets.isPresetDialogOpen" title="⭐ Сохранить блок как пресет" width="420px">
		<div class="preset-dialog-content">
			<p>
				Сохраните текущую конфигурацию контента и стиля блока как шаблон для повторного использования на других
				страницах:
			</p>
			<el-input
				v-model="presets.presetFormName"
				placeholder="Название пресета (например: Hero с синим градиентом)"
				autofocus
			/>
		</div>
		<template #footer>
			<el-button @click="presets.isPresetDialogOpen = false">Отмена</el-button>
			<el-button type="primary" :disabled="!presets.presetFormName.trim()" @click="presets.confirmSavePreset">
				Сохранить пресет
			</el-button>
		</template>
	</el-dialog>
</template>

<script setup lang="ts">
import type { BlockPresetsAndClipboard } from '../composables/useBlockPresets'

defineProps<{
	presets: BlockPresetsAndClipboard
}>()
</script>

<style scoped>
.preset-dialog-content {
	display: flex;
	flex-direction: column;
	gap: 12px;
}
</style>

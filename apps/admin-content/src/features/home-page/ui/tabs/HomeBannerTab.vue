<template>
	<UiGlassCard
		icon="📢"
		title="Финальный промо-баннер"
		description="Блок доверия и одновременного поиска внизу страницы"
	>
		<el-form label-position="top">
			<el-form-item label="Заголовок баннера">
				<el-input
					v-model="homeForm.form.bannerTitle"
					type="textarea"
					:rows="2"
					placeholder="Для быстрого поиска Вы можете пользоваться всеми вариантами одновременно."
					@input="onChange"
				/>
			</el-form-item>
			<el-form-item label="Слоган / Текст баннера">
				<el-input
					v-model="homeForm.form.bannerText"
					type="textarea"
					:rows="2"
					placeholder="GP Платформа позволяет общаться напрямую здесь и сейчас. Мы за «прозрачные отношения»"
					@input="onChange"
				/>
			</el-form-item>
		</el-form>
	</UiGlassCard>

	<UiGlassCard icon="🎨" title="Фоновая графика баннера" description="Изображение для фона или плашки">
		<div class="media-wrap">
			<UiMediaPicker v-model="homeForm.form.bannerGuideUuid" @update:model-value="onChange" />
			<p class="field-hint">Фоновое изображение или иконка нижнего блока</p>
		</div>
	</UiGlassCard>
</template>

<script setup lang="ts">
import { UiGlassCard, UiMediaPicker } from '@admin-panel/ui'
import type { HomePageForm } from '../../composables/useHomePageForm'

defineProps<{
	homeForm: HomePageForm
	onChange: () => void
}>()
</script>

<style scoped>
.field-hint {
	font-size: 12px;
	color: var(--gp-text-secondary, #94a3b8);
	margin: 8px 0 0;
}
</style>

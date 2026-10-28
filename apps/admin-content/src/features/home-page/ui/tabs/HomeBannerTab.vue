<template>
	<UiGlassCard
		icon="📢"
		title="Финальный промо-баннер"
		description="Блок доверия и одновременного поиска внизу страницы"
	>
		<el-form label-position="top">
			<el-form-item label="Заголовок баннера">
				<UiRichTextField
					v-model="homeForm.form.bannerTitle"
					field-path="banner.title"
					mode="simple"
					multiline
					namespace="home"
					placeholder="Для быстрого поиска Вы можете пользоваться всеми вариантами одновременно."
					@update:model-value="onChange"
				/>
			</el-form-item>
			<el-form-item label="Слоган / Текст баннера">
				<UiRichTextField
					v-model="homeForm.form.bannerText"
					field-path="banner.text"
					mode="simple"
					multiline
					namespace="home"
					placeholder="GP Платформа позволяет общаться напрямую здесь и сейчас. Мы за «прозрачные отношения»"
					@update:model-value="onChange"
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
import { UiGlassCard, UiMediaPicker, UiRichTextField } from '@admin-panel/ui'
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

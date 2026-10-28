<template>
	<UiGlassCard
		icon="🌟"
		title="Заголовок и кнопки первого экрана"
		description="Главный месседж, подзаголовок и целевые действия пользователя"
	>
		<el-form label-position="top">
			<el-form-item label="Главный заголовок">
				<UiRichTextField
					v-model="homeForm.form.title"
					field-path="hero.title"
					mode="simple"
					namespace="home"
					placeholder="СОЦИАЛЬНАЯ ИНТЕРАКТИВНАЯ ПЛАТФОРМА"
					@update:model-value="onChange"
				/>
			</el-form-item>
			<el-form-item label="Подзаголовок">
				<UiRichTextField
					v-model="homeForm.form.subtitle"
					field-path="hero.subtitle"
					mode="simple"
					multiline
					namespace="home"
					placeholder="Соединяем гостей и места&#10;Общение, бронирование здесь и сейчас"
					@update:model-value="onChange"
				/>
			</el-form-item>
			<el-row :gutter="16">
				<el-col :span="12">
					<el-form-item label="Кнопка «На карте»">
						<UiRichTextField
							v-model="homeForm.form.heroMapButtonText"
							field-path="hero.mapButtonText"
							mode="simple"
							namespace="home"
							placeholder="Показать на карте"
							@update:model-value="onChange"
						/>
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item label="Кнопка «Списком»">
						<UiRichTextField
							v-model="homeForm.form.heroListButtonText"
							field-path="hero.listButtonText"
							mode="simple"
							namespace="home"
							placeholder="Показать списком"
							@update:model-value="onChange"
						/>
					</el-form-item>
				</el-col>
			</el-row>
		</el-form>
	</UiGlassCard>

	<UiGlassCard
		icon="🖼️"
		title="Медиа и иллюстрация первого экрана"
		description="Фоновое изображение или визуальный гайд по каталогу"
	>
		<div class="media-wrap">
			<UiMediaPicker v-model="homeForm.form.heroGuideUuid" @update:model-value="onChange" />
			<p class="field-hint">Изображение или графический референс первого экрана</p>
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

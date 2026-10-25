<template>
	<UiGlassCard
		icon="🌟"
		title="Заголовок и кнопки первого экрана"
		description="Главный месседж, подзаголовок и целевые действия пользователя"
	>
		<el-form label-position="top">
			<el-form-item label="Главный заголовок">
				<el-input
					v-model="homeForm.form.title"
					placeholder="СОЦИАЛЬНАЯ ИНТЕРАКТИВНАЯ ПЛАТФОРМА"
					size="large"
					@input="onChange"
				/>
			</el-form-item>
			<el-form-item label="Подзаголовок">
				<el-input
					v-model="homeForm.form.subtitle"
					type="textarea"
					:rows="3"
					placeholder="Соединяем гостей и места&#10;Общение, бронирование здесь и сейчас"
					@input="onChange"
				/>
			</el-form-item>
			<el-row :gutter="16">
				<el-col :span="12">
					<el-form-item label="Кнопка «На карте»">
						<el-input v-model="homeForm.form.heroMapButtonText" placeholder="Показать на карте" @input="onChange" />
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item label="Кнопка «Списком»">
						<el-input v-model="homeForm.form.heroListButtonText" placeholder="Показать списком" @input="onChange" />
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

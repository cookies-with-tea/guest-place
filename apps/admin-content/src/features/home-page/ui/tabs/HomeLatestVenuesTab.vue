<template>
	<UiGlassCard
		icon="🆕"
		title="Блок «Последние добавленные»"
		description="Настройки заголовка и кнопки перехода в полный каталог"
	>
		<el-form label-position="top">
			<el-form-item label="Заголовок секции">
				<el-input v-model="homeForm.form.latestSectionTitle" placeholder="Последние добавленные" @input="onChange" />
			</el-form-item>
			<el-row :gutter="16">
				<el-col :span="12">
					<el-form-item label="Текст кнопки">
						<el-input v-model="homeForm.form.latestSectionButtonText" placeholder="Показать еще" @input="onChange" />
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item label="Ссылка кнопки">
						<el-input v-model="homeForm.form.latestSectionButtonLink" placeholder="/venues" @input="onChange" />
					</el-form-item>
				</el-col>
			</el-row>
		</el-form>

		<div class="info-callout">
			💡 Карточки площадок формируются автоматически из базы данных по дате добавления (4 последних активных площадки).
		</div>
	</UiGlassCard>
</template>

<script setup lang="ts">
import { UiGlassCard } from '@admin-panel/ui'
import type { HomePageForm } from '../../composables/useHomePageForm'

defineProps<{
	homeForm: HomePageForm
	onChange: () => void
}>()
</script>

<style scoped>
.info-callout {
	border: 1px solid rgb(56, 189, 248, 0.2);
	border-radius: 8px;
	font-size: 13px;
	color: var(--gp-text-main, #f8fafc);
	background: rgb(56, 189, 248, 0.08);
	padding: 10px 14px;
	margin-top: 14px;
}
</style>

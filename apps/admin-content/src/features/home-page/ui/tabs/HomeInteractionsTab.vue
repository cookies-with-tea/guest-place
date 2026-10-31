<template>
	<UiGlassCard
		icon="Aim"
		title="Варианты взаимодействия с платформой"
		description="Шаги 1-4: Самостоятельный поиск, Интерактивная карта, Помощь эксперта, Подбор в чате"
	>
		<template #actions>
			<el-button type="primary" size="small" :icon="Plus" @click="homeForm.addInteraction">Добавить шаг</el-button>
		</template>

		<el-form label-position="top">
			<el-form-item label="Общий заголовок секции">
				<el-input
					v-model="homeForm.form.interactionsTitle"
					placeholder="Варианты взаимодействия с GP Platform"
					@input="onChange"
				/>
			</el-form-item>
		</el-form>

		<div class="interactions-grid">
			<div v-for="(item, idx) in homeForm.form.interactions" :key="item.id || idx" class="item-glass-card">
				<div class="item-glass-card__head">
					<span class="step-badge">Шаг {{ item.stepNumber }}</span>
					<el-switch v-model="item.isAccent" active-text="Акцент" size="small" @change="onChange" />
					<el-button type="danger" link size="small" :icon="Delete" @click="homeForm.removeInteraction(idx)" />
				</div>

				<el-form label-position="top" size="small">
					<el-form-item label="Заголовок шага">
						<el-input v-model="item.title" placeholder="Самостоятельный поиск и бронирование" @input="onChange" />
					</el-form-item>
					<el-form-item label="Описание">
						<el-input
							v-model="item.text"
							type="textarea"
							:rows="2"
							placeholder="Описание сценария..."
							@input="onChange"
						/>
					</el-form-item>
					<el-row :gutter="12">
						<el-col :span="12">
							<el-form-item label="Текст кнопки">
								<el-input v-model="item.buttonText" placeholder="Каталог поиска" @input="onChange" />
							</el-form-item>
						</el-col>
						<el-col :span="12">
							<el-form-item label="Ссылка">
								<el-input v-model="item.link" placeholder="/venues" @input="onChange" />
							</el-form-item>
						</el-col>
					</el-row>
				</el-form>
			</div>
		</div>
	</UiGlassCard>
</template>

<script setup lang="ts">
import { UiGlassCard } from '@admin-panel/ui'
import { Delete, Plus } from '@element-plus/icons-vue'
import type { HomePageForm } from '../../composables/useHomePageForm'

defineProps<{
	homeForm: HomePageForm
	onChange: () => void
}>()
</script>

<style scoped lang="scss">
.interactions-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
	margin-top: 16px;
	gap: 16px;
}

.item-glass-card {
	border: 1px solid var(--gp-glass-border, rgb(255, 255, 255, 0.08));
	border-radius: 12px;
	background: var(--gp-bg-element, rgb(15, 23, 42, 0.4));
	padding: 14px;

	&__head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 10px;
		gap: 8px;
	}
}

.step-badge {
	font-weight: 700;
	font-size: 12px;
	color: #38bdf8;
}
</style>

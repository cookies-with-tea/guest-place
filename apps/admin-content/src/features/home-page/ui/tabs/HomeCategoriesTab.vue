<template>
	<UiGlassCard
		icon="Folder"
		title="Секция «Места по категориям»"
		description="Управление быстрым выбором типа площадок"
	>
		<template #actions>
			<el-button type="primary" size="small" :icon="Plus" @click="homeForm.addCategory">Добавить категорию</el-button>
		</template>

		<el-form label-position="top">
			<el-form-item label="Заголовок секции">
				<el-input v-model="homeForm.form.categoriesTitle" placeholder="Места по категориям" @input="onChange" />
			</el-form-item>
		</el-form>

		<div class="categories-grid">
			<div v-for="(cat, idx) in homeForm.form.categories" :key="cat.id || idx" class="item-glass-card">
				<div class="item-glass-card__head">
					<span class="item-num">#{{ idx + 1 }}</span>
					<el-button type="danger" link size="small" :icon="Delete" @click="homeForm.removeCategory(idx)"
						>Удалить</el-button
					>
				</div>
				<el-form label-position="top" size="small">
					<el-form-item label="Название категории">
						<el-input v-model="cat.title" placeholder="Банкетные залы" @input="onChange" />
					</el-form-item>
					<el-row :gutter="12">
						<el-col :span="12">
							<el-form-item label="Слаг">
								<el-input v-model="cat.slug" placeholder="banquet-halls" @input="onChange" />
							</el-form-item>
						</el-col>
						<el-col :span="12">
							<el-form-item label="Ссылка">
								<el-input v-model="cat.link" placeholder="/venues?type=..." @input="onChange" />
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
.categories-grid {
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
	}
}

.item-num {
	font-weight: 700;
	font-size: 11px;
	color: var(--gp-primary, #7c3aed);
}
</style>

<template>
	<VenueEditorCard icon="💬" title="Отзывы гостей площадки" description="Реальные отзывы гостей с оценкой и аватаром">
		<template #actions>
			<el-button size="small" type="primary" :icon="Plus" @click="venueForm.addReview">Добавить отзыв</el-button>
		</template>

		<div class="reviews-list">
			<div v-for="(rev, idx) in venueForm.formReviews" :key="rev.id" class="review-item-card">
				<div class="review-item-top">
					<div class="review-avatar-preview">
						<img :src="rev.avatar || DEFAULT_AVATAR" alt="Аватар" />
					</div>
					<el-input v-model="rev.author" placeholder="Имя гостя" style="width: 160px" @input="onChange" />
					<el-input v-model="rev.date" placeholder="Дата (20.03.2024)" style="width: 130px" @input="onChange" />
					<el-rate v-model="rev.rating" :max="5" style="margin-left: 8px" @change="onChange" />
					<el-button type="danger" link style="margin-left: auto" @click="venueForm.removeReview(idx)">✕</el-button>
				</div>
				<el-input v-model="rev.avatar" placeholder="URL аватара гостя" style="margin-bottom: 8px" @input="onChange" />
				<el-input v-model="rev.text" type="textarea" :rows="2" placeholder="Текст отзыва..." @input="onChange" />
			</div>
		</div>
		<div v-if="!venueForm.formReviews.length" class="empty-list-notice">Нет отзывов. Нажмите «Добавить отзыв».</div>
	</VenueEditorCard>

	<VenueEditorCard
		icon="❓"
		title="Вопросы и ответы (FAQ)"
		description="Часто задаваемые вопросы по бронированию и сервису"
	>
		<template #actions>
			<el-button size="small" type="primary" :icon="Plus" @click="venueForm.addFaq">Добавить вопрос</el-button>
		</template>

		<div class="faq-list">
			<div v-for="(item, idx) in venueForm.formFaq" :key="item.id" class="faq-item-card">
				<div class="faq-item-header">
					<el-input
						v-model="item.question"
						placeholder="Вопрос (Каков процент за обслуживание?)"
						style="flex: 1"
						@input="onChange"
					/>
					<el-button type="danger" link @click="venueForm.removeFaq(idx)">✕</el-button>
				</div>
				<el-input v-model="item.answer" type="textarea" :rows="2" placeholder="Подробный ответ..." @input="onChange" />
			</div>
		</div>
		<div v-if="!venueForm.formFaq.length" class="empty-list-notice">FAQ пуст. Нажмите «Добавить вопрос».</div>
	</VenueEditorCard>
</template>

<script setup lang="ts">
import { Plus } from '@element-plus/icons-vue'
import { DEFAULT_AVATAR, type VenueForm } from '../../composables/useVenueForm'
import VenueEditorCard from '../VenueEditorCard.vue'

defineProps<{
	venueForm: VenueForm
	onChange: () => void
}>()
</script>

<style scoped lang="scss">
.reviews-list,
.faq-list {
	display: flex;
	flex-direction: column;
	gap: 12px;
}

.review-item-card,
.faq-item-card {
	border: 1px solid var(--border-color);
	border-radius: 8px;
	background: var(--bg-surface);
	padding: 14px;
}

.review-item-top {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	margin-bottom: 10px;
	gap: 10px;
}

.review-avatar-preview {
	width: 36px;
	height: 36px;
	flex-shrink: 0;
	border-radius: 50%;
	background: #334155;
	overflow: hidden;

	img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
}

.faq-item-header {
	display: flex;
	align-items: center;
	margin-bottom: 8px;
	gap: 8px;
}

.empty-list-notice {
	border: 1px dashed var(--border-color);
	border-radius: 8px;
	font-size: 13px;
	text-align: center;
	color: var(--text-muted);
	background: var(--bg-surface);
	padding: 24px;
}
</style>

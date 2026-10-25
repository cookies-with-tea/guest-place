<template>
	<VenueEditorCard
		icon="🍽️"
		title="Фотогалерея блюд и банкетов"
		description="Фотографии авторских блюд для вкладки «Меню» на лендинге"
	>
		<div class="add-photo-bar">
			<el-input
				v-model="venueForm.newMenuPhotoUrl"
				placeholder="Вставьте прямую ссылку на фото блюда (https://...)"
				style="flex: 1"
				clearable
			/>
			<el-button type="primary" :icon="Plus" @click="venueForm.addMenuPhoto">Добавить</el-button>
			<el-button plain @click="venueForm.addPresetMenuPhotos">✨ Демо-блюда</el-button>
		</div>

		<div class="photos-grid">
			<div v-for="(photo, index) in venueForm.formMenuPhotos" :key="index" class="photo-card">
				<img :src="photo" alt="Блюдо" class="photo-card__img" />
				<div class="photo-card__badge">#{{ index + 1 }}</div>
				<button type="button" class="photo-card__del" title="Удалить фото" @click="venueForm.removeMenuPhoto(index)"
					>✕</button
				>
			</div>
		</div>
		<div v-if="!venueForm.formMenuPhotos.length" class="empty-list-notice">
			В меню пока нет фотографий. Введите URL выше или нажмите «✨ Демо-блюда».
		</div>
	</VenueEditorCard>
</template>

<script setup lang="ts">
import { Plus } from '@element-plus/icons-vue'
import type { VenueForm } from '../../composables/useVenueForm'
import VenueEditorCard from '../VenueEditorCard.vue'

defineProps<{
	venueForm: VenueForm
	onChange: () => void
}>()
</script>

<style scoped lang="scss">
.add-photo-bar {
	display: flex;
	margin-bottom: 16px;
	gap: 10px;
}

.photos-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
	margin-top: 12px;
	gap: 12px;
}

.photo-card {
	height: 100px;
	position: relative;
	border: 1px solid var(--border-color);
	border-radius: 8px;
	background: var(--bg-surface);
	overflow: hidden;

	&__img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	&__badge {
		left: 4px;
		bottom: 4px;
		position: absolute;
		border-radius: 4px;
		font-size: 10px;
		color: #fff;
		background: rgb(0, 0, 0, 0.65);
		padding: 2px 6px;
	}

	&__del {
		top: 4px;
		right: 4px;
		width: 22px;
		height: 22px;
		position: absolute;
		display: flex;
		align-items: center;
		justify-content: center;
		border: none;
		border-radius: 50%;
		font-size: 11px;
		color: #fff;
		background: rgb(239, 68, 68, 0.85);
		transition: background 0.15s;
		cursor: pointer;

		&:hover {
			background: #dc2626;
		}
	}
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

<template>
	<UiGlassCard
		icon="PictureFilled"
		title="Фотогалерея и 3D-тур"
		description="Ссылки на изображения и видео-тур площадки"
	>
		<el-form label-position="top">
			<el-form-item label="Фотографии площадки (URL по одному на строке)">
				<el-input
					v-model="venueForm.photosString"
					type="textarea"
					:rows="6"
					placeholder="https://images.unsplash.com/photo-1519167758481...&#10;https://images.unsplash.com/photo-1464366400..."
					@input="onChange"
				/>
			</el-form-item>

			<el-form-item label="Ссылка на видео / 3D-тур (YouTube)">
				<el-input
					v-model="venueForm.form.video_tour_url"
					placeholder="https://www.youtube.com/watch?v=..."
					@input="onChange"
				/>
			</el-form-item>

			<el-form-item>
				<el-checkbox v-model="venueForm.form.has_online_tour" @change="onChange"
					>Доступен онлайн-показ площадки</el-checkbox
				>
			</el-form-item>
		</el-form>
	</UiGlassCard>
</template>

<script setup lang="ts">
import { UiGlassCard } from '@admin-panel/ui'
import type { VenueForm } from '../../composables/useVenueForm'

defineProps<{
	venueForm: VenueForm
	onChange: () => void
}>()
</script>

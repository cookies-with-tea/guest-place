<template>
	<VenueEditorCard
		icon="📝"
		title="Подробное описание площадки"
		description="Основной текст о заведении для карточки и поисковых систем"
	>
		<el-form label-position="top">
			<el-form-item label="Текст описания">
				<el-input
					v-model="venueForm.form.description_html"
					type="textarea"
					:rows="10"
					placeholder="У Вас намечается банкет? Отлично! Приглашаем отметить ваше торжество..."
					@input="onChange"
				/>
			</el-form-item>
		</el-form>
	</VenueEditorCard>
</template>

<script setup lang="ts">
import type { VenueForm } from '../../composables/useVenueForm'
import VenueEditorCard from '../VenueEditorCard.vue'

defineProps<{
	venueForm: VenueForm
	onChange: () => void
}>()
</script>

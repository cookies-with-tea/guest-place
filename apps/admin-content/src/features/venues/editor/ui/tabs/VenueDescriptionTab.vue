<template>
	<UiGlassCard
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

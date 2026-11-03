<template>
	<UiGlassCard
		icon="EditPen"
		title="Подробное описание площадки"
		description="Основной текст о заведении для карточки и поисковых систем"
	>
		<el-form label-position="top">
			<el-form-item label="Текст описания">
				<UiRichTextField
					v-model="venueForm.form.description_html"
					field-path="description"
					mode="full"
					namespace="venues"
					placeholder="У Вас намечается банкет? Отлично! Приглашаем отметить ваше торжество..."
					@update:model-value="onChange"
				/>
			</el-form-item>
		</el-form>
	</UiGlassCard>
</template>

<script setup lang="ts">
import { UiGlassCard, UiRichTextField } from '@admin-panel/ui'
import type { VenueForm } from '../../composables/useVenueForm'

defineProps<{
	venueForm: VenueForm
	onChange: () => void
}>()
</script>

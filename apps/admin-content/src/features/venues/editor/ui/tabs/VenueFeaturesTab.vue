<template>
	<UiGlassCard
		icon="PriceTag"
		title="Классификация и теги"
		description="Фильтры каталога, типы заведений и особенности"
	>
		<el-form label-position="top">
			<el-form-item label="Типы площадки (через запятую)">
				<el-input
					v-model="venueForm.typesString"
					placeholder="Банкетный зал, Загородный ресторан, Ресторан для Банкета"
					@input="onChange"
				/>
			</el-form-item>

			<el-form-item label="Особенности (через запятую)">
				<el-input
					v-model="venueForm.featuresString"
					placeholder="Летняя веранда, Парковая зона, удобный подъезд"
					@input="onChange"
				/>
			</el-form-item>

			<el-form-item label="Кухня (через запятую)">
				<el-input v-model="venueForm.cuisinesString" placeholder="Европейская, Русская, Авторская" @input="onChange" />
			</el-form-item>
		</el-form>
	</UiGlassCard>

	<UiGlassCard
		icon="SetUp"
		title="Оснащение, сервис и парковка"
		description="Техническое оборудование и сопутствующие услуги"
	>
		<el-form label-position="top">
			<el-form-item label="Услуги">
				<el-input
					v-model="venueForm.servicesString"
					placeholder="Wi-Fi, Бизнес-ланч, Банкеты, Номерной фонд, Детская комната"
					@input="onChange"
				/>
			</el-form-item>

			<el-form-item label="Оборудование">
				<el-input
					v-model="venueForm.equipmentString"
					placeholder="Свет, Звук, микрофон, колонки, проектор"
					@input="onChange"
				/>
			</el-form-item>

			<el-form-item label="Парковка">
				<el-input v-model="venueForm.form.parking" placeholder="на 5 А/М, охраняемая" @input="onChange" />
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

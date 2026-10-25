<template>
	<UiGlassCard
		icon="💰"
		title="Основные тарифы площадки"
		description="Средний чек, банкетное меню и стоимость аренды в час"
	>
		<el-form label-position="top">
			<el-row :gutter="16">
				<el-col :span="8">
					<el-form-item label="Средний чек (руб)">
						<el-input-number
							v-model="venueForm.form.average_check"
							:min="0"
							:step="100"
							style="width: 100%"
							@change="onChange"
						/>
					</el-form-item>
				</el-col>
				<el-col :span="8">
					<el-form-item label="Банкетное меню от (руб)">
						<el-input-number
							v-model="venueForm.form.banquet_price_from"
							:min="0"
							:step="100"
							style="width: 100%"
							@change="onChange"
						/>
					</el-form-item>
				</el-col>
				<el-col :span="8">
					<el-form-item label="Аренда от (руб/час)">
						<el-input-number
							v-model="venueForm.form.rent_price_hour"
							:min="0"
							:step="100"
							style="width: 100%"
							@change="onChange"
						/>
					</el-form-item>
				</el-col>
			</el-row>
		</el-form>
	</UiGlassCard>

	<UiGlassCard
		icon="🏦"
		title="Депозиты закрытия залов"
		description="Минимальная стоимость закрытия площадки под мероприятие"
	>
		<el-form label-position="top">
			<el-row :gutter="16">
				<el-col :span="8">
					<el-form-item label="Депозит: Большой зал">
						<el-input v-model="venueForm.depositLarge" placeholder="200 000 р." @input="onChange" />
					</el-form-item>
				</el-col>
				<el-col :span="8">
					<el-form-item label="Депозит: Малый зал">
						<el-input v-model="venueForm.depositSmall" placeholder="120 000 р." @input="onChange" />
					</el-form-item>
				</el-col>
				<el-col :span="8">
					<el-form-item label="Депозит: Вся площадка">
						<el-input v-model="venueForm.depositAll" placeholder="300 000 р." @input="onChange" />
					</el-form-item>
				</el-col>
			</el-row>

			<el-row :gutter="16">
				<el-col :span="12">
					<el-form-item label="Что входит в депозит">
						<el-input v-model="venueForm.depositIncludes" placeholder="Еда, часть напитков" @input="onChange" />
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item label="Алкоголь площадки">
						<el-input v-model="venueForm.alcoholAllowed" placeholder="да" @input="onChange" />
					</el-form-item>
				</el-col>
			</el-row>

			<el-row :gutter="16">
				<el-col :span="8">
					<el-form-item label="Пробковый сбор">
						<el-switch
							v-model="venueForm.form.corkage_fee_has"
							active-text="Есть"
							inactive-text="Нет"
							@change="onChange"
						/>
					</el-form-item>
				</el-col>
				<el-col :span="16">
					<el-form-item label="Условия пробкового сбора">
						<el-input
							v-model="venueForm.form.corkage_fee_desc"
							placeholder="есть / от 300 р. за бутылку"
							@input="onChange"
						/>
					</el-form-item>
				</el-col>
			</el-row>
		</el-form>
	</UiGlassCard>

	<UiGlassCard
		icon="📄"
		title="Документы и файлы меню"
		description="Ссылки на PDF меню, технический райдер и особые примечания"
	>
		<el-form label-position="top">
			<el-row :gutter="16">
				<el-col :span="12">
					<el-form-item label="URL файла банкетного меню (PDF)">
						<el-input v-model="venueForm.form.menu_url" placeholder="https://example.com/menu.pdf" @input="onChange" />
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item label="URL технического райдера (PDF)">
						<el-input
							v-model="venueForm.form.rider_url"
							placeholder="https://example.com/rider.pdf"
							@input="onChange"
						/>
					</el-form-item>
				</el-col>
			</el-row>

			<el-form-item label="Примечания по ценам и условиям бронирования">
				<el-input
					v-model="venueForm.pricingNotesString"
					type="textarea"
					:rows="3"
					placeholder="Условия сезонности, залоги и предоплата..."
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

<template>
	<UiGlassCard
		icon="🏷️"
		title="Основная информация"
		description="Название площадки, URL-идентификатор (слаг) и краткое позиционирование"
	>
		<el-form label-position="top">
			<el-form-item label="Название площадки *" required>
				<el-input
					v-model="venueForm.form.title"
					placeholder="Например: Крыша Неглинная Руфтоп"
					size="large"
					@input="onChange"
				/>
			</el-form-item>

			<el-form-item label="Слаг (URL-идентификатор) *" required>
				<div class="slug-input-group">
					<div class="slug-prefix">/venues/</div>
					<el-input v-model="venueForm.form.slug" placeholder="rooftop-neglinnaya" @input="onChange" />
					<el-button
						type="primary"
						plain
						title="Сгенерировать слаг из названия"
						@click="venueForm.generateSlugFromTitle"
					>
						⚡ Из названия
					</el-button>
				</div>
			</el-form-item>

			<el-form-item label="Подзаголовок / Краткое позиционирование">
				<el-input
					v-model="venueForm.form.subtitle"
					type="textarea"
					:rows="2"
					placeholder="Стильная терраса на крыше особняка с панорамным видом на исторический центр Москвы"
					@input="onChange"
				/>
			</el-form-item>
		</el-form>
	</UiGlassCard>

	<UiGlassCard
		icon="📍"
		title="Локация и транспортная доступность"
		description="Фактический адрес, метро и пешие ориентиры для гостей"
	>
		<el-form label-position="top">
			<el-row :gutter="16">
				<el-col :span="16">
					<el-form-item label="Фактический адрес *" required>
						<el-input
							v-model="venueForm.form.address"
							placeholder="г. Москва, ул. Неглинная, д. 14, стр. 1A"
							@input="onChange"
						/>
					</el-form-item>
				</el-col>
				<el-col :span="8">
					<el-form-item label="Город">
						<el-input v-model="venueForm.form.city" placeholder="Москва" @input="onChange" />
					</el-form-item>
				</el-col>
			</el-row>

			<el-row :gutter="16">
				<el-col :span="12">
					<el-form-item label="Ближайшее метро">
						<el-input v-model="venueForm.form.metro_station" placeholder="Трубная" @input="onChange">
							<template #prefix>🚇</template>
						</el-input>
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item label="Пешком от метро">
						<el-input v-model="venueForm.form.metro_distance_text" placeholder="3 мин пешком" @input="onChange">
							<template #prefix>🚶</template>
						</el-input>
					</el-form-item>
				</el-col>
			</el-row>

			<!-- Координаты для карты -->
			<div class="map-coordinates-box">
				<div class="map-coords-header">
					<div class="map-coords-title">
						<span>🗺️ Точка на карте (геолокация)</span>
						<small>Необходимо для отображения места в каталоге на карте</small>
					</div>
					<el-tag
						v-if="venueForm.form.coordinates_lat && venueForm.form.coordinates_lng"
						type="success"
						size="small"
						effect="dark"
					>
						📍 Размещено на карте
					</el-tag>
					<el-tag v-else type="warning" size="small" effect="plain"> ⚠️ Точка не задана </el-tag>
				</div>

				<el-row :gutter="16">
					<el-col :span="12">
						<el-form-item label="Широта (Latitude, WGS84)">
							<el-input-number
								v-model="venueForm.form.coordinates_lat"
								:precision="6"
								:step="0.001"
								:min="55.0"
								:max="56.5"
								style="width: 100%"
								placeholder="55.7558"
								@change="onChange"
							/>
						</el-form-item>
					</el-col>
					<el-col :span="12">
						<el-form-item label="Долгота (Longitude, WGS84)">
							<el-input-number
								v-model="venueForm.form.coordinates_lng"
								:precision="6"
								:step="0.001"
								:min="36.5"
								:max="38.5"
								style="width: 100%"
								placeholder="37.6173"
								@change="onChange"
							/>
						</el-form-item>
					</el-col>
				</el-row>

				<div class="map-presets-row">
					<span class="map-presets-label">Быстрый выбор района:</span>
					<div class="map-presets-buttons">
						<el-button size="small" text bg @click="venueForm.setCoordsPreset('center')">Охотный ряд (Центр)</el-button>
						<el-button size="small" text bg @click="venueForm.setCoordsPreset('tverskaya')">Тверская</el-button>
						<el-button size="small" text bg @click="venueForm.setCoordsPreset('city')">Москва-Сити</el-button>
						<el-button size="small" text bg @click="venueForm.setCoordsPreset('arbat')">Арбат</el-button>
						<el-button size="small" text bg @click="venueForm.setCoordsPreset('sokolniki')">Сокольники</el-button>
					</div>
				</div>
			</div>
		</el-form>
	</UiGlassCard>

	<UiGlassCard
		icon="📞"
		title="Контакты и статус публикации"
		description="Телефон менеджера и видимость площадки в каталоге"
	>
		<el-form label-position="top">
			<el-row :gutter="16">
				<el-col :span="12">
					<el-form-item label="Контактный телефон">
						<el-input v-model="venueForm.form.phone" placeholder="+7 (495) 123 78 90" @input="onChange">
							<template #prefix>📞</template>
						</el-input>
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item label="Статус площадки">
						<el-select v-model="venueForm.form.status" style="width: 100%">
							<el-option label="🟢 Опубликовано на сайте" value="published" />
							<el-option label="⚪ Черновик (скрыто)" value="draft" />
						</el-select>
					</el-form-item>
				</el-col>
			</el-row>
		</el-form>
	</UiGlassCard>

	<UiGlassCard icon="⏰" title="Режим работы" description="Часы приёма гостей в будни и выходные дни">
		<el-form label-position="top">
			<el-row :gutter="16">
				<el-col :span="12">
					<el-form-item label="Будние дни (Пн - Чт)">
						<el-input
							v-model="venueForm.form.working_hours_weekdays"
							placeholder="Пн - Чт: с 12:00 до 22:00"
							@input="onChange"
						/>
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item label="Выходные и праздники (Пт - Вс)">
						<el-input
							v-model="venueForm.form.working_hours_weekends"
							placeholder="Пт - Вс: с 10:00 до 24:00"
							@input="onChange"
						/>
					</el-form-item>
				</el-col>
			</el-row>
		</el-form>
	</UiGlassCard>

	<UiGlassCard icon="⭐" title="Рейтинг и репутация" description="Отображаемая оценка в каталоге и количество отзывов">
		<el-form label-position="top">
			<el-row :gutter="16">
				<el-col :span="12">
					<el-form-item label="Оценка рейтинга (0 - 5.0)">
						<div class="rating-input-row">
							<el-input-number
								v-model="venueForm.form.rating_score"
								:min="1"
								:max="5"
								:step="0.1"
								controls-position="right"
								style="width: 140px"
								@change="onChange"
							/>
							<el-rate
								:model-value="venueForm.form.rating_score"
								disabled
								show-score
								text-color="#f59e0b"
								score-template="{value}"
							/>
						</div>
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item label="Количество отзывов">
						<el-input-number
							v-model="venueForm.form.rating_reviews_count"
							:min="0"
							controls-position="right"
							style="width: 100%"
							@change="onChange"
						/>
					</el-form-item>
				</el-col>
			</el-row>
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

<style scoped lang="scss">
.map-coordinates-box {
	border: 1px solid var(--border-color, rgb(255, 255, 255, 0.1));
	border-radius: 8px;
	background: rgb(255, 255, 255, 0.03);
	padding: 16px;
	margin-top: 16px;
	margin-bottom: 8px;
}

.map-coords-header {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 12px;
	gap: 8px;
}

.map-coords-title {
	display: flex;
	flex-direction: column;
	font-weight: 500;
	font-size: 14px;
	color: var(--text-primary);
	gap: 2px;

	small {
		font-weight: 400;
		font-size: 11px;
		color: var(--text-muted);
	}
}

.map-presets-row {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	border-top: 1px dashed var(--border-color, rgb(255, 255, 255, 0.08));
	padding-top: 10px;
	margin-top: 10px;
	gap: 8px;
}

.map-presets-label {
	font-size: 12px;
	color: var(--text-muted);
}

.map-presets-buttons {
	display: flex;
	flex-wrap: wrap;
	gap: 6px;
}

.slug-input-group {
	width: 100%;
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: 8px;
}

.slug-prefix {
	border: 1px solid var(--gp-glass-border, rgb(255, 255, 255, 0.08));
	border-radius: 6px;
	font-size: 13px;
	color: var(--gp-text-secondary, #94a3b8);
	background: rgb(0, 0, 0, 0.25);
	user-select: none;
	padding: 6px 10px;
}

.rating-input-row {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: 12px;
}
</style>

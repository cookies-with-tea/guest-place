<template>
	<div class="venues-list-view">
		<div class="page-header">
			<div class="page-header__left">
				<div class="header-title-row">
					<h1>Управление площадками (Venues)</h1>
					<el-tag size="small" type="primary" effect="plain" class="version-tag">Live Editor & Tabs</el-tag>
				</div>
				<p class="page-subtitle">
					Каталог площадок: залы, вместимость, ценообразование, характеристики, медиагалереи, лента и гостевой чат
				</p>
			</div>
			<div class="page-header__actions">
				<el-button plain @click="router.push('/pages')">🧱 Страницы сайта</el-button>
				<el-button plain @click="router.push('/menus')">🧭 Меню и навигация</el-button>
				<el-button plain @click="router.push('/redirects')">🔀 Редиректы</el-button>
				<el-button type="primary" :icon="Plus" @click="emit('create')"> + Добавить площадку </el-button>
			</div>
		</div>

		<el-card class="filter-card" shadow="never">
			<div class="filter-row">
				<el-input
					v-model="catalog.searchQuery"
					placeholder="Поиск по названию, адресу или метро..."
					clearable
					prefix-icon="Search"
					style="width: 380px"
					@input="catalog.handleSearch"
				/>

				<el-select
					v-model="catalog.statusFilter"
					placeholder="Все статусы"
					clearable
					style="width: 180px"
					@change="catalog.fetchVenuesList"
				>
					<el-option label="Все статусы" value="" />
					<el-option label="Опубликовано" value="published" />
					<el-option label="Черновик" value="draft" />
				</el-select>

				<div class="filter-stats">
					<span
						>Всего площадок: <strong>{{ catalog.totalVenues }}</strong></span
					>
				</div>
			</div>
		</el-card>

		<el-card class="table-card" shadow="never">
			<el-table
				v-loading="catalog.loading"
				:data="catalog.venues"
				stripe
				style="width: 100%"
				empty-text="Площадки не найдены"
			>
				<el-table-column label="Фото" width="100">
					<template #default="{ row }">
						<div class="venue-thumb-wrap">
							<img :src="catalog.getVenueThumb(row)" alt="Превью" class="venue-thumb" />
						</div>
					</template>
				</el-table-column>

				<el-table-column label="Название и слаг" min-width="260">
					<template #default="{ row }">
						<div class="venue-title-cell">
							<a
								:href="getLandingUrl(row.slug)"
								target="_blank"
								class="venue-title-link"
								title="Перейти на страницу площадки"
							>
								<strong>{{ row.title }}</strong>
								<span class="external-icon">↗</span>
							</a>
							<div class="venue-slug-row">
								<el-tag size="small" type="info">{{ row.slug }}</el-tag>
								<span v-if="row.phone" class="venue-phone-text">📞 {{ row.phone }}</span>
							</div>
							<a :href="getLandingUrl(row.slug)" target="_blank" class="landing-pill-btn"> 🌐 Открыть лендинг ↗ </a>
						</div>
					</template>
				</el-table-column>

				<el-table-column label="Локация" min-width="220">
					<template #default="{ row }">
						<div class="venue-loc-cell">
							<span class="venue-address-text">📍 {{ row.address }}</span>
							<span v-if="row.metro_station || row.metroStation" class="venue-metro-text">
								🚇 {{ row.metro_station || row.metroStation }}
								<small v-if="row.metro_distance_text || row.metroDistanceText"
									>({{ row.metro_distance_text || row.metroDistanceText }})</small
								>
							</span>
							<div class="venue-map-coords-badge">
								<el-tag
									v-if="(row.coordinates_lat || row.coordinatesLat) && (row.coordinates_lng || row.coordinatesLng)"
									size="small"
									type="success"
									effect="light"
								>
									🗺️ {{ Number(row.coordinates_lat || row.coordinatesLat).toFixed(4) }},
									{{ Number(row.coordinates_lng || row.coordinatesLng).toFixed(4) }}
								</el-tag>
								<el-tag v-else size="small" type="info" effect="plain"> ⚠️ Без точки на карте </el-tag>
							</div>
						</div>
					</template>
				</el-table-column>

				<el-table-column label="Цены" width="180">
					<template #default="{ row }">
						<div class="venue-prices-cell">
							<span v-if="row.average_check || row.averageCheck"
								>Чек: {{ formatPrice(row.average_check || row.averageCheck) }} ₽</span
							>
							<span v-if="row.banquet_price_from || row.banquetPriceFrom">
								Банкет: от {{ formatPrice(row.banquet_price_from || row.banquetPriceFrom) }} ₽
							</span>
							<span v-if="row.rent_price_hour || row.rentPriceHour"
								>Аренда: {{ formatPrice(row.rent_price_hour || row.rentPriceHour) }} ₽/ч</span
							>
						</div>
					</template>
				</el-table-column>

				<el-table-column label="Табы сайта" width="170">
					<template #default="{ row }">
						<div class="venue-tabs-badges">
							<el-tag size="small" :type="row.pricing_table ? 'success' : 'info'" effect="plain">💰 Цены</el-tag>
							<el-tag size="small" :type="row.menu_photos?.length ? 'success' : 'info'" effect="plain">
								🍽️ Меню ({{ row.menu_photos?.length || 0 }})
							</el-tag>
							<el-tag size="small" :type="row.feed?.length ? 'success' : 'info'" effect="plain"
								>📰 Лента ({{ row.feed?.length || 0 }})</el-tag
							>
							<el-tag size="small" :type="row.reviews?.length ? 'success' : 'info'" effect="plain"
								>💬 Чат ({{ row.reviews?.length || 0 }})</el-tag
							>
						</div>
					</template>
				</el-table-column>

				<el-table-column label="Статус" width="120" align="center">
					<template #default="{ row }">
						<el-tag :type="row.status === 'published' ? 'success' : 'warning'">
							{{ row.status === 'published' ? 'Опубликован' : 'Черновик' }}
						</el-tag>
					</template>
				</el-table-column>

				<el-table-column label="Действия" width="220" align="right">
					<template #default="{ row }">
						<div class="actions-group">
							<el-button
								size="small"
								type="success"
								plain
								title="Открыть лендинг в новой вкладке"
								@click="openLanding(row.slug)"
							>
								Сайт ↗
							</el-button>
							<el-button size="small" type="primary" title="Редактировать в Live формате" @click="emit('edit', row)">
								⚡ Live редактор
							</el-button>
							<el-popconfirm
								title="Удалить эту площадку?"
								confirm-button-text="Удалить"
								cancel-button-text="Отмена"
								@confirm="catalog.handleDelete(row)"
							>
								<template #reference>
									<el-button size="small" type="danger" plain> ✕ </el-button>
								</template>
							</el-popconfirm>
						</div>
					</template>
				</el-table-column>
			</el-table>

			<div class="table-pagination-row">
				<el-pagination
					v-model:current-page="catalog.currentPage"
					v-model:page-size="catalog.pageSize"
					:page-sizes="[5, 10, 20, 50]"
					layout="total, sizes, prev, pager, next, jumper"
					:total="catalog.totalVenues"
					@size-change="catalog.handleSizeChange"
					@current-change="catalog.handlePageChange"
				/>
			</div>
		</el-card>
	</div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Plus } from '@element-plus/icons-vue'
import type { VenuesCatalog } from '../composables/useVenuesCatalog'
import { formatPrice, getLandingUrl, openLanding } from '../../lib/helpers'

defineProps<{
	catalog: VenuesCatalog
}>()

const emit = defineEmits<{
	create: []
	edit: [row: any]
}>()

const router = useRouter()
</script>

<style scoped lang="scss">
.venues-list-view {
	display: flex;
	flex-direction: column;
	padding: 24px 32px;
	gap: 20px;
}

.page-header {
	display: flex;
	flex-wrap: wrap;
	align-items: flex-start;
	justify-content: space-between;
	gap: 12px;

	&__left {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	&__actions {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 10px;
	}
}

.header-title-row {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: 12px;

	h1 {
		font-weight: 700;
		font-size: 24px;
		color: var(--text-primary);
		margin: 0;
	}
}

.page-subtitle {
	font-size: 14px;
	color: var(--text-muted);
	margin: 0;
}

.filter-card {
	border: 1px solid var(--border-color);
	border-radius: 12px;
	background: var(--bg-card);
	backdrop-filter: blur(8px);
}

.filter-row {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: 16px;
}

.filter-stats {
	font-size: 14px;
	color: var(--text-muted);
	margin-left: auto;
}

.table-card {
	border: 1px solid var(--border-color);
	border-radius: 12px;
	background: var(--bg-card);
	overflow: hidden;
	backdrop-filter: blur(8px);
}

.table-pagination-row {
	display: flex;
	justify-content: flex-end;
	margin-top: 20px;
}

:deep(.el-card) {
	border-color: var(--border-color);
	color: var(--text-primary);
	background-color: var(--bg-card);
}

:deep(.el-table) {
	--el-table-header-bg-color: var(--bg-surface);
	--el-table-row-hover-bg-color: rgb(255, 255, 255, 0.05);
	--el-table-border-color: var(--border-color);
	--el-table-bg-color: transparent;
	--el-table-tr-bg-color: transparent;
	--el-table-text-color: var(--text-primary);
	--el-table-header-text-color: var(--text-muted);

	color: var(--text-primary);
	background-color: transparent !important;
}

:deep(.el-table th.el-table__cell) {
	border-bottom: 1px solid var(--border-color) !important;
	color: var(--text-muted) !important;
	background-color: var(--bg-surface) !important;
}

:deep(.el-table td.el-table__cell) {
	border-bottom: 1px solid var(--border-color) !important;
}

:deep(.el-table tr) {
	background-color: transparent !important;
}

:deep(.el-table--striped .el-table__body tr.el-table__row--striped td.el-table__cell) {
	background-color: rgb(255, 255, 255, 0.02) !important;
}

.venue-thumb-wrap {
	width: 68px;
	height: 52px;
	border: 1px solid var(--border-color);
	border-radius: 8px;
	background: var(--bg-surface);
	overflow: hidden;
}

.venue-thumb {
	width: 100%;
	height: 100%;
	display: block;
	object-fit: cover;
}

.venue-title-cell {
	display: flex;
	flex-direction: column;
	gap: 6px;
}

.venue-title-link {
	display: inline-flex;
	align-items: center;
	font-size: 14px;
	text-decoration: none;
	color: var(--text-primary);
	transition: color 0.15s;
	gap: 4px;

	&:hover {
		color: var(--accent-primary, #38bdf8);
	}
}

.external-icon {
	font-size: 12px;
	opacity: 0.7;
}

.venue-slug-row {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: 8px;
}

.landing-pill-btn {
	width: fit-content;
	display: inline-flex;
	align-items: center;
	border: 1px solid rgb(16, 185, 129, 0.2);
	border-radius: 4px;
	font-size: 11px;
	text-decoration: none;
	color: #10b981;
	background: rgb(16, 185, 129, 0.1);
	padding: 2px 8px;
	gap: 4px;

	&:hover {
		background: rgb(16, 185, 129, 0.2);
	}
}

.venue-phone-text {
	font-size: 12px;
	color: var(--text-muted);
}

.venue-loc-cell {
	display: flex;
	flex-direction: column;
	font-size: 13px;
	gap: 4px;
}

.venue-address-text {
	color: var(--text-primary);
}

.venue-metro-text {
	font-size: 12px;
	color: var(--text-muted);
}

.venue-map-coords-badge {
	margin-top: 2px;
}

.venue-prices-cell {
	display: flex;
	flex-direction: column;
	font-size: 12px;
	color: var(--text-muted);
	gap: 2px;
}

.venue-tabs-badges {
	display: flex;
	flex-wrap: wrap;
	gap: 4px;
}

.actions-group {
	display: flex;
	flex-wrap: wrap;
	justify-content: flex-end;
	gap: 6px;
}
</style>

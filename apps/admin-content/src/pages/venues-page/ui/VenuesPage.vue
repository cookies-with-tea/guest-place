<template>
	<div class="venues-page">
		<!-- ================================================================= -->
		<!-- VIEW 1: Venues Catalog & Table (when !isEditorOpen)              -->
		<!-- ================================================================= -->
		<div v-if="!isEditorOpen" class="venues-list-view">
			<!-- Header -->
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
					<el-button type="primary" :icon="Plus" @click="openCreate">
						+ Добавить площадку
					</el-button>
				</div>
			</div>

			<!-- Filter Bar -->
			<el-card class="filter-card" shadow="never">
				<div class="filter-row">
					<el-input
						v-model="searchQuery"
						placeholder="Поиск по названию, адресу или метро..."
						clearable
						prefix-icon="Search"
						style="width: 380px"
						@input="handleSearch"
					/>

					<el-select
						v-model="statusFilter"
						placeholder="Все статусы"
						clearable
						style="width: 180px"
						@change="fetchVenuesList"
					>
						<el-option label="Все статусы" value="" />
						<el-option label="Опубликовано" value="published" />
						<el-option label="Черновик" value="draft" />
					</el-select>

					<div class="filter-stats">
						<span>Всего площадок: <strong>{{ totalVenues }}</strong></span>
					</div>
				</div>
			</el-card>

			<!-- Venues Table -->
			<el-card class="table-card" shadow="never">
				<el-table
					v-loading="loading"
					:data="venues"
					stripe
					style="width: 100%"
					empty-text="Площадки не найдены"
				>
					<el-table-column label="Фото" width="100">
						<template #default="{ row }">
							<div class="venue-thumb-wrap">
								<img
									:src="getVenueThumb(row)"
									alt="Превью"
									class="venue-thumb"
								/>
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
								<a
									:href="getLandingUrl(row.slug)"
									target="_blank"
									class="landing-pill-btn"
								>
									🌐 Открыть лендинг ↗
								</a>
							</div>
						</template>
					</el-table-column>

					<el-table-column label="Локация" min-width="200">
						<template #default="{ row }">
							<div class="venue-loc-cell">
								<span class="venue-address-text">📍 {{ row.address }}</span>
								<span v-if="row.metro_station || row.metroStation" class="venue-metro-text">
									🚇 {{ row.metro_station || row.metroStation }}
									<small v-if="row.metro_distance_text || row.metroDistanceText">({{ row.metro_distance_text || row.metroDistanceText }})</small>
								</span>
							</div>
						</template>
					</el-table-column>

					<el-table-column label="Цены" width="180">
						<template #default="{ row }">
							<div class="venue-prices-cell">
								<span v-if="row.average_check || row.averageCheck">Чек: {{ formatPrice(row.average_check || row.averageCheck) }} ₽</span>
								<span v-if="row.banquet_price_from || row.banquetPriceFrom">Банкет: от {{ formatPrice(row.banquet_price_from || row.banquetPriceFrom) }} ₽</span>
								<span v-if="row.rent_price_hour || row.rentPriceHour">Аренда: {{ formatPrice(row.rent_price_hour || row.rentPriceHour) }} ₽/ч</span>
							</div>
						</template>
					</el-table-column>

					<el-table-column label="Табы сайта" width="170">
						<template #default="{ row }">
							<div class="venue-tabs-badges">
								<el-tag size="small" :type="row.pricing_table ? 'success' : 'info'" effect="plain">💰 Цены</el-tag>
								<el-tag size="small" :type="row.menu_photos?.length ? 'success' : 'info'" effect="plain">🍽️ Меню ({{ row.menu_photos?.length || 0 }})</el-tag>
								<el-tag size="small" :type="row.feed?.length ? 'success' : 'info'" effect="plain">📰 Лента ({{ row.feed?.length || 0 }})</el-tag>
								<el-tag size="small" :type="row.reviews?.length ? 'success' : 'info'" effect="plain">💬 Чат ({{ row.reviews?.length || 0 }})</el-tag>
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
									@click="openLanding(row.slug)"
									title="Открыть лендинг в новой вкладке"
								>
									Сайт ↗
								</el-button>
								<el-button
									size="small"
									type="primary"
									@click="openEdit(row)"
									title="Редактировать в Live формате"
								>
									⚡ Live редактор
								</el-button>
								<el-popconfirm
									title="Удалить эту площадку?"
									confirm-button-text="Удалить"
									cancel-button-text="Отмена"
									@confirm="handleDelete(row)"
								>
									<template #reference>
										<el-button size="small" type="danger" plain>
											✕
										</el-button>
									</template>
								</el-popconfirm>
							</div>
						</template>
					</el-table-column>
				</el-table>

				<div class="table-pagination-row" style="margin-top: 20px; display: flex; justify-content: flex-end;">
					<el-pagination
						v-model:current-page="currentPage"
						v-model:page-size="pageSize"
						:page-sizes="[5, 10, 20, 50]"
						layout="total, sizes, prev, pager, next, jumper"
						:total="totalVenues"
						@size-change="handleSizeChange"
						@current-change="handlePageChange"
					/>
				</div>
			</el-card>
		</div>

		<!-- ================================================================= -->
		<!-- VIEW 2: In-Page Full Live Split Editor (No Dialog z-index clash!) -->
		<!-- ================================================================= -->
		<div v-else class="venues-live-editor-view">
			<!-- Live Editor Top Navigation Bar -->
			<div class="editor-topbar">
				<div class="editor-topbar__left">
					<el-button plain @click="closeEditor">
						← К списку
					</el-button>
					<span class="live-pill">⚡ LIVE РЕДАКТОР</span>
					<h2 class="editor-title">{{ isEditing ? form.title : 'Новая площадка' }}</h2>
					<a
						v-if="form.slug"
						:href="getLandingUrl(form.slug)"
						target="_blank"
						class="editor-slug-chip"
						title="Открыть страницу на сайте"
					>
						{{ form.slug }} ↗
					</a>
				</div>

				<div class="editor-topbar__right">
					<!-- Split Screen Controls -->
					<div class="split-controls">
						<button
							type="button"
							class="split-btn"
							:class="{ active: splitRatio === '50-50' }"
							title="Равный сплит (50% / 50%)"
							@click="splitRatio = '50-50'"
						>
							◫ 50:50
						</button>
						<button
							type="button"
							class="split-btn"
							:class="{ active: splitRatio === '60-40' }"
							title="Широкая форма (60% / 40%)"
							@click="splitRatio = '60-40'"
						>
							◧ 60:40
						</button>
						<button
							type="button"
							class="split-btn"
							:class="{ active: splitRatio === 'full' }"
							title="Только форма (100%)"
							@click="splitRatio = 'full'"
						>
							⛶ 100%
						</button>
					</div>

					<el-button
						type="success"
						plain
						@click="openLanding(form.slug)"
					>
						🌐 На сайт ↗
					</el-button>

					<el-button
						type="primary"
						:loading="saving"
						@click="handleSave"
					>
						💾 Сохранить
					</el-button>
				</div>
			</div>

			<!-- Live Editor Main Container -->
						<!-- Live Editor Main Container -->
			<div class="editor-content-container" :class="[`split-${splitRatio}`]">
				<!-- LEFT PANE: Full Tabbed Form -->
				<div class="editor-form-pane">
					<!-- Modern Segmented Pill Tabs Navigation -->
					<div class="venue-tabs-nav">
						<button
							v-for="t in venueTabs"
							:key="t.id"
							type="button"
							class="venue-tab-btn"
							:class="{ active: activeFormTab === t.id }"
							@click="activeFormTab = t.id"
						>
							<span class="tab-icon">{{ t.icon }}</span>
							<span class="tab-label">{{ t.label }}</span>
							<span v-if="t.badge !== undefined" class="tab-badge">{{ t.badge }}</span>
						</button>
					</div>

					<!-- Form Content Pane -->
					<div class="form-scrollable-area">
						<!-- TAB 1: Основное & Контакты -->
						<div v-show="activeFormTab === 'basic'" class="tab-pane-wrapper">
							<!-- Card 1: Название и слаг -->
							<div class="editor-glass-card">
								<div class="card-head">
									<div class="card-head__icon">🏷️</div>
									<div class="card-head__text">
										<h3>Основная информация</h3>
										<p>Название площадки, URL-идентификатор (слаг) и краткое позиционирование</p>
									</div>
								</div>

								<el-form label-position="top">
									<el-form-item label="Название площадки *" required>
										<el-input
											v-model="form.title"
											placeholder="Например: Крыша Неглинная Руфтоп"
											size="large"
											@input="syncLivePreview"
										/>
									</el-form-item>

									<el-form-item label="Слаг (URL-идентификатор) *" required>
										<div class="slug-input-group">
											<div class="slug-prefix">/venues/</div>
											<el-input
												v-model="form.slug"
												placeholder="rooftop-neglinnaya"
												@input="syncLivePreview"
											/>
											<el-button
												type="primary"
												plain
												title="Сгенерировать слаг из названия"
												@click="generateSlugFromTitle"
											>
												⚡ Из названия
											</el-button>
										</div>
									</el-form-item>

									<el-form-item label="Подзаголовок / Краткое позиционирование">
										<el-input
											v-model="form.subtitle"
											type="textarea"
											:rows="2"
											placeholder="Стильная терраса на крыше особняка с панорамным видом на исторический центр Москвы"
											@input="syncLivePreview"
										/>
									</el-form-item>
								</el-form>
							</div>

							<!-- Card 2: Локация и метро -->
							<div class="editor-glass-card">
								<div class="card-head">
									<div class="card-head__icon">📍</div>
									<div class="card-head__text">
										<h3>Локация и транспортная доступность</h3>
										<p>Фактический адрес, метро и пешие ориентиры для гостей</p>
									</div>
								</div>

								<el-form label-position="top">
									<el-row :gutter="16">
										<el-col :span="16">
											<el-form-item label="Фактический адрес *" required>
												<el-input
													v-model="form.address"
													placeholder="г. Москва, ул. Неглинная, д. 14, стр. 1A"
													@input="syncLivePreview"
												/>
											</el-form-item>
										</el-col>
										<el-col :span="8">
											<el-form-item label="Город">
												<el-input
													v-model="form.city"
													placeholder="Москва"
													@input="syncLivePreview"
												/>
											</el-form-item>
										</el-col>
									</el-row>

									<el-row :gutter="16">
										<el-col :span="12">
											<el-form-item label="Ближайшее метро">
												<el-input
													v-model="form.metro_station"
													placeholder="Трубная"
													@input="syncLivePreview"
												>
													<template #prefix>🚇</template>
												</el-input>
											</el-form-item>
										</el-col>
										<el-col :span="12">
											<el-form-item label="Пешком от метро">
												<el-input
													v-model="form.metro_distance_text"
													placeholder="3 мин пешком"
													@input="syncLivePreview"
												>
													<template #prefix>🚶</template>
												</el-input>
											</el-form-item>
										</el-col>
									</el-row>
								</el-form>
							</div>

							<!-- Card 3: Контакты и публикация -->
							<div class="editor-glass-card">
								<div class="card-head">
									<div class="card-head__icon">📞</div>
									<div class="card-head__text">
										<h3>Контакты и статус публикации</h3>
										<p>Телефон менеджера и видимость площадки в каталоге</p>
									</div>
								</div>

								<el-form label-position="top">
									<el-row :gutter="16">
										<el-col :span="12">
											<el-form-item label="Контактный телефон">
												<el-input
													v-model="form.phone"
													placeholder="+7 (495) 123 78 90"
													@input="syncLivePreview"
												>
													<template #prefix>📞</template>
												</el-input>
											</el-form-item>
										</el-col>
										<el-col :span="12">
											<el-form-item label="Статус площадки">
												<el-select v-model="form.status" style="width: 100%">
													<el-option label="🟢 Опубликовано на сайте" value="published" />
													<el-option label="⚪ Черновик (скрыто)" value="draft" />
												</el-select>
											</el-form-item>
										</el-col>
									</el-row>
								</el-form>
							</div>

							<!-- Card 4: Режим работы -->
							<div class="editor-glass-card">
								<div class="card-head">
									<div class="card-head__icon">⏰</div>
									<div class="card-head__text">
										<h3>Режим работы</h3>
										<p>Часы приёма гостей в будни и выходные дни</p>
									</div>
								</div>

								<el-form label-position="top">
									<el-row :gutter="16">
										<el-col :span="12">
											<el-form-item label="Будние дни (Пн - Чт)">
												<el-input
													v-model="form.working_hours_weekdays"
													placeholder="Пн - Чт: с 12:00 до 22:00"
													@input="syncLivePreview"
												/>
											</el-form-item>
										</el-col>
										<el-col :span="12">
											<el-form-item label="Выходные и праздники (Пт - Вс)">
												<el-input
													v-model="form.working_hours_weekends"
													placeholder="Пт - Вс: с 10:00 до 24:00"
													@input="syncLivePreview"
												/>
											</el-form-item>
										</el-col>
									</el-row>
								</el-form>
							</div>

							<!-- Card 5: Рейтинг и отзывы -->
							<div class="editor-glass-card">
								<div class="card-head">
									<div class="card-head__icon">⭐</div>
									<div class="card-head__text">
										<h3>Рейтинг и репутация</h3>
										<p>Отображаемая оценка в каталоге и количество отзывов</p>
									</div>
								</div>

								<el-form label-position="top">
									<el-row :gutter="16">
										<el-col :span="12">
											<el-form-item label="Оценка рейтинга (0 - 5.0)">
												<div class="rating-input-row">
													<el-input-number
														v-model="form.rating_score"
														:min="1"
														:max="5"
														:step="0.1"
														controls-position="right"
														style="width: 140px"
														@change="syncLivePreview"
													/>
													<el-rate
														:model-value="form.rating_score"
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
													v-model="form.rating_reviews_count"
													:min="0"
													controls-position="right"
													style="width: 100%"
													@change="syncLivePreview"
												/>
											</el-form-item>
										</el-col>
									</el-row>
								</el-form>
							</div>
						</div>

						<!-- TAB 2: Залы & Номера -->
						<div v-show="activeFormTab === 'halls'" class="tab-pane-wrapper">
							<!-- Halls Card -->
							<div class="editor-glass-card">
								<div class="card-head">
									<div class="card-head__icon">🏰</div>
									<div class="card-head__text">
										<h3>Залы площадки</h3>
										<p>Вместимость банкетом, фуршетом, рассадкой театр и площадь каждого зала</p>
									</div>
									<el-button size="small" type="primary" :icon="Plus" @click="addHall">
										Добавить зал
									</el-button>
								</div>

								<el-table :data="formHalls" border class="styled-content-table" style="width: 100%">
									<el-table-column label="Название зала" min-width="150">
										<template #default="{ row }">
											<el-input v-model="row.name" placeholder="Атриум" @input="syncLivePreview" />
										</template>
									</el-table-column>
									<el-table-column label="Площадь м²" width="105">
										<template #default="{ row }">
											<el-input-number v-model="row.areaSqm" :min="1" controls-position="right" style="width: 100%" @change="syncLivePreview" />
										</template>
									</el-table-column>
									<el-table-column label="Банкет" width="95">
										<template #default="{ row }">
											<el-input-number v-model="row.capacityBanquet" :min="0" controls-position="right" style="width: 100%" @change="syncLivePreview" />
										</template>
									</el-table-column>
									<el-table-column label="Фуршет" width="95">
										<template #default="{ row }">
											<el-input-number v-model="row.capacityBuffet" :min="0" controls-position="right" style="width: 100%" @change="syncLivePreview" />
										</template>
									</el-table-column>
									<el-table-column label="Театр" width="95">
										<template #default="{ row }">
											<el-input-number v-model="row.capacityTheater" :min="0" controls-position="right" style="width: 100%" @change="syncLivePreview" />
										</template>
									</el-table-column>
									<el-table-column label="Особенности" min-width="140">
										<template #default="{ row }">
											<el-input v-model="row.extraDetails" placeholder="Панорамные окна" @input="syncLivePreview" />
										</template>
									</el-table-column>
									<el-table-column label="" width="50" align="center">
										<template #default="{ $index }">
											<el-button type="danger" link @click="removeHall($index)">✕</el-button>
										</template>
									</el-table-column>
								</el-table>
							</div>

							<!-- Rooms Card -->
							<div class="editor-glass-card">
								<div class="card-head">
									<div class="card-head__icon">🛏️</div>
									<div class="card-head__text">
										<h3>Номерной фонд отеля</h3>
										<p>Категории номеров, тип размещения и стоимость проживания гостей</p>
									</div>
									<el-button size="small" type="primary" :icon="Plus" @click="addRoom">
										Добавить номер
									</el-button>
								</div>

								<el-table :data="formRooms" border class="styled-content-table" style="width: 100%">
									<el-table-column label="Тип номера" min-width="160">
										<template #default="{ row }">
											<el-input v-model="row.roomType" placeholder="Одноместный стандарт" @input="syncLivePreview" />
										</template>
									</el-table-column>
									<el-table-column label="Размещение" width="130">
										<template #default="{ row }">
											<el-input v-model="row.placement" placeholder="Одноместное" @input="syncLivePreview" />
										</template>
									</el-table-column>
									<el-table-column label="Цена (руб)" width="130">
										<template #default="{ row }">
											<el-input-number v-model="row.priceRub" :min="0" :step="500" controls-position="right" style="width: 100%" @change="syncLivePreview" />
										</template>
									</el-table-column>
									<el-table-column label="Дополнительно" min-width="160">
										<template #default="{ row }">
											<el-input v-model="row.extraInfo" placeholder="Доп. место + 1000 р." @input="syncLivePreview" />
										</template>
									</el-table-column>
									<el-table-column label="" width="50" align="center">
										<template #default="{ $index }">
											<el-button type="danger" link @click="removeRoom($index)">✕</el-button>
										</template>
									</el-table-column>
								</el-table>
							</div>
						</div>

						<!-- TAB 3: Цены & Аренда -->
						<div v-show="activeFormTab === 'pricing'" class="tab-pane-wrapper">
							<!-- Card 1: Основные цены -->
							<div class="editor-glass-card">
								<div class="card-head">
									<div class="card-head__icon">💰</div>
									<div class="card-head__text">
										<h3>Основные тарифы площадки</h3>
										<p>Средний чек, банкетное меню и стоимость аренды в час</p>
									</div>
								</div>

								<el-form label-position="top">
									<el-row :gutter="16">
										<el-col :span="8">
											<el-form-item label="Средний чек (руб)">
												<el-input-number v-model="form.average_check" :min="0" :step="100" style="width: 100%" @change="syncLivePreview" />
											</el-form-item>
										</el-col>
										<el-col :span="8">
											<el-form-item label="Банкетное меню от (руб)">
												<el-input-number v-model="form.banquet_price_from" :min="0" :step="100" style="width: 100%" @change="syncLivePreview" />
											</el-form-item>
										</el-col>
										<el-col :span="8">
											<el-form-item label="Аренда от (руб/час)">
												<el-input-number v-model="form.rent_price_hour" :min="0" :step="100" style="width: 100%" @change="syncLivePreview" />
											</el-form-item>
										</el-col>
									</el-row>
								</el-form>
							</div>

							<!-- Card 2: Депозиты -->
							<div class="editor-glass-card">
								<div class="card-head">
									<div class="card-head__icon">🏦</div>
									<div class="card-head__text">
										<h3>Депозиты закрытия залов</h3>
										<p>Минимальная стоимость закрытия площадки под мероприятие</p>
									</div>
								</div>

								<el-form label-position="top">
									<el-row :gutter="16">
										<el-col :span="8">
											<el-form-item label="Депозит: Большой зал">
												<el-input v-model="depositLarge" placeholder="200 000 р." @input="syncLivePreview" />
											</el-form-item>
										</el-col>
										<el-col :span="8">
											<el-form-item label="Депозит: Малый зал">
												<el-input v-model="depositSmall" placeholder="120 000 р." @input="syncLivePreview" />
											</el-form-item>
										</el-col>
										<el-col :span="8">
											<el-form-item label="Депозит: Вся площадка">
												<el-input v-model="depositAll" placeholder="300 000 р." @input="syncLivePreview" />
											</el-form-item>
										</el-col>
									</el-row>

									<el-row :gutter="16">
										<el-col :span="12">
											<el-form-item label="Что входит в депозит">
												<el-input v-model="depositIncludes" placeholder="Еда, часть напитков" @input="syncLivePreview" />
											</el-form-item>
										</el-col>
										<el-col :span="12">
											<el-form-item label="Алкоголь площадки">
												<el-input v-model="alcoholAllowed" placeholder="да" @input="syncLivePreview" />
											</el-form-item>
										</el-col>
									</el-row>

									<el-row :gutter="16">
										<el-col :span="8">
											<el-form-item label="Пробковый сбор">
												<el-switch v-model="form.corkage_fee_has" active-text="Есть" inactive-text="Нет" @change="syncLivePreview" />
											</el-form-item>
										</el-col>
										<el-col :span="16">
											<el-form-item label="Условия пробкового сбора">
												<el-input v-model="form.corkage_fee_desc" placeholder="есть / от 300 р. за бутылку" @input="syncLivePreview" />
											</el-form-item>
										</el-col>
									</el-row>
								</el-form>
							</div>

							<!-- Card 3: Файлы & Документы -->
							<div class="editor-glass-card">
								<div class="card-head">
									<div class="card-head__icon">📄</div>
									<div class="card-head__text">
										<h3>Документы и файлы меню</h3>
										<p>Ссылки на PDF меню, технический райдер и особые примечания</p>
									</div>
								</div>

								<el-form label-position="top">
									<el-row :gutter="16">
										<el-col :span="12">
											<el-form-item label="URL файла банкетного меню (PDF)">
												<el-input v-model="form.menu_url" placeholder="https://example.com/menu.pdf" @input="syncLivePreview" />
											</el-form-item>
										</el-col>
										<el-col :span="12">
											<el-form-item label="URL технического райдера (PDF)">
												<el-input v-model="form.rider_url" placeholder="https://example.com/rider.pdf" @input="syncLivePreview" />
											</el-form-item>
										</el-col>
									</el-row>

									<el-form-item label="Примечания по ценам и условиям бронирования">
										<el-input
											v-model="pricingNotesString"
											type="textarea"
											:rows="3"
											placeholder="Условия сезонности, залоги и предоплата..."
											@input="syncLivePreview"
										/>
									</el-form-item>
								</el-form>
							</div>
						</div>

						<!-- TAB 4: Меню -->
						<div v-show="activeFormTab === 'menu'" class="tab-pane-wrapper">
							<div class="editor-glass-card">
								<div class="card-head">
									<div class="card-head__icon">🍽️</div>
									<div class="card-head__text">
										<h3>Фотогалерея блюд и банкетов</h3>
										<p>Фотографии авторских блюд для вкладки «Меню» на лендинге</p>
									</div>
								</div>

								<div class="add-photo-bar">
									<el-input
										v-model="newMenuPhotoUrl"
										placeholder="Вставьте прямую ссылку на фото блюда (https://...)"
										style="flex: 1"
										clearable
									/>
									<el-button type="primary" :icon="Plus" @click="addMenuPhoto">
										Добавить
									</el-button>
									<el-button plain @click="addPresetMenuPhotos">
										✨ Демо-блюда
									</el-button>
								</div>

								<div class="photos-grid">
									<div
										v-for="(photo, index) in formMenuPhotos"
										:key="index"
										class="photo-card"
									>
										<img :src="photo" alt="Блюдо" class="photo-card__img" />
										<div class="photo-card__badge">#{{ index + 1 }}</div>
										<button
											type="button"
											class="photo-card__del"
											title="Удалить фото"
											@click="removeMenuPhoto(index)"
										>
											✕
										</button>
									</div>
								</div>
								<div v-if="!formMenuPhotos.length" class="empty-list-notice">
									В меню пока нет фотографий. Введите URL выше или нажмите «✨ Демо-блюда».
								</div>
							</div>
						</div>

						<!-- TAB 5: Лента -->
						<div v-show="activeFormTab === 'feed'" class="tab-pane-wrapper">
							<div class="editor-glass-card">
								<div class="card-head">
									<div class="card-head__icon">📰</div>
									<div class="card-head__text">
										<h3>Публикации и новости площадки</h3>
										<p>Посты для интерактивной вкладки «Лента»</p>
									</div>
									<el-button size="small" type="primary" :icon="Plus" @click="addFeedItem">
										Добавить публикацию
									</el-button>
								</div>

								<div class="feed-items-list">
									<div
										v-for="(item, idx) in formFeed"
										:key="item.id"
										class="feed-item-card"
									>
										<div class="feed-item-top">
											<div class="feed-avatar-preview">
												<img :src="item.authorAvatar || defaultAvatar" alt="Аватар" />
											</div>
											<el-input v-model="item.author" placeholder="Автор публикации" style="flex: 1" @input="syncLivePreview" />
											<el-input v-model="item.publishedAgo" placeholder="Дата (4 дня назад)" style="width: 140px" @input="syncLivePreview" />
											<el-button type="danger" link @click="removeFeedItem(idx)">✕</el-button>
										</div>

										<el-input
											v-model="item.text"
											type="textarea"
											:rows="3"
											placeholder="Текст новости или анонса мероприятия..."
											style="margin-bottom: 10px"
											@input="syncLivePreview"
										/>

										<el-row :gutter="12">
											<el-col :span="12">
												<el-input v-model="item.imageUrl" placeholder="URL фото обложки" @input="syncLivePreview" />
											</el-col>
											<el-col :span="8">
												<el-input v-model="item.videoUrl" placeholder="URL видео (YouTube)" @input="syncLivePreview" />
											</el-col>
											<el-col :span="4">
												<el-input-number v-model="item.likesCount" :min="0" controls-position="right" style="width: 100%" placeholder="Лайки" @change="syncLivePreview" />
											</el-col>
										</el-row>
									</div>
								</div>
								<div v-if="!formFeed.length" class="empty-list-notice">
									Лента новостей пуста. Нажмите «Добавить публикацию».
								</div>
							</div>
						</div>

						<!-- TAB 6: Чат, Отзывы & FAQ -->
						<div v-show="activeFormTab === 'chat'" class="tab-pane-wrapper">
							<!-- Reviews Card -->
							<div class="editor-glass-card">
								<div class="card-head">
									<div class="card-head__icon">💬</div>
									<div class="card-head__text">
										<h3>Отзывы гостей площадки</h3>
										<p>Реальные отзывы гостей с оценкой и аватаром</p>
									</div>
									<el-button size="small" type="primary" :icon="Plus" @click="addReview">
										Добавить отзыв
									</el-button>
								</div>

								<div class="reviews-list">
									<div
										v-for="(rev, idx) in formReviews"
										:key="rev.id"
										class="review-item-card"
									>
										<div class="review-item-top">
											<div class="review-avatar-preview">
												<img :src="rev.avatar || defaultAvatar" alt="Аватар" />
											</div>
											<el-input v-model="rev.author" placeholder="Имя гостя" style="width: 160px" @input="syncLivePreview" />
											<el-input v-model="rev.date" placeholder="Дата (20.03.2024)" style="width: 130px" @input="syncLivePreview" />
											<el-rate v-model="rev.rating" :max="5" style="margin-left: 8px" @change="syncLivePreview" />
											<el-button type="danger" link style="margin-left: auto" @click="removeReview(idx)">✕</el-button>
										</div>
										<el-input
											v-model="rev.avatar"
											placeholder="URL аватара гостя"
											style="margin-bottom: 8px"
											@input="syncLivePreview"
										/>
										<el-input
											v-model="rev.text"
											type="textarea"
											:rows="2"
											placeholder="Текст отзыва..."
											@input="syncLivePreview"
										/>
									</div>
								</div>
								<div v-if="!formReviews.length" class="empty-list-notice">
									Нет отзывов. Нажмите «Добавить отзыв».
								</div>
							</div>

							<!-- FAQ Card -->
							<div class="editor-glass-card">
								<div class="card-head">
									<div class="card-head__icon">❓</div>
									<div class="card-head__text">
										<h3>Вопросы и ответы (FAQ)</h3>
										<p>Часто задаваемые вопросы по бронированию и сервису</p>
									</div>
									<el-button size="small" type="primary" :icon="Plus" @click="addFaq">
										Добавить вопрос
									</el-button>
								</div>

								<div class="faq-list">
									<div
										v-for="(item, idx) in formFaq"
										:key="item.id"
										class="faq-item-card"
									>
										<div class="faq-item-header">
											<el-input v-model="item.question" placeholder="Вопрос (Каков процент за обслуживание?)" style="flex: 1" @input="syncLivePreview" />
											<el-button type="danger" link @click="removeFaq(idx)">✕</el-button>
										</div>
										<el-input
											v-model="item.answer"
											type="textarea"
											:rows="2"
											placeholder="Подробный ответ..."
											@input="syncLivePreview"
										/>
									</div>
								</div>
								<div v-if="!formFaq.length" class="empty-list-notice">
									FAQ пуст. Нажмите «Добавить вопрос».
								</div>
							</div>
						</div>

						<!-- TAB 7: Особенности & Услуги -->
						<div v-show="activeFormTab === 'features'" class="tab-pane-wrapper">
							<div class="editor-glass-card">
								<div class="card-head">
									<div class="card-head__icon">🎯</div>
									<div class="card-head__text">
										<h3>Классификация и теги</h3>
										<p>Фильтры каталога, типы заведений и особенности</p>
									</div>
								</div>

								<el-form label-position="top">
									<el-form-item label="Типы площадки (через запятую)">
										<el-input v-model="typesString" placeholder="Банкетный зал, Загородный ресторан, Ресторан для Банкета" @input="syncLivePreview" />
									</el-form-item>

									<el-form-item label="Особенности (через запятую)">
										<el-input v-model="featuresString" placeholder="Летняя веранда, Парковая зона, удобный подъезд" @input="syncLivePreview" />
									</el-form-item>

									<el-form-item label="Кухня (через запятую)">
										<el-input v-model="cuisinesString" placeholder="Европейская, Русская, Авторская" @input="syncLivePreview" />
									</el-form-item>
								</el-form>
							</div>

							<div class="editor-glass-card">
								<div class="card-head">
									<div class="card-head__icon">⚙️</div>
									<div class="card-head__text">
										<h3>Оснащение, сервис и парковка</h3>
										<p>Техническое оборудование и сопутствующие услуги</p>
									</div>
								</div>

								<el-form label-position="top">
									<el-form-item label="Услуги">
										<el-input v-model="servicesString" placeholder="Wi-Fi, Бизнес-ланч, Банкеты, Номерной фонд, Детская комната" @input="syncLivePreview" />
									</el-form-item>

									<el-form-item label="Оборудование">
										<el-input v-model="equipmentString" placeholder="Свет, Звук, микрофон, колонки, проектор" @input="syncLivePreview" />
									</el-form-item>

									<el-form-item label="Парковка">
										<el-input v-model="form.parking" placeholder="на 5 А/М, охраняемая" @input="syncLivePreview" />
									</el-form-item>
								</el-form>
							</div>
						</div>

						<!-- TAB 8: Фотогалерея площадки -->
						<div v-show="activeFormTab === 'media'" class="tab-pane-wrapper">
							<div class="editor-glass-card">
								<div class="card-head">
									<div class="card-head__icon">🖼️</div>
									<div class="card-head__text">
										<h3>Фотогалерея и 3D-тур</h3>
										<p>Ссылки на изображения и видео-тур площадки</p>
									</div>
								</div>

								<el-form label-position="top">
									<el-form-item label="Фотографии площадки (URL по одному на строке)">
										<el-input
											v-model="photosString"
											type="textarea"
											:rows="6"
											placeholder="https://images.unsplash.com/photo-1519167758481...&#10;https://images.unsplash.com/photo-1464366400..."
											@input="syncLivePreview"
										/>
									</el-form-item>

									<el-form-item label="Ссылка на видео / 3D-тур (YouTube)">
										<el-input v-model="form.video_tour_url" placeholder="https://www.youtube.com/watch?v=..." @input="syncLivePreview" />
									</el-form-item>

									<el-form-item>
										<el-checkbox v-model="form.has_online_tour" @change="syncLivePreview">Доступен онлайн-показ площадки</el-checkbox>
									</el-form-item>
								</el-form>
							</div>
						</div>

						<!-- TAB 9: Полное описание -->
						<div v-show="activeFormTab === 'description'" class="tab-pane-wrapper">
							<div class="editor-glass-card">
								<div class="card-head">
									<div class="card-head__icon">📝</div>
									<div class="card-head__text">
										<h3>Подробное описание площадки</h3>
										<p>Основной текст о заведении для карточки и поисковых систем</p>
									</div>
								</div>

								<el-form label-position="top">
									<el-form-item label="Текст описания">
										<el-input
											v-model="form.description_html"
											type="textarea"
											:rows="10"
											placeholder="У Вас намечается банкет? Отлично! Приглашаем отметить ваше торжество..."
											@input="syncLivePreview"
										/>
									</el-form-item>
								</el-form>
							</div>
						</div>
					</div>

					<!-- Bottom Sticky Save & Mode Bar -->
					<div class="form-bottom-actions">
						<div class="bottom-sync-status">
							<span class="sync-dot"></span>
							<span class="sync-label">Live Preview синхронизирован</span>
						</div>

						<div class="bottom-buttons">
							<el-button plain @click="closeEditor">
								✕ Закрыть
							</el-button>
							<el-button
								type="primary"
								size="large"
								:loading="saving"
								@click="handleSave"
							>
								💾 Сохранить площадку
							</el-button>
						</div>
					</div>
				</div>

				<!-- RIGHT PANE: Interactive Live Preview Viewport (Split Mode) -->
				<div v-if="splitRatio !== 'full'" class="editor-preview-pane">
					<!-- Preview Header with Device Switcher & URL Bar -->
					<div class="preview-bar">
						<div class="preview-urlbar">
							<span class="urlbar-origin">Nuxt Client</span>
							<span class="urlbar-path">/venues/{{ form.slug || 'loft-forest-hall' }}</span>
							<button type="button" class="preview-refresh-btn" title="Обновить iframe" @click="reloadPreviewIframe">
								↻
							</button>
						</div>

						<div class="preview-devices">
							<button
								type="button"
								class="device-btn"
								:class="{ 'is-active': previewDevice === 'desktop' }"
								title="Desktop view"
								@click="previewDevice = 'desktop'"
							>
								🖥️ Desktop
							</button>
							<button
								type="button"
								class="device-btn"
								:class="{ 'is-active': previewDevice === 'tablet' }"
								title="Tablet view (768px)"
								@click="previewDevice = 'tablet'"
							>
								📱 Tablet
							</button>
							<button
								type="button"
								class="device-btn"
								:class="{ 'is-active': previewDevice === 'mobile' }"
								title="Mobile view (375px)"
								@click="previewDevice = 'mobile'"
							>
								📱 Mobile
							</button>
							<button
								type="button"
								class="device-btn"
								title="Открыть в новой вкладке"
								@click="openLanding(form.slug)"
							>
								↗ Вкладка
							</button>
						</div>
					</div>

					<!-- Iframe Container -->
					<div class="preview-viewport-wrapper" :class="`device-${previewDevice}`">
						<iframe
							ref="previewIframeRef"
							:src="previewIframeUrl"
							class="preview-iframe"
							@load="onIframeLoad"
						/>
					</div>
				</div>
			</div>
		
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import {
	venuesApi,
	type Venue,
	type CreateVenueDTO,
	type VenueHall,
	type VenueRoom,
	type VenueFaq,
	type VenueReview,
	type VenueFeedItem,
} from '#entities/venues/api'

const router = useRouter()

const loading = ref(false)
const saving = ref(false)
const venues = ref<Venue[]>([])
const searchQuery = ref('')
const statusFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const totalVenues = ref(0)

const isEditorOpen = ref(false)
const isEditing = ref(false)
const editingId = ref<string | null>(null)
const activeFormTab = ref('basic')
const isSplitPreview = ref(true)
const previewDevice = ref<'desktop' | 'tablet' | 'mobile'>('desktop')
const previewIframeRef = ref<HTMLIFrameElement | null>(null)

const clientBaseUrl = computed(() => (import.meta.env.VITE_CLIENT_URL || 'http://localhost:3000').replace(/\/$/, ''))

const previewIframeUrl = computed(() => {
	const slug = form.value.slug || 'loft-forest-hall'
	return `${clientBaseUrl.value}/venues/${slug}?preview=true`
})

const defaultAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'

const defaultForm: CreateVenueDTO = {
	title: '',
	slug: '',
	subtitle: '',
	description_html: '',
	phone: '',
	address: '',
	city: 'Москва',
	metro_station: '',
	metro_distance_text: '',
	average_check: 2500,
	banquet_price_from: 4000,
	rent_price_hour: 3000,
	corkage_fee_has: true,
	corkage_fee_desc: 'есть',
	price_level: '$$$',
	halls_count: 3,
	capacity_banquet: '20/40/60',
	capacity_buffet: '40/80/120',
	capacity_theater: '60/100/140',
	area_sqm: '50/100/120',
	working_hours_weekdays: 'Пн - Чт: с 12:00 до 22:00',
	working_hours_weekends: 'Пт - Вс: с 10:00 до 24:00',
	rating_score: 5.0,
	rating_reviews_count: 4,
	parking: 'на 5 А/М',
	video_tour_url: '',
	has_online_tour: true,
	status: 'published',
	menu_url: 'https://example.com/menu.pdf',
	rider_url: 'https://example.com/rider.pdf',
}

const form = ref<CreateVenueDTO>({ ...defaultForm })
const formHalls = ref<VenueHall[]>([])
const formRooms = ref<VenueRoom[]>([])
const formFaq = ref<VenueFaq[]>([])
const formReviews = ref<VenueReview[]>([])
const formFeed = ref<VenueFeedItem[]>([])
const formMenuPhotos = ref<string[]>([])
const newMenuPhotoUrl = ref('')

const depositLarge = ref('200 000 р.')
const depositSmall = ref('120 000 р.')
const depositAll = ref('300 000 р.')
const depositIncludes = ref('Еда, часть напитков')
const alcoholAllowed = ref('да')
const pricingNotesString = ref('Стоимость аренды может меняться в зависимости от сезона и дня недели.\nВ декабре действуют специальные праздничные тарифы на закрытие зала.\nБронирование даты подтверждается внесением задатка в размере 30%.')

const typesString = ref('')
const featuresString = ref('')
const cuisinesString = ref('')
const servicesString = ref('')
const equipmentString = ref('')
const photosString = ref('')

const getLandingUrl = (slug?: string) => {
	const s = slug || form.value.slug || 'loft-forest-hall'
	return `${clientBaseUrl.value}/venues/${s}`
}

const openLanding = (slug?: string) => {
	window.open(getLandingUrl(slug), '_blank')
}

const closeEditor = () => {
	isEditorOpen.value = false
}

const fetchVenuesList = async () => {
	loading.value = true
	try {
		const res = await venuesApi.getVenues({
			search: searchQuery.value?.trim() || undefined,
			status: statusFilter.value || undefined,
			page: currentPage.value,
			limit: pageSize.value,
		})
		const data = (res as any)?.data ?? res
		const items = Array.isArray(data) ? data : data?.items || []
		venues.value = items
		totalVenues.value = data?.pagination?.total ?? items.length
	} catch (e: any) {
		ElMessage.error(e.message || 'Ошибка загрузки списка площадок')
		venues.value = []
	} finally {
		loading.value = false
	}
}

const handlePageChange = (page: number) => {
	currentPage.value = page
	fetchVenuesList()
}

const handleSizeChange = (size: number) => {
	pageSize.value = size
	currentPage.value = 1
	fetchVenuesList()
}

const handleSearch = () => {
	currentPage.value = 1
	fetchVenuesList()
}

const getVenueThumb = (row: any) => {
	const photos = row.gallery_photos || row.galleryPhotos
	if (photos && photos.length > 0) {
		return photos[0]
	}
	return 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=200&q=80'
}

const formatPrice = (p?: number) => {
	if (!p) return '0'
	return new Intl.NumberFormat('ru-RU').format(p)
}

const openCreate = () => {
	isEditing.value = false
	editingId.value = null
	form.value = { ...defaultForm }
	formHalls.value = [
		{ id: '1', name: '1 Атриум', areaSqm: 50, capacityBanquet: 25, capacityBuffet: 40, capacityTheater: 40 },
		{ id: '2', name: '2 Сафари', areaSqm: 100, capacityBanquet: 50, capacityBuffet: 50, capacityTheater: 50 },
		{ id: '3', name: '3 Королевский', areaSqm: 200, capacityBanquet: 50, capacityBuffet: 50, capacityTheater: 50 },
	]
	formRooms.value = [
		{ id: '1', roomType: 'Одноместный', placement: 'Одноместное', priceRub: 2500 },
		{ id: '2', roomType: 'Двухместный', placement: 'Двухместное', priceRub: 5000 },
	]
	formFaq.value = [
		{ id: '1', question: 'Каков процент за обслуживание банкета?', answer: 'Сервисный сбор составляет 10% от суммы заказа.' },
		{ id: '2', question: 'Можно ли привезти свой алкоголь?', answer: 'Да, действует пробковый сбор.' }
	]
	formReviews.value = [
		{ id: '1', author: 'Юлия', date: '20.03.2022', rating: 5, text: 'Очень красивое и стильное место! Сервис на высшем уровне.', avatar: defaultAvatar }
	]
	formFeed.value = [
		{
			id: '1',
			author: 'Банкетный зал Форест Холл',
			authorAvatar: defaultAvatar,
			publishedAgo: '4 дня',
			text: 'Зимняя свадьба похожа на сказку. Приглашаем на просмотр!',
			imageUrl: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80',
			likesCount: 18,
		}
	]
	formMenuPhotos.value = [
		'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
		'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80',
		'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
	]
	depositLarge.value = '200 000 р.'
	depositSmall.value = '120 000 р.'
	depositAll.value = '300 000 р.'
	depositIncludes.value = 'Еда, часть напитков'
	alcoholAllowed.value = 'да'
	typesString.value = 'Банкетный зал, Загородный ресторан, Ресторан для Банкета, Ресторан при отеле, Бизнес-площадка'
	featuresString.value = 'Летняя веранда, Парковая зона, удобный подъезд'
	cuisinesString.value = 'Европейская, Русская'
	servicesString.value = 'Wi-Fi, Бизнес-ланч, Банкеты, Номерной фонд, Детская комната'
	equipmentString.value = 'Свет, Звук, микрофон, колонки, проектор'
	photosString.value = 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80'
	activeFormTab.value = 'basic'
	isEditorOpen.value = true
	setTimeout(reloadPreviewIframe, 150)
}

const openEdit = (row: any) => {
	isEditing.value = true
	editingId.value = row.id
	form.value = {
		title: row.title || '',
		slug: row.slug || '',
		subtitle: row.subtitle || '',
		description_html: row.description_html || row.descriptionHtml || '',
		phone: row.phone || '',
		address: row.address || '',
		city: row.city || 'Москва',
		metro_station: row.metro_station || row.metroStation || '',
		metro_distance_text: row.metro_distance_text || row.metroDistanceText || '',
		average_check: row.average_check ?? row.averageCheck ?? 2500,
		banquet_price_from: row.banquet_price_from ?? row.banquetPriceFrom ?? 4000,
		rent_price_hour: row.rent_price_hour ?? row.rentPriceHour ?? 3000,
		corkage_fee_has: row.corkage_fee_has ?? row.corkageFeeHas ?? true,
		corkage_fee_desc: row.corkage_fee_desc || row.corkageFeeDesc || 'есть',
		price_level: row.price_level || row.priceLevel || '$$$',
		halls_count: row.halls_count ?? row.hallsCount ?? 1,
		capacity_banquet: row.capacity_banquet || row.capacityBanquet || '',
		capacity_buffet: row.capacity_buffet || row.capacityBuffet || '',
		capacity_theater: row.capacity_theater || row.capacityTheater || '',
		area_sqm: row.area_sqm || row.areaSqm || '',
		working_hours_weekdays: row.working_hours_weekdays || row.workingHoursWeekdays || '',
		working_hours_weekends: row.working_hours_weekends || row.workingHoursWeekends || '',
		rating_score: row.rating_score ?? row.ratingScore ?? 5.0,
		rating_reviews_count: row.rating_reviews_count ?? row.ratingReviewsCount ?? 0,
		parking: row.parking || '',
		video_tour_url: row.video_tour_url || row.videoTourUrl || '',
		has_online_tour: row.has_online_tour ?? row.hasOnlineTour ?? true,
		status: row.status || 'published',
		menu_url: row.menu_url || row.menuUrl || 'https://example.com/menu-forest-hall.pdf',
		rider_url: row.rider_url || row.riderUrl || 'https://example.com/rider-forest-hall.pdf',
	}

	formHalls.value = Array.isArray(row.halls) ? [...(row.halls as VenueHall[])] : []
	formRooms.value = Array.isArray(row.rooms) ? [...(row.rooms as VenueRoom[])] : []
	formFaq.value = Array.isArray(row.faq) ? [...(row.faq as VenueFaq[])] : []
	formReviews.value = Array.isArray(row.reviews) ? JSON.parse(JSON.stringify(row.reviews)) : []
	formFeed.value = Array.isArray(row.feed) ? JSON.parse(JSON.stringify(row.feed)) : []
	formMenuPhotos.value = Array.isArray(row.menu_photos || row.menuPhotos) ? [...(row.menu_photos || row.menuPhotos)] : []

	// Parse pricing table
	const pt = row.pricing_table || row.pricingTable
	if (pt?.categories && Array.isArray(pt.categories)) {
		const depSplit = pt.categories.find((c: any) => c.type === 'split' || c.largeHall)
		if (depSplit) {
			depositLarge.value = depSplit.largeHall || '200 000 р.'
			depositSmall.value = depSplit.smallHall || '120 000 р.'
			depositAll.value = depSplit.allVenue || '300 000 р.'
		}
		const inc = pt.categories.find((c: any) => c.label?.includes('входит в депозит'))
		if (inc) depositIncludes.value = inc.value || 'Еда, часть напитков'
		const alc = pt.categories.find((c: any) => c.label?.includes('своего алкоголя'))
		if (alc) alcoholAllowed.value = alc.value || 'да'
	}
	if (pt?.notes && Array.isArray(pt.notes)) {
		pricingNotesString.value = pt.notes.join('\n')
	}

	const vTypes = row.venue_types || row.venueTypes || []
	const vFeatures = row.features || []
	const vCuisines = row.cuisines || []
	const vServices = row.services || []
	const vEquipment = row.equipment || []
	const vPhotos = row.gallery_photos || row.galleryPhotos || []
	typesString.value = vTypes.join(', ')
	featuresString.value = vFeatures.join(', ')
	cuisinesString.value = vCuisines.join(', ')
	servicesString.value = vServices.join(', ')
	equipmentString.value = vEquipment.join(', ')
	photosString.value = vPhotos.join('\n')

	activeFormTab.value = 'basic'
	isEditorOpen.value = true
	setTimeout(reloadPreviewIframe, 150)
}

// -------------------------------------------------------------
// Live Preview & Iframe Sync
// -------------------------------------------------------------
const reloadPreviewIframe = () => {
	if (previewIframeRef.value) {
		const targetUrl = previewIframeUrl.value
		previewIframeRef.value.src = 'about:blank'
		setTimeout(() => {
			if (previewIframeRef.value) {
				previewIframeRef.value.src = targetUrl
			}
		}, 80)
	}
}

const onIframeLoad = () => {
	syncLivePreview()
}

let syncTimeout: any = null
const syncLivePreview = () => {
	if (!isSplitPreview.value) return
	clearTimeout(syncTimeout)
	syncTimeout = setTimeout(() => {
		const iframe = previewIframeRef.value
		if (!iframe?.contentWindow) return

		const payload = {
			title: form.value.title,
			subtitle: form.value.subtitle,
			descriptionHtml: form.value.description_html,
			phone: form.value.phone,
			hallsCount: form.value.halls_count,
			location: {
				address: form.value.address,
				city: form.value.city,
				metro: form.value.metro_station ? {
					station: form.value.metro_station,
					distanceText: form.value.metro_distance_text || '5 мин пешком',
				} : undefined,
			},
			workingHours: {
				weekdays: form.value.working_hours_weekdays,
				weekends: form.value.working_hours_weekends,
			},
			pricing: {
				averageCheck: form.value.average_check,
				banquetMenuPriceFrom: form.value.banquet_price_from,
				rentPricePerHour: form.value.rent_price_hour,
				corkageFee: {
					hasFee: form.value.corkage_fee_has,
					description: form.value.corkage_fee_desc,
				},
				priceLevel: form.value.price_level,
			},
			capacitySummary: {
				banquet: form.value.capacity_banquet,
				buffet: form.value.capacity_buffet,
				theater: form.value.capacity_theater,
				areaSqm: form.value.area_sqm,
			},
			gallery: {
				mainPhoto: photosString.value.split('\n').map(s => s.trim()).filter(Boolean)[0] || '',
				photos: photosString.value.split('\n').map(s => s.trim()).filter(Boolean),
				videoTourUrl: form.value.video_tour_url,
				hasOnlineTour: form.value.has_online_tour,
			},
			details: {
				venueTypes: typesString.value.split(',').map(s => s.trim()).filter(Boolean),
				features: featuresString.value.split(',').map(s => s.trim()).filter(Boolean),
				cuisines: cuisinesString.value.split(',').map(s => s.trim()).filter(Boolean),
				services: servicesString.value.split(',').map(s => s.trim()).filter(Boolean),
				equipment: equipmentString.value.split(',').map(s => s.trim()).filter(Boolean),
				parking: form.value.parking,
				halls: formHalls.value,
				rooms: formRooms.value,
			},
			faq: formFaq.value,
			feed: formFeed.value,
			reviews: formReviews.value,
			menuPhotos: formMenuPhotos.value,
			menuUrl: form.value.menu_url,
			riderUrl: form.value.rider_url,
		}

		iframe.contentWindow.postMessage({
			type: 'VENUE_PREVIEW_DATA',
			payload,
		}, '*')
	}, 120)
}

// -------------------------------------------------------------
// Form Sub-entity Handlers
// -------------------------------------------------------------
const addHall = () => {
	formHalls.value.push({
		id: Date.now().toString(),
		name: `Зал ${formHalls.value.length + 1}`,
		areaSqm: 60,
		capacityBanquet: 30,
		capacityBuffet: 50,
		capacityTheater: 50,
	})
	syncLivePreview()
}
const removeHall = (index: number) => {
	formHalls.value.splice(index, 1)
	syncLivePreview()
}

const addRoom = () => {
	formRooms.value.push({
		id: Date.now().toString(),
		roomType: 'Стандарт',
		placement: 'Двухместное',
		priceRub: 3500,
	})
	syncLivePreview()
}
const removeRoom = (index: number) => {
	formRooms.value.splice(index, 1)
	syncLivePreview()
}

const addFaq = () => {
	formFaq.value.push({
		id: Date.now().toString(),
		question: '',
		answer: '',
	})
	syncLivePreview()
}
const removeFaq = (index: number) => {
	formFaq.value.splice(index, 1)
	syncLivePreview()
}

const addReview = () => {
	formReviews.value.push({
		id: Date.now().toString(),
		author: 'Новый отзыв',
		avatar: defaultAvatar,
		date: 'Сегодня',
		rating: 5,
		text: 'Прекрасная площадка, великолепный сервис!',
	})
	syncLivePreview()
}
const removeReview = (index: number) => {
	formReviews.value.splice(index, 1)
	syncLivePreview()
}

const addFeedItem = () => {
	formFeed.value.push({
		id: Date.now().toString(),
		author: form.value.title || 'Банкетный зал Форест Холл',
		authorAvatar: defaultAvatar,
		publishedAgo: 'Только что',
		text: 'Новое специальное предложение для свадеб и юбилеев!',
		imageUrl: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80',
		likesCount: 0,
	})
	syncLivePreview()
}
const removeFeedItem = (index: number) => {
	formFeed.value.splice(index, 1)
	syncLivePreview()
}

const addMenuPhoto = () => {
	if (!newMenuPhotoUrl.value.trim()) return
	formMenuPhotos.value.push(newMenuPhotoUrl.value.trim())
	newMenuPhotoUrl.value = ''
	syncLivePreview()
}
const removeMenuPhoto = (index: number) => {
	formMenuPhotos.value.splice(index, 1)
	syncLivePreview()
}
const addPresetMenuPhotos = () => {
	const presets = [
		'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
		'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80',
		'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
		'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80',
		'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=600&q=80',
	]
	presets.forEach((p) => {
		if (!formMenuPhotos.value.includes(p)) {
			formMenuPhotos.value.push(p)
		}
	})
	syncLivePreview()
}

// -------------------------------------------------------------
// Save Handler
// -------------------------------------------------------------
const handleSave = async () => {
	if (!form.value.title || !form.value.slug || !form.value.address) {
		ElMessage.warning('Заполните обязательные поля: Название, Слаг и Адрес')
		return
	}

	const pricingTableData = {
		categories: [
			{ label: 'Средний чек', value: `${formatPrice(form.value.average_check)} р.`, type: 'merged' },
			{ label: 'Стоимость банкетного меню от:', value: `${formatPrice(form.value.banquet_price_from)} р.`, type: 'merged' },
			{ label: 'Аренда / час. от:', value: `${formatPrice(form.value.rent_price_hour)} р.`, type: 'merged' },
			{
				label: 'Депозит (минимальная стоимость закрытия):',
				largeHall: depositLarge.value || '200 000 р.',
				smallHall: depositSmall.value || '120 000 р.',
				allVenue: depositAll.value || '300 000 р.',
				type: 'split',
			},
			{ label: 'Что входит в депозит:', value: depositIncludes.value || 'Еда, часть напитков', type: 'merged' },
			{ label: 'Возможность своего алкоголя:', value: alcoholAllowed.value || 'да', type: 'merged' },
			{ label: 'Пробковый сбор:', value: form.value.corkage_fee_desc || (form.value.corkage_fee_has ? 'есть' : 'нет'), type: 'merged' },
		],
		notes: pricingNotesString.value.split('\n').map((s) => s.trim()).filter(Boolean),
	}

	const payload: CreateVenueDTO = {
		...form.value,
		halls: formHalls.value as any,
		rooms: formRooms.value as any,
		faq: formFaq.value as any,
		reviews: formReviews.value as any,
		feed: formFeed.value as any,
		menu_photos: formMenuPhotos.value,
		pricing_table: pricingTableData as any,
		venue_types: typesString.value.split(',').map((s) => s.trim()).filter(Boolean),
		features: featuresString.value.split(',').map((s) => s.trim()).filter(Boolean),
		cuisines: cuisinesString.value.split(',').map((s) => s.trim()).filter(Boolean),
		services: servicesString.value.split(',').map((s) => s.trim()).filter(Boolean),
		equipment: equipmentString.value.split(',').map((s) => s.trim()).filter(Boolean),
		gallery_photos: photosString.value.split('\n').map((s) => s.trim()).filter(Boolean),
	}

	saving.value = true
	try {
		if (isEditing.value && editingId.value) {
			await venuesApi.updateVenue(editingId.value, payload)
			ElMessage.success('Площадка успешно обновлена')
		} else {
			await venuesApi.createVenue(payload)
			ElMessage.success('Площадка успешно создана')
		}
		reloadPreviewIframe()
		fetchVenuesList()
	} catch (e: any) {
		ElMessage.error(e.message || 'Ошибка сохранения площадки')
	} finally {
		saving.value = false
	}
}

const handleDelete = async (row: Venue) => {
	try {
		await venuesApi.deleteVenue(row.id)
		ElMessage.success(`Площадка "${row.title}" удалена`)
		fetchVenuesList()
	} catch (e: any) {
		ElMessage.error(e.message || 'Ошибка при удалении')
	}
}

onMounted(() => {
	fetchVenuesList()
})
</script>

<style scoped lang="scss">
.venues-page {
	width: 100%;
	min-height: 100%;
}

.venues-list-view {
	padding: 24px 32px;
	display: flex;
	flex-direction: column;
	gap: 20px;
}

.page-header {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;

	&__left {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	&__actions {
		display: flex;
		gap: 10px;
		align-items: center;
	}
}

.header-title-row {
	display: flex;
	align-items: center;
	gap: 12px;

	h1 {
		margin: 0;
		font-size: 24px;
		font-weight: 700;
		color: var(--text-primary);
	}
}

.page-subtitle {
	margin: 0;
	font-size: 14px;
	color: var(--text-muted);
}

.filter-card {
	border-radius: 12px;
	background: var(--bg-card);
	border: 1px solid var(--border-color);
	backdrop-filter: blur(8px);
}

.filter-row {
	display: flex;
	align-items: center;
	gap: 16px;
}

.filter-stats {
	margin-left: auto;
	font-size: 14px;
	color: var(--text-muted);
}

.table-card {
	border-radius: 12px;
	background: var(--bg-card);
	border: 1px solid var(--border-color);
	backdrop-filter: blur(8px);
	overflow: hidden;
}

:deep(.el-card) {
	background-color: var(--bg-card);
	border-color: var(--border-color);
	color: var(--text-primary);
}

:deep(.el-table) {
	--el-table-header-bg-color: var(--bg-surface);
	--el-table-row-hover-bg-color: rgba(255, 255, 255, 0.05);
	--el-table-border-color: var(--border-color);
	--el-table-bg-color: transparent;
	--el-table-tr-bg-color: transparent;
	--el-table-text-color: var(--text-primary);
	--el-table-header-text-color: var(--text-muted);

	color: var(--text-primary);
	background-color: transparent !important;
}

:deep(.el-table th.el-table__cell) {
	background-color: var(--bg-surface) !important;
	border-bottom: 1px solid var(--border-color) !important;
	color: var(--text-muted) !important;
}

:deep(.el-table td.el-table__cell) {
	border-bottom: 1px solid var(--border-color) !important;
}

:deep(.el-table tr) {
	background-color: transparent !important;
}

:deep(.el-table--striped .el-table__body tr.el-table__row--striped td.el-table__cell) {
	background-color: rgba(255, 255, 255, 0.02) !important;
}

.venue-thumb-wrap {
	width: 68px;
	height: 52px;
	border-radius: 8px;
	overflow: hidden;
	background: var(--bg-surface);
	border: 1px solid var(--border-color);
}

.venue-thumb {
	width: 100%;
	height: 100%;
	object-fit: cover;
	display: block;
}

.venue-title-cell {
	display: flex;
	flex-direction: column;
	gap: 6px;
}

.venue-title-link {
	font-size: 14px;
	color: var(--text-primary);
	text-decoration: none;
	display: inline-flex;
	align-items: center;
	gap: 4px;
	transition: color 0.15s;

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
	align-items: center;
	gap: 8px;
}

.landing-pill-btn {
	display: inline-flex;
	align-items: center;
	gap: 4px;
	font-size: 11px;
	color: #10b981;
	text-decoration: none;
	width: fit-content;
	padding: 2px 8px;
	background: rgba(16, 185, 129, 0.1);
	border-radius: 4px;
	border: 1px solid rgba(16, 185, 129, 0.2);

	&:hover {
		background: rgba(16, 185, 129, 0.2);
	}
}

.venue-phone-text {
	font-size: 12px;
	color: var(--text-muted);
}

.venue-loc-cell {
	display: flex;
	flex-direction: column;
	gap: 4px;
	font-size: 13px;
}

.venue-address-text {
	color: var(--text-primary);
}

.venue-metro-text {
	color: var(--text-muted);
	font-size: 12px;
}

.venue-prices-cell {
	display: flex;
	flex-direction: column;
	gap: 2px;
	font-size: 12px;
	color: var(--text-muted);
}

.venue-tabs-badges {
	display: flex;
	flex-wrap: wrap;
	gap: 4px;
}

.actions-group {
	display: flex;
	gap: 6px;
	justify-content: flex-end;
}

/* ========================================================================= */
/* In-Page Full Live Split Editor Styles                                     */
/* ========================================================================= */
.venues-live-editor-view {
	display: flex;
	flex-direction: column;
	width: 100%;
	height: calc(100vh - 60px);
	background: var(--gp-bg-main, #0b1120);
	overflow: hidden;
}

.editor-topbar {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 12px 24px;
	background: var(--bg-surface, #1e293b);
	border-bottom: 1px solid var(--border-color);
	flex-shrink: 0;
	z-index: 10;

	&__left {
		display: flex;
		align-items: center;
		gap: 14px;
	}

	&__right {
		display: flex;
		align-items: center;
		gap: 10px;
	}
}

.live-pill {
	background: linear-gradient(135deg, #0ea5e9, #6366f1);
	color: #fff;
	font-size: 11px;
	font-weight: 700;
	padding: 4px 10px;
	border-radius: 6px;
	text-transform: uppercase;
	letter-spacing: 0.5px;
}

.editor-title {
	margin: 0;
	font-size: 17px;
	font-weight: 600;
	color: var(--text-primary, #fff);
	max-width: 320px;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.editor-slug-link {
	font-size: 12px;
	color: var(--accent-primary, #38bdf8);
	text-decoration: none;
	opacity: 0.85;

	&:hover {
		opacity: 1;
		text-decoration: underline;
	}
}

.editor-content-container {
	display: flex;
	width: 100%;
	flex: 1;
	overflow: hidden;

	&.is-split {
		.editor-form-pane {
			width: 50%;
			border-right: 1px solid var(--border-color);
		}
		.editor-preview-pane {
			width: 50%;
			display: flex;
			flex-direction: column;
		}
	}
}

.editor-form-pane {
	width: 100%;
	height: 100%;
	overflow-y: auto;
	padding: 24px 32px 100px;
	background: var(--gp-bg-main, #0b1120);
	position: relative;
}

.form-bottom-actions {
	position: sticky;
	bottom: -100px;
	margin: 32px -32px -100px;
	padding: 16px 32px;
	background: rgba(15, 23, 42, 0.95);
	backdrop-filter: blur(12px);
	border-top: 1px solid var(--border-color);
	display: flex;
	align-items: center;
	justify-content: flex-end;
	gap: 12px;
	z-index: 20;
}

.venue-form-tabs {
	:deep(.el-tabs__header) {
		margin-bottom: 20px;
		border-bottom: 1px solid var(--border-color);
	}

	:deep(.el-tabs__item) {
		color: var(--text-muted);
		font-weight: 500;
		font-size: 13px;

		&.is-active {
			color: var(--accent-primary, #38bdf8);
			font-weight: 600;
		}
	}

	:deep(.el-form-item__label) {
		color: var(--text-primary);
		font-size: 13px;
		font-weight: 500;
	}
}

.section-notice {
	background: rgba(56, 189, 248, 0.08);
	border: 1px solid rgba(56, 189, 248, 0.2);
	color: var(--text-primary);
	padding: 10px 14px;
	border-radius: 8px;
	font-size: 13px;
	margin-bottom: 16px;
}

.sub-heading {
	margin: 20px 0 12px;
	font-size: 14px;
	font-weight: 600;
	color: var(--text-primary);
}

.tab-section-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 12px;
}

.tab-subtitle {
	font-size: 14px;
	font-weight: 600;
	color: var(--text-primary);
}

/* Menu Tab Photo Grid */
.add-photo-bar {
	display: flex;
	gap: 10px;
	margin-bottom: 16px;
}

.photos-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
	gap: 12px;
	margin-top: 12px;
}

.photo-card {
	position: relative;
	border-radius: 8px;
	overflow: hidden;
	height: 100px;
	border: 1px solid var(--border-color);
	background: var(--bg-surface);

	&__img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	&__badge {
		position: absolute;
		bottom: 4px;
		left: 4px;
		background: rgba(0, 0, 0, 0.65);
		color: #fff;
		font-size: 10px;
		padding: 2px 6px;
		border-radius: 4px;
	}

	&__del {
		position: absolute;
		top: 4px;
		right: 4px;
		background: rgba(239, 68, 68, 0.85);
		color: #fff;
		border: none;
		border-radius: 50%;
		width: 22px;
		height: 22px;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 11px;
		transition: background 0.15s;

		&:hover {
			background: #dc2626;
		}
	}
}

/* Feed Tab Cards */
.feed-items-list {
	display: flex;
	flex-direction: column;
	gap: 14px;
}

.feed-item-card {
	background: var(--bg-surface);
	border: 1px solid var(--border-color);
	border-radius: 8px;
	padding: 14px;
}

.feed-item-top {
	display: flex;
	align-items: center;
	gap: 10px;
	margin-bottom: 10px;
}

.feed-avatar-preview,
.review-avatar-preview {
	width: 36px;
	height: 36px;
	border-radius: 50%;
	overflow: hidden;
	flex-shrink: 0;
	background: #334155;

	img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
}

/* Reviews Tab */
.reviews-list {
	display: flex;
	flex-direction: column;
	gap: 12px;
}

.review-item-card {
	background: var(--bg-surface);
	border: 1px solid var(--border-color);
	border-radius: 8px;
	padding: 14px;
}

.review-item-top {
	display: flex;
	align-items: center;
	gap: 10px;
	margin-bottom: 10px;
}

.faq-list {
	display: flex;
	flex-direction: column;
	gap: 10px;
}

.faq-item-card {
	background: var(--bg-surface);
	border: 1px solid var(--border-color);
	border-radius: 8px;
	padding: 12px;
}

.faq-item-header {
	display: flex;
	align-items: center;
	gap: 8px;
	margin-bottom: 8px;
}

.empty-list-notice {
	padding: 24px;
	text-align: center;
	color: var(--text-muted);
	font-size: 13px;
	background: var(--bg-surface);
	border: 1px dashed var(--border-color);
	border-radius: 8px;
}

/* ========================================================================= */
/* Live Preview Viewport (Right Pane)                                        */
/* ========================================================================= */
.editor-preview-pane {
	background: #030712;
	height: 100%;
	display: flex;
	flex-direction: column;
}

.preview-bar {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 8px 14px;
	background: #0f172a;
	border-bottom: 1px solid var(--border-color);
	gap: 12px;
	flex-shrink: 0;
}

.preview-urlbar {
	display: flex;
	align-items: center;
	gap: 8px;
	background: rgba(255, 255, 255, 0.05);
	border: 1px solid rgba(255, 255, 255, 0.1);
	padding: 4px 10px;
	border-radius: 6px;
	font-size: 12px;
	flex: 1;
	overflow: hidden;
}

.urlbar-origin {
	color: #10b981;
	font-weight: 600;
	font-size: 11px;
}

.urlbar-path {
	color: var(--text-primary);
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.preview-refresh-btn {
	background: transparent;
	border: none;
	color: var(--text-muted);
	cursor: pointer;
	font-size: 14px;
	padding: 0 4px;
	margin-left: auto;

	&:hover {
		color: #fff;
	}
}

.preview-devices {
	display: flex;
	align-items: center;
	gap: 4px;
}

.device-btn {
	background: transparent;
	border: 1px solid transparent;
	color: var(--text-muted);
	padding: 4px 8px;
	border-radius: 5px;
	font-size: 11px;
	cursor: pointer;
	transition: all 0.15s;

	&:hover {
		color: #fff;
		background: rgba(255, 255, 255, 0.06);
	}

	&.is-active {
		background: var(--accent-primary, #38bdf8);
		color: #0f172a;
		font-weight: 600;
	}
}

.preview-viewport-wrapper {
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: center;
	overflow: hidden;
	background: #020617;
	position: relative;

	&.device-desktop {
		.preview-iframe {
			width: 100%;
			height: 100%;
			border: none;
		}
	}

	&.device-tablet {
		padding: 20px;
		.preview-iframe {
			width: 768px;
			max-width: 100%;
			height: 100%;
			border-radius: 12px;
			border: 4px solid #334155;
			box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
		}
	}

	&.device-mobile {
		padding: 20px;
		.preview-iframe {
			width: 375px;
			max-width: 100%;
			height: 100%;
			border-radius: 20px;
			border: 6px solid #334155;
			box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
		}
	}
}

.preview-iframe {
	background: #fff;
	border: none;
	width: 100%;
	height: 100%;
}

/* ========================================================================= */
/* Modern Redesigned Venue Live Editor Styles                               */
/* ========================================================================= */
.editor-slug-chip {
	font-size: 12px;
	color: var(--accent-primary, #38bdf8);
	background: rgba(56, 189, 248, 0.1);
	border: 1px solid rgba(56, 189, 248, 0.25);
	padding: 3px 8px;
	border-radius: 6px;
	text-decoration: none;
	transition: all 0.15s;

	&:hover {
		background: rgba(56, 189, 248, 0.2);
		text-decoration: none;
	}
}

.split-controls {
	display: flex;
	background: rgba(0, 0, 0, 0.3);
	padding: 2px;
	border-radius: 8px;
	border: 1px solid var(--gp-glass-border, rgba(255, 255, 255, 0.08));
}

.split-btn {
	background: transparent;
	border: none;
	color: var(--gp-text-secondary, #94a3b8);
	font-size: 12px;
	font-weight: 500;
	padding: 4px 10px;
	border-radius: 6px;
	cursor: pointer;
	transition: all 0.15s;

	&:hover {
		color: #fff;
	}

	&.active {
		background: var(--gp-primary, #42b883);
		color: #fff;
		font-weight: 600;
	}
}

.editor-content-container {
	display: flex;
	width: 100%;
	flex: 1;
	overflow: hidden;

	&.split-50-50 {
		.editor-form-pane {
			width: 50%;
			border-right: 1px solid var(--border-color);
		}
		.editor-preview-pane {
			width: 50%;
		}
	}

	&.split-60-40 {
		.editor-form-pane {
			width: 60%;
			border-right: 1px solid var(--border-color);
		}
		.editor-preview-pane {
			width: 40%;
		}
	}

	&.split-full {
		.editor-form-pane {
			width: 100%;
		}
		.editor-preview-pane {
			display: none;
		}
	}
}

.editor-form-pane {
	height: 100%;
	overflow: hidden;
	display: flex;
	flex-direction: column;
	background: var(--gp-bg-main, #0b1120);
	position: relative;
}

.form-scrollable-area {
	flex: 1;
	overflow-y: auto;
	padding: 20px 24px;
}

/* Modern Segmented Navigation */
.venue-tabs-nav {
	display: flex;
	flex-wrap: wrap;
	gap: 6px;
	padding: 12px 24px;
	background: var(--bg-surface, #1e293b);
	border-bottom: 1px solid var(--border-color);
	flex-shrink: 0;
}

.venue-tab-btn {
	display: inline-flex;
	align-items: center;
	gap: 6px;
	padding: 6px 12px;
	background: rgba(255, 255, 255, 0.04);
	border: 1px solid var(--gp-glass-border, rgba(255, 255, 255, 0.08));
	border-radius: 8px;
	color: var(--gp-text-secondary, #94a3b8);
	font-size: 12px;
	font-weight: 500;
	cursor: pointer;
	transition: all 0.15s;

	&:hover {
		color: #fff;
		background: rgba(255, 255, 255, 0.08);
	}

	&.active {
		background: rgba(66, 184, 131, 0.15);
		border-color: var(--gp-primary, #42b883);
		color: #fff;
		font-weight: 600;
		box-shadow: 0 0 12px rgba(66, 184, 131, 0.2);
	}
}

.tab-badge {
	background: rgba(0, 0, 0, 0.35);
	color: var(--gp-primary, #42b883);
	font-size: 10px;
	font-weight: 700;
	padding: 1px 5px;
	border-radius: 8px;
}

/* Glass Cards */
.editor-glass-card {
	background: var(--gp-bg-card, var(--gp-bg-surface, rgba(30, 41, 59, 0.5)));
	border: 1px solid var(--gp-glass-border, rgba(255, 255, 255, 0.08));
	border-radius: 12px;
	padding: 18px 20px;
	margin-bottom: 16px;
	backdrop-filter: blur(12px);
}

.card-head {
	display: flex;
	align-items: flex-start;
	gap: 10px;
	margin-bottom: 16px;
	padding-bottom: 12px;
	border-bottom: 1px solid var(--gp-glass-border, rgba(255, 255, 255, 0.06));

	&__icon {
		font-size: 20px;
		line-height: 1;
	}

	&__text {
		flex: 1;

		h3 {
			margin: 0;
			font-size: 15px;
			font-weight: 600;
			color: var(--gp-text-main, #fff);
		}

		p {
			margin: 3px 0 0;
			font-size: 12px;
			color: var(--gp-text-secondary, #94a3b8);
		}
	}
}

.slug-input-group {
	display: flex;
	align-items: center;
	gap: 8px;
	width: 100%;
}

.slug-prefix {
	font-size: 13px;
	color: var(--gp-text-secondary, #94a3b8);
	background: rgba(0, 0, 0, 0.25);
	padding: 6px 10px;
	border-radius: 6px;
	border: 1px solid var(--gp-glass-border, rgba(255, 255, 255, 0.08));
	user-select: none;
}

.rating-input-row {
	display: flex;
	align-items: center;
	gap: 12px;
}

.styled-content-table {
	border-radius: 8px;
	overflow: hidden;
	background: transparent !important;
}

/* Floating Bottom Actions */
.form-bottom-actions {
	position: sticky;
	bottom: 0;
	background: rgba(15, 23, 42, 0.95);
	backdrop-filter: blur(16px);
	border-top: 1px solid var(--border-color);
	padding: 12px 24px;
	display: flex;
	align-items: center;
	justify-content: space-between;
	z-index: 10;
	margin: 0;
}

.bottom-sync-status {
	display: flex;
	align-items: center;
	gap: 8px;
	font-size: 12px;
	color: var(--gp-text-secondary, #94a3b8);
}

.sync-dot {
	width: 8px;
	height: 8px;
	border-radius: 50%;
	background: #10b981;
	box-shadow: 0 0 8px #10b981;
}

.bottom-buttons {
	display: flex;
	align-items: center;
	gap: 10px;
}

</style>

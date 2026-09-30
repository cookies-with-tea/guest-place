<template>
	<div class="page-constructor" :class="{ 'is-previewing': isPreviewing }">
		<!-- Top Bar -->
		<header class="constructor-header">
			<div class="header-left">
				<el-button link @click="goBack">
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M19 12H5M12 19l-7-7 7-7" stroke-linecap="round" stroke-linejoin="round"/>
					</svg>
					Назад к списку
				</el-button>
				<div class="page-meta-inputs">
					<el-input
						v-model="pageForm.title"
						placeholder="Название страницы (например: О платформе)"
						class="title-input"
					/>
					<div class="slug-input-wrapper">
						<span class="slug-prefix">/p/</span>
						<el-input
							v-model="pageForm.slug"
							placeholder="slug"
							class="slug-input"
							@input="onSlugInput"
						/>
					</div>
				</div>
			</div>

			<div class="header-actions">
				<!-- Stage 2.1: Workflow Status Machine -->
				<div class="workflow-status-bar">
					<el-tag
						:type="pageForm.status === 'published' ? 'success' : pageForm.status === 'review' ? 'warning' : 'info'"
						size="large"
						effect="dark"
						class="status-tag"
					>
						<span v-if="pageForm.status === 'published'">● ОПУБЛИКОВАНО</span>
						<span v-else-if="pageForm.status === 'review'">● НА ПРОВЕРКЕ</span>
						<span v-else>● ЧЕРНОВИК</span>
					</el-tag>

					<el-dropdown trigger="click" @command="handleStatusTransition">
						<el-button size="default" plain>
							Статус: {{ getStatusLabel(pageForm.status) }} ▾
						</el-button>
						<template #dropdown>
							<el-dropdown-menu>
								<el-dropdown-item command="draft" :disabled="pageForm.status === 'draft'">
									📝 Черновик (Draft)
								</el-dropdown-item>
								<el-dropdown-item command="review" :disabled="pageForm.status === 'review'">
									🔍 На проверку (Review)
								</el-dropdown-item>
								<el-dropdown-item command="published" :disabled="pageForm.status === 'published'">
									🚀 Опубликовать (Publish)
								</el-dropdown-item>
							</el-dropdown-menu>
						</template>
					</el-dropdown>
				</div>

				<el-button
					:type="isPreviewing ? 'primary' : 'default'"
					@click="togglePreview"
				>
					<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px">
						<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
						<circle cx="12" cy="12" r="3"/>
					</svg>
					{{ isPreviewing ? 'Скрыть превью' : 'Live Preview' }}
				</el-button>

				<el-button
					plain
					title="Открыть страницу во фронтенде в новой вкладке"
					@click="openInNewTab"
				>
					<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px">
						<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
						<polyline points="15 3 21 3 21 9"></polyline>
						<line x1="10" y1="14" x2="21" y2="3"></line>
					</svg>
					На сайт
				</el-button>

				<el-button type="primary" :loading="saving" @click="handleSave">
					Сохранить страницу
				</el-button>
			</div>
		</header>

		<!-- Main Workspace: 3 Columns -->
		<div class="constructor-body">
			<!-- 1. LEFT COLUMN: Block Palette & Presets (Stage 2.4) -->
			<aside class="palette-panel">
				<!-- Palette Tabs: Blocks vs Presets -->
				<div class="palette-tabs">
					<button
						type="button"
						class="palette-tab-btn"
						:class="{ 'is-active': activePaletteTab === 'blocks' }"
						@click="activePaletteTab = 'blocks'"
					>
						📦 Блоки ({{ blockTypes.length }})
					</button>
					<button
						type="button"
						class="palette-tab-btn"
						:class="{ 'is-active': activePaletteTab === 'presets' }"
						@click="activePaletteTab = 'presets'"
					>
						⭐ Пресеты ({{ savedPresets.length }})
					</button>
				</div>

				<!-- TAB 1: BLOCKS PALETTE -->
				<template v-if="activePaletteTab === 'blocks'">
					<div class="palette-quick-add">
						<button type="button" class="quick-add-btn" @click="addWireframeBlock">
							<span class="quick-add-icon">📐</span>
							<span class="quick-add-text">
								<strong>Макет (Вайрфрейм)</strong>
								<small>Прямоугольник для прототипа</small>
							</span>
							<span class="quick-add-plus">+</span>
						</button>
					</div>

					<div class="palette-search">
						<el-input
							v-model="paletteSearch"
							placeholder="Поиск блоков..."
							clearable
							size="small"
						/>
					</div>

					<div class="palette-list">
						<div
							v-for="bt in filteredBlockTypes"
							:key="bt.slug"
							class="palette-item"
							@click="addBlock(bt)"
						>
							<div class="palette-item__icon">{{ bt.icon || '📦' }}</div>
							<div class="palette-item__info">
								<div class="palette-item__name">{{ bt.name }}</div>
								<div v-if="bt.description" class="palette-item__desc">{{ bt.description }}</div>
							</div>
							<el-button size="small" circle type="primary" class="palette-item__add">+</el-button>
						</div>
					</div>

					<!-- Sync from Frontend Bridge -->
					<div v-if="clientManifest.length > 0" class="palette-sync-box">
						<div class="sync-info">
							<span>⚡ Фронтенд подключен: {{ clientManifest.length }} блоков</span>
						</div>
						<el-button
							size="small"
							plain
							type="success"
							style="width: 100%"
							:loading="syncingBlocks"
							@click="syncBlocksFromClient"
						>
							Синхронизировать блоки с фронтенда
						</el-button>
					</div>
				</template>

				<!-- TAB 2: SAVED PRESETS (Stage 2.4) -->
				<template v-else>
					<div class="presets-container">
						<div class="presets-header-info">
							<span>Сохранённые шаблоны блоков для быстрого переиспользования</span>
						</div>

						<div v-if="savedPresets.length === 0" class="presets-empty">
							<div class="presets-empty-icon">⭐</div>
							<p>Пресеты пока не сохранены.</p>
							<small>Кликните «⭐ Сохранить как пресет» на любом настроенном блоке в канвасе.</small>
						</div>

						<div v-else class="presets-list">
							<div
								v-for="preset in savedPresets"
								:key="preset.id"
								class="preset-item-card"
								@click="addPresetToCanvas(preset)"
							>
								<div class="preset-card__header">
									<span class="preset-card__icon">{{ getBlockType(preset.type)?.icon || '📦' }}</span>
									<div class="preset-card__info">
										<strong>{{ preset.name }}</strong>
										<code class="preset-type-badge">{{ preset.type }}</code>
									</div>
									<el-button
										size="small"
										circle
										type="danger"
										link
										title="Удалить пресет"
										@click.stop="deletePreset(preset.id)"
									>
										✕
									</el-button>
								</div>
								<div class="preset-card__footer">
									<span class="preset-date">{{ formatDate(preset.createdAt) }}</span>
									<el-button size="small" type="primary" plain class="preset-add-btn">
										+ Добавить
									</el-button>
								</div>
							</div>
						</div>
					</div>
				</template>
			</aside>

			<!-- 2. CENTER COLUMN: Page Canvas (with optional Split Preview) -->
			<main class="canvas-panel" :class="{ 'with-preview': isPreviewing }">
				<div
					class="canvas-scroll-area"
					:class="{ 'is-media-drag-active': isMediaDragActive }"
					@dragenter.prevent="onMediaDragEnter"
					@dragover.prevent="onMediaDragOver"
					@dragleave="onMediaDragLeave"
					@drop.prevent="onMediaCanvasDrop"
				>
					<!-- Drag & Drop overlay for direct media uploads (Stage 4.1) -->
					<div v-if="isMediaDragActive" class="media-drag-overlay">
						<div class="media-drag-hint">
							<span class="media-drag-icon">📥</span>
							<strong>Отпустите файл для мгновенной загрузки</strong>
							<p>Изображения создадут Hero-блок, видео создадут Видео-блок</p>
						</div>
					</div>

					<div class="canvas-header">
						<div class="canvas-title">
							<span>Структура страницы</span>
							<el-tag size="small" type="info">{{ pageForm.blocks.length }} блоков</el-tag>
						</div>
						<div class="canvas-actions">
							<!-- Paste from clipboard button (Stage 2.4) -->
							<el-button
								v-if="clipboardBlock"
								size="small"
								type="success"
								plain
								title="Вставить блок из буфера (Ctrl+V)"
								@click="pasteBlock"
							>
								📋 Вставить блок ({{ getBlockType(clipboardBlock.type)?.name || clipboardBlock.type }})
							</el-button>

							<el-button size="small" link type="danger" @click="clearAllBlocks">
								Очистить всё
							</el-button>
						</div>
					</div>

					<!-- Empty Canvas State -->
					<div v-if="pageForm.blocks.length === 0" class="canvas-empty">
						<div class="canvas-empty__icon">🧱</div>
						<h4>Канвас страницы пуст</h4>
						<p>Создайте структуру страницы из прямоугольников-макетов или готовых компонентов.</p>
						<div class="canvas-empty__btns">
							<el-button type="primary" @click="addWireframeBlock">
								📐 Добавить первый макет-прямоугольник
							</el-button>
							<el-button
								v-if="clipboardBlock"
								type="success"
								plain
								@click="pasteBlock"
							>
								📋 Вставить из буфера
							</el-button>
						</div>
					</div>

					<!-- Block list (Draggable) -->
					<div class="canvas-blocks">
						<div
							v-for="(block, index) in pageForm.blocks"
							:key="block.id"
							class="canvas-block-card"
							:class="{
								'is-selected': selectedBlockIndex === index,
								'is-dragging': draggingIndex === index,
								'is-drag-over': dragOverIndex === index,
							}"
							draggable="true"
							@dragstart="onDragStart(index, $event)"
							@dragover="onDragOver(index, $event)"
							@dragleave="onDragLeave(index)"
							@drop.prevent="onBlockCardDrop(index, $event)"
							@dragend="onDragEnd"
							@click="selectBlock(index)"
						>
							<div class="block-card__handle" title="Перетащить блок">
								⠿
							</div>

							<div class="block-card__icon">
								{{ getBlockType(block.type)?.icon || '📦' }}
							</div>

							<div class="block-card__details">
								<div class="block-card__name">
									<strong>{{ getBlockType(block.type)?.name || block.type }}</strong>
									<code class="block-card__slug">{{ block.type }}</code>
									<span v-if="block.type === 'wireframe'" class="wireframe-pill">📐 Макет</span>
									<span v-if="block.style?.theme" class="style-pill">🎨 {{ block.style.theme }}</span>
									<span v-if="selectedBlockIndex === index" class="selected-pill">✏️ Редактируется</span>
								</div>
								<div class="block-card__summary">
									{{ getBlockSummary(block) }}
								</div>
							</div>

							<div class="block-card__controls" @click.stop>
								<!-- Change Type dropdown -->
								<el-dropdown trigger="click" @command="(cmd: string) => changeBlockType(index, cmd)">
									<el-button size="small" circle title="Заменить на реальный компонент">
										⇄
									</el-button>
									<template #dropdown>
										<el-dropdown-menu>
											<el-dropdown-item disabled>Заменить на компонент:</el-dropdown-item>
											<el-dropdown-item
												v-for="bt in blockTypes"
												:key="bt.slug"
												:command="bt.slug"
												:disabled="bt.slug === block.type"
											>
												{{ bt.icon || '📦' }} {{ bt.name }}
											</el-dropdown-item>
										</el-dropdown-menu>
									</template>
								</el-dropdown>

								<!-- Copy block to clipboard (Stage 2.4) -->
								<el-button
									size="small"
									circle
									title="Скопировать в буфер (Ctrl+C)"
									@click="copyBlock(index)"
								>
									📋
								</el-button>

								<!-- Save as preset (Stage 2.4) -->
								<el-button
									size="small"
									circle
									title="Сохранить как пресет"
									@click="openSavePresetDialog(index)"
								>
									⭐
								</el-button>

								<el-button
									size="small"
									circle
									:disabled="index === 0"
									title="Переместить выше"
									@click="moveBlock(index, -1)"
								>
									↑
								</el-button>
								<el-button
									size="small"
									circle
									:disabled="index === pageForm.blocks.length - 1"
									title="Переместить ниже"
									@click="moveBlock(index, 1)"
								>
									↓
								</el-button>
								<el-button
									size="small"
									circle
									title="Дублировать блок"
									@click="duplicateBlock(index)"
								>
									⎘
								</el-button>
								<el-button
									size="small"
									circle
									type="danger"
									title="Удалить блок"
									@click="removeBlock(index)"
								>
									✕
								</el-button>
							</div>
						</div>
					</div>
				</div>

				<!-- Live Preview Iframe Split Screen with Multi-device Responsive Controls (Stage 1.9) -->
				<div v-if="isPreviewing" class="preview-split-frame">
					<div class="preview-frame-header">
						<div class="preview-frame-header__info">
							<span class="preview-live-badge">● LIVE</span>
							<span class="preview-frame-title">/p/{{ pageForm.slug || 'about' }}</span>
						</div>

						<!-- Device resolution toggles (Desktop / Tablet / Mobile) -->
						<div class="preview-device-controls">
							<button
								type="button"
								:class="['preview-device-btn', { 'is-active': previewDevice === 'desktop' }]"
								title="Десктоп (100% / 1440px)"
								@click="previewDevice = 'desktop'"
							>
								<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<rect x="2" y="3" width="20" height="14" rx="2"/>
									<path d="M8 21h8M12 17v4"/>
								</svg>
								<span>Desktop</span>
							</button>
							<button
								type="button"
								:class="['preview-device-btn', { 'is-active': previewDevice === 'tablet' }]"
								title="Планшет (768px)"
								@click="previewDevice = 'tablet'"
							>
								<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<rect x="4" y="2" width="16" height="20" rx="2"/>
									<circle cx="12" cy="18" r="1" fill="currentColor"/>
								</svg>
								<span>Tablet (768px)</span>
							</button>
							<button
								type="button"
								:class="['preview-device-btn', { 'is-active': previewDevice === 'mobile' }]"
								title="Мобильный (375px)"
								@click="previewDevice = 'mobile'"
							>
								<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<rect x="5" y="2" width="14" height="20" rx="2"/>
									<circle cx="12" cy="18" r="1" fill="currentColor"/>
									<path d="M9 5h6"/>
								</svg>
								<span>Mobile (375px)</span>
							</button>
						</div>

						<div class="preview-frame-header__actions">
							<el-button size="small" link @click="reloadPreview">↻ Обновить</el-button>
						</div>
					</div>

					<!-- Viewport wrapper with responsive device framing -->
					<div class="preview-panel__viewport" :class="`is-${previewDevice}`">
						<iframe
							ref="previewIframe"
							:src="previewUrl"
							class="preview-iframe"
						/>
					</div>
				</div>
			</main>

			<!-- 3. RIGHT COLUMN: Block Inspector -->
			<aside class="inspector-panel">
				<!-- Tab Navigation: Block vs Page Settings -->
				<div class="inspector-nav-tabs">
					<button
						type="button"
						class="inspector-nav-tab"
						:class="{ 'is-active': activeInspectorTab === 'block' }"
						@click="activeInspectorTab = 'block'"
					>
						📝 Контент блока
					</button>
					<button
						type="button"
						class="inspector-nav-tab"
						:class="{ 'is-active': activeInspectorTab === 'page' }"
						@click="activeInspectorTab = 'page'"
					>
						⚙️ Настройки страницы
					</button>
				</div>

				<!-- TAB 1: BLOCK INSPECTOR -->
				<div v-if="activeInspectorTab === 'block'" class="inspector-tab-pane">
					<div v-if="selectedBlock" class="inspector-content">
						<div class="inspector-header">
							<div class="inspector-icon">
								{{ selectedBlockType?.icon || '📦' }}
							</div>
							<div class="inspector-header__info">
								<h3>{{ selectedBlockType?.name || selectedBlock.type }}</h3>
								<div class="inspector-type-row">
									<code class="inspector-type">{{ selectedBlock.type }}</code>
									<span v-if="selectedBlock.type === 'wireframe'" class="wireframe-pill">📐 Макет</span>
								</div>
							</div>
							<el-button
								size="small"
								circle
								title="Снять выбор"
								@click="selectedBlockIndex = null"
							>
								✕
							</el-button>
						</div>

						<!-- Quick swap to real component -->
						<div class="inspector-swap-bar">
							<div class="swap-bar-label">
								<span>Компонент:</span>
								<small class="swap-bar-hint">Заменить на другой</small>
							</div>
							<el-select
								:model-value="selectedBlock.type"
								size="small"
								class="swap-bar-select"
								placeholder="Сменить тип блока..."
								@update:model-value="(val: string) => changeBlockType(selectedBlockIndex!, val)"
							>
								<el-option
									v-for="bt in blockTypes"
									:key="bt.slug"
									:label="`${bt.icon || '📦'} ${bt.name}`"
									:value="bt.slug"
								>
									<span style="float: left">{{ bt.icon || '📦' }} {{ bt.name }}</span>
									<span style="float: right; color: var(--text-muted); font-size: 11px"><code>{{ bt.slug }}</code></span>
								</el-option>
							</el-select>
						</div>

						<!-- SUB-TABS: Data vs Styling (Stage 2.3) -->
						<div class="inspector-sub-tabs">
							<button
								type="button"
								class="sub-tab-btn"
								:class="{ 'is-active': activeBlockSubTab === 'content' }"
								@click="activeBlockSubTab = 'content'"
							>
								📝 Поля данных
							</button>
							<button
								type="button"
								class="sub-tab-btn"
								:class="{ 'is-active': activeBlockSubTab === 'style' }"
								@click="activeBlockSubTab = 'style'"
							>
								🎨 Стилизация блока
							</button>
						</div>

						<!-- SUB-PANE 1: CONTENT FIELDS -->
						<div v-if="activeBlockSubTab === 'content'" class="sub-tab-pane">
							<div class="inspector-notice">
								✏️ Заполните поля блока. Изменения видны в Live Preview:
							</div>

							<div class="inspector-form">
								<!-- ContentFormGenerator dynamically renders inputs based on block_type.schema -->
								<ContentFormGenerator
									:key="selectedBlock.id"
									v-if="selectedBlockType?.schema && selectedBlockType.schema.length"
									v-model="selectedBlock.data"
									:fields="selectedBlockType.schema"
								/>
								<div v-else class="inspector-no-schema">
									<p>У этого типа блока нет настроенных полей схемы.</p>
								</div>
							</div>
						</div>

						<!-- SUB-PANE 2: BLOCK STYLING (Stage 2.3) -->
						<div v-else class="sub-tab-pane styling-pane">
							<div class="styling-section">
								<label class="styling-label">Цветовая схема (Тема)</label>
								<div class="theme-selector-grid">
									<button
										type="button"
										class="theme-card theme-light"
										:class="{ 'is-active': getBlockStyle().theme === 'light' }"
										@click="setBlockTheme('light')"
									>
										☀️ Светлая
									</button>
									<button
										type="button"
										class="theme-card theme-dark"
										:class="{ 'is-active': getBlockStyle().theme === 'dark' }"
										@click="setBlockTheme('dark')"
									>
										🌙 Тёмная
									</button>
									<button
										type="button"
										class="theme-card theme-accent"
										:class="{ 'is-active': getBlockStyle().theme === 'accent' }"
										@click="setBlockTheme('accent')"
									>
										⚡ Акцент
									</button>
									<button
										type="button"
										class="theme-card theme-muted"
										:class="{ 'is-active': getBlockStyle().theme === 'muted' }"
										@click="setBlockTheme('muted')"
									>
										🌫️ Приглушённая
									</button>
									<button
										type="button"
										class="theme-card theme-transparent"
										:class="{ 'is-active': getBlockStyle().theme === 'transparent' }"
										@click="setBlockTheme('transparent')"
									>
										🪟 Прозрачная
									</button>
								</div>
							</div>

							<div class="styling-section">
								<label class="styling-label">Внутренний отступ (Padding)</label>
								<el-radio-group
									v-model="getBlockStyle().padding"
									size="small"
									class="spacing-radio-group"
								>
									<el-radio-button label="none">0</el-radio-button>
									<el-radio-button label="sm">SM</el-radio-button>
									<el-radio-button label="md">MD</el-radio-button>
									<el-radio-button label="lg">LG</el-radio-button>
									<el-radio-button label="xl">XL</el-radio-button>
								</el-radio-group>
							</div>

							<div class="styling-section">
								<label class="styling-label">Внешний отступ (Margin)</label>
								<el-radio-group
									v-model="getBlockStyle().margin"
									size="small"
									class="spacing-radio-group"
								>
									<el-radio-button label="none">0</el-radio-button>
									<el-radio-button label="sm">SM</el-radio-button>
									<el-radio-button label="md">MD</el-radio-button>
									<el-radio-button label="lg">LG</el-radio-button>
								</el-radio-group>
							</div>

							<div class="styling-section">
								<label class="styling-label">Цвет фона (Background Color)</label>
								<div class="color-picker-row">
									<el-color-picker
										v-model="getBlockStyle().backgroundColor"
										show-alpha
										size="default"
									/>
									<el-input
										v-model="getBlockStyle().backgroundColor"
										placeholder="#ffffff или rgba(...)"
										size="small"
										clearable
										style="flex: 1"
									/>
								</div>
							</div>

							<div class="styling-section">
								<label class="styling-label">Градиент фона (Background Gradient)</label>
								<div class="gradient-presets-chips">
									<span
										v-for="(grad, idx) in gradientPresets"
										:key="idx"
										class="grad-chip"
										:style="{ background: grad.value }"
										:title="grad.name"
										@click="getBlockStyle().backgroundGradient = grad.value"
									></span>
									<el-button
										v-if="getBlockStyle().backgroundGradient"
										size="small"
										link
										type="danger"
										@click="getBlockStyle().backgroundGradient = ''"
									>
										Сбросить
									</el-button>
								</div>
								<el-input
									v-model="getBlockStyle().backgroundGradient"
									placeholder="linear-gradient(...)"
									size="small"
									clearable
									style="margin-top: 6px"
								/>
							</div>

							<div class="styling-section">
								<label class="styling-label">Фоновое изображение (Background Image URL)</label>
								<div class="bg-image-upload-row">
									<el-input
										v-model="getBlockStyle().backgroundImage"
										placeholder="https://... или перетащите файл"
										size="small"
										clearable
										@dragover.prevent
										@drop.prevent="onBgImageDrop"
									>
										<template #append>
											<el-upload
												action="#"
												:auto-upload="false"
												:show-file-list="false"
												accept="image/*"
												:on-change="onBgImageSelected"
											>
												<el-button size="small">Файл</el-button>
											</el-upload>
										</template>
									</el-input>
								</div>
							</div>

							<div class="styling-section">
								<el-button
									type="primary"
									plain
									style="width: 100%"
									@click="openSavePresetDialog(selectedBlockIndex!)"
								>
									⭐ Сохранить блок и стиль как пресет
								</el-button>
							</div>
						</div>
					</div>

					<!-- No block selected helper guide -->
					<div v-else class="inspector-guide">
						<div class="guide-icon">👈</div>
						<h3>Как заполнять контент:</h3>
						<p class="guide-desc">
							Страница собирается из блоков. Кликните на любой блок в канвасе по центру, чтобы открыть его поля для редактирования.
						</p>

						<div class="guide-steps-list">
							<div class="guide-step-item">
								<span class="step-num">1</span>
								<div class="step-text">
									<strong>Выберите блок</strong> в левой палитре (нажмите «+»)
								</div>
							</div>
							<div class="guide-step-item">
								<span class="step-num">2</span>
								<div class="step-text">
									<strong>Нажмите на карточку блока</strong> в центральном канвасе
								</div>
							</div>
							<div class="guide-step-item">
								<span class="step-num">3</span>
								<div class="step-text">
									<strong>Заполните тексты, медиа и стиль</strong> в этой правой панели
								</div>
							</div>
						</div>

						<div v-if="pageForm.blocks.length > 0" class="guide-action">
							<el-button type="primary" plain style="width: 100%" @click="selectBlock(0)">
								Выбрать 1-й блок «{{ getBlockType(pageForm.blocks[0].type)?.name || pageForm.blocks[0].type }}»
							</el-button>
						</div>
					</div>
				</div>

				<!-- TAB 2: PAGE SETTINGS & SEO -->
				<div v-else class="inspector-tab-pane inspector-page-settings">
					<div class="inspector-header">
						<div class="inspector-icon">⚙️</div>
						<div>
							<h3>Настройки страницы</h3>
							<span class="inspector-type">Основные параметры, статус и SEO</span>
						</div>
					</div>

					<div class="inspector-form">
						<el-form label-position="top">
							<el-form-item label="Название страницы">
								<el-input
									v-model="pageForm.title"
									placeholder="О платформе"
								/>
							</el-form-item>
							<el-form-item label="URL страницы (slug)">
								<el-input
									v-model="pageForm.slug"
									placeholder="about"
									@input="onSlugInput"
								>
									<template #prepend>/p/</template>
								</el-input>
							</el-form-item>

							<!-- Status Workflow Selection -->
							<el-form-item label="Статус публикации (Workflow)">
								<el-select v-model="pageForm.status" style="width: 100%" @change="onStatusSelectChange">
									<el-option label="Черновик (DRAFT)" value="draft" />
									<el-option label="На проверке (REVIEW)" value="review" />
									<el-option label="Опубликовано (PUBLISHED)" value="published" />
								</el-select>
								<div v-if="pageForm.published_at" class="published-time-hint">
									🚀 Опубликовано: {{ formatDate(pageForm.published_at) }}
								</div>
							</el-form-item>

							<!-- Parent Page / Hierarchy (Stage 3.3) -->
							<el-form-item label="Родительская страница (Иерархия & Хлебные крошки)">
								<el-select
									v-model="pageForm.parent_id"
									clearable
									placeholder="— Корневая страница (без родителя) —"
									style="width: 100%"
								>
									<el-option label="— Корневая страница (без родителя) —" :value="null" />
									<el-option
										v-for="parent in availableParentPages"
										:key="parent.id"
										:label="`${parent.title} (/p/${parent.slug})`"
										:value="parent.id"
									/>
								</el-select>
								<div class="seo-field-hint">
									Определяет цепочку Breadcrumbs на клиенте и структуру навигации сайта.
								</div>
							</el-form-item>

							<el-divider style="margin: 20px 0 16px" content-position="left">
								<span style="font-weight: 600; font-size: 13px">🔍 SEO & Поисковые сниппеты</span>
							</el-divider>

							<el-form-item>
								<template #label>
									<div class="seo-label-row">
										<span>SEO Title (заголовок вкладки)</span>
										<el-tag size="small" :type="seoTitleLengthStatus" effect="plain">
											{{ effectiveSeoTitle.length }}/60 символов
										</el-tag>
									</div>
								</template>
								<el-input
									v-model="pageForm.seo.title"
									:placeholder="pageForm.title ? `${pageForm.title} | Guest & Place` : 'Заголовок страницы для поисковиков'"
								/>
								<div class="seo-field-hint">Оптимальная длина: 50–60 символов для отображения в Google без обрезки.</div>
							</el-form-item>

							<el-form-item>
								<template #label>
									<div class="seo-label-row">
										<span>SEO Description (мета-описание)</span>
										<el-tag size="small" :type="seoDescLengthStatus" effect="plain">
											{{ (pageForm.seo.description || '').length }}/160 символов
										</el-tag>
									</div>
								</template>
								<el-input
									v-model="pageForm.seo.description"
									type="textarea"
									:rows="3"
									placeholder="Краткое привлекательное описание страницы для выдачи поисковых систем"
								/>
								<div class="seo-field-hint">Оптимальная длина: 120–160 символов.</div>
							</el-form-item>

							<el-form-item label="OG Image (превью для соцсетей и мессенджеров)">
								<el-input
									v-model="pageForm.seo.og_image"
									placeholder="https://... или /uploads/image.jpg"
								>
									<template #prefix>🖼️</template>
								</el-input>
							</el-form-item>

							<el-form-item label="Canonical URL (канонический адрес)">
								<el-input
									v-model="pageForm.seo.canonical"
									:placeholder="computedCanonicalUrl"
								/>
							</el-form-item>

							<el-form-item>
								<el-checkbox v-model="pageForm.seo.no_index">
									Запретить индексацию роботами (noindex, nofollow)
								</el-checkbox>
							</el-form-item>

							<!-- SERP / SOCIAL PREVIEW COMPONENT -->
							<div class="serp-preview-section">
								<div class="serp-preview-header">
									<div class="serp-preview-title">
										<span>Предпросмотр сниппета</span>
									</div>
									<el-radio-group v-model="serpPreviewTab" size="small">
										<el-radio-button label="google">Google</el-radio-button>
										<el-radio-button label="social">Соцсети</el-radio-button>
									</el-radio-group>
								</div>

								<!-- Google SERP Card -->
								<div v-if="serpPreviewTab === 'google'" class="google-snippet-card">
									<div class="google-snippet-topbar">
										<div class="google-favicon">G</div>
										<div class="google-site-info">
											<span class="google-site-name">Guest & Place</span>
											<span class="google-snippet-url">https://guestplace.ru › p › {{ breadcrumbSlugDisplay }}</span>
										</div>
									</div>
									<div class="google-snippet-title">
										{{ effectiveSeoTitle }}
									</div>
									<div class="google-snippet-desc">
										{{ effectiveSeoDesc }}
									</div>
								</div>

								<!-- Social OpenGraph Card -->
								<div v-else class="social-snippet-card">
									<div class="social-snippet-thumb" :style="ogImageStyle">
										<span v-if="!pageForm.seo.og_image" class="social-thumb-placeholder">🖼️ Превью по умолчанию</span>
									</div>
									<div class="social-snippet-body">
										<div class="social-snippet-domain">GUESTPLACE.RU</div>
										<div class="social-snippet-title">{{ effectiveSeoTitle }}</div>
										<div class="social-snippet-desc">{{ effectiveSeoDesc }}</div>
									</div>
								</div>
							</div>

							<!-- Sitemap Info Card -->
							<div class="sitemap-info-box">
								<div class="sitemap-info-icon">🗺️</div>
								<div class="sitemap-info-text">
									<strong>Sitemap XML генерация:</strong>
									<p>Страница автоматически попадает в <code>sitemap.xml</code> при публикации (статус PUBLISHED).</p>
								</div>
								<el-button size="small" plain @click="openSitemapXml">
									Открыть sitemap.xml
								</el-button>
							</div>
						</el-form>
					</div>
				</div>
			</aside>
		</div>

		<!-- Dialog: Save Block as Preset (Stage 2.4) -->
		<el-dialog
			v-model="isPresetDialogOpen"
			title="⭐ Сохранить блок как пресет"
			width="420px"
		>
			<div class="preset-dialog-content">
				<p>Сохраните текущую конфигурацию контента и стиля блока как шаблон для повторного использования на других страницах:</p>
				<el-input
					v-model="presetFormName"
					placeholder="Название пресета (например: Hero с синим градиентом)"
					autofocus
				/>
			</div>
			<template #footer>
				<el-button @click="isPresetDialogOpen = false">Отмена</el-button>
				<el-button type="primary" :disabled="!presetFormName.trim()" @click="confirmSavePreset">
					Сохранить пресет
				</el-button>
			</template>
		</el-dialog>
	</div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { uploadMedia } from '@admin-panel/lib'
import { ElMessage, ElMessageBox } from 'element-plus'
import { pagesApi, type BlockStyle, type BlockTypeItem, type PageBlock } from '#entities/pages'
import ContentFormGenerator from '#features/content-editor/ui/components/ContentFormGenerator.vue'

interface BlockPreset {
	id: string
	name: string
	type: string
	data: Record<string, any>
	style?: BlockStyle
	createdAt: string
}

const route = useRoute()
const router = useRouter()

const isEdit = computed(() => !!route.params.id)
const pageId = computed(() => (route.params.id as string) || '')

const saving = ref(false)
const syncingBlocks = ref(false)
const blockTypes = ref<BlockTypeItem[]>([])
const paletteSearch = ref('')
const selectedBlockIndex = ref<number | null>(null)
const isPreviewing = ref(false)
const clientManifest = ref<any[]>([])
const previewIframe = ref<HTMLIFrameElement | null>(null)

// Tabs state
const activePaletteTab = ref<'blocks' | 'presets'>('blocks')
const activeInspectorTab = ref<'block' | 'page'>('block')
const activeBlockSubTab = ref<'content' | 'style'>('content')

// Drag and drop state
const draggingIndex = ref<number | null>(null)
const dragOverIndex = ref<number | null>(null)

// Clipboard & Presets (Stage 2.4)
const clipboardBlock = ref<PageBlock | null>(null)
const savedPresets = ref<BlockPreset[]>([])
const isPresetDialogOpen = ref(false)
const presetFormName = ref('')
const presetTargetIndex = ref<number | null>(null)

const gradientPresets = [
	{ name: 'Indigo Purple', value: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)' },
	{ name: 'Dark Slate', value: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' },
	{ name: 'Sunset Glow', value: 'linear-gradient(135deg, #f97316 0%, #ec4899 100%)' },
	{ name: 'Emerald Wave', value: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)' },
	{ name: 'Ocean Blue', value: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' },
]

const pageForm = reactive({
	title: '',
	slug: '',
	status: 'draft',
	published_at: '',
	published_by: '',
	parent_id: null as string | null,
	blocks: [] as PageBlock[],
	seo: {
		title: '',
		description: '',
		og_image: '',
		canonical: '',
		no_index: false,
	},
})

const availableParentPages = ref<PageItem[]>([])
const serpPreviewTab = ref<'google' | 'social'>('google')

const effectiveSeoTitle = computed(() => {
	if (pageForm.seo?.title && pageForm.seo.title.trim()) {
		return pageForm.seo.title
	}
	return pageForm.title ? `${pageForm.title} | Guest & Place` : 'Guest & Place — Каталог площадок и мероприятий'
})

const effectiveSeoDesc = computed(() => {
	if (pageForm.seo?.description && pageForm.seo.description.trim()) {
		return pageForm.seo.description
	}
	return 'Интерактивная платформа для поиска и бронирования залов, площадок для корпоративов, свадеб и деловых событий.'
})

const breadcrumbSlugDisplay = computed(() => {
	const current = pageForm.slug ? pageForm.slug.replace(/^\/+/, '') : 'page'
	if (pageForm.parent_id) {
		const parent = availableParentPages.value.find((p) => p.id === pageForm.parent_id)
		if (parent) {
			return `${parent.slug} › ${current}`
		}
	}
	return current
})

const seoTitleLengthStatus = computed(() => {
	const l = effectiveSeoTitle.value.length
	if (l >= 30 && l <= 60) return 'success'
	if (l > 60) return 'danger'
	return 'warning'
})

const seoDescLengthStatus = computed(() => {
	const l = (pageForm.seo?.description || '').length
	if (l >= 100 && l <= 160) return 'success'
	if (l > 160) return 'danger'
	return 'info'
})

const clientBaseUrl = computed(() => import.meta.env.VITE_CLIENT_URL || 'http://localhost:3000')

const computedCanonicalUrl = computed(() => {
	const base = clientBaseUrl.value.replace(/\/$/, '')
	const cleanSlug = pageForm.slug ? pageForm.slug.replace(/^\/+/, '') : 'page'
	return `${base}/p/${cleanSlug}`
})

const sitemapUrl = computed(() => {
	const base = clientBaseUrl.value.replace(/\/$/, '')
	return `${base}/sitemap.xml`
})

function openSitemapXml() {
	window.open(sitemapUrl.value, '_blank')
}

const ogImageStyle = computed(() => {
	if (pageForm.seo?.og_image) {
		return {
			backgroundImage: `url(${pageForm.seo.og_image})`,
			backgroundSize: 'cover',
			backgroundPosition: 'center',
		}
	}
	return {}
})

const previewDevice = ref<'desktop' | 'tablet' | 'mobile'>('desktop')

const previewUrl = computed(() => {
	const cleanSlug = pageForm.slug ? pageForm.slug.replace(/^\/+/, '') : 'about'
	const base = clientBaseUrl.value.replace(/\/$/, '')
	return `${base}/p/${cleanSlug}?preview=true`
})

function openInNewTab() {
	const cleanSlug = pageForm.slug ? pageForm.slug.replace(/^\/+/, '') : 'about'
	const base = clientBaseUrl.value.replace(/\/$/, '')
	window.open(`${base}/p/${cleanSlug}`, '_blank')
}

const selectedBlock = computed(() => {
	if (
		selectedBlockIndex.value === null ||
		selectedBlockIndex.value < 0 ||
		selectedBlockIndex.value >= pageForm.blocks.length
	) {
		return null
	}
	const b = pageForm.blocks[selectedBlockIndex.value]
	if (!b) return null
	if (!b.data || typeof b.data !== 'object') {
		b.data = {}
	}
	if (!b.style || typeof b.style !== 'object') {
		b.style = {
			theme: 'light',
			padding: 'md',
			margin: 'none',
			backgroundColor: '',
			backgroundGradient: '',
			backgroundImage: '',
		}
	}
	return b
})

const selectedBlockType = computed(() => {
	if (!selectedBlock.value) return null
	return getBlockType(selectedBlock.value.type)
})

const filteredBlockTypes = computed(() => {
	if (!paletteSearch.value) return blockTypes.value
	const q = paletteSearch.value.toLowerCase()
	return blockTypes.value.filter(
		(b) => b.name.toLowerCase().includes(q) || b.slug.toLowerCase().includes(q)
	)
})

function getBlockType(slug: string): BlockTypeItem | undefined {
	return blockTypes.value.find((b) => b.slug === slug)
}

function getBlockSummary(block: PageBlock): string {
	if (!block || !block.data) return 'Без заголовка'
	const d = block.data
	return d.title || d.left_title || d.quote || d.title_prefix || 'Без заголовка'
}

function getBlockStyle(): BlockStyle {
	if (!selectedBlock.value) {
		return {}
	}
	if (!selectedBlock.value.style) {
		selectedBlock.value.style = {
			theme: 'light',
			padding: 'md',
			margin: 'none',
		}
	}
	return selectedBlock.value.style
}

function setBlockTheme(themeName: string) {
	const st = getBlockStyle()
	st.theme = themeName
}

function getStatusLabel(st: string): string {
	if (st === 'published') return 'Опубликовано'
	if (st === 'review') return 'На проверке'
	return 'Черновик'
}

function handleStatusTransition(cmd: string) {
	pageForm.status = cmd
	if (cmd === 'published' && !pageForm.published_at) {
		pageForm.published_at = new Date().toISOString()
	}
	ElMessage.success(`Статус страницы изменён: ${getStatusLabel(cmd)}`)
}

function onStatusSelectChange(val: string) {
	if (val === 'published' && !pageForm.published_at) {
		pageForm.published_at = new Date().toISOString()
	}
}

// Built-in Wireframe prototype block
const WIREFRAME_TYPE: BlockTypeItem = {
	id: 'builtin-wireframe',
	name: 'Макет / Вайрфрейм',
	slug: 'wireframe',
	description: 'Свободный прямоугольник с заголовком и текстом для прототипирования структуры',
	icon: '📐',
	category: 'prototype',
	schema: [
		{ name: 'title', label: 'Заголовок / Назначение блока', fieldType: 'Text', required: true },
		{ name: 'subtitle', label: 'Подзаголовок / Секция', fieldType: 'Text' },
		{ name: 'description', label: 'Текст / Описание / ТЗ для верстки', fieldType: 'RichText' },
		{ name: 'cta_text', label: 'Текст кнопки (если нужна)', fieldType: 'Text' },
		{ name: 'cta_link', label: 'Ссылка кнопки', fieldType: 'Text' },
		{ name: 'badge', label: 'Метка статуса (например, «В разработке»)', fieldType: 'Text' },
		{ name: 'height', label: 'Высота блока (small, medium, large)', fieldType: 'Text' },
	],
}

// Built-in Video block (Stage 4.3)
const VIDEO_TYPE: BlockTypeItem = {
	id: 'builtin-video-embed',
	name: 'Видео блок',
	slug: 'video_embed',
	description: 'Встраивание видео (MP4/WebM файлы или YouTube/Vimeo ссылки)',
	icon: '🎬',
	category: 'media',
	schema: [
		{ name: 'title', label: 'Заголовок блока', fieldType: 'Text' },
		{ name: 'subtitle', label: 'Подзаголовок', fieldType: 'Text' },
		{ name: 'video_url', label: 'Видео (файл или YouTube/Vimeo ссылка)', fieldType: 'Media', required: true },
		{ name: 'poster_url', label: 'Обложка видео (Poster image)', fieldType: 'Media' },
		{ name: 'caption', label: 'Подпись к видео', fieldType: 'Text' },
		{ name: 'aspect_ratio', label: 'Соотношение сторон (16/9, 4/3, 1/1)', fieldType: 'Text' },
	],
}

// Data fetching
const fetchBlockTypes = async () => {
	try {
		const res = await pagesApi.getBlockTypes()
		const list = res.data && Array.isArray(res.data) ? res.data : []
		if (!list.some((b) => b.slug === 'wireframe')) {
			list.unshift(WIREFRAME_TYPE)
		}
		if (!list.some((b) => b.slug === 'video_embed')) {
			list.push(VIDEO_TYPE)
		}
		blockTypes.value = list
	} catch (err: any) {
		console.warn('Failed to load block types:', err)
		blockTypes.value = [WIREFRAME_TYPE, VIDEO_TYPE]
	}
}

const fetchPage = async () => {
	if (!isEdit.value) return
	try {
		const res = await pagesApi.getPageById(pageId.value, { preview: true })
		if (res.data) {
			pageForm.title = res.data.title || ''
			pageForm.slug = res.data.slug || ''
			pageForm.status = res.data.status || 'draft'
			pageForm.published_at = res.data.published_at || ''
			pageForm.published_by = res.data.published_by || ''
			pageForm.parent_id = res.data.parent_id || null
			pageForm.blocks = Array.isArray(res.data.blocks) ? res.data.blocks : []
			pageForm.seo = {
				title: res.data.seo?.title || '',
				description: res.data.seo?.description || '',
				og_image: res.data.seo?.og_image || '',
				canonical: res.data.seo?.canonical || '',
				no_index: !!res.data.seo?.no_index,
			}

			if (pageForm.blocks.length > 0) {
				selectedBlockIndex.value = 0
				activeInspectorTab.value = 'block'
			}
		}
	} catch (err: any) {
		ElMessage.error(err.message || 'Ошибка загрузки страницы')
	}
}

function loadSavedPresets() {
	try {
		const raw = localStorage.getItem('gp_cms_block_presets')
		if (raw) {
			savedPresets.value = JSON.parse(raw)
		}
	} catch (e) {
		console.warn('Failed to load presets from localStorage:', e)
	}
}

function persistPresets() {
	try {
		localStorage.setItem('gp_cms_block_presets', JSON.stringify(savedPresets.value))
	} catch (e) {
		console.warn('Failed to save presets to localStorage:', e)
	}
}

function openSavePresetDialog(index: number) {
	presetTargetIndex.value = index
	const block = pageForm.blocks[index]
	const summary = block ? getBlockSummary(block) : ''
	presetFormName.value = summary ? `${getBlockType(block.type)?.name || block.type}: ${summary}` : `${getBlockType(block.type)?.name || block.type} (Пресет)`
	isPresetDialogOpen.value = true
}

function confirmSavePreset() {
	if (presetTargetIndex.value === null) return
	const block = pageForm.blocks[presetTargetIndex.value]
	if (!block) return

	const newPreset: BlockPreset = {
		id: `preset-${Date.now()}`,
		name: presetFormName.value.trim(),
		type: block.type,
		data: JSON.parse(JSON.stringify(block.data || {})),
		style: JSON.parse(JSON.stringify(block.style || {})),
		createdAt: new Date().toISOString(),
	}

	savedPresets.value.unshift(newPreset)
	persistPresets()
	isPresetDialogOpen.value = false
	ElMessage.success(`Пресет «${newPreset.name}» успешно сохранён!`)
}

function deletePreset(id: string) {
	savedPresets.value = savedPresets.value.filter(p => p.id !== id)
	persistPresets()
	ElMessage.info('Пресет удалён')
}

function addPresetToCanvas(preset: BlockPreset) {
	const newBlock: PageBlock = {
		id: `${preset.type}-${Date.now()}`,
		type: preset.type,
		data: JSON.parse(JSON.stringify(preset.data || {})),
		style: JSON.parse(JSON.stringify(preset.style || {})),
	}
	pageForm.blocks.push(newBlock)
	selectedBlockIndex.value = pageForm.blocks.length - 1
	activeInspectorTab.value = 'block'
	ElMessage.success(`Блок из пресета «${preset.name}» добавлен на страницу!`)
}

// Clipboard (Stage 2.4)
function copyBlock(index: number) {
	const original = pageForm.blocks[index]
	if (!original) return
	clipboardBlock.value = JSON.parse(JSON.stringify(original))
	ElMessage.success(`Блок «${getBlockType(original.type)?.name || original.type}» скопирован в буфер`)
}

function pasteBlock() {
	if (!clipboardBlock.value) {
		ElMessage.warning('Буфер блоков пуст')
		return
	}
	const cloned: PageBlock = {
		id: `${clipboardBlock.value.type}-${Date.now()}`,
		type: clipboardBlock.value.type,
		data: JSON.parse(JSON.stringify(clipboardBlock.value.data || {})),
		style: JSON.parse(JSON.stringify(clipboardBlock.value.style || {})),
	}
	if (selectedBlockIndex.value !== null && selectedBlockIndex.value >= 0) {
		pageForm.blocks.splice(selectedBlockIndex.value + 1, 0, cloned)
		selectedBlockIndex.value = selectedBlockIndex.value + 1
	} else {
		pageForm.blocks.push(cloned)
		selectedBlockIndex.value = pageForm.blocks.length - 1
	}
	activeInspectorTab.value = 'block'
	ElMessage.success('Блок успешно вставлен из буфера!')
}

// Keyboard shortcuts for Copy/Paste
function onKeydown(e: KeyboardEvent) {
	const target = e.target as HTMLElement
	if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
		return
	}
	if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
		if (selectedBlockIndex.value !== null) {
			copyBlock(selectedBlockIndex.value)
			e.preventDefault()
		}
	} else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') {
		if (clipboardBlock.value) {
			pasteBlock()
			e.preventDefault()
		}
	}
}

onMounted(async () => {
	loadSavedPresets()
	await fetchBlockTypes()
	try {
		const pagesRes = await pagesApi.getPages()
		if (pagesRes.data) {
			availableParentPages.value = pagesRes.data.filter((p) => p.id !== pageId.value)
		}
	} catch (e) {
		console.warn('Failed to load parent pages:', e)
	}
	if (isEdit.value) {
		await fetchPage()
	}

	window.addEventListener('message', handleWindowMessage)
	window.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
	if (previewDebounceTimer) {
		clearTimeout(previewDebounceTimer)
	}
	window.removeEventListener('message', handleWindowMessage)
	window.removeEventListener('keydown', onKeydown)
})

// Listen to messages from Nuxt preview iframe
function handleWindowMessage(event: MessageEvent) {
	if (!event.data || typeof event.data !== 'object') return
	const { type, manifest } = event.data

	if (type === 'CMS_PAGE_PREVIEW_READY') {
		if (Array.isArray(manifest) && manifest.length > 0) {
			clientManifest.value = manifest
		}
		// Send initial state to preview iframe
		sendPreviewUpdate()
	}
}

let previewDebounceTimer: ReturnType<typeof setTimeout> | null = null

// Send live update to iframe
function sendPreviewUpdate() {
	if (previewDebounceTimer) {
		clearTimeout(previewDebounceTimer)
	}
	previewDebounceTimer = setTimeout(() => {
		if (!previewIframe.value || !previewIframe.value.contentWindow) return

		try {
			// Entire message payload MUST be deep cloned into plain objects/primitives to prevent DataCloneError
			const payload = JSON.parse(
				JSON.stringify({
					type: 'CMS_PAGE_PREVIEW_UPDATE',
					blocks: pageForm.blocks || [],
					title: pageForm.title || '',
					seo: pageForm.seo || {},
				})
			)
			previewIframe.value.contentWindow.postMessage(payload, '*')
		} catch (err) {
			console.warn('[PageConstructor] sendPreviewUpdate error:', err)
		}
	}, 80)
}

// Watch blocks and send live update to preview
watch(
	() => [pageForm.blocks, pageForm.title, pageForm.seo],
	() => {
		if (isPreviewing.value) {
			sendPreviewUpdate()
		}
	},
	{ deep: true }
)

// Canvas operations
function addBlock(bt: BlockTypeItem) {
	const newBlock: PageBlock = {
		id: `${bt.slug}-${Date.now()}`,
		type: bt.slug,
		data: {},
		style: {
			theme: 'light',
			padding: 'md',
			margin: 'none',
		},
	}
	pageForm.blocks.push(newBlock)
	selectedBlockIndex.value = pageForm.blocks.length - 1
	activeInspectorTab.value = 'block'
	activeBlockSubTab.value = 'content'
	ElMessage.success(`Блок «${bt.name}» добавлен. Заполните поля в правой панели`)
}

function addWireframeBlock() {
	const wireframeType = blockTypes.value.find((b) => b.slug === 'wireframe') || WIREFRAME_TYPE
	addBlock(wireframeType)
}

function changeBlockType(index: number, newSlug: string) {
	if (index < 0 || index >= pageForm.blocks.length) return
	const block = pageForm.blocks[index]
	if (!block || block.type === newSlug) return
	const oldType = block.type
	block.type = newSlug
	ElMessage.success(`Тип блока заменён: ${oldType} ➔ ${getBlockType(newSlug)?.name || newSlug}`)
}

function selectBlock(index: number) {
	selectedBlockIndex.value = index
	activeInspectorTab.value = 'block'
}

function moveBlock(index: number, direction: number) {
	const target = index + direction
	if (target < 0 || target >= pageForm.blocks.length) return
	const [item] = pageForm.blocks.splice(index, 1)
	if (item) {
		pageForm.blocks.splice(target, 0, item)
		selectedBlockIndex.value = target
	}
}

function duplicateBlock(index: number) {
	const original = pageForm.blocks[index]
	const cloned: PageBlock = {
		id: `${original.type}-${Date.now()}`,
		type: original.type,
		data: JSON.parse(JSON.stringify(original.data || {})),
		style: JSON.parse(JSON.stringify(original.style || {})),
	}
	pageForm.blocks.splice(index + 1, 0, cloned)
	selectedBlockIndex.value = index + 1
}

function removeBlock(index: number) {
	pageForm.blocks.splice(index, 1)
	if (selectedBlockIndex.value === index) {
		selectedBlockIndex.value = pageForm.blocks.length ? Math.max(0, index - 1) : null
	} else if (selectedBlockIndex.value !== null && selectedBlockIndex.value > index) {
		selectedBlockIndex.value--
	}
}

function clearAllBlocks() {
	pageForm.blocks = []
	selectedBlockIndex.value = null
}

// Drag & drop handlers
function onDragStart(index: number, event: DragEvent) {
	draggingIndex.value = index
	dragOverIndex.value = null
	if (event.dataTransfer) {
		event.dataTransfer.effectAllowed = 'move'
		event.dataTransfer.setData('text/plain', String(index))
	}
}

function onDragOver(index: number, event: DragEvent) {
	event.preventDefault()
	if (draggingIndex.value !== null && draggingIndex.value !== index) {
		dragOverIndex.value = index
	}
}

function onDragLeave(index: number) {
	if (dragOverIndex.value === index) {
		dragOverIndex.value = null
	}
}

function onBlockCardDrop(targetIndex: number, event: DragEvent) {
	if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
		event.preventDefault()
		event.stopPropagation()
		handleDirectMediaUpload(event.dataTransfer.files[0], targetIndex)
		draggingIndex.value = null
		dragOverIndex.value = null
		return
	}
	onDrop(targetIndex)
}

function onDrop(targetIndex: number) {
	if (draggingIndex.value === null || draggingIndex.value === targetIndex) {
		draggingIndex.value = null
		dragOverIndex.value = null
		return
	}

	const fromIndex = draggingIndex.value
	const [movedBlock] = pageForm.blocks.splice(fromIndex, 1)
	pageForm.blocks.splice(targetIndex, 0, movedBlock)

	if (selectedBlockIndex.value === fromIndex) {
		selectedBlockIndex.value = targetIndex
	} else if (
		selectedBlockIndex.value !== null &&
		selectedBlockIndex.value > fromIndex &&
		selectedBlockIndex.value <= targetIndex
	) {
		selectedBlockIndex.value--
	} else if (
		selectedBlockIndex.value !== null &&
		selectedBlockIndex.value < fromIndex &&
		selectedBlockIndex.value >= targetIndex
	) {
		selectedBlockIndex.value++
	}

	draggingIndex.value = null
	dragOverIndex.value = null
}

function onDragEnd() {
	draggingIndex.value = null
	dragOverIndex.value = null
}

// Split preview controls
function togglePreview() {
	isPreviewing.value = !isPreviewing.value
	if (isPreviewing.value) {
		setTimeout(sendPreviewUpdate, 200)
	}
}

function reloadPreview() {
	if (previewIframe.value) {
		previewIframe.value.src = previewUrl.value
	}
}

function onSlugInput(val: string) {
	pageForm.slug = val.replace(/[^a-zA-Z0-9-_]/g, '').toLowerCase()
}

// Sync blocks from frontend
async function syncBlocksFromClient() {
	if (!clientManifest.value.length) {
		ElMessage.warning('Манифест компонентов с фронтенда ещё не получен')
		return
	}
	syncingBlocks.value = true
	try {
		const res = await pagesApi.syncBlockTypes(clientManifest.value)
		if (res.data) {
			blockTypes.value = res.data
			ElMessage.success(`Синхронизировано ${res.data.length} блоков из фронтенда!`)
		}
	} catch (err: any) {
		ElMessage.error(err.message || 'Ошибка синхронизации блоков')
	} finally {
		syncingBlocks.value = false
	}
}

// Save Page
async function handleSave() {
	if (!pageForm.title) {
		ElMessage.warning('Введите название страницы')
		return
	}
	if (!pageForm.slug) {
		ElMessage.warning('Введите slug страницы')
		return
	}

	saving.value = true
	try {
		const payload = {
			title: pageForm.title,
			slug: pageForm.slug,
			status: pageForm.status,
			parent_id: pageForm.parent_id || null,
			clear_parent: !pageForm.parent_id,
			published_at: pageForm.status === 'published' ? (pageForm.published_at || new Date().toISOString()) : (pageForm.published_at || undefined),
			published_by: pageForm.published_by || undefined,
			blocks: pageForm.blocks,
			seo: pageForm.seo,
		}

		if (isEdit.value) {
			await pagesApi.updatePage(pageId.value, payload)
			ElMessage.success('Страница успешно обновлена')
		} else {
			const res = await pagesApi.createPage(payload)
			ElMessage.success('Страница успешно создана')
			if (res.data?.id) {
				router.replace({ name: 'PageEdit', params: { id: res.data.id } })
			}
		}
	} catch (err: any) {
		ElMessage.error(err.message || 'Ошибка сохранения страницы')
	} finally {
		saving.value = false
	}
}

function formatDate(dateStr?: string): string {
	if (!dateStr) return ''
	try {
		const d = new Date(dateStr)
		return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
	} catch {
		return dateStr
	}
}

// Drag-and-drop direct media upload (Stage 4.1)
const isMediaDragActive = ref(false)
const isUploadingMedia = ref(false)

function onMediaDragEnter(e: DragEvent) {
	if (e.dataTransfer?.types.includes('Files')) {
		isMediaDragActive.value = true
	}
}

function onMediaDragOver(e: DragEvent) {
	if (e.dataTransfer?.types.includes('Files')) {
		e.dataTransfer.dropEffect = 'copy'
		isMediaDragActive.value = true
	}
}

function onMediaDragLeave(e: DragEvent) {
	const rect = (e.currentTarget as HTMLElement)?.getBoundingClientRect?.()
	if (!rect) {
		isMediaDragActive.value = false
		return
	}
	if (
		e.clientX <= rect.left ||
		e.clientX >= rect.right ||
		e.clientY <= rect.top ||
		e.clientY >= rect.bottom
	) {
		isMediaDragActive.value = false
	}
}

async function onMediaCanvasDrop(e: DragEvent) {
	isMediaDragActive.value = false
	const files = e.dataTransfer?.files
	if (!files || files.length === 0) return

	for (let i = 0; i < files.length; i++) {
		await handleDirectMediaUpload(files[i])
	}
}

async function handleDirectMediaUpload(file: File, targetBlockIndex?: number) {
	isUploadingMedia.value = true
	const loadingMsg = ElMessage.info({
		message: `Загрузка медиа «${file.name}»...`,
		duration: 0,
	})

	try {
		const result = await uploadMedia(file)
		if (!result || !result.url) {
			throw new Error('Не удалось получить URL загруженного файла')
		}

		const isVideo = file.type.startsWith('video/') || /\.(mp4|webm|ogg|mov)$/i.test(file.name)

		if (targetBlockIndex !== undefined && targetBlockIndex !== null && pageForm.blocks[targetBlockIndex]) {
			const b = pageForm.blocks[targetBlockIndex]
			if (isVideo) {
				b.data.video_url = result.url
			} else {
				if ('image' in b.data) b.data.image = result.url
				else if ('poster_url' in b.data) b.data.poster_url = result.url
				else {
					if (!b.style) b.style = {}
					b.style.backgroundImage = result.url
				}
			}
			ElMessage.success(`Медиа «${file.name}» успешно обновлено в блоке!`)
		} else {
			if (isVideo) {
				const newBlock: PageBlock = {
					id: `video-${Date.now()}`,
					type: 'video_embed',
					data: {
						title: file.name.replace(/\.[^/.]+$/, ''),
						video_url: result.url,
						aspect_ratio: '16/9',
					},
					style: { theme: 'light', padding: 'md', margin: 'none' },
				}
				pageForm.blocks.push(newBlock)
				selectedBlockIndex.value = pageForm.blocks.length - 1
			} else {
				const newBlock: PageBlock = {
					id: `hero-${Date.now()}`,
					type: 'hero',
					data: {
						title: file.name.replace(/\.[^/.]+$/, ''),
						subtitle: 'Блок с загруженным изображением',
						image: result.url,
					},
					style: { theme: 'light', padding: 'md', margin: 'none' },
				}
				pageForm.blocks.push(newBlock)
				selectedBlockIndex.value = pageForm.blocks.length - 1
			}
			activeInspectorTab.value = 'block'
			ElMessage.success(`Медиа «${file.name}» загружено и добавлен новый блок!`)
		}
	} catch (err: any) {
		ElMessage.error(`Ошибка загрузки: ${err?.message || err}`)
	} finally {
		loadingMsg.close()
		isUploadingMedia.value = false
	}
}

async function onBgImageDrop(e: DragEvent) {
	const files = e.dataTransfer?.files
	if (files && files.length > 0) {
		await handleDirectMediaUpload(files[0], selectedBlockIndex.value ?? undefined)
	}
}

async function onBgImageSelected(file: any) {
	if (file.raw) {
		await handleDirectMediaUpload(file.raw, selectedBlockIndex.value ?? undefined)
	}
}

function goBack() {
	router.push({ name: 'PageList' })
}
</script>

<style scoped>
.canvas-scroll-area {
	position: relative;
}

.is-media-drag-active {
	outline: 2px dashed var(--color-primary, #3b82f6);
	outline-offset: -2px;
}

.media-drag-overlay {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(59, 130, 246, 0.12);
	backdrop-filter: blur(4px);
	z-index: 50;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 12px;
	pointer-events: none;
}

.media-drag-hint {
	background: var(--bg-surface, #ffffff);
	padding: 24px 32px;
	border-radius: 16px;
	border: 1px solid var(--border-color, #e2e8f0);
	box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
	text-align: center;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 8px;
}

.media-drag-icon {
	font-size: 36px;
}

.bg-image-upload-row {
	width: 100%;
}

.page-constructor {
	display: flex;
	flex-direction: column;
	height: calc(100vh - var(--gp-header-height, 64px));
	margin: -24px;
	background: var(--bg-page, transparent);
	color: var(--text-primary);
	overflow: hidden;
}

/* Header */
.constructor-header {
	height: 60px;
	padding: 0 24px;
	background: var(--bg-card);
	border-bottom: 1px solid var(--border-color);
	display: flex;
	justify-content: space-between;
	align-items: center;
	gap: 20px;
	flex-shrink: 0;
	backdrop-filter: blur(12px);
}

.header-left {
	display: flex;
	align-items: center;
	gap: 16px;
	flex-grow: 1;
}

.header-left :deep(.el-button) {
	color: var(--text-primary);
}

.page-meta-inputs {
	display: flex;
	align-items: center;
	gap: 12px;
	flex-grow: 1;
	max-width: 600px;
}

.title-input {
	font-weight: 600;
}

.slug-input-wrapper {
	display: flex;
	align-items: center;
	background: var(--bg-surface);
	border: 1px solid var(--border-color);
	border-radius: 8px;
	padding: 0 10px;
	transition: border-color 0.2s ease;
}

.slug-input-wrapper:focus-within {
	border-color: var(--gp-primary);
}

.slug-prefix {
	font-size: 13px;
	color: var(--text-muted);
	font-family: monospace;
	font-weight: 600;
}

.slug-input :deep(.el-input__wrapper) {
	box-shadow: none !important;
	background: transparent !important;
	padding: 0 6px;
}

.slug-input :deep(.el-input__inner) {
	color: var(--text-primary) !important;
	font-family: monospace;
}

.header-actions {
	display: flex;
	align-items: center;
	gap: 10px;
}

/* Workflow Status Bar */
.workflow-status-bar {
	display: flex;
	align-items: center;
	gap: 8px;
}

.status-tag {
	font-weight: 600;
	font-size: 11px;
}

/* 3-Column Body */
.constructor-body {
	display: flex;
	flex-grow: 1;
	overflow: hidden;
}

/* 1. Palette */
.palette-panel {
	width: 300px;
	background: var(--bg-card);
	border-right: 1px solid var(--border-color);
	display: flex;
	flex-direction: column;
	flex-shrink: 0;
}

.palette-tabs {
	display: flex;
	border-bottom: 1px solid var(--border-color);
	background: var(--bg-surface);
}

.palette-tab-btn {
	flex: 1;
	padding: 12px;
	background: transparent;
	border: none;
	border-bottom: 2px solid transparent;
	font-weight: 600;
	font-size: 12px;
	color: var(--text-muted);
	cursor: pointer;
	transition: all 0.2s ease;
}

.palette-tab-btn.is-active {
	color: #6366f1;
	border-bottom-color: #6366f1;
	background: var(--bg-card);
}

/* Palette Quick Add */
.palette-quick-add {
	padding: 12px 14px;
	border-bottom: 1px solid var(--border-color);
	background: var(--bg-surface);
}

.quick-add-btn {
	width: 100%;
	display: flex;
	align-items: center;
	gap: 10px;
	padding: 9px 12px;
	background: rgba(99, 102, 241, 0.08);
	border: 1px dashed rgba(99, 102, 241, 0.4);
	border-radius: 10px;
	cursor: pointer;
	text-align: left;
	transition: all 0.2s ease;
}

.quick-add-btn:hover {
	background: rgba(99, 102, 241, 0.16);
	border-color: #6366f1;
	transform: translateY(-1px);
}

.quick-add-icon {
	font-size: 20px;
}

.quick-add-text {
	flex-grow: 1;
	display: flex;
	flex-direction: column;
}

.quick-add-text strong {
	font-size: 12px;
	color: var(--text-primary);
}

.quick-add-text small {
	font-size: 10px;
	color: var(--text-muted);
}

.quick-add-plus {
	font-size: 16px;
	font-weight: 700;
	color: #6366f1;
}

.wireframe-pill {
	font-size: 10px;
	font-weight: 600;
	color: #6366f1;
	background: rgba(99, 102, 241, 0.12);
	padding: 2px 6px;
	border-radius: 4px;
}

.style-pill {
	font-size: 10px;
	font-weight: 600;
	color: #10b981;
	background: rgba(16, 185, 129, 0.12);
	padding: 2px 6px;
	border-radius: 4px;
}

.palette-search {
	padding: 10px 14px;
	border-bottom: 1px solid var(--border-color);
}

.palette-list {
	flex-grow: 1;
	overflow-y: auto;
	padding: 10px;
	display: flex;
	flex-direction: column;
	gap: 6px;
}

.palette-item {
	display: flex;
	align-items: center;
	gap: 12px;
	padding: 10px 12px;
	background: var(--bg-surface);
	border: 1px solid var(--border-color);
	border-radius: 8px;
	cursor: pointer;
	transition: all 0.15s ease;
}

.palette-item:hover {
	border-color: var(--gp-primary);
	transform: translateY(-1px);
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.palette-item__icon {
	font-size: 20px;
	flex-shrink: 0;
}

.palette-item__info {
	flex-grow: 1;
	min-width: 0;
}

.palette-item__name {
	font-weight: 600;
	font-size: 13px;
	color: var(--text-primary);
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.palette-item__desc {
	font-size: 11px;
	color: var(--text-muted);
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.palette-item__add {
	flex-shrink: 0;
}

.palette-sync-box {
	padding: 12px 14px;
	border-top: 1px solid var(--border-color);
	background: var(--bg-surface);
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.sync-info {
	font-size: 11px;
	color: var(--text-muted);
	display: flex;
	align-items: center;
	gap: 6px;
}

/* Presets List (Stage 2.4) */
.presets-container {
	flex-grow: 1;
	overflow-y: auto;
	display: flex;
	flex-direction: column;
}

.presets-header-info {
	padding: 10px 14px;
	font-size: 11px;
	color: var(--text-muted);
	border-bottom: 1px solid var(--border-color);
	background: rgba(0, 0, 0, 0.01);
}

.presets-empty {
	padding: 30px 20px;
	text-align: center;
	color: var(--text-muted);
}

.presets-empty-icon {
	font-size: 32px;
	margin-bottom: 10px;
	opacity: 0.5;
}

.presets-list {
	padding: 10px;
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.preset-item-card {
	padding: 10px 12px;
	background: var(--bg-surface);
	border: 1px solid var(--border-color);
	border-radius: 8px;
	cursor: pointer;
	transition: all 0.2s ease;
}

.preset-item-card:hover {
	border-color: #6366f1;
	box-shadow: 0 2px 8px rgba(99, 102, 241, 0.1);
}

.preset-card__header {
	display: flex;
	align-items: center;
	gap: 8px;
}

.preset-card__icon {
	font-size: 18px;
}

.preset-card__info {
	flex-grow: 1;
	min-width: 0;
	display: flex;
	flex-direction: column;
}

.preset-card__info strong {
	font-size: 12px;
	color: var(--text-primary);
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.preset-type-badge {
	font-size: 10px;
	color: var(--text-muted);
}

.preset-card__footer {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-top: 8px;
	padding-top: 6px;
	border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.preset-date {
	font-size: 10px;
	color: var(--text-muted);
}

/* 2. Center Canvas */
.canvas-panel {
	flex-grow: 1;
	display: flex;
	flex-direction: column;
	background: var(--bg-surface);
	position: relative;
	overflow: hidden;
}

.canvas-panel.with-preview {
	display: grid;
	grid-template-columns: 1fr 1fr;
}

.canvas-scroll-area {
	overflow-y: auto;
	padding: 20px;
	flex-grow: 1;
	display: flex;
	flex-direction: column;
	gap: 16px;
}

.canvas-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding-bottom: 8px;
	border-bottom: 1px solid var(--border-color);
}

.canvas-title {
	display: flex;
	align-items: center;
	gap: 10px;
	font-size: 14px;
	font-weight: 600;
}

.canvas-actions {
	display: flex;
	align-items: center;
	gap: 8px;
}

.canvas-empty {
	margin: auto 0;
	padding: 40px 20px;
	text-align: center;
	border: 2px dashed var(--border-color);
	border-radius: 12px;
	background: var(--bg-card);
}

.canvas-empty__icon {
	font-size: 48px;
	margin-bottom: 12px;
}

.canvas-empty h4 {
	margin: 0 0 8px 0;
	font-size: 16px;
	font-weight: 600;
}

.canvas-empty p {
	margin: 0 0 20px 0;
	color: var(--text-muted);
	font-size: 13px;
}

.canvas-empty__btns {
	display: flex;
	justify-content: center;
	gap: 12px;
}

.canvas-blocks {
	display: flex;
	flex-direction: column;
	gap: 10px;
}

.canvas-block-card {
	display: flex;
	align-items: center;
	gap: 12px;
	padding: 12px 16px;
	background: var(--bg-card);
	border: 1px solid var(--border-color);
	border-radius: 10px;
	cursor: pointer;
	transition: all 0.15s ease;
	position: relative;
}

.canvas-block-card:hover {
	border-color: #6366f1;
	box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.canvas-block-card.is-selected {
	border-color: #6366f1;
	box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
	background: rgba(99, 102, 241, 0.02);
}

.canvas-block-card.is-drag-over {
	border-top: 2px solid #6366f1;
}

.block-card__handle {
	font-size: 16px;
	color: var(--text-muted);
	cursor: grab;
	user-select: none;
}

.block-card__icon {
	font-size: 22px;
	flex-shrink: 0;
}

.block-card__details {
	flex-grow: 1;
	min-width: 0;
}

.block-card__name {
	display: flex;
	align-items: center;
	gap: 8px;
	font-size: 14px;
	color: var(--text-primary);
}

.block-card__slug {
	font-size: 11px;
	color: var(--text-muted);
}

.selected-pill {
	font-size: 10px;
	background: #6366f1;
	color: #fff;
	padding: 1px 6px;
	border-radius: 10px;
}

.block-card__summary {
	font-size: 12px;
	color: var(--text-muted);
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	margin-top: 2px;
}

.block-card__controls {
	display: flex;
	align-items: center;
	gap: 4px;
}

/* Split Preview Frame (Stage 1.9 Multi-device Responsive Controls) */
.preview-split-frame {
	border-left: 1px solid var(--border-color);
	display: flex;
	flex-direction: column;
	background: #0f1117;
	height: 100%;
	min-width: 340px;
	overflow: hidden;
}

.preview-frame-header {
	height: 42px;
	padding: 0 12px;
	background: var(--bg-card);
	border-bottom: 1px solid var(--border-color);
	display: flex;
	justify-content: space-between;
	align-items: center;
	font-size: 12px;
	color: var(--text-muted);
	gap: 8px;
	flex-shrink: 0;
	z-index: 2;
}

.preview-frame-header__info {
	display: flex;
	align-items: center;
	gap: 6px;
	font-size: 11px;
}

.preview-live-badge {
	color: #10b981;
	font-weight: 800;
	font-size: 10px;
	letter-spacing: 0.5px;
}

.preview-frame-title {
	font-family: monospace;
	color: var(--text-main);
	font-weight: 500;
}

.preview-device-controls {
	display: flex;
	align-items: center;
	gap: 3px;
	background: rgba(0, 0, 0, 0.04);
	padding: 2px 4px;
	border-radius: 8px;
	border: 1px solid var(--border-color);
}

.preview-device-btn {
	display: flex;
	align-items: center;
	gap: 4px;
	padding: 3px 8px;
	border-radius: 6px;
	border: none;
	background: transparent;
	color: var(--text-muted);
	font-size: 11px;
	cursor: pointer;
	font-weight: 500;
	transition: all 0.2s;

	&:hover {
		color: var(--text-main);
		background: rgba(0, 0, 0, 0.05);
	}

	&.is-active {
		background: #6366f1;
		color: #ffffff;
		box-shadow: 0 2px 4px rgba(99, 102, 241, 0.25);
	}
}

.preview-panel__viewport {
	flex: 1;
	overflow: auto;
	background: #0f1117;
	display: flex;
	align-items: flex-start;
	justify-content: center;
	padding: 0;
	transition: all 0.3s ease;
	position: relative;

	&.is-desktop {
		background: #ffffff;
		padding: 0;

		.preview-iframe {
			width: 100%;
			height: 100%;
			border: none;
			border-radius: 0;
			box-shadow: none;
		}
	}

	&.is-tablet {
		padding: 20px 16px;

		.preview-iframe {
			width: 768px;
			max-width: 100%;
			height: calc(100% - 10px);
			min-height: 680px;
			border-radius: 20px;
			border: 8px solid #2d3748;
			box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
		}
	}

	&.is-mobile {
		padding: 20px 16px;

		.preview-iframe {
			width: 375px;
			max-width: 100%;
			height: calc(100% - 10px);
			min-height: 667px;
			border-radius: 32px;
			border: 10px solid #2d3748;
			box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
		}
	}
}

.preview-iframe {
	width: 100%;
	height: 100%;
	background: #fff;
	display: block;
	transition: all 0.3s ease;
}

/* 3. Right Inspector */
.inspector-panel {
	width: 380px;
	background: var(--bg-card);
	border-left: 1px solid var(--border-color);
	display: flex;
	flex-direction: column;
	flex-shrink: 0;
}

.inspector-nav-tabs {
	display: flex;
	border-bottom: 1px solid var(--border-color);
	background: var(--bg-surface);
}

.inspector-nav-tab {
	flex: 1;
	padding: 12px;
	background: transparent;
	border: none;
	border-bottom: 2px solid transparent;
	font-weight: 600;
	font-size: 13px;
	color: var(--text-muted);
	cursor: pointer;
	transition: all 0.2s ease;
}

.inspector-nav-tab.is-active {
	color: #6366f1;
	border-bottom-color: #6366f1;
	background: var(--bg-card);
}

.inspector-tab-pane {
	flex-grow: 1;
	overflow-y: auto;
	display: flex;
	flex-direction: column;
}

.inspector-content {
	padding: 16px;
	display: flex;
	flex-direction: column;
	gap: 16px;
}

.inspector-header {
	display: flex;
	align-items: center;
	gap: 12px;
	padding-bottom: 12px;
	border-bottom: 1px solid var(--border-color);
}

.inspector-icon {
	font-size: 28px;
}

.inspector-header__info {
	flex-grow: 1;
}

.inspector-header__info h3 {
	margin: 0;
	font-size: 15px;
	font-weight: 600;
}

.inspector-type-row {
	display: flex;
	align-items: center;
	gap: 6px;
	margin-top: 2px;
}

.inspector-type {
	font-size: 11px;
	color: var(--text-muted);
}

.inspector-swap-bar {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 8px 12px;
	background: var(--bg-surface);
	border-radius: 8px;
	border: 1px solid var(--border-color);
}

.swap-bar-label {
	font-size: 12px;
	font-weight: 600;
}

.swap-bar-hint {
	display: block;
	font-size: 10px;
	color: var(--text-muted);
}

.swap-bar-select {
	width: 170px;
}

/* Sub-tabs inside block inspector (Stage 2.3) */
.inspector-sub-tabs {
	display: flex;
	gap: 4px;
	background: var(--bg-surface);
	padding: 3px;
	border-radius: 8px;
	border: 1px solid var(--border-color);
}

.sub-tab-btn {
	flex: 1;
	padding: 6px 10px;
	border: none;
	border-radius: 6px;
	background: transparent;
	font-size: 12px;
	font-weight: 600;
	color: var(--text-muted);
	cursor: pointer;
	transition: all 0.15s ease;
}

.sub-tab-btn.is-active {
	background: var(--bg-card);
	color: #6366f1;
	box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.sub-tab-pane {
	display: flex;
	flex-direction: column;
	gap: 14px;
}

/* Styling Pane (Stage 2.3) */
.styling-pane {
	display: flex;
	flex-direction: column;
	gap: 16px;
}

.styling-section {
	display: flex;
	flex-direction: column;
	gap: 8px;
	padding: 12px;
	background: var(--bg-surface);
	border-radius: 8px;
	border: 1px solid var(--border-color);
}

.styling-label {
	font-size: 12px;
	font-weight: 600;
	color: var(--text-primary);
}

.theme-selector-grid {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 6px;
}

.theme-card {
	padding: 8px 10px;
	border-radius: 6px;
	border: 1px solid var(--border-color);
	font-size: 12px;
	font-weight: 500;
	cursor: pointer;
	text-align: center;
	transition: all 0.15s ease;
}

.theme-card.theme-light {
	background: #ffffff;
	color: #1e293b;
}

.theme-card.theme-dark {
	background: #0f172a;
	color: #f8fafc;
	border-color: #334155;
}

.theme-card.theme-accent {
	background: #6366f1;
	color: #ffffff;
}

.theme-card.theme-muted {
	background: #f1f5f9;
	color: #475569;
}

.theme-card.theme-transparent {
	background: transparent;
	color: var(--text-primary);
}

.theme-card.is-active {
	box-shadow: 0 0 0 2px #6366f1;
	font-weight: 700;
}

.spacing-radio-group {
	width: 100%;
}

.spacing-radio-group :deep(.el-radio-button) {
	flex: 1;
}

.spacing-radio-group :deep(.el-radio-button__inner) {
	width: 100%;
}

.color-picker-row {
	display: flex;
	align-items: center;
	gap: 10px;
}

.gradient-presets-chips {
	display: flex;
	align-items: center;
	gap: 8px;
	flex-wrap: wrap;
}

.grad-chip {
	width: 24px;
	height: 24px;
	border-radius: 6px;
	cursor: pointer;
	border: 1px solid rgba(0, 0, 0, 0.15);
	transition: transform 0.15s ease;
}

.grad-chip:hover {
	transform: scale(1.15);
}

.published-time-hint {
	font-size: 11px;
	color: var(--text-muted);
	margin-top: 4px;
}

.inspector-guide {
	padding: 30px 20px;
	text-align: center;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 12px;
	color: var(--text-muted);
}

.guide-icon {
	font-size: 36px;
}

.guide-desc {
	font-size: 13px;
	line-height: 1.5;
	margin: 0;
}

.guide-steps-list {
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: 10px;
	text-align: left;
	margin-top: 10px;
}

.guide-step-item {
	display: flex;
	align-items: center;
	gap: 10px;
	background: var(--bg-surface);
	padding: 8px 12px;
	border-radius: 8px;
	font-size: 12px;
}

.step-num {
	width: 20px;
	height: 20px;
	background: #6366f1;
	color: #fff;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 11px;
	font-weight: 700;
	flex-shrink: 0;
}

.guide-action {
	width: 100%;
	margin-top: 10px;
}

.inspector-page-settings {
	padding: 16px;
}

.seo-label-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	width: 100%;
}

.seo-field-hint {
	font-size: 11px;
	color: #6b7280;
	margin-top: 4px;
	line-height: 1.4;
}

.serp-preview-section {
	background: #f9fafb;
	border: 1px solid #e5e7eb;
	border-radius: 12px;
	padding: 16px;
	margin: 16px 0;
}

.serp-preview-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 12px;
}

.serp-preview-title {
	font-size: 12px;
	font-weight: 700;
	text-transform: uppercase;
	letter-spacing: 0.5px;
	color: #6b7280;
}

.google-snippet-card {
	background: #ffffff;
	border: 1px solid #dfe1e5;
	border-radius: 10px;
	padding: 14px 16px;
	font-family: Arial, sans-serif;
	text-align: left;
	box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.google-snippet-topbar {
	display: flex;
	align-items: center;
	gap: 10px;
	margin-bottom: 6px;
}

.google-favicon {
	width: 22px;
	height: 22px;
	border-radius: 50%;
	background: #4285f4;
	color: #ffffff;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 12px;
	font-weight: bold;
}

.google-site-info {
	display: flex;
	flex-direction: column;
	font-size: 12px;
	line-height: 1.3;
}

.google-site-name {
	color: #202124;
	font-weight: 500;
}

.google-snippet-url {
	color: #4d5156;
	font-size: 11px;
}

.google-snippet-title {
	color: #1a0dab;
	font-size: 18px;
	line-height: 1.3;
	font-weight: 400;
	cursor: pointer;
	margin-bottom: 4px;
	word-break: break-word;
}

.google-snippet-title:hover {
	text-decoration: underline;
}

.google-snippet-desc {
	color: #4d5156;
	font-size: 13px;
	line-height: 1.5;
	word-break: break-word;
}

.social-snippet-card {
	background: #ffffff;
	border: 1px solid #dfe1e5;
	border-radius: 10px;
	overflow: hidden;
	box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.social-snippet-thumb {
	height: 130px;
	background: #f3f4f6;
	display: flex;
	align-items: center;
	justify-content: center;
	color: #9ca3af;
	font-size: 13px;
}

.social-snippet-body {
	padding: 12px 14px;
}

.social-snippet-domain {
	font-size: 10px;
	font-weight: 700;
	color: #9ca3af;
	letter-spacing: 0.5px;
	margin-bottom: 4px;
}

.social-snippet-title {
	font-size: 15px;
	font-weight: 700;
	color: #111827;
	margin-bottom: 4px;
	line-height: 1.3;
}

.social-snippet-desc {
	font-size: 12px;
	color: #4b5563;
	line-height: 1.4;
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
	overflow: hidden;
}

.sitemap-info-box {
	display: flex;
	align-items: center;
	gap: 12px;
	background: rgba(16, 185, 129, 0.06);
	border: 1px solid rgba(16, 185, 129, 0.25);
	border-radius: 8px;
	padding: 12px 14px;
	margin-top: 14px;
}

.sitemap-info-icon {
	font-size: 24px;
	flex-shrink: 0;
}

.sitemap-info-text {
	flex: 1;
	font-size: 12px;
	line-height: 1.4;
	color: #111827;
}

.sitemap-info-text p {
	margin: 2px 0 0;
	color: #6b7280;
}
</style>

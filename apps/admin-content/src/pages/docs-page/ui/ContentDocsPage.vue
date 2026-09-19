<template>
	<div class="content-docs-page">
		<!-- Header -->
		<div class="docs-header glass-card">
			<div class="docs-header__left">
				<el-button :icon="Back" plain size="small" @click="goBack">
					Назад к схемам
				</el-button>
				<div class="docs-header__title-block">
					<div class="badge-row">
						<el-tag effect="dark" size="small" type="primary">ARCHITECTURE & GUIDE</el-tag>
						<el-tag effect="plain" size="small" type="info">Headless CMS v2.0</el-tag>
					</div>
					<h1>Архитектура: Схемы, Split View & Live Preview</h1>
					<p class="docs-subtitle">
						Полное руководство по работе с контент-схемами, двухпанельным разделением и реактивным предпросмотром
					</p>
				</div>
			</div>
			<div class="docs-header__right">
				<el-button :icon="Plus" type="primary" @click="goToCreateSchema">
					Создать новую схему
				</el-button>
			</div>
		</div>

		<!-- Main Content Tabs -->
		<div class="docs-body">
			<el-tabs v-model="activeTab" class="docs-tabs glass-card">
				<!-- TAB 1: СХЕМЫ ДАННЫХ -->
				<el-tab-pane label="1. Схемы данных (Schemas)" name="schemas">
					<div class="tab-content">
						<div class="section-intro">
							<h2>Концепция динамических схем (Headless Schema Model)</h2>
							<p>
								Схема контента в Guest Place — это декларативная модель структуры данных, определяющая форму,
								типы полей, правила валидации и способ отображения сущностей без необходимости писать миграции БД на бэкенде.
							</p>
						</div>

						<div class="grid-2-col">
							<div class="info-card glass-panel">
								<div class="card-icon">🏗️</div>
								<h3>Как хранятся схемы в PostgreSQL</h3>
								<p>
									Каждая схема сохраняется в таблице <code>content_schemas</code>:
								</p>
								<ul class="styled-list">
									<li><code>id (UUID)</code> — уникальный идентификатор схемы.</li>
									<li><code>name (TEXT)</code> — человекочитаемое имя (например, «Статьи блога»).</li>
									<li><code>slug (TEXT UNIQUE)</code> — программный идентификатор (например, <code>articles</code>).</li>
									<li><code>is_singleton (BOOLEAN)</code> — флаг одиночной страницы (один экземпляр, напр. «Главная страница»).</li>
									<li><code>fields (JSONB)</code> — массив определений полей схемы.</li>
								</ul>
							</div>

							<div class="info-card glass-panel">
								<div class="card-icon">🧩</div>
								<h3>Поддерживаемые типы полей</h3>
								<div class="field-types-chips">
									<el-tag type="primary">Text</el-tag>
									<el-tag type="success">RichText (Tiptap)</el-tag>
									<el-tag type="warning">Number</el-tag>
									<el-tag type="info">Boolean</el-tag>
									<el-tag type="danger">Date</el-tag>
									<el-tag color="#8b5cf6" effect="dark">Media</el-tag>
									<el-tag color="#ec4899" effect="dark">Relation</el-tag>
									<el-tag color="#14b8a6" effect="dark">Select</el-tag>
								</div>
								<p class="mt-3 text-secondary text-sm">
									Каждое поле имеет <code>name</code> (snake_case ключ), <code>label</code> (для UI),
									флаг <code>required</code> и специфичные опции (напр., выбор коллекции для <code>Relation</code>).
								</p>
							</div>
						</div>

						<!-- Schema Structure Code Sample -->
						<div class="code-block-card glass-panel mt-4">
							<div class="code-header">
								<span>Пример структуры JSONB-схемы (PostgreSQL):</span>
								<el-tag size="small" type="info">JSONB</el-tag>
							</div>
							<pre class="code-content"><code>{
  "name": "Номера и апартаменты",
  "slug": "apartments",
  "is_singleton": false,
  "fields": [
    { "name": "title", "label": "Название номера", "fieldType": "Text", "required": true },
    { "name": "description", "label": "Описание", "fieldType": "RichText", "required": true },
    { "name": "price_per_night", "label": "Цена за ночь (₽)", "fieldType": "Number", "required": true },
    { "name": "is_available", "label": "Доступен для брони", "fieldType": "Boolean", "defaultValue": true },
    { "name": "gallery", "label": "Фотографии", "fieldType": "Media", "required": false }
  ]
}</code></pre>
						</div>
					</div>
				</el-tab-pane>

				<!-- TAB 2: SPLIT VIEW -->
				<el-tab-pane label="2. Сплит-вью (Split View)" name="split-view">
					<div class="tab-content">
						<div class="section-intro">
							<h2>Двухуровневый Split-View подход</h2>
							<p>
								В системе используются два разных независимых сплит-интерфейса: один для конструирования структуры схемы,
								а второй — для визуального наполнения контентом.
							</p>
						</div>

						<div class="comparison-cards">
							<!-- Split 1: Schema Builder -->
							<div class="split-card glass-panel">
								<div class="split-badge">УРОВЕНЬ 1</div>
								<h3>Split View в Конструкторе схем (Schema Builder)</h3>
								<p class="split-desc">
									Трехпанельный макет для сборки структуры данных без модальных окон:
								</p>
								<div class="split-visual-schema">
									<div class="col-visual col-palette">
										<strong>Палитра типов</strong>
										<span>Text, RichText, Media...</span>
									</div>
									<div class="col-arrow">➔</div>
									<div class="col-visual col-canvas">
										<strong>Канвас (DnD)</strong>
										<span>Карточки полей, drag-and-drop сортировка</span>
									</div>
									<div class="col-arrow">➔</div>
									<div class="col-visual col-inspector">
										<strong>Инспектор свойств</strong>
										<span>Label, slug, required, опции</span>
									</div>
								</div>
								<ul class="styled-list mt-3">
									<li>Левая панель: быстрый клик добавляет поле в список.</li>
									<li>Центр: визуальные карточки с индикацией ошибок и drag-ручками.</li>
									<li>Правая панель: реактивная настройка активного поля без закрытия контекста.</li>
								</ul>
							</div>

							<!-- Split 2: Content Editor -->
							<div class="split-card glass-panel">
								<div class="split-badge split-badge--live">УРОВЕНЬ 2</div>
								<h3>Split View в Редакторе контента (Live Preview Split)</h3>
								<p class="split-desc">
									Двухпанельный режим реального времени: форма редактора слева и клиентский сайт справа.
								</p>
								<div class="split-visual-content">
									<div class="col-visual col-form">
										<strong>Форма редактора</strong>
										<span>Tiptap, инпуты, медиа-пикер</span>
									</div>
									<div class="col-arrow col-arrow--bidirectional">⟷</div>
									<div class="col-visual col-preview">
										<strong>Live Viewport (Iframe)</strong>
										<span>http://localhost:3000/preview</span>
									</div>
								</div>
								<ul class="styled-list mt-3">
									<li>Кнопка <strong>«Live Preview»</strong> делит экран ровно пополам (50% / 50%).</li>
									<li>Переключатель устройств: <strong>Desktop</strong>, <strong>Tablet</strong> (768px), <strong>Mobile</strong> (375px).</li>
									<li>Кнопка открытия превью в отдельной вкладке без потери связи.</li>
								</ul>
							</div>
						</div>
					</div>
				</el-tab-pane>

				<!-- TAB 3: LIVE PREVIEW -->
				<el-tab-pane label="3. Междоменный Live Preview (postMessage)" name="live-preview">
					<div class="tab-content">
						<div class="section-intro">
							<h2>Как устроен Live Preview мост</h2>
							<p>
								Превью работает на изолированном клиентском приложении (Nuxt / Vite на порту 3000) без сохранения черновиков в базу данных.
								Обмен данными происходит через безопасный протокол HTML5 <code>postMessage</code> в оперативной памяти браузера.
							</p>
						</div>

						<!-- Diagram Step by Step -->
						<div class="protocol-timeline glass-panel">
							<h3>Протокол рукопожатия (Handshake Protocol)</h3>

							<div class="protocol-step">
								<div class="step-num">1</div>
								<div class="step-body">
									<h4>Загрузка Iframe и сигнал готовности</h4>
									<p>
										При включении сплита монтируется <code>&lt;iframe src="http://localhost:3000/preview?schema=...&id=..."&gt;</code>.
										После инициализации страницы клиент отправляет родительскому окну сигнал:
									</p>
									<code class="code-inline">window.parent.postMessage({ type: 'PREVIEW_READY' }, '*')</code>
								</div>
							</div>

							<div class="protocol-step">
								<div class="step-num">2</div>
								<div class="step-body">
									<h4>Передача первого слепка данных</h4>
									<p>
										Админ-панель слушает событие <code>PREVIEW_READY</code> и высылает полный текущий черновик:
									</p>
									<code class="code-inline">iframe.contentWindow.postMessage({ type: 'CMS_PREVIEW_DATA', payload: { data, schema, seo } }, '*')</code>
								</div>
							</div>

							<div class="protocol-step">
								<div class="step-num">3</div>
								<div class="step-body">
									<h4>Реактивная трансляция на лету</h4>
									<p>
										Каждое нажатие клавиши в форме отслеживается через <code>watch(() => ({ ...formData }), ..., { deep: true })</code>.
										Измененные значения мгновенно пушатся в iframe. На клиенте загорается индикатор <em>«Updated HH:MM:SS»</em>.
									</p>
								</div>
							</div>

							<div class="protocol-step">
								<div class="step-num">4</div>
								<div class="step-body">
									<h4>Автономный Fallback для новой вкладки</h4>
									<p>
										Если пользователь открывает превью в отдельной вкладке без opener, клиент через 1.2 сек автоматически делает fallback-запрос к API
										<code>/api/v1/content/schemas/{slug}</code> и <code>/api/v1/content/entries/{id}</code>, чтобы страница не висела вечно.
									</p>
								</div>
							</div>
						</div>
					</div>
				</el-tab-pane>

				<!-- TAB 4: ЧАСТЫЕ ПРОБЛЕМЫ И РЕШЕНИЯ -->
				<el-tab-pane label="4. Устранение неполадок (Troubleshooting)" name="troubleshooting">
					<div class="tab-content">
						<div class="section-intro">
							<h2>Почему что-то могло работать криво или не работать?</h2>
							<p>Разбор типичных ситуаций и как они исправлены в кодовой базе.</p>
						</div>

						<div class="faq-accordion">
							<el-collapse accordion>
								<el-collapse-item name="1" title="1. В превью висит «Waiting for preview data» бесконечно">
									<div class="faq-answer">
										<p><strong>Причина:</strong> Несовпадение origin при <code>postMessage</code> (например, <code>localhost</code> vs <code>127.0.0.1</code>) или окно открыто в новой вкладке без родительского окна (<code>window.opener</code> отсутствует).</p>
										<p><strong>Исправление:</strong></p>
										<ul>
											<li>Использован безопасный широковещательный таргет <code>'*'</code> для превью-сообщений.</li>
											<li>Добавлен fallback: клиент ожидает сообщение, и если его нет, подгружает сохраненные данные напрямую из бэкенда через <code>/api/v1/content</code>.</li>
										</ul>
									</div>
								</el-collapse-item>

								<el-collapse-item name="2" title="2. После docker-compose down -v пропали все схемы и записи">
									<div class="faq-answer">
										<p><strong>Причина:</strong> Команда <code>docker-compose down -v</code> удаляет volume базы данных PostgreSQL. Таблицы пересоздаются миграциями, но без начального наполнения они пустые.</p>
										<p><strong>Решение:</strong> Создайте новую схему через кнопку <strong>«Create Schema»</strong> на главной странице контента, либо воспользуйтесь сидером тестовых данных.</p>
									</div>
								</el-collapse-item>

								<el-collapse-item name="3" title="3. Iframe не загружается (Connection Refused на порту 3000)">
									<div class="faq-answer">
										<p><strong>Причина:</strong> Клиентское приложение гостевого сайта (Nuxt в папке <code>client</code>) не запущено.</p>
										<p><strong>Решение:</strong> Запустите клиент командой <code>pnpm dev</code> в папке <code>client</code>. Сервер запустится на <code>http://localhost:3000</code>.</p>
									</div>
								</el-collapse-item>

								<el-collapse-item name="4" title="4. Поле RichText или Media не рендерится в превью">
									<div class="faq-answer">
										<p><strong>Причина:</strong> RichText сохраняет HTML, а Media сохраняет путь к файлу. Если клиентский код ожидал обычный текст, он экранировался.</p>
										<p><strong>Решение:</strong> В превью используется <code>v-html</code> для полей с <code>fieldType === 'RichText'</code> и компонент <code>img</code> с резолвером медиа-URL для <code>fieldType === 'Media'</code>.</p>
									</div>
								</el-collapse-item>
							</el-collapse>
						</div>
					</div>
				</el-tab-pane>
			</el-tabs>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import { Back, Plus } from '@element-plus/icons-vue'

const router = useRouter()
const activeTab = ref('schemas')

const goBack = () => {
	router.push('/content')
}

const goToCreateSchema = () => {
	router.push({ path: '/content', query: { create: 'true' } })
}
</script>

<style scoped lang="scss">
.content-docs-page {
	padding: 0;
	color: var(--gp-text-main, #fff);
}

.docs-header {
	display: flex;
	align-items: flex-start;
	justify-content: space-between;
	padding: 24px;
	border-radius: 14px;
	margin-bottom: 24px;
	gap: 16px;
	flex-wrap: wrap;

	&__left {
		display: flex;
		align-items: flex-start;
		gap: 16px;
	}

	&__title-block {
		display: flex;
		flex-direction: column;

		h1 {
			font-size: 1.6rem;
			font-weight: 700;
			margin: 8px 0 4px;
			letter-spacing: -0.3px;
		}

		.docs-subtitle {
			font-size: 0.9rem;
			color: var(--gp-text-secondary, #a0aec0);
			margin: 0;
		}
	}
}

.badge-row {
	display: flex;
	gap: 8px;
}

.docs-body {
	width: 100%;
}

.docs-tabs {
	padding: 20px 24px;
	border-radius: 14px;
}

.tab-content {
	padding: 16px 0;
}

.section-intro {
	margin-bottom: 24px;

	h2 {
		font-size: 1.35rem;
		font-weight: 600;
		margin: 0 0 8px;
	}

	p {
		font-size: 0.95rem;
		line-height: 1.6;
		color: var(--gp-text-secondary, #a0aec0);
		margin: 0;
	}
}

.grid-2-col {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
	gap: 20px;
}

.info-card {
	padding: 20px;
	border-radius: 12px;
	border: 1px solid rgba(255, 255, 255, 0.08);
	background: rgba(255, 255, 255, 0.02);

	.card-icon {
		font-size: 28px;
		margin-bottom: 12px;
	}

	h3 {
		font-size: 1.1rem;
		font-weight: 600;
		margin: 0 0 10px;
	}

	p {
		font-size: 0.88rem;
		color: var(--gp-text-secondary, #a0aec0);
		line-height: 1.5;
	}
}

.styled-list {
	margin: 12px 0 0;
	padding-left: 20px;
	color: var(--gp-text-secondary, #a0aec0);
	font-size: 0.85rem;
	line-height: 1.6;

	li {
		margin-bottom: 6px;
	}

	code {
		color: var(--gp-primary, #42b883);
		background: rgba(66, 184, 131, 0.1);
		padding: 2px 6px;
		border-radius: 4px;
		font-family: monospace;
	}
}

.field-types-chips {
	display: flex;
	flex-wrap: wrap;
	gap: 6px;
	margin-top: 10px;
}

.code-block-card {
	padding: 20px;
	border-radius: 12px;
	border: 1px solid rgba(255, 255, 255, 0.08);
	background: rgba(0, 0, 0, 0.3);

	.code-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 12px;
		font-weight: 500;
		font-size: 0.85rem;
		color: var(--gp-text-secondary, #a0aec0);
	}

	.code-content {
		margin: 0;
		background: transparent;
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.8rem;
		color: #e2e8f0;
		line-height: 1.5;
		overflow-x: auto;
	}
}

/* Comparison Cards */
.comparison-cards {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
	gap: 20px;
}

.split-card {
	position: relative;
	padding: 24px;
	border-radius: 12px;
	border: 1px solid rgba(255, 255, 255, 0.08);
	background: rgba(255, 255, 255, 0.02);

	.split-badge {
		position: absolute;
		top: 16px;
		right: 16px;
		font-size: 0.7rem;
		font-weight: 700;
		padding: 3px 8px;
		border-radius: 6px;
		background: rgba(100, 108, 255, 0.2);
		color: #646cff;

		&--live {
			background: rgba(66, 184, 131, 0.2);
			color: var(--gp-primary, #42b883);
		}
	}

	h3 {
		font-size: 1.15rem;
		font-weight: 600;
		margin: 0 0 8px;
		padding-right: 70px;
	}

	.split-desc {
		font-size: 0.85rem;
		color: var(--gp-text-secondary, #a0aec0);
		margin-bottom: 16px;
	}
}

.split-visual-schema,
.split-visual-content {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 12px;
	border-radius: 8px;
	background: rgba(0, 0, 0, 0.25);
	margin-bottom: 16px;
	gap: 8px;

	.col-visual {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		padding: 8px;
		border-radius: 6px;
		border: 1px dashed rgba(255, 255, 255, 0.15);
		background: rgba(255, 255, 255, 0.02);

		strong {
			font-size: 0.75rem;
			color: var(--gp-text-main, #fff);
		}

		span {
			font-size: 0.65rem;
			color: var(--gp-text-muted, #718096);
			margin-top: 2px;
		}
	}

	.col-arrow {
		font-size: 14px;
		color: var(--gp-primary, #42b883);
	}
}

/* Protocol Timeline */
.protocol-timeline {
	padding: 24px;
	border-radius: 12px;
	border: 1px solid rgba(255, 255, 255, 0.08);
	background: rgba(0, 0, 0, 0.2);

	h3 {
		font-size: 1.15rem;
		font-weight: 600;
		margin: 0 0 20px;
	}
}

.protocol-step {
	display: flex;
	gap: 16px;
	margin-bottom: 20px;
	position: relative;

	&:last-child {
		margin-bottom: 0;
	}

	.step-num {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		background: var(--gp-primary, #42b883);
		color: #000;
		font-weight: 700;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.step-body {
		flex: 1;

		h4 {
			font-size: 0.95rem;
			font-weight: 600;
			margin: 0 0 6px;
			color: var(--gp-text-main, #fff);
		}

		p {
			font-size: 0.85rem;
			color: var(--gp-text-secondary, #a0aec0);
			margin: 0 0 8px;
			line-height: 1.5;
		}
	}
}

.code-inline {
	display: block;
	padding: 6px 10px;
	border-radius: 6px;
	background: rgba(0, 0, 0, 0.4);
	color: #646cff;
	font-family: monospace;
	font-size: 0.8rem;
	overflow-x: auto;
}

/* FAQ */
.faq-accordion {
	:deep(.el-collapse) {
		border: none;
		background: transparent;
	}

	:deep(.el-collapse-item__header) {
		font-weight: 600;
		font-size: 0.95rem;
		background: rgba(255, 255, 255, 0.02);
		border-radius: 8px;
		padding: 0 16px;
		color: var(--gp-text-main, #fff);
		border-bottom: 1px solid rgba(255, 255, 255, 0.06);
		margin-bottom: 8px;
	}

	:deep(.el-collapse-item__wrap) {
		background: transparent;
		border: none;
	}

	:deep(.el-collapse-item__content) {
		padding: 12px 16px 20px;
		color: var(--gp-text-secondary, #a0aec0);
		font-size: 0.88rem;
		line-height: 1.6;
	}
}

.faq-answer {
	strong {
		color: var(--gp-text-main, #fff);
	}

	ul {
		margin: 8px 0 0;
		padding-left: 20px;
	}

	li {
		margin-bottom: 4px;
	}
}
</style>

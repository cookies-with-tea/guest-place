<template>
	<div class="content-docs-page">
		<!-- Header -->
		<div class="docs-header glass-card">
			<div class="docs-header__left">
				<el-button :icon="Back" plain size="small" @click="goBack"> Назад к схемам </el-button>
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
				<el-button :icon="Plus" type="primary" @click="goToCreateSchema"> Создать новую схему </el-button>
			</div>
		</div>

		<!-- Main Content Tabs -->
		<div class="docs-body">
			<el-tabs v-model="activeTab" class="docs-tabs glass-card">
				<!-- TAB 0: ТРИ МОДЕЛИ КОНТЕНТА -->
				<el-tab-pane label="0. Три модели контента (Обзор)" name="overview">
					<div class="tab-content">
						<div class="section-intro">
							<h2>Почему в проекте одновременно три разные модели контента</h2>
							<p>
								На сайте есть три параллельные, независимые друг от друга системы хранения и редактирования контента. Ни
								одна из них не заменяет другую — у каждой свой сценарий использования. Этот обзор объясняет границу
								между ними, прежде чем переходить к деталям Schema Builder на следующих вкладках.
							</p>
						</div>

						<div class="comparison-cards">
							<div class="split-card glass-panel">
								<div class="split-badge">PAGECONSTRUCTOR</div>
								<h3>Блочные страницы</h3>
								<p class="split-desc">
									Визуальный конструктор страниц из палитры переиспользуемых блоков (Hero, Features, CTA, Quotes...).
									Данные — <code>PageItem</code> с массивом <code>blocks[]</code>, типы блоков приходят из
									<code>pagesApi.getBlockTypes()</code>. Роуты вида <code>/p/*</code>.
								</p>
								<ul class="styled-list mt-3">
									<li>Когда использовать: когда странице нужна гибкая, собираемая на лету композиция блоков.</li>
									<li>Не связан со схемами Schema Builder — отдельная таблица и отдельный редактор.</li>
								</ul>
							</div>

							<div class="split-card glass-panel">
								<div class="split-badge split-badge--live">SCHEMA BUILDER</div>
								<h3>Схемные страницы (Schema / Entry)</h3>
								<p class="split-desc">
									Контент описывается декларативной схемой полей (<code>ContentSchema</code>) и хранится в
									<code>ContentEntry</code> (<code>schema_id, slug, data, status</code>). Рендерится универсальным
									<code>ContentFormGenerator</code>/<code>ContentEditor</code>, независимо от конкретной схемы.
									<code>is_singleton: true</code> — страница-одиночка (например, «О платформе», «Глобальные настройки»),
									<code>false</code> — коллекция с произвольным числом записей.
								</p>
								<ul class="styled-list mt-3">
									<li
										>Когда использовать: когда у сущности простой, предсказуемый набор полей без сложной
										бизнес-логики.</li
									>
									<li>Подробности модели Schema/Entry — на вкладке «1. Схемы данных» ниже.</li>
								</ul>
							</div>

							<div class="split-card glass-panel">
								<div class="split-badge split-badge--entity">ЖЁСТКИЕ MFE</div>
								<h3>Сущности с собственной бизнес-логикой</h3>
								<p class="split-desc">
									Venues, Menus, Media, Guests, Platforms, About, Redirects — каждая это отдельное
									микрофронтенд-приложение со своей Rust/TS-моделью, фиксированным набором полей и собственной
									CRUD-вёрсткой. Схемами тут не пахнет: поля захардкожены в коде обеих сторон (сервер + клиент).
								</p>
								<ul class="styled-list mt-3">
									<li>
										Когда использовать: когда у сущности есть нетривиальная бизнес-логика (например, ценообразование и
										бронирования у Venues, статусы заявок у Guests), которую неудобно или рискованно выражать через
										generic-схему.
									</li>
									<li>Каждая такая сущность — это осознанный компромисс: больше кода, но предсказуемое поведение.</li>
								</ul>
							</div>
						</div>

						<div class="info-card glass-panel mt-4">
							<div class="card-icon">⚠️</div>
							<h3>Частый источник путаницы</h3>
							<p>
								Список страниц (<code>/content</code>) показывает блочные и схемные страницы в одной витрине —
								различаются только подписанными секциями/значком на карточке. Это две независимые системы хранения, а не
								одна. Страница «Глобальные настройки» (<code>/settings</code>) — это просто схема Schema Builder с
								зарезервированным slug'ом <code>global-settings</code>, а не отдельный системный механизм.
							</p>
						</div>
					</div>
				</el-tab-pane>

				<!-- TAB 1: СХЕМЫ ДАННЫХ -->
				<el-tab-pane label="1. Схемы данных (Schemas)" name="schemas">
					<div class="tab-content">
						<div class="section-intro">
							<h2>Концепция динамических схем (Headless Schema Model)</h2>
							<p>
								Схема контента в Guest Place — это декларативная модель структуры данных, определяющая форму, типы
								полей, правила валидации и способ отображения сущностей без необходимости писать миграции БД на бэкенде.
							</p>
						</div>

						<div class="grid-2-col">
							<div class="info-card glass-panel">
								<div class="card-icon">🏗️</div>
								<h3>Как хранятся схемы в PostgreSQL</h3>
								<p> Каждая схема сохраняется в таблице <code>content_schemas</code>: </p>
								<ul class="styled-list">
									<li><code>id (UUID)</code> — уникальный идентификатор схемы.</li>
									<li><code>name (TEXT)</code> — человекочитаемое имя (например, «Статьи блога»).</li>
									<li
										><code>slug (TEXT UNIQUE)</code> — программный идентификатор (например, <code>articles</code>).</li
									>
									<li
										><code>is_singleton (BOOLEAN)</code> — флаг одиночной страницы (один экземпляр, напр. «Главная
										страница»).</li
									>
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
									Каждое поле имеет <code>name</code> (snake_case ключ), <code>label</code> (для UI), флаг
									<code>required</code> и специфичные опции (напр., выбор коллекции для <code>Relation</code>).
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
								В системе используются два разных независимых сплит-интерфейса: один для конструирования структуры
								схемы, а второй — для визуального наполнения контентом.
							</p>
						</div>

						<div class="comparison-cards">
							<!-- Split 1: Schema Builder -->
							<div class="split-card glass-panel">
								<div class="split-badge">УРОВЕНЬ 1</div>
								<h3>Split View в Конструкторе схем (Schema Builder)</h3>
								<p class="split-desc"> Трехпанельный макет для сборки структуры данных без модальных окон: </p>
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
									<li
										>Переключатель устройств: <strong>Desktop</strong>, <strong>Tablet</strong> (768px),
										<strong>Mobile</strong> (375px).</li
									>
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
								Превью работает на изолированном клиентском приложении (Nuxt / Vite на порту 3000) без сохранения
								черновиков в базу данных. Обмен данными происходит через безопасный протокол HTML5
								<code>postMessage</code> в оперативной памяти браузера.
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
										При включении сплита монтируется
										<code>&lt;iframe src="http://localhost:3000/preview?schema=...&id=..."&gt;</code>. После
										инициализации страницы клиент отправляет родительскому окну сигнал:
									</p>
									<code class="code-inline">window.parent.postMessage({ type: 'PREVIEW_READY' }, '*')</code>
								</div>
							</div>

							<div class="protocol-step">
								<div class="step-num">2</div>
								<div class="step-body">
									<h4>Передача первого слепка данных</h4>
									<p> Админ-панель слушает событие <code>PREVIEW_READY</code> и высылает полный текущий черновик: </p>
									<code class="code-inline"
										>iframe.contentWindow.postMessage({ type: 'CMS_PREVIEW_DATA', payload: { data, schema, seo } },
										'*')</code
									>
								</div>
							</div>

							<div class="protocol-step">
								<div class="step-num">3</div>
								<div class="step-body">
									<h4>Реактивная трансляция на лету</h4>
									<p>
										Каждое нажатие клавиши в форме отслеживается через
										<code>watch(() => ({ ...formData }), ..., { deep: true })</code>. Измененные значения мгновенно
										пушатся в iframe. На клиенте загорается индикатор <em>«Updated HH:MM:SS»</em>.
									</p>
								</div>
							</div>

							<div class="protocol-step">
								<div class="step-num">4</div>
								<div class="step-body">
									<h4>Автономный Fallback для новой вкладки</h4>
									<p>
										Если пользователь открывает превью в отдельной вкладке без opener, клиент через 1.2 сек
										автоматически делает fallback-запрос к API
										<code>/api/v1/content/schemas/{slug}</code> и <code>/api/v1/content/entries/{id}</code>, чтобы
										страница не висела вечно.
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
										<p
											><strong>Причина:</strong> Несовпадение origin при <code>postMessage</code> (например,
											<code>localhost</code> vs <code>127.0.0.1</code>) или окно открыто в новой вкладке без
											родительского окна (<code>window.opener</code> отсутствует).</p
										>
										<p><strong>Исправление:</strong></p>
										<ul>
											<li>Использован безопасный широковещательный таргет <code>'*'</code> для превью-сообщений.</li>
											<li
												>Добавлен fallback: клиент ожидает сообщение, и если его нет, подгружает сохраненные данные
												напрямую из бэкенда через <code>/api/v1/content</code>.</li
											>
										</ul>
									</div>
								</el-collapse-item>

								<el-collapse-item name="2" title="2. После docker-compose down -v пропали все схемы и записи">
									<div class="faq-answer">
										<p
											><strong>Причина:</strong> Команда <code>docker-compose down -v</code> удаляет volume базы данных
											PostgreSQL. Таблицы пересоздаются миграциями, но без начального наполнения они пустые.</p
										>
										<p
											><strong>Решение:</strong> Создайте новую схему через кнопку <strong>«Create Schema»</strong> на
											главной странице контента, либо воспользуйтесь сидером тестовых данных.</p
										>
									</div>
								</el-collapse-item>

								<el-collapse-item name="3" title="3. Iframe не загружается (Connection Refused на порту 3000)">
									<div class="faq-answer">
										<p
											><strong>Причина:</strong> Клиентское приложение гостевого сайта (Nuxt в папке
											<code>client</code>) не запущено.</p
										>
										<p
											><strong>Решение:</strong> Запустите клиент командой <code>pnpm dev</code> в папке
											<code>client</code>. Сервер запустится на <code>http://localhost:3000</code>.</p
										>
									</div>
								</el-collapse-item>

								<el-collapse-item name="4" title="4. Поле RichText или Media не рендерится в превью">
									<div class="faq-answer">
										<p
											><strong>Причина:</strong> RichText сохраняет HTML, а Media сохраняет путь к файлу. Если
											клиентский код ожидал обычный текст, он экранировался.</p
										>
										<p
											><strong>Решение:</strong> В превью используется <code>v-html</code> для полей с
											<code>fieldType === 'RichText'</code> и компонент <code>img</code> с резолвером медиа-URL для
											<code>fieldType === 'Media'</code>.</p
										>
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
const activeTab = ref('overview')

const goBack = () => {
	router.push('/content')
}

const goToCreateSchema = () => {
	router.push({ path: '/content', query: { create: 'true' } })
}
</script>

<style scoped lang="scss">
.content-docs-page {
	color: var(--gp-text-main, #fff);
	padding: 0;
}

.docs-header {
	display: flex;
	flex-wrap: wrap;
	align-items: flex-start;
	justify-content: space-between;
	border-radius: 14px;
	padding: 24px;
	margin-bottom: 24px;
	gap: 16px;

	&__left {
		display: flex;
		align-items: flex-start;
		gap: 16px;
	}

	&__title-block {
		display: flex;
		flex-direction: column;

		h1 {
			font-weight: 700;
			font-size: 1.6rem;
			letter-spacing: -0.3px;
			margin: 8px 0 4px;
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
	border-radius: 14px;
	padding: 20px 24px;
}

.tab-content {
	padding: 16px 0;
}

.section-intro {
	margin-bottom: 24px;

	h2 {
		font-weight: 600;
		font-size: 1.35rem;
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
	border: 1px solid rgb(255, 255, 255, 0.08);
	border-radius: 12px;
	background: rgb(255, 255, 255, 0.02);
	padding: 20px;

	.card-icon {
		font-size: 28px;
		margin-bottom: 12px;
	}

	h3 {
		font-weight: 600;
		font-size: 1.1rem;
		margin: 0 0 10px;
	}

	p {
		font-size: 0.88rem;
		line-height: 1.5;
		color: var(--gp-text-secondary, #a0aec0);
	}
}

.styled-list {
	font-size: 0.85rem;
	line-height: 1.6;
	color: var(--gp-text-secondary, #a0aec0);
	padding-left: 20px;
	margin: 12px 0 0;

	li {
		margin-bottom: 6px;
	}

	code {
		border-radius: 4px;
		font-family: monospace;
		color: var(--gp-primary, #42b883);
		background: rgb(66, 184, 131, 0.1);
		padding: 2px 6px;
	}
}

.field-types-chips {
	display: flex;
	flex-wrap: wrap;
	margin-top: 10px;
	gap: 6px;
}

.code-block-card {
	border: 1px solid rgb(255, 255, 255, 0.08);
	border-radius: 12px;
	background: rgb(0, 0, 0, 0.3);
	padding: 20px;

	.code-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		font-weight: 500;
		font-size: 0.85rem;
		color: var(--gp-text-secondary, #a0aec0);
		margin-bottom: 12px;
	}

	.code-content {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.8rem;
		line-height: 1.5;
		color: #e2e8f0;
		background: transparent;
		margin: 0;
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
	border: 1px solid rgb(255, 255, 255, 0.08);
	border-radius: 12px;
	background: rgb(255, 255, 255, 0.02);
	padding: 24px;

	.split-badge {
		top: 16px;
		right: 16px;
		position: absolute;
		border-radius: 6px;
		font-weight: 700;
		font-size: 0.7rem;
		color: #646cff;
		background: rgb(100, 108, 255, 0.2);
		padding: 3px 8px;

		&--live {
			color: var(--gp-primary, #42b883);
			background: rgb(66, 184, 131, 0.2);
		}

		&--entity {
			color: #ec4899;
			background: rgb(236, 72, 153, 0.2);
		}
	}

	h3 {
		font-weight: 600;
		font-size: 1.15rem;
		padding-right: 70px;
		margin: 0 0 8px;
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
	border-radius: 8px;
	background: rgb(0, 0, 0, 0.25);
	padding: 12px;
	margin-bottom: 16px;
	gap: 8px;

	.col-visual {
		display: flex;
		flex: 1;
		flex-direction: column;
		align-items: center;
		border: 1px dashed rgb(255, 255, 255, 0.15);
		border-radius: 6px;
		text-align: center;
		background: rgb(255, 255, 255, 0.02);
		padding: 8px;

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
	border: 1px solid rgb(255, 255, 255, 0.08);
	border-radius: 12px;
	background: rgb(0, 0, 0, 0.2);
	padding: 24px;

	h3 {
		font-weight: 600;
		font-size: 1.15rem;
		margin: 0 0 20px;
	}
}

.protocol-step {
	position: relative;
	display: flex;
	margin-bottom: 20px;
	gap: 16px;

	.step-num {
		width: 32px;
		height: 32px;
		display: flex;
		flex-shrink: 0;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		font-weight: 700;
		color: #000;
		background: var(--gp-primary, #42b883);
	}

	.step-body {
		flex: 1;

		h4 {
			font-weight: 600;
			font-size: 0.95rem;
			color: var(--gp-text-main, #fff);
			margin: 0 0 6px;
		}

		p {
			font-size: 0.85rem;
			line-height: 1.5;
			color: var(--gp-text-secondary, #a0aec0);
			margin: 0 0 8px;
		}
	}

	&:last-child {
		margin-bottom: 0;
	}
}

.code-inline {
	display: block;
	border-radius: 6px;
	font-family: monospace;
	font-size: 0.8rem;
	color: #646cff;
	background: rgb(0, 0, 0, 0.4);
	padding: 6px 10px;
	overflow-x: auto;
}

/* FAQ */
.faq-accordion {
	:deep(.el-collapse) {
		border: none;
		background: transparent;
	}

	:deep(.el-collapse-item__header) {
		border-bottom: 1px solid rgb(255, 255, 255, 0.06);
		border-radius: 8px;
		font-weight: 600;
		font-size: 0.95rem;
		color: var(--gp-text-main, #fff);
		background: rgb(255, 255, 255, 0.02);
		padding: 0 16px;
		margin-bottom: 8px;
	}

	:deep(.el-collapse-item__wrap) {
		border: none;
		background: transparent;
	}

	:deep(.el-collapse-item__content) {
		font-size: 0.88rem;
		line-height: 1.6;
		color: var(--gp-text-secondary, #a0aec0);
		padding: 12px 16px 20px;
	}
}

.faq-answer {
	strong {
		color: var(--gp-text-main, #fff);
	}

	ul {
		padding-left: 20px;
		margin: 8px 0 0;
	}

	li {
		margin-bottom: 4px;
	}
}
</style>

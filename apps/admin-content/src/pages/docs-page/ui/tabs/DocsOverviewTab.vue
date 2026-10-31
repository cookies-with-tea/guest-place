<template>
	<div class="tab-content">
		<div class="section-intro">
			<h2>Почему в проекте одновременно три разные модели контента</h2>
			<p>
				На сайте есть три параллельные, независимые друг от друга системы хранения и редактирования контента. Ни одна из
				них не заменяет другую — у каждой свой сценарий использования. Этот обзор объясняет границу между ними, прежде
				чем переходить к деталям Schema Builder на следующих вкладках.
			</p>
		</div>

		<div class="comparison-cards">
			<div class="split-card glass-panel">
				<div class="split-badge">PAGECONSTRUCTOR</div>
				<h3>Блочные страницы</h3>
				<p class="split-desc">
					Визуальный конструктор страниц из палитры переиспользуемых блоков (Hero, Features, CTA, Quotes...). Данные —
					<code>PageItem</code> с массивом <code>blocks[]</code>, типы блоков приходят из
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
					<li>Когда использовать: когда у сущности простой, предсказуемый набор полей без сложной бизнес-логики.</li>
					<li>Подробности модели Schema/Entry — на вкладке «1. Схемы данных» ниже.</li>
				</ul>
			</div>

			<div class="split-card glass-panel">
				<div class="split-badge split-badge--entity">ЖЁСТКИЕ MFE</div>
				<h3>Сущности с собственной бизнес-логикой</h3>
				<p class="split-desc">
					Venues, Menus, Media, Guests, Platforms, About, Redirects — каждая это отдельное микрофронтенд-приложение со
					своей Rust/TS-моделью, фиксированным набором полей и собственной CRUD-вёрсткой. Схемами тут не пахнет: поля
					захардкожены в коде обеих сторон (сервер + клиент).
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
			<el-icon class="card-icon"><WarningFilled /></el-icon>
			<h3>Частый источник путаницы</h3>
			<p>
				Список страниц (<code>/content</code>) показывает блочные и схемные страницы в одной витрине — различаются
				только подписанными секциями/значком на карточке. Это две независимые системы хранения, а не одна. Страница
				«Глобальные настройки» (<code>/settings</code>) — это просто схема Schema Builder с зарезервированным slug'ом
				<code>global-settings</code>, а не отдельный системный механизм.
			</p>
		</div>
	</div>
</template>

<script setup lang="ts">
import { WarningFilled } from '@element-plus/icons-vue'
</script>

<style scoped>
.card-icon {
	width: 28px;
	height: 28px;
	color: #f59e0b;
	margin-bottom: 12px;
}
</style>

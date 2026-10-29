<template>
	<div class="tab-content">
		<div class="section-intro">
			<h2>Концепция динамических схем (Headless Schema Model)</h2>
			<p>
				Схема контента в Guest Place — это декларативная модель структуры данных, определяющая форму, типы полей,
				правила валидации и способ отображения сущностей без необходимости писать миграции БД на бэкенде.
			</p>
		</div>

		<div class="grid-2-col">
			<div class="info-card glass-panel">
				<el-icon class="card-icon"><Box /></el-icon>
				<h3>Как хранятся схемы в PostgreSQL</h3>
				<p> Каждая схема сохраняется в таблице <code>content_schemas</code>: </p>
				<ul class="styled-list">
					<li><code>id (UUID)</code> — уникальный идентификатор схемы.</li>
					<li><code>name (TEXT)</code> — человекочитаемое имя (например, «Статьи блога»).</li>
					<li><code>slug (TEXT UNIQUE)</code> — программный идентификатор (например, <code>articles</code>).</li>
					<li
						><code>is_singleton (BOOLEAN)</code> — флаг одиночной страницы (один экземпляр, напр. «Главная
						страница»).</li
					>
					<li><code>fields (JSONB)</code> — массив определений полей схемы.</li>
				</ul>
			</div>

			<div class="info-card glass-panel">
				<el-icon class="card-icon"><Operation /></el-icon>
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
</template>

<script setup lang="ts">
import { Box, Operation } from '@element-plus/icons-vue'
</script>

<style scoped>
.card-icon {
	width: 28px;
	height: 28px;
	color: var(--gp-primary, #6366f1);
	margin-bottom: 12px;
}
</style>

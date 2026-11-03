<template>
	<div class="tab-content">
		<div class="section-intro">
			<h2>Двухуровневый Split-View подход</h2>
			<p>
				В системе используются два разных независимых сплит-интерфейса: один для конструирования структуры схемы, а
				второй — для визуального наполнения контентом.
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
</template>

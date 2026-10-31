<template>
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
							<code>localhost</code> vs <code>127.0.0.1</code>) или окно открыто в новой вкладке без родительского окна
							(<code>window.opener</code> отсутствует).</p
						>
						<p><strong>Исправление:</strong></p>
						<ul>
							<li>Использован безопасный широковещательный таргет <code>'*'</code> для превью-сообщений.</li>
							<li
								>Добавлен fallback: клиент ожидает сообщение, и если его нет, подгружает сохраненные данные напрямую из
								бэкенда через <code>/api/v1/content</code>.</li
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
							><strong>Решение:</strong> Создайте новую схему через кнопку <strong>«Create Schema»</strong> на главной
							странице контента, либо воспользуйтесь сидером тестовых данных.</p
						>
					</div>
				</el-collapse-item>

				<el-collapse-item name="3" title="3. Iframe не загружается (Connection Refused на порту 3000)">
					<div class="faq-answer">
						<p
							><strong>Причина:</strong> Клиентское приложение гостевого сайта (Nuxt в папке <code>client</code>) не
							запущено.</p
						>
						<p
							><strong>Решение:</strong> Запустите клиент командой <code>pnpm dev</code> в папке <code>client</code>.
							Сервер запустится на <code>http://localhost:3000</code>.</p
						>
					</div>
				</el-collapse-item>

				<el-collapse-item name="4" title="4. Поле RichText или Media не рендерится в превью">
					<div class="faq-answer">
						<p
							><strong>Причина:</strong> RichText сохраняет HTML, а Media сохраняет путь к файлу. Если клиентский код
							ожидал обычный текст, он экранировался.</p
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
</template>

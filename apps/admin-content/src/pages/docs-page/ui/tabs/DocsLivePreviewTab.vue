<template>
	<div class="tab-content">
		<div class="section-intro">
			<h2>Как устроен Live Preview мост</h2>
			<p>
				Превью работает на изолированном клиентском приложении (Nuxt / Vite на порту 3000) без сохранения черновиков в
				базу данных. Обмен данными происходит через безопасный протокол HTML5
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
						<code>&lt;iframe src="http://localhost:3000/preview?schema=...&id=..."&gt;</code>. После инициализации
						страницы клиент отправляет родительскому окну сигнал:
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
						>iframe.contentWindow.postMessage({ type: 'CMS_PREVIEW_DATA', payload: { data, schema, seo } }, '*')</code
					>
				</div>
			</div>

			<div class="protocol-step">
				<div class="step-num">3</div>
				<div class="step-body">
					<h4>Реактивная трансляция на лету</h4>
					<p>
						Каждое нажатие клавиши в форме отслеживается через
						<code>watch(() => ({ ...formData }), ..., { deep: true })</code>. Измененные значения мгновенно пушатся в
						iframe. На клиенте загорается индикатор <em>«Updated HH:MM:SS»</em>.
					</p>
				</div>
			</div>

			<div class="protocol-step">
				<div class="step-num">4</div>
				<div class="step-body">
					<h4>Автономный Fallback для новой вкладки</h4>
					<p>
						Если пользователь открывает превью в отдельной вкладке без opener, клиент через 1.2 сек автоматически делает
						fallback-запрос к API
						<code>/api/v1/content/schemas/{slug}</code> и <code>/api/v1/content/entries/{id}</code>, чтобы страница не
						висела вечно.
					</p>
				</div>
			</div>
		</div>
	</div>
</template>

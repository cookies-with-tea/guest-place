<template>
	<div class="info-strip">
		<div class="info-item">
			<span class="info-icon">🎯</span>
			<div>
				<strong>301 Moved Permanently</strong>
				<span
					>Передаёт 95–99% ссылочного веса поисковых систем (Google, Яндекс). Используется при постоянной смене
					URL.</span
				>
			</div>
		</div>
		<div class="info-sep"></div>
		<div class="info-item">
			<span class="info-icon">⏳</span>
			<div>
				<strong>302 Found (Временный)</strong>
				<span>Не передаёт поисковый вес. Используется для временных акций, технических работ или A/B тестов.</span>
			</div>
		</div>
	</div>
</template>

<style scoped>
.info-strip {
	display: flex;
	border: 1px solid var(--border-color);
	border-radius: 10px;
	background: var(--bg-card);
	padding: 14px 20px;
	margin-bottom: 20px;
	gap: 24px;
}

.info-item {
	display: flex;
	flex: 1;
	align-items: flex-start;
	gap: 12px;
}

.info-icon {
	font-size: 24px;
}

.info-item strong {
	display: block;
	font-size: 13px;
	color: var(--text-primary);
	margin-bottom: 2px;
}

.info-item span {
	font-size: 12px;
	line-height: 1.4;
	color: var(--text-muted);
}

.info-sep {
	width: 1px;
	background: var(--border-color);
}
</style>

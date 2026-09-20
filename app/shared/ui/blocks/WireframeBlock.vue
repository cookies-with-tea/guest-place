<template>
	<section class="wireframe-block" :class="[`is-${data.height || 'medium'}`]">
		<div class="container">
			<div class="wireframe-card">
				<!-- Blueprint Grid Overlay -->
				<div class="wireframe-grid-pattern" />

				<div class="wireframe-inner">
					<div class="wireframe-topbar">
						<div class="wireframe-badge">
							<span class="badge-icon">📐</span>
							<span class="badge-text">{{ data.badge || 'Макет секции / Вайрфрейм' }}</span>
						</div>
						<div class="wireframe-dimensions">
							<code>&lt;Section /&gt;</code>
						</div>
					</div>

					<div class="wireframe-body">
						<h2 v-if="data.title" class="wireframe-title">
							{{ data.title }}
						</h2>
						<h2 v-else class="wireframe-title is-placeholder">
							Заголовок будущей секции
						</h2>

						<p v-if="data.subtitle" class="wireframe-subtitle">
							{{ data.subtitle }}
						</p>

						<div v-if="data.description" class="wireframe-desc">
							<div class="desc-content">{{ data.description }}</div>
						</div>
						<div v-else class="wireframe-desc is-empty">
							<p>Здесь будет контент секции (описание, текст, список или карточки). Заполните поля в панели администратора.</p>
						</div>

						<div v-if="data.cta_text" class="wireframe-action">
							<NuxtLink :to="data.cta_link || '#'" class="wireframe-btn">
								{{ data.cta_text }}
							</NuxtLink>
						</div>
					</div>

					<div class="wireframe-footer">
						<span class="footer-hint">💡 Черновик: в конструкторе CMS этот блок можно в 1 клик заменить на готовый компонент</span>
					</div>
				</div>
			</div>
		</div>
	</section>
</template>

<script setup lang="ts">
defineProps<{
	data: {
		title?: string
		subtitle?: string
		description?: string
		cta_text?: string
		cta_link?: string
		badge?: string
		height?: 'small' | 'medium' | 'large'
	}
}>()
</script>

<style scoped>
.wireframe-block {
	padding: 36px 0;
	width: 100%;
}

.wireframe-block.is-small .wireframe-card {
	min-height: 180px;
}

.wireframe-block.is-medium .wireframe-card {
	min-height: 280px;
}

.wireframe-block.is-large .wireframe-card {
	min-height: 420px;
}

.wireframe-card {
	position: relative;
	border: 2px dashed rgba(99, 102, 241, 0.4);
	border-radius: 20px;
	background: rgba(99, 102, 241, 0.03);
	overflow: hidden;
	transition: all 0.3s ease;
}

.wireframe-card:hover {
	border-color: rgba(99, 102, 241, 0.7);
	background: rgba(99, 102, 241, 0.05);
}

.wireframe-grid-pattern {
	position: absolute;
	inset: 0;
	background-image: 
		linear-gradient(to right, rgba(99, 102, 241, 0.06) 1px, transparent 1px),
		linear-gradient(to bottom, rgba(99, 102, 241, 0.06) 1px, transparent 1px);
	background-size: 24px 24px;
	pointer-events: none;
}

.wireframe-inner {
	position: relative;
	z-index: 1;
	padding: 28px 32px;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	height: 100%;
}

.wireframe-topbar {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 20px;
}

.wireframe-badge {
	display: inline-flex;
	align-items: center;
	gap: 6px;
	background: rgba(99, 102, 241, 0.12);
	color: #4f46e5;
	padding: 4px 12px;
	border-radius: 9999px;
	font-size: 12px;
	font-weight: 600;
	letter-spacing: 0.02em;
}

.wireframe-dimensions code {
	font-size: 12px;
	color: #64748b;
	background: rgba(0, 0, 0, 0.04);
	padding: 3px 8px;
	border-radius: 6px;
}

.wireframe-body {
	flex-grow: 1;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	text-align: center;
	max-width: 720px;
	margin: 0 auto;
	padding: 16px 0;
}

.wireframe-title {
	font-size: 26px;
	font-weight: 700;
	color: #1e293b;
	margin: 0 0 10px 0;
	line-height: 1.3;
}

.wireframe-title.is-placeholder {
	color: #94a3b8;
	font-style: italic;
}

.wireframe-subtitle {
	font-size: 15px;
	font-weight: 500;
	color: #64748b;
	margin: 0 0 16px 0;
}

.wireframe-desc {
	font-size: 14px;
	line-height: 1.6;
	color: #475569;
	white-space: pre-line;
	margin-bottom: 20px;
}

.wireframe-desc.is-empty {
	color: #94a3b8;
	font-size: 13px;
}

.wireframe-action {
	margin-top: 10px;
}

.wireframe-btn {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	padding: 10px 24px;
	background: #4f46e5;
	color: #ffffff;
	border-radius: 10px;
	font-size: 14px;
	font-weight: 600;
	text-decoration: none;
	transition: all 0.2s ease;
	box-shadow: 0 2px 8px rgba(79, 70, 229, 0.25);
}

.wireframe-btn:hover {
	background: #4338ca;
	transform: translateY(-1px);
	box-shadow: 0 4px 12px rgba(79, 70, 229, 0.35);
}

.wireframe-footer {
	margin-top: 24px;
	padding-top: 14px;
	border-top: 1px dashed rgba(99, 102, 241, 0.2);
	display: flex;
	justify-content: center;
}

.footer-hint {
	font-size: 12px;
	color: #64748b;
}

/* Dark mode support */
:global(html.dark) .wireframe-card {
	border-color: rgba(129, 140, 248, 0.3);
	background: rgba(129, 140, 248, 0.04);
}

:global(html.dark) .wireframe-card:hover {
	border-color: rgba(129, 140, 248, 0.6);
	background: rgba(129, 140, 248, 0.07);
}

:global(html.dark) .wireframe-grid-pattern {
	background-image: 
		linear-gradient(to right, rgba(129, 140, 248, 0.06) 1px, transparent 1px),
		linear-gradient(to bottom, rgba(129, 140, 248, 0.06) 1px, transparent 1px);
}

:global(html.dark) .wireframe-title {
	color: #f1f5f9;
}

:global(html.dark) .wireframe-title.is-placeholder {
	color: #64748b;
}

:global(html.dark) .wireframe-subtitle {
	color: #94a3b8;
}

:global(html.dark) .wireframe-desc {
	color: #cbd5e1;
}

:global(html.dark) .wireframe-badge {
	background: rgba(129, 140, 248, 0.16);
	color: #a5b4fc;
}

:global(html.dark) .wireframe-dimensions code {
	color: #94a3b8;
	background: rgba(255, 255, 255, 0.06);
}

:global(html.dark) .footer-hint {
	color: #94a3b8;
}
</style>

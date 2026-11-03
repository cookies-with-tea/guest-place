<template>
	<div class="onboarding-card glass-card" :class="{ 'is-dark': isDark }">
		<div class="onboarding-hero">
			<div class="hero-icon-wrapper">
				<el-icon class="hero-icon"><Tools /></el-icon>
			</div>

			<el-tag effect="dark" size="small" type="info" class="hero-badge"> Схема не инициализирована (404) </el-tag>

			<h2 class="hero-title">Для чего эта страница и как её настроить</h2>

			<p class="hero-desc">
				Страница «Глобальные настройки» использует синглтон-схему CMS с системным идентификатором
				<code>global-settings</code>. Поскольку база данных пуста или была сброшена, схема ещё не создана.
			</p>
		</div>

		<!-- Explanation Cards -->
		<div class="features-grid">
			<div class="feature-box">
				<div class="feature-num">01</div>
				<h4>Что такое синглтон?</h4>
				<p>
					В отличие от коллекций (статьи, страницы), синглтон существует в единственном экземпляре и предназначен для
					общесайтовых констант.
				</p>
			</div>

			<div class="feature-box">
				<div class="feature-num">02</div>
				<h4>Как это связано с Live Preview?</h4>
				<p>
					Название сайта, слоган и баннер техобслуживания сразу транслируются на клиентский сайт через реактивный мост
					postMessage.
				</p>
			</div>

			<div class="feature-box">
				<div class="feature-num">03</div>
				<h4>Гибкая кастомизация</h4>
				<p>
					Вы можете добавить любые свои поля (логотип, соцсети, аналитика) в любой момент через визуальный Конструктор
					схем.
				</p>
			</div>
		</div>

		<!-- Default Fields Preview -->
		<div class="default-fields-card">
			<div class="fields-card-header">
				<el-icon><InfoFilled /></el-icon>
				<span>Состав полей стандартной схемы по умолчанию:</span>
			</div>
			<div class="fields-chips">
				<span class="chip"><strong>site_name</strong> <small>(Text, Обязательное)</small> — Название сайта</span>
				<span class="chip"><strong>tagline</strong> <small>(Text)</small> — Слоган проекта</span>
				<span class="chip"><strong>description</strong> <small>(RichText)</small> — SEO Meta Описание</span>
				<span class="chip"><strong>contact_email</strong> <small>(Text)</small> — Контактный e-mail</span>
				<span class="chip"><strong>maintenance_mode</strong> <small>(Boolean)</small> — Режим техобслуживания</span>
			</div>
		</div>

		<!-- Action Buttons -->
		<div class="hero-actions">
			<el-button
				type="primary"
				size="large"
				:icon="Check"
				:loading="entry.isInitializing"
				class="btn-gradient"
				@click="entry.createDefaultSchema"
			>
				Инициализировать схему в 1 клик
			</el-button>

			<el-button size="large" :icon="Operation" @click="emit('go-to-schemas')">
				Создать вручную в Конструкторе
			</el-button>

			<el-button size="large" text :icon="Reading" @click="emit('go-to-docs')"> Документация подхода </el-button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useTheme } from '@admin-panel/ui'
import { Check, InfoFilled, Operation, Reading, Tools } from '@element-plus/icons-vue'

import type { GlobalSettingsEntry } from '../../composables/useGlobalSettingsEntry'

defineProps<{
	entry: GlobalSettingsEntry
}>()

const emit = defineEmits<{
	'go-to-schemas': []
	'go-to-docs': []
}>()

const { isDark } = useTheme()
</script>

<style scoped lang="scss">
.glass-card {
	border: 1px solid var(--gp-glass-border, rgb(255, 255, 255, 0.2));
	border-radius: 20px;
	box-shadow: 0 12px 32px rgb(0, 0, 0, 0.05);
	background: var(--gp-bg-glass, rgb(255, 255, 255, 0.7));
	padding: 32px;
	-webkit-backdrop-filter: blur(16px);
	backdrop-filter: blur(16px);

	&.is-dark {
		border-color: rgb(255, 255, 255, 0.08);
		box-shadow: 0 12px 32px rgb(0, 0, 0, 0.3);
		background: rgb(15, 23, 42, 0.75);
	}
}

/* Onboarding Hero */
.onboarding-card {
	text-align: center;
	padding: 48px;
}

.onboarding-hero {
	max-width: 620px;
	display: flex;
	flex-direction: column;
	align-items: center;
	margin: 0 auto 32px;
}

.hero-icon-wrapper {
	width: 72px;
	height: 72px;
	display: flex;
	align-items: center;
	justify-content: center;
	border: 1px solid rgb(99, 102, 241, 0.25);
	border-radius: 20px;
	background: linear-gradient(135deg, rgb(99, 102, 241, 0.15), rgb(168, 85, 247, 0.15));
	margin-bottom: 20px;
}

.hero-icon {
	font-size: 36px;
	color: #6366f1;
}

.hero-badge {
	margin-bottom: 12px;
}

.hero-title {
	font-weight: 800;
	font-size: 24px;
	color: var(--gp-text-main, #1e293b);
	margin: 0 0 12px;
}

.hero-desc {
	font-size: 15px;
	line-height: 1.6;
	color: var(--gp-text-secondary, #64748b);
	margin: 0;

	code {
		border-radius: 4px;
		font-family: monospace;
		color: #6366f1;
		background: rgb(99, 102, 241, 0.1);
		padding: 2px 6px;
	}
}

/* Feature Grid */
.features-grid {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	text-align: left;
	margin-bottom: 32px;
	gap: 20px;
}

.feature-box {
	position: relative;
	border: 1px solid rgb(255, 255, 255, 0.2);
	border-radius: 14px;
	background: rgb(255, 255, 255, 0.4);
	transition: all 0.2s ease;
	padding: 20px;

	.feature-num {
		font-weight: 800;
		font-size: 12px;
		letter-spacing: 0.05em;
		color: #6366f1;
		margin-bottom: 8px;
		opacity: 0.8;
	}

	h4 {
		font-weight: 700;
		font-size: 15px;
		color: var(--gp-text-main, #1e293b);
		margin: 0 0 8px;
	}

	p {
		font-size: 13px;
		line-height: 1.5;
		color: var(--gp-text-secondary, #64748b);
		margin: 0;
	}

	&:hover {
		box-shadow: 0 8px 20px rgb(0, 0, 0, 0.05);
		transform: translateY(-2px);
	}
}

.is-dark .feature-box {
	border-color: rgb(255, 255, 255, 0.06);
	background: rgb(30, 41, 59, 0.5);
}

/* Default Fields Card */
.default-fields-card {
	border: 1px solid rgb(99, 102, 241, 0.15);
	border-radius: 14px;
	text-align: left;
	background: rgb(99, 102, 241, 0.05);
	padding: 16px 20px;
	margin-bottom: 36px;

	.fields-card-header {
		display: flex;
		align-items: center;
		font-weight: 600;
		font-size: 13px;
		color: #4f46e5;
		margin-bottom: 12px;
		gap: 8px;
	}

	.fields-chips {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;

		.chip {
			display: inline-flex;
			align-items: center;
			border: 1px solid rgb(0, 0, 0, 0.06);
			border-radius: 8px;
			font-size: 12px;
			color: var(--gp-text-main, #334155);
			background: var(--gp-bg-surface, #fff);
			padding: 4px 10px;
			gap: 4px;

			strong {
				font-family: monospace;
				color: #6366f1;
			}

			small {
				color: #94a3b8;
			}
		}
	}
}

.is-dark .default-fields-card {
	border-color: rgb(99, 102, 241, 0.2);
	background: rgb(99, 102, 241, 0.08);

	.fields-chips .chip {
		border-color: rgb(255, 255, 255, 0.1);
		color: #e2e8f0;
		background: #1e293b;
	}
}

/* Actions */
.hero-actions {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	justify-content: center;
	gap: 16px;
}

.btn-gradient {
	border: none !important;
	box-shadow: 0 4px 14px rgb(99, 102, 241, 0.35);
	font-weight: 600;
	background: linear-gradient(135deg, #6366f1, #8b5cf6) !important;

	&:hover {
		transform: translateY(-1px);
		opacity: 0.95;
	}
}

@media (width <= 840px) {
	.features-grid {
		grid-template-columns: 1fr;
	}
}
</style>

<template>
	<div class="architecture-strip">
		<div class="arch-item">
			<el-icon class="arch-icon"><Box /></el-icon>
			<div class="arch-info">
				<strong>Блочные страницы (Block-based)</strong>
				<span>
					Собираются из палитры переиспользуемых компонентов (Hero, Features, CTA, Quotes...) через визуальный
					конструктор. Роуты: <code>/p/*</code>
				</span>
			</div>
		</div>
		<div class="arch-sep"></div>
		<div class="arch-item">
			<el-icon class="arch-icon"><Tickets /></el-icon>
			<div class="arch-info">
				<strong>Схемные страницы (Schema-driven)</strong>
				<span>
					Индивидуальная уникальная вёрстка фронтенда (About, Guests, Platforms). CMS хранит схему полей, наполняет
					контент и переводы. Роуты: <code>/*</code>
				</span>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { Box, Tickets } from '@element-plus/icons-vue'
</script>

<style scoped>
.architecture-strip {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	border: 1px solid var(--gp-glass-border, var(--border-color, rgb(255, 255, 255, 0.1)));
	border-radius: 12px;
	box-shadow: var(--gp-glass-shadow, 0 1px 3px rgb(0, 0, 0, 0.05));
	background: var(--gp-bg-surface, var(--bg-card, rgb(30, 41, 59, 0.5)));
	padding: 14px 20px;
	margin-bottom: 24px;
	gap: 24px;
}

.arch-item {
	min-width: 220px;
	display: flex;
	flex: 1;
	align-items: flex-start;
	gap: 12px;
}

.arch-icon {
	width: 1em;
	height: 1em;
	flex-shrink: 0;
	font-size: 22px;
	line-height: 1;
	color: var(--gp-primary, #6366f1);
}

.arch-info {
	display: flex;
	flex-direction: column;
	font-size: 12px;
	gap: 2px;
}

.arch-info strong {
	font-size: 13px;
	color: var(--text-primary);
}

.arch-info span {
	line-height: 1.4;
	color: var(--text-muted);
}

.arch-info code {
	border-radius: 4px;
	font-family: monospace;
	color: #6366f1;
	background: rgb(99, 102, 241, 0.1);
	padding: 1px 4px;
}

.arch-sep {
	width: 1px;
	height: 36px;
	background: var(--border-color);
}
</style>

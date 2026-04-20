<template>
	<div
		class="ui-theme-switcher"
		:title="isDark ? 'Переключить на светлую тему' : 'Переключить на темную тему'"
		@click="toggleTheme"
	>
		<div class="switcher-icon" :class="{ 'is-dark': isDark }">
			<el-icon v-if="isDark"><Moon /></el-icon>
			<el-icon v-else><Sunny /></el-icon>
		</div>
	</div>
</template>

<script setup lang="ts">
import { Moon, Sunny } from '@element-plus/icons-vue'

import { useTheme } from '../lib/composables/useTheme'

const { isDark, toggleTheme } = useTheme()
</script>

<style scoped>
.ui-theme-switcher {
	width: 42px;
	height: 42px;
	display: flex;
	align-items: center;
	justify-content: center;
	border: 1px solid var(--border-color);
	border-radius: 50%;
	box-shadow: var(--shadow-sm);
	color: var(--text-primary);
	background: var(--bg-card);
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	cursor: pointer;
}

.ui-theme-switcher:hover {
	border-color: var(--accent-primary);
	background: var(--bg-surface);
	transform: translateY(-2px);
}

.switcher-icon {
	display: flex;
	font-size: 20px;
	transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.is-dark .switcher-icon {
	color: #fbbf24;
	transform: rotate(360deg);
}

.ui-theme-switcher:not(.is-dark) .switcher-icon {
	color: #f59e0b;
}
</style>

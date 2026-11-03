<template>
	<div
		v-if="!isEmbedded || !floating"
		class="ui-theme-switcher"
		:class="{ 'is-floating': floating }"
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
import { onMounted, ref } from 'vue'

import { Moon, Sunny } from '@element-plus/icons-vue'

import { useTheme } from '../lib/composables/useTheme'

defineProps<{
	floating?: boolean
}>()

const { isDark, toggleTheme } = useTheme()
const isEmbedded = ref(true)

onMounted(() => {
	// Если в DOM есть .main-layout, значит мы работаем внутри shell
	// В таком случае floating switcher не нужен, так как переключатель есть в шапке shell
	isEmbedded.value = !!document.querySelector('.main-layout')
})
</script>

<style scoped>
.ui-theme-switcher {
	width: 42px;
	height: 42px;
	display: flex;
	align-items: center;
	justify-content: center;
	border: 1px solid var(--gp-glass-border);
	border-radius: 50%;
	box-shadow: var(--gp-glass-shadow);
	color: var(--gp-text-main);
	background: var(--gp-bg-glass);
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	cursor: pointer;
	backdrop-filter: blur(8px);
}

.ui-theme-switcher.is-floating {
	right: 24px;
	bottom: 24px;
	width: 48px;
	height: 48px;
	position: fixed;
	border-color: var(--gp-primary-hover);
	box-shadow: 0 8px 16px rgb(0, 0, 0, 0.2);
	color: var(--gp-white);
	background: var(--gp-primary);
	z-index: 9999;
}

.ui-theme-switcher.is-floating:hover {
	box-shadow: 0 12px 24px rgb(0, 0, 0, 0.3);
	background: var(--gp-primary-hover);
	transform: scale(1.1) translateY(-4px);
}

.ui-theme-switcher:not(.is-floating):hover {
	border-color: var(--gp-primary);
	background: var(--gp-bg-glass-hover);
	transform: translateY(-2px);
}

.switcher-icon {
	display: flex;
	font-size: 20px;
	transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.is-dark .switcher-icon {
	color: var(--gp-warning-light);
	transform: rotate(360deg);
}

.ui-theme-switcher:not(.is-dark) .switcher-icon {
	color: var(--gp-warning);
}

.ui-theme-switcher.is-floating:not(.is-dark) .switcher-icon {
	color: var(--gp-white);
}
</style>

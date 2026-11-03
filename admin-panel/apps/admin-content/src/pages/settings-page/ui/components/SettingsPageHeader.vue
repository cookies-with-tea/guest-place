<template>
	<div class="glass-header" :class="{ 'is-dark': isDark }">
		<div class="header-left">
			<div class="header-icon-box">
				<el-icon class="header-icon"><Setting /></el-icon>
			</div>
			<div class="header-titles">
				<div class="title-row">
					<h1>Глобальные настройки</h1>
					<el-tag effect="plain" round size="small" type="primary"> Singleton Configuration </el-tag>
				</div>
				<p class="subtitle">
					Централизованное управление параметрами сайта: метаданные, SEO по умолчанию, контакты и статус режима
					техобслуживания.
				</p>
			</div>
		</div>

		<div class="header-actions">
			<el-button :icon="Operation" plain @click="emit('go-to-schemas')"> Конструктор схем </el-button>
			<el-button :icon="Reading" plain @click="emit('go-to-docs')"> Документация подхода </el-button>
			<el-button :icon="Refresh" circle :loading="isLoading" @click="emit('refresh')" />
		</div>
	</div>
</template>

<script setup lang="ts">
import { useTheme } from '@admin-panel/ui'
import { Operation, Reading, Refresh, Setting } from '@element-plus/icons-vue'

defineProps<{
	isLoading?: boolean
}>()

const emit = defineEmits<{
	refresh: []
	'go-to-schemas': []
	'go-to-docs': []
}>()

const { isDark } = useTheme()
</script>

<style scoped lang="scss">
.glass-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	border: 1px solid var(--gp-glass-border, rgb(255, 255, 255, 0.2));
	border-radius: 16px;
	box-shadow: 0 8px 24px rgb(0, 0, 0, 0.04);
	background: var(--gp-bg-glass, rgb(255, 255, 255, 0.65));
	padding: 20px 24px;
	margin-bottom: 24px;
	-webkit-backdrop-filter: blur(16px);
	backdrop-filter: blur(16px);

	&.is-dark {
		border-color: rgb(255, 255, 255, 0.08);
		box-shadow: 0 12px 32px rgb(0, 0, 0, 0.3);
		background: rgb(15, 23, 42, 0.75);
	}
}

.header-left {
	display: flex;
	align-items: center;
	gap: 16px;
}

.header-icon-box {
	width: 48px;
	height: 48px;
	display: flex;
	align-items: center;
	justify-content: center;
	border: 1px solid rgb(99, 102, 241, 0.2);
	border-radius: 14px;
	color: #6366f1;
	background: linear-gradient(135deg, rgb(99, 102, 241, 0.15), rgb(168, 85, 247, 0.15));
}

.header-icon {
	font-size: 24px;
}

.header-titles {
	.title-row {
		display: flex;
		align-items: center;
		margin-bottom: 4px;
		gap: 12px;

		h1 {
			font-weight: 700;
			font-size: 22px;
			letter-spacing: -0.02em;
			color: var(--gp-text-main, #1e293b);
			margin: 0;
		}
	}

	.subtitle {
		font-size: 13px;
		color: var(--gp-text-secondary, #64748b);
		margin: 0;
	}
}

.header-actions {
	display: flex;
	align-items: center;
	gap: 10px;
}

@media (width <= 840px) {
	.glass-header {
		flex-direction: column;
		align-items: flex-start;
		gap: 16px;
	}
}
</style>

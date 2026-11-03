<template>
	<div class="lock-banner">
		<div class="lock-banner__content">
			<el-icon class="lock-banner__icon"><WarningFilled /></el-icon>
			<span class="lock-banner__text">
				<strong>Режим только для чтения:</strong> Запись сейчас редактирует
				<u>{{ entry.lockedByName || 'другой администратор' }}</u
				>. Одновременное сохранение заблокировано через Redis во избежание конфликтов.
			</span>
		</div>
		<el-button size="small" type="warning" plain @click="entry.forceUnlock"> Принудительно разблокировать </el-button>
	</div>
</template>

<script setup lang="ts">
import { WarningFilled } from '@element-plus/icons-vue'
import type { ContentEntry } from '../../composables/useContentEntry'

defineProps<{
	entry: ContentEntry
}>()
</script>

<style scoped lang="scss">
.lock-banner {
	display: flex;
	align-items: center;
	justify-content: space-between;
	border: 1px solid rgb(245, 158, 11, 0.3);
	border-radius: 8px;
	font-size: 13px;
	color: #f59e0b;
	background: rgb(245, 158, 11, 0.12);
	padding: 10px 16px;
	margin-bottom: 16px;

	&__content {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	&__icon {
		width: 1em;
		height: 1em;
		flex-shrink: 0;
		font-size: 16px;
	}

	&__text {
		color: var(--gp-text-main, #f8fafc);

		strong {
			color: #f59e0b;
		}

		u {
			font-weight: 600;
			text-decoration-color: #f59e0b;
		}
	}
}
</style>

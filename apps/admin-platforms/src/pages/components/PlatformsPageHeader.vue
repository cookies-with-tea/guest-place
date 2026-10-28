<template>
	<header class="editor-header">
		<div>
			<h1>
				<T path="platforms.page_title" :params="{ brand: 'GP' }">
					<template #brand="{ value }">
						<span style="color: var(--gp-primary)">{{ value }}</span>
					</template>
				</T>
			</h1>
			<p class="subtitle">{{ t('platforms.subtitle') }}</p>
		</div>
		<div class="header-actions">
			<el-button circle :icon="Refresh" @click="emit('refresh')" />
			<el-button :icon="Check" :loading="saving" type="primary" @click="emit('save')">
				{{ t('platforms.save_btn') }}
			</el-button>
		</div>
	</header>
</template>

<script setup lang="ts">
import { useI18n } from '@admin-panel/i18n'
import { Check, Refresh } from '@element-plus/icons-vue'

defineProps<{
	saving?: boolean
}>()

const emit = defineEmits<{
	refresh: []
	save: []
}>()

const { t } = useI18n()
</script>

<style scoped lang="scss">
.editor-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	border-bottom: 1px solid var(--gp-glass-border);
	padding-bottom: 24px;
	margin-bottom: 32px;

	h1 {
		font-weight: 800;
		font-size: 1.75rem;
		color: var(--gp-primary);
		margin: 0;
	}

	.subtitle {
		font-size: 0.95rem;
		color: var(--gp-text-secondary);
		margin: 4px 0 0;
	}

	.header-actions {
		display: flex;
		gap: 12px;
	}
}
</style>

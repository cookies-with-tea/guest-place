<template>
	<header class="editor-header">
		<div>
			<h1>About Platform</h1>
			<p class="subtitle">Design-first content management</p>
		</div>
		<div class="header-actions">
			<el-button circle :icon="Refresh" @click="emit('refresh')" />
			<el-button :icon="Check" :loading="saving" type="primary" @click="emit('save')"> Save Changes </el-button>
		</div>
	</header>
</template>

<script setup lang="ts">
import { Check, Refresh } from '@element-plus/icons-vue'

defineProps<{
	saving?: boolean
}>()

const emit = defineEmits<{
	refresh: []
	save: []
}>()
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
		-webkit-text-fill-color: transparent;
		background: linear-gradient(to right, var(--gp-primary), var(--gp-text-primary));
		-webkit-background-clip: text;
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

<template>
	<div v-if="error" class="error-boundary-container glass-card">
		<div class="error-content">
			<ElIcon class="error-icon"><Warning /></ElIcon>
			<h3>Module Error</h3>
			<p>Something went wrong while rendering this module.</p>
			<div v-if="showDetails" class="error-details">
				<code>{{ error }}</code>
			</div>
			<ElButton type="primary" plain @click="retry"> Try Again </ElButton>
		</div>
	</div>
	<slot v-else></slot>
</template>

<script setup lang="ts">
import { onErrorCaptured, ref } from 'vue'

import { Warning } from '@element-plus/icons-vue'
import { ElButton, ElIcon } from 'element-plus'

const error = ref<any>(null)
const showDetails = ref(process.env.NODE_ENV === 'development')

onErrorCaptured((err) => {
	error.value = err

	console.error('[ErrorBoundary] Captured error:', err)

	return false // Prevent error from propagating further
})

const retry = () => {
	error.value = null

	window.location.reload()
}
</script>

<style scoped lang="scss">
.error-boundary-container {
	min-height: 200px;
	display: flex;
	align-items: center;
	justify-content: center;
	border: 1px solid var(--gp-glass-border);
	background: var(--gp-bg-glass);
	padding: 40px;
	margin: 20px;
}

.error-content {
	max-width: 400px;
	text-align: center;

	h3 {
		color: var(--gp-text-main);
		margin: 16px 0 8px;
	}

	p {
		color: var(--gp-text-secondary);
		margin-bottom: 20px;
	}
}

.error-icon {
	font-size: 48px;
	color: var(--gp-warning);
}

.error-details {
	border-radius: 8px;
	font-size: 12px;
	text-align: left;
	color: var(--gp-warning);
	background: rgb(0, 0, 0, 0.1);
	padding: 12px;
	margin-bottom: 20px;
	overflow-x: auto;
}
</style>

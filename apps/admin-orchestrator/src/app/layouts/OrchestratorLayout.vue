<template>
	<div class="orchestrator-page-wrapper">
		<div class="orchestrator-content">
			<router-view />
		</div>
	</div>
</template>

<script setup lang="ts">
// Layout wrapper for orchestrator pages
</script>

<style scoped>
.orchestrator-page-wrapper {
	min-height: calc(100vh - var(--gp-header-height) - 48px);
	display: flex;
}

.orchestrator-content {
	min-width: 0;
	display: flex;
	flex: 1;
	flex-direction: column;
	background: var(--gp-bg-main);
	padding: 32px;
	gap: 32px;
}

.page-header h1 {
	font-weight: 800;
	font-size: 2rem;
	letter-spacing: -0.02em;
	color: var(--gp-text-main);
	margin: 0;
}

.page-subtitle {
	font-size: 0.9rem;
	color: var(--gp-text-secondary);
	margin-top: 4px;
}

.stats-row {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
	gap: 16px;
}

.stat-card {
	display: flex;
	align-items: center;
	padding: 16px;
	gap: 16px;
}

.stat-icon {
	font-size: 24px;
	color: var(--gp-text-secondary);
}

.stat-icon--online {
	color: var(--gp-primary);
}

.stat-icon--offline {
	color: var(--gp-danger);
}

.stat-info {
	display: flex;
	flex-direction: column;
}

.stat-value {
	font-weight: 700;
	font-size: 1.25rem;
	color: var(--gp-text-main);
}

.stat-label {
	font-size: 0.75rem;
	letter-spacing: 0.05em;
	text-transform: uppercase;
	color: var(--gp-text-muted);
}

.page-body {
	flex: 1;
}
</style>

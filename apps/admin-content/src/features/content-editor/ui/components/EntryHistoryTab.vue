<template>
	<div class="history-list">
		<!-- Toolbar -->
		<div class="history-toolbar">
			<span class="history-toolbar__title">Version History</span>
			<el-button size="small" :loading="history.isLoadingHistory" @click="history.fetchHistory">
				<svg
					width="13"
					height="13"
					viewBox="0 0 24 24"
					fill="none"
					style="margin-right: 4px"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path d="M3 12A9 9 0 1 0 6 5.68" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
					<path d="M3 5v4h4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
				</svg>
				Refresh
			</el-button>
		</div>

		<div v-if="history.isLoadingHistory" class="loading-state">
			<el-skeleton :rows="4" animated />
		</div>

		<div v-else-if="history.history.length > 0" class="activity-timeline">
			<div v-for="(log, idx) in history.history" :key="log.id" class="activity-item">
				<div class="activity-avatar">
					<el-avatar :size="32" :src="log.user?.avatar">
						{{ log.user?.name?.[0]?.toUpperCase() || 'A' }}
					</el-avatar>
				</div>
				<div class="activity-content">
					<div class="activity-header">
						<div class="activity-header__left">
							<el-tag size="small" type="info" style="font-weight: 700">v{{ log.version_number }}</el-tag>
							<span class="user-name">{{ log.user?.name || 'Administrator' }}</span>
							<el-tag v-if="idx === 0" size="small" type="success" style="font-size: 9px">LATEST</el-tag>
						</div>
						<span class="activity-date">{{ history.formatDate(log.created_at) }}</span>
					</div>
					<div v-if="log.comment" class="activity-comment">"{{ log.comment }}"</div>
					<div class="activity-actions">
						<el-button link size="small" type="primary" @click="history.openDiff(log)">
							<svg
								width="12"
								height="12"
								viewBox="0 0 24 24"
								fill="none"
								style="margin-right: 3px"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									d="M9 3H5a2 2 0 00-2 2v14a2 2 0 002 2h4M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M12 8v8M9 11l3-3 3 3"
									stroke="currentColor"
									stroke-width="1.5"
									stroke-linecap="round"
									stroke-linejoin="round"
								/>
							</svg>
							View Diff
						</el-button>
						<el-button link size="small" type="warning" @click="history.onRollback(log.id)">
							<svg
								width="12"
								height="12"
								viewBox="0 0 24 24"
								fill="none"
								style="margin-right: 3px"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									d="M3 7v4h4"
									stroke="currentColor"
									stroke-width="1.5"
									stroke-linecap="round"
									stroke-linejoin="round"
								/>
								<path d="M3 11A9 9 0 1 0 6.68 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
							</svg>
							Restore
						</el-button>
					</div>
				</div>
			</div>
		</div>

		<div v-else class="empty-state">
			<svg
				width="32"
				height="32"
				viewBox="0 0 24 24"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
				style="opacity: 0.3"
			>
				<path d="M12 8v4l3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
				<circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.5" />
			</svg>
			<p>No version history yet.<br /><small>Versions are saved automatically on every update.</small></p>
		</div>
	</div>
</template>

<script setup lang="ts">
import type { EntryHistory } from '../../composables/useEntryHistory'

defineProps<{
	history: EntryHistory
}>()
</script>

<style scoped>
.activity-timeline {
	display: flex;
	flex-direction: column;
	padding: 10px 0;
	gap: 20px;
}

.activity-item {
	position: relative;
	display: flex;
	gap: 16px;

	&:not(:last-child)::after {
		content: '';
		top: 40px;
		left: 16px;
		bottom: -20px;
		width: 1px;
		position: absolute;
		background: var(--gp-glass-border);
	}
}

.activity-avatar {
	flex-shrink: 0;
	z-index: 1;
}

.activity-content {
	flex: 1;
	border: 1px solid var(--gp-glass-border);
	border-radius: 12px;
	background: var(--gp-bg-glass-hover);
	padding: 12px 16px;
}

.activity-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 8px;
}

.user-name {
	font-weight: 600;
	font-size: 14px;
	color: var(--gp-text-main);
}

.activity-date {
	font-size: 12px;
	color: var(--gp-text-secondary);
}

.activity-comment {
	display: block;
	font-style: italic;
	color: var(--gp-text-secondary);
	margin-top: 4px;
}

.activity-actions {
	display: flex;
	border-top: 1px dashed var(--gp-glass-border);
	padding-top: 8px;
	margin-top: 8px;
	gap: 12px;
}

.empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	font-size: 14px;
	text-align: center;
	color: var(--gp-text-secondary);
	padding: 40px;
	gap: 12px;

	small {
		font-size: 12px;
		opacity: 0.7;
	}
}

.history-list {
	display: flex;
	flex-direction: column;
	gap: 16px;
}

.history-toolbar {
	display: flex;
	align-items: center;
	justify-content: space-between;
	border-bottom: 1px solid var(--gp-glass-border, rgb(255, 255, 255, 0.07));
	padding-bottom: 12px;
}

.history-toolbar__title {
	font-weight: 700;
	font-size: 13px;
	color: var(--gp-text-main);
}

.activity-header__left {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: 8px;
}
</style>

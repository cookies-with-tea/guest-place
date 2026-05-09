<template>
	<UiModal v-model="isHistoryOpen" title="Translation History" width="700px" @close="closeHistory">
		<div v-loading="isHistoryLoading" class="history-container">
			<div v-if="editingTranslation" class="history-info">
				<div class="info-item">
					<span class="label">Key:</span>
					<span class="value">{{ editingTranslation.key }}</span>
				</div>
				<div class="info-item">
					<span class="label">Locale:</span>
					<span class="value">{{ editingTranslation.locale }}</span>
				</div>
			</div>

			<el-table :data="translationHistory" border stripe style="width: 100%">
				<el-table-column label="Version" prop="version_number" width="100" />
				<el-table-column label="Date" width="180">
					<template #default="{ row }">
						{{ new Date(row.created_at).toLocaleString() }}
					</template>
				</el-table-column>
				<el-table-column label="Value" prop="value" />
				<el-table-column label="Comment" prop="comment" />
				<el-table-column label="Actions" width="120">
					<template #default="{ row }">
						<el-button size="small" type="warning" @click="handleRollback(row.id)"> Rollback </el-button>
					</template>
				</el-table-column>
			</el-table>

			<div v-if="translationHistory.length === 0 && !isHistoryLoading" class="empty-history">
				No history versions found for this translation.
			</div>
		</div>
	</UiModal>
</template>

<script setup lang="ts">
import { UiModal } from '@admin-panel/ui'

import { useTranslations } from '#entities/translation/lib/composables'

const { isHistoryOpen, isHistoryLoading, translationHistory, editingTranslation, closeHistory, handleRollback } =
	useTranslations()
</script>

<style scoped>
.history-container {
	padding: 8px 0;
}

.history-info {
	display: flex;
	border-radius: 8px;
	background: var(--gp-bg-lighter);
	padding: 12px;
	margin-bottom: 20px;
	gap: 24px;
}

.info-item {
	display: flex;
	font-size: 0.9rem;
	gap: 8px;
}

.info-item .label {
	font-weight: 600;
	color: var(--gp-text-secondary);
}

.empty-history {
	text-align: center;
	color: var(--gp-text-disabled);
	padding: 40px;
}
</style>

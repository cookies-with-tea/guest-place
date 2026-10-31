<template>
	<UiModal v-model="isRefsOpen" title="Где используется ключ" width="700px" @close="closeRefs">
		<div v-loading="isRefsLoading" class="refs-container">
			<div v-if="editingTranslation" class="refs-info">
				<div class="info-item">
					<span class="label">Ключ:</span>
					<span class="value">{{ editingTranslation.key }}</span>
				</div>
			</div>

			<el-table :data="translationRefs" border stripe style="width: 100%">
				<el-table-column label="Схема" prop="schemaName" width="200">
					<template #default="{ row }">
						{{ row.schemaName }}
						<div class="schema-slug">{{ row.schemaSlug }}</div>
					</template>
				</el-table-column>
				<el-table-column label="Запись" prop="entrySlug" />
				<el-table-column label="Поле" prop="fieldPath" width="180" />
				<el-table-column label="" width="120" align="center">
					<template #default="{ row }">
						<router-link :to="`/content/${row.schemaSlug}/edit/${row.contentEntryId}`">
							<el-button size="small" type="primary" text @click="closeRefs"> Открыть </el-button>
						</router-link>
					</template>
				</el-table-column>
			</el-table>

			<div v-if="translationRefs.length === 0 && !isRefsLoading" class="empty-refs">
				Этот ключ пока нигде не используется в контенте.
			</div>
		</div>
	</UiModal>
</template>

<script setup lang="ts">
import { UiModal } from '@admin-panel/ui'

import { useTranslations } from '#entities/translation/lib/composables'

const { isRefsOpen, isRefsLoading, translationRefs, editingTranslation, closeRefs } = useTranslations()
</script>

<style scoped>
.refs-container {
	padding: 8px 0;
}

.refs-info {
	display: flex;
	border-radius: 8px;
	background: var(--bg-surface);
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

.schema-slug {
	font-size: 0.8em;
	color: var(--gp-text-disabled);
}

.empty-refs {
	text-align: center;
	color: var(--gp-text-disabled);
	padding: 40px;
}
</style>

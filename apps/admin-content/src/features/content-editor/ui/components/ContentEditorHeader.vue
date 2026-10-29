<template>
	<div class="editor-header">
		<h3>{{ isEdit ? 'Edit entry' : 'Create entry' }}</h3>
		<div class="header-actions">
			<el-select
				v-model="status"
				placeholder="Status"
				size="default"
				style="width: 130px; vertical-align: middle; margin-right: 8px"
			>
				<el-option label="Draft" value="draft">
					<div class="status-option"><el-tag size="small" type="info">DRAFT</el-tag></div>
				</el-option>
				<el-option label="Review" value="review">
					<div class="status-option"><el-tag size="small" type="warning">REVIEW</el-tag></div>
				</el-option>
				<el-option label="Published" value="published">
					<div class="status-option"><el-tag size="small" type="success">PUBLISHED</el-tag></div>
				</el-option>
			</el-select>
			<el-button-group style="vertical-align: middle; margin-right: 8px">
				<el-button v-if="status === 'draft'" size="default" plain type="warning" @click="status = 'review'">
					На ревью →
				</el-button>
				<el-button v-if="status === 'review'" size="default" plain type="info" @click="status = 'draft'">
					← В черновик
				</el-button>
				<el-button
					v-if="status !== 'published'"
					size="default"
					plain
					type="success"
					:icon="Promotion"
					@click="status = 'published'"
				>
					Опубликовать
				</el-button>
				<el-button v-else size="default" plain type="info" @click="status = 'draft'"> Снять с публикации </el-button>
			</el-button-group>
			<el-button :type="isTranslationMode ? 'warning' : 'default'" @click="isTranslationMode = !isTranslationMode">
				{{ isTranslationMode ? 'Exit Translation' : 'Translation Mode' }}
			</el-button>
			<el-button :type="isPreviewing ? 'primary' : 'default'" @click="isPreviewing = !isPreviewing">
				<svg
					v-if="isPreviewing"
					width="14"
					height="14"
					viewBox="0 0 24 24"
					fill="none"
					style="vertical-align: middle; margin-right: 4px"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M11 19H5a2 2 0 01-2-2V7a2 2 0 012-2h14a2 2 0 012 2v5"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
					/>
					<path d="M16 19h6M19 16v6" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
				</svg>
				{{ isPreviewing ? 'Split Preview' : 'Live Preview' }}
			</el-button>
			<el-button @click="emit('cancel')">Cancel</el-button>
			<el-button :loading="isSaving" type="primary" @click="emit('save')">
				{{ isEdit ? 'Update' : 'Create' }}
			</el-button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { Promotion } from '@element-plus/icons-vue'

defineProps<{
	isEdit?: boolean
	isSaving?: boolean
}>()

const emit = defineEmits<{
	save: []
	cancel: []
}>()

const status = defineModel<string>('status', { default: 'draft' })
const isTranslationMode = defineModel<boolean>('isTranslationMode', { default: false })
const isPreviewing = defineModel<boolean>('isPreviewing', { default: false })
</script>

<style scoped>
.editor-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 24px;
}

.editor-header h3 {
	font-weight: 700;
	font-size: 18px;
	color: var(--text-primary);
	margin: 0;
}

.header-actions {
	display: flex;
	gap: 12px;
}

.status-option {
	height: 34px;
	display: flex;
	align-items: center;
}
</style>

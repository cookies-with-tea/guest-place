<template>
	<header class="constructor-header">
		<div class="header-left">
			<el-button link @click="document.goBack">
				<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M19 12H5M12 19l-7-7 7-7" stroke-linecap="round" stroke-linejoin="round" />
				</svg>
				Назад к списку
			</el-button>
			<div class="page-meta-inputs">
				<el-input
					v-model="document.pageForm.title"
					placeholder="Название страницы (например: О платформе)"
					class="title-input"
				/>
				<div class="slug-input-wrapper">
					<span class="slug-prefix">/p/</span>
					<el-input
						:model-value="document.pageForm.slug"
						placeholder="slug"
						class="slug-input"
						@update:model-value="document.onSlugInput"
					/>
				</div>
			</div>
		</div>

		<div class="header-actions">
			<div class="workflow-status-bar">
				<el-tag
					:type="
						document.pageForm.status === 'published'
							? 'success'
							: document.pageForm.status === 'review'
								? 'warning'
								: 'info'
					"
					size="large"
					effect="dark"
					class="status-tag"
				>
					<span v-if="document.pageForm.status === 'published'">● ОПУБЛИКОВАНО</span>
					<span v-else-if="document.pageForm.status === 'review'">● НА ПРОВЕРКЕ</span>
					<span v-else>● ЧЕРНОВИК</span>
				</el-tag>

				<el-dropdown trigger="click" @command="document.handleStatusTransition">
					<el-button size="default" plain> Статус: {{ getStatusLabel(document.pageForm.status) }} ▾ </el-button>
					<template #dropdown>
						<el-dropdown-menu>
							<el-dropdown-item command="draft" :disabled="document.pageForm.status === 'draft'" :icon="EditPen">
								Черновик (Draft)
							</el-dropdown-item>
							<el-dropdown-item command="review" :disabled="document.pageForm.status === 'review'" :icon="Search">
								На проверку (Review)
							</el-dropdown-item>
							<el-dropdown-item
								command="published"
								:disabled="document.pageForm.status === 'published'"
								:icon="Promotion"
							>
								Опубликовать (Publish)
							</el-dropdown-item>
						</el-dropdown-menu>
					</template>
				</el-dropdown>
			</div>

			<el-button :type="livePreview.isPreviewing ? 'primary' : 'default'" @click="livePreview.togglePreview">
				<svg
					width="15"
					height="15"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					style="margin-right: 4px"
				>
					<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
					<circle cx="12" cy="12" r="3" />
				</svg>
				{{ livePreview.isPreviewing ? 'Скрыть превью' : 'Live Preview' }}
			</el-button>

			<el-button plain title="Открыть страницу во фронтенде в новой вкладке" @click="livePreview.openInNewTab">
				<svg
					width="14"
					height="14"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					style="margin-right: 4px"
				>
					<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
					<polyline points="15 3 21 3 21 9"></polyline>
					<line x1="10" y1="14" x2="21" y2="3"></line>
				</svg>
				На сайт
			</el-button>

			<el-button type="primary" :loading="document.saving" @click="document.handleSave"> Сохранить страницу </el-button>
		</div>
	</header>
</template>

<script setup lang="ts">
import { EditPen, Promotion, Search } from '@element-plus/icons-vue'
import type { PageDocument } from '../composables/usePageDocument'
import type { LivePreview } from '../composables/useLivePreview'
import { getStatusLabel } from '../lib/helpers'

defineProps<{
	document: PageDocument
	livePreview: LivePreview
}>()
</script>

<style scoped>
.header-left :deep(.el-button) {
	flex-shrink: 0;
}

.constructor-header {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	justify-content: space-between;
	border-bottom: 1px solid var(--border-color);
	background: var(--bg-card);
	padding: 12px 20px;
	gap: 12px;
}

.header-left {
	min-width: 0;
	display: flex;
	align-items: center;
	gap: 16px;
}

.page-meta-inputs {
	min-width: 0;
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: 8px;
}

.title-input {
	width: 280px;
	max-width: 100%;
}

.slug-input-wrapper {
	width: 180px;
	max-width: 100%;
	display: flex;
	align-items: center;
	border: 1px solid var(--border-color);
	border-radius: 6px;
	overflow: hidden;
}

.slug-input-wrapper:focus-within {
	border-color: var(--gp-primary);
}

.slug-prefix {
	font-size: 13px;
	white-space: nowrap;
	color: var(--text-muted);
	padding: 0 8px;
}

.slug-input :deep(.el-input__wrapper) {
	box-shadow: none;
}

.slug-input :deep(.el-input__inner) {
	padding-left: 0;
}

.header-actions {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: 8px;
}

.workflow-status-bar {
	display: flex;
	align-items: center;
	gap: 8px;
}

.status-tag {
	font-weight: 600;
	letter-spacing: 0.3px;
}
</style>

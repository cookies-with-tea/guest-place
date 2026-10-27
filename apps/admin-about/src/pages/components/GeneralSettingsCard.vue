<template>
	<el-card class="section-card mb-24">
		<template #header>
			<div class="card-header">
				<span>General Settings</span>
			</div>
		</template>
		<el-form label-position="top">
			<el-form-item label="Main Hero Title (Translation Key)">
				<el-input v-model="form.title" placeholder="e.g. about.hero.title" />
			</el-form-item>
			<el-form-item label="Main Hero Description (Translation Key)">
				<el-input v-model="form.description" placeholder="e.g. about.hero.desc" :rows="2" type="textarea" />
			</el-form-item>
			<div class="section-guide-embed">
				<UiMediaPicker v-model="form.heroGuideUuid" />
				<p class="guide-hint">Hero Section Preview</p>
			</div>
		</el-form>
	</el-card>
</template>

<script setup lang="ts">
import { UiMediaPicker } from '@admin-panel/ui'

import type { AboutForm } from '../composables/useAboutData'

defineProps<{
	form: AboutForm
}>()
</script>

<style scoped lang="scss">
// .section-card, .card-header, .guide-hint, .mb-24, :deep(.el-form-item__label)
// are shared across every section card and live in the parent AboutPage.vue.
.section-guide-embed {
	border: 1px dashed var(--gp-glass-border);
	border-radius: 8px;
	background: rgb(var(--gp-primary-rgb), 0.05);
	padding: 16px;
	margin-top: 20px;
}
</style>

<template>
	<el-card class="section-card mb-24">
		<template #header>
			<div class="card-header">
				<span>News Highlights</span>
			</div>
		</template>
		<el-form label-position="top">
			<el-form-item label="News Section Title (Translation Key)">
				<el-input v-model="form.newsTitle" placeholder="e.g. about.news.title" />
			</el-form-item>

			<KeyIconItemList
				:items="form.newsItems"
				divider-label="News Items"
				add-label="Add News Item (Key)"
				text-placeholder="Translation key"
			/>

			<div class="mt-16">
				<UiMediaPicker v-model="form.newsGuideUuid" />
				<p class="guide-hint">News Section Preview</p>
			</div>
		</el-form>
	</el-card>
</template>

<script setup lang="ts">
import { UiMediaPicker } from '@admin-panel/ui'

import type { AboutForm } from '../composables/useAboutData'
import KeyIconItemList from './KeyIconItemList.vue'

defineProps<{
	form: AboutForm
}>()
</script>

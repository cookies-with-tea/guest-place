<template>
	<el-card class="section-card mb-24">
		<template #header>
			<div class="card-header">
				<span>Leadership Overview</span>
			</div>
		</template>
		<el-form label-position="top">
			<el-row :gutter="20">
				<el-col :span="24">
					<el-form-item label="Section Logo">
						<div style="max-width: 250px">
							<UiMediaPicker v-model="form.leadershipLogoUuid" />
						</div>
					</el-form-item>
				</el-col>
				<el-col :span="24">
					<el-form-item label="Header Title (Translation Key)">
						<el-input v-model="form.leadershipTitle" placeholder="e.g. about.lead.title" />
					</el-form-item>
				</el-col>
			</el-row>
			<el-form-item label="Section Introduction (Translation Key)">
				<el-input v-model="form.leadershipDescription" :rows="2" type="textarea" placeholder="e.g. about.lead.desc" />
			</el-form-item>

			<KeyIconItemList
				:items="form.leadershipItems"
				divider-label="Team Members & Key Points"
				add-label="Add Leadership Item (Key)"
				text-placeholder="Key (e.g. about.lead.item)"
			/>

			<div class="mt-16">
				<UiMediaPicker v-model="form.leadershipGuideUuid" />
				<p class="guide-hint">Leadership Preview</p>
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

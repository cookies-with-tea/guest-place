<template>
	<div class="section-header mb-16">
		<h2>Who We Are</h2>
	</div>
	<div class="dynamic-list">
		<div v-for="(item, index) in form.whoWeAre" :key="index" class="list-item-wrapper mb-16">
			<el-card class="section-card">
				<template #header>
					<div class="card-header">
						<span>Member/Section #{{ index + 1 }}</span>
						<el-button :icon="Delete" link type="danger" @click="form.whoWeAre.splice(index, 1)" />
					</div>
				</template>
				<el-form label-position="top">
					<el-row :gutter="20">
						<el-col :span="24">
							<el-form-item label="Member Image">
								<div style="max-width: 250px">
									<UiMediaPicker v-model="item.imageUuid" />
								</div>
							</el-form-item>
						</el-col>
						<el-col :span="24">
							<el-form-item label="Title (Translation Key)">
								<el-input v-model="item.title" placeholder="e.g. about.who.item_title" />
							</el-form-item>
						</el-col>
					</el-row>
					<el-form-item label="Description (Translation Key)">
						<el-input v-model="item.description" :rows="2" type="textarea" placeholder="e.g. about.who.item_desc" />
					</el-form-item>
				</el-form>
			</el-card>
		</div>
		<div class="mb-16">
			<UiMediaPicker v-model="form.whoWeAreGuideUuid" />
			<p class="guide-hint">Who We Are Preview</p>
		</div>
		<el-button
			class="add-btn mb-32"
			:icon="Plus"
			plain
			type="primary"
			@click="form.whoWeAre.push({ title: '', description: '', imageUuid: null })"
		>
			Add Member/Section
		</el-button>
	</div>
</template>

<script setup lang="ts">
import { UiMediaPicker } from '@admin-panel/ui'
import { Delete, Plus } from '@element-plus/icons-vue'

import type { AboutForm } from '../composables/useAboutData'

defineProps<{
	form: AboutForm
}>()
</script>

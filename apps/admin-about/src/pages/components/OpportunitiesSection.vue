<template>
	<div class="section-header mb-16">
		<h2>Opportunities</h2>
	</div>
	<div class="dynamic-list">
		<div v-for="(opp, index) in form.opportunities" :key="index" class="list-item-wrapper mb-16">
			<el-card class="section-card">
				<template #header>
					<div class="card-header">
						<span>Opportunity Card #{{ index + 1 }}</span>
						<el-button :icon="Delete" link type="danger" @click="form.opportunities.splice(index, 1)" />
					</div>
				</template>
				<el-form label-position="top">
					<el-row :gutter="20">
						<el-col :span="24">
							<el-form-item label="Card Icon">
								<div style="max-width: 250px">
									<UiMediaPicker v-model="opp.iconUuid" />
								</div>
							</el-form-item>
						</el-col>
						<el-col :span="24">
							<el-form-item label="Title (Translation Key)">
								<el-input v-model="opp.title" placeholder="e.g. about.opp.title" />
							</el-form-item>
						</el-col>
					</el-row>
					<el-row :gutter="20">
						<el-col :span="12">
							<el-form-item label="Button Text (Translation Key)">
								<el-input v-model="opp.buttonText" placeholder="e.g. about.opp.btn" />
							</el-form-item>
						</el-col>
						<el-col :span="12">
							<el-form-item label="Link">
								<el-input v-model="opp.link" placeholder="e.g., /careers" />
							</el-form-item>
						</el-col>
					</el-row>
					<el-form-item label="Features List">
						<div style="width: 100%; display: flex; flex-direction: column; gap: 12px">
							<div v-for="(item, iIdx) in opp.items" :key="iIdx" class="sub-item">
								<el-input v-model="opp.items[iIdx]" placeholder="Translation key">
									<template #append>
										<el-button :icon="Delete" @click="opp.items.splice(iIdx, 1)" />
									</template>
								</el-input>
							</div>
							<el-button :icon="Plus" plain style="align-self: flex-start" type="primary" @click="opp.items.push('')">
								Add Feature (Key)
							</el-button>
						</div>
					</el-form-item>
				</el-form>
			</el-card>
		</div>
		<div class="mb-16">
			<UiMediaPicker v-model="form.opportunitiesGuideUuid" />
			<p class="guide-hint">Opportunities Preview</p>
		</div>
		<el-button
			class="add-btn mb-32"
			:icon="Plus"
			plain
			type="primary"
			@click="form.opportunities.push({ title: '', iconUuid: null, items: [], link: '', buttonText: '' })"
		>
			Add New Opportunity Card
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

<style scoped lang="scss">
.sub-item {
	margin-bottom: 8px;
}
</style>

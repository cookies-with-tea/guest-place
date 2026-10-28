<template>
	<el-card class="section-card mb-24">
		<template #header>
			<div class="card-header">
				<span>Tools & Services Overview</span>
			</div>
		</template>
		<el-form label-position="top">
			<el-row :gutter="20">
				<el-col :span="24">
					<el-form-item label="Tools Logo">
						<div style="max-width: 250px">
							<UiMediaPicker v-model="form.toolsLogoUuid" />
						</div>
					</el-form-item>
				</el-col>
				<el-col :span="24">
					<el-form-item label="Section Title (Translation Key)">
						<el-input v-model="form.toolsTitle" placeholder="e.g. platforms.tools.title" />
					</el-form-item>
				</el-col>
			</el-row>
			<div class="divider">Service Cards</div>
			<div v-for="(item, index) in form.toolsItems" :key="index" class="sub-item-complex">
				<el-row align="middle" :gutter="12">
					<el-col :span="22">
						<el-form-item class="mb-8" label="Card Title (Translation Key)">
							<el-input v-model="item.title" placeholder="e.g. platforms.tools.item_title" />
						</el-form-item>
						<el-form-item class="mb-8" label="Card Description (Translation Key)">
							<el-input v-model="item.text" :rows="2" type="textarea" placeholder="e.g. platforms.tools.item_desc" />
						</el-form-item>
					</el-col>
					<el-col :span="2">
						<el-button :icon="Delete" link type="danger" @click="form.toolsItems.splice(index, 1)" />
					</el-col>
				</el-row>
			</div>
			<el-button
				:icon="Plus"
				plain
				style="margin-top: 12px; margin-bottom: 24px"
				type="primary"
				@click="form.toolsItems.push({ title: '', text: '' })"
			>
				Add Service Card (Key)
			</el-button>
			<div class="mt-16">
				<UiMediaPicker v-model="form.toolsGuideUuid" />
				<p class="guide-hint">Tools Preview</p>
			</div>
		</el-form>
	</el-card>
</template>

<script setup lang="ts">
import { UiMediaPicker } from '@admin-panel/ui'
import { Delete, Plus } from '@element-plus/icons-vue'

import type { PlatformsForm } from '../composables/usePlatformsData'

defineProps<{
	form: PlatformsForm
}>()
</script>

<style scoped lang="scss">
.divider {
	display: flex;
	align-items: center;
	font-weight: 600;
	font-size: 0.9rem;
	color: var(--gp-primary);
	margin: 24px 0 16px;

	&::after {
		content: '';
		height: 1px;
		flex: 1;
		background: var(--gp-glass-border);
		margin-left: 16px;
	}
}

.sub-item-complex {
	border-bottom: 1px dashed var(--gp-glass-border);
	padding-bottom: 12px;
	margin-bottom: 12px;

	&:last-child {
		border-bottom: none;
	}
}
</style>

<template>
	<el-card class="section-card mb-24">
		<template #header>
			<div class="card-header">
				<span>Additional Services</span>
			</div>
		</template>
		<el-form label-position="top">
			<div v-for="(item, index) in form.additionalServices" :key="index" class="sub-item-complex">
				<el-row align="middle" :gutter="12">
					<el-col :span="14">
						<el-input v-model="item.text" placeholder="Key (e.g. guests.svc.item)" />
					</el-col>
					<el-col :span="6">
						<UiMediaPicker v-model="item.iconUuid" />
					</el-col>
					<el-col :span="2">
						<el-button :icon="Delete" link type="danger" @click="form.additionalServices.splice(index, 1)" />
					</el-col>
				</el-row>
			</div>
			<el-button
				:icon="Plus"
				plain
				style="margin-top: 12px; margin-bottom: 24px"
				type="primary"
				@click="form.additionalServices.push({ text: '', iconUuid: null })"
			>
				Add Service Item (Key)
			</el-button>
			<div class="mt-16">
				<UiMediaPicker v-model="form.additionalServicesGuideUuid" />
				<p class="guide-hint">Additional Services Preview</p>
			</div>
		</el-form>
	</el-card>
</template>

<script setup lang="ts">
import { UiMediaPicker } from '@admin-panel/ui'
import { Delete, Plus } from '@element-plus/icons-vue'

import type { GuestsForm } from '../composables/useGuestsData'

defineProps<{
	form: GuestsForm
}>()
</script>

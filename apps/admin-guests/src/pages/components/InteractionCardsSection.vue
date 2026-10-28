<template>
	<div class="section-header mb-16">
		<h2>Interaction Cards</h2>
	</div>
	<div class="dynamic-list">
		<div v-for="(card, index) in form.interactionCards" :key="index" class="list-item-wrapper mb-16">
			<el-card class="section-card">
				<template #header>
					<div class="card-header">
						<span>Interaction Card #{{ index + 1 }}</span>
						<el-button :icon="Delete" link type="danger" @click="form.interactionCards.splice(index, 1)" />
					</div>
				</template>
				<el-form label-position="top">
					<el-row :gutter="20">
						<el-col :span="24">
							<el-form-item label="Icon">
								<div style="max-width: 250px">
									<UiMediaPicker v-model="card.iconUuid" />
								</div>
							</el-form-item>
						</el-col>
						<el-col :span="24">
							<el-form-item label="Title (Translation Key)">
								<el-input v-model="card.title" placeholder="e.g. guests.card.title" />
							</el-form-item>
						</el-col>
					</el-row>
					<el-form-item label="Interaction Card Description (Translation Key)">
						<el-input v-model="card.text" :rows="2" type="textarea" placeholder="e.g. guests.card.desc" />
					</el-form-item>
					<el-row :gutter="20">
						<el-col :span="12">
							<el-form-item label="Button Text (Translation Key)">
								<el-input v-model="card.buttonText" placeholder="e.g. guests.card.btn" />
							</el-form-item>
						</el-col>
						<el-col :span="12">
							<el-form-item label="Link">
								<el-input v-model="card.link" />
							</el-form-item>
						</el-col>
					</el-row>
				</el-form>
			</el-card>
		</div>
		<div class="mb-16">
			<UiMediaPicker v-model="form.interactionCardsGuideUuid" />
			<p class="guide-hint">Interaction Cards Preview</p>
		</div>
		<el-button
			class="add-btn mb-24"
			:icon="Plus"
			plain
			type="primary"
			@click="form.interactionCards.push({ title: '', text: '', buttonText: '', link: '', iconUuid: null })"
		>
			Add Interaction Card
		</el-button>
	</div>
</template>

<script setup lang="ts">
import { UiMediaPicker } from '@admin-panel/ui'
import { Delete, Plus } from '@element-plus/icons-vue'

import type { GuestsForm } from '../composables/useGuestsData'

defineProps<{
	form: GuestsForm
}>()
</script>

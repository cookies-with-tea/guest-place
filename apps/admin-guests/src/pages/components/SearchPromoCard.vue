<template>
	<el-card class="section-card mb-24">
		<template #header>
			<div class="card-header">
				<span>Quick Search Promo</span>
			</div>
		</template>
		<el-form label-position="top">
			<el-form-item label="Promo Title (Translation Key)">
				<el-input v-model="form.searchPromoTitle" placeholder="e.g. guests.promo.title" />
			</el-form-item>
			<el-form-item label="Promo Description (Translation Key)">
				<el-input
					v-model="form.searchPromoDescription"
					:rows="2"
					type="textarea"
					placeholder="e.g. guests.promo.desc"
				/>
			</el-form-item>
			<div class="mt-16">
				<UiMediaPicker v-model="form.searchPromoGuideUuid" />
				<p class="guide-hint">Search Promo Preview</p>
			</div>
		</el-form>
	</el-card>
</template>

<script setup lang="ts">
import { UiMediaPicker } from '@admin-panel/ui'

import type { GuestsForm } from '../composables/useGuestsData'

defineProps<{
	form: GuestsForm
}>()
</script>

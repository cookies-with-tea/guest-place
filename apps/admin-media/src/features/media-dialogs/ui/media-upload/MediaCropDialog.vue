<template>
	<el-dialog
		v-model="crop.isCropDialogOpen"
		append-to-body
		title="Crop & Resize Image Before Upload"
		width="800px"
		:before-close="crop.closeCropDialog"
	>
		<div class="crop-modal-body">
			<div class="crop-cropper-area">
				<VueCropper
					v-if="crop.isCropDialogOpen && crop.croppingImageUrl"
					:ref="(el: any) => (crop.cropperRef = el)"
					:img="crop.croppingImageUrl"
					:auto-crop="true"
					:center-box="true"
					:fixed="crop.cropFixed"
					:fixed-number="crop.cropFixedNumber"
					:output-size="1"
					output-type="webp"
				/>
			</div>
			<div class="crop-modal-controls">
				<div class="crop-control-group">
					<span class="control-label">Aspect Ratio</span>
					<el-radio-group v-model="crop.cropAspectRatio" size="small" @change="crop.handleCropRatioChange">
						<el-radio-button label="free" value="free">Free</el-radio-button>
						<el-radio-button label="1:1" value="1:1">1:1</el-radio-button>
						<el-radio-button label="4:3" value="4:3">4:3</el-radio-button>
						<el-radio-button label="16:9" value="16:9">16:9</el-radio-button>
					</el-radio-group>
				</div>
				<div class="crop-control-group">
					<span class="control-label">Rotate</span>
					<el-button-group>
						<el-button size="small" :icon="RefreshLeft" @click="crop.cropperRef?.rotateLeft()" />
						<el-button size="small" :icon="RefreshRight" @click="crop.cropperRef?.rotateRight()" />
					</el-button-group>
				</div>
			</div>
		</div>
		<template #footer>
			<el-button @click="crop.closeCropDialog">Cancel</el-button>
			<el-button type="primary" @click="crop.applyCrop">Apply Crop & Resize</el-button>
		</template>
	</el-dialog>
</template>

<script setup lang="ts">
import { VueCropper } from 'vue-cropper/dist/vue-cropper.es.js'

import { RefreshLeft, RefreshRight } from '@element-plus/icons-vue'

import type { ImageCrop } from '../../composables/useImageCrop'

import 'vue-cropper/dist/index.css'

defineProps<{
	crop: ImageCrop
}>()
</script>

<style scoped>
.crop-modal-body {
	display: flex;
	flex-direction: column;
	gap: 16px;
}

.crop-cropper-area {
	width: 100%;
	height: 400px;
	border: 1px solid var(--border-color);
	border-radius: 8px;
	overflow: hidden;
}

.crop-modal-controls {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	justify-content: space-between;
	gap: 12px;
}

.crop-control-group {
	display: flex;
	align-items: center;
	gap: 8px;
}

.control-label {
	font-size: 13px;
	color: var(--text-muted);
}
</style>

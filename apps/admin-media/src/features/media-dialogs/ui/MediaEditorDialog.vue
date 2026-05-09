<template>
	<UiModal v-model="isEditorOpen" modal-class="strong-overlay" title="Image Editor" :width="1000" @close="closeEditor">
		<div v-if="currentMedia?.data" class="editor-layout">
			<div class="editor-main">
				<div class="cropper-wrapper" :class="cropperBg">
					<VueCropper
						ref="cropper"
						:auto-crop="true"
						:bg="false"
						:can-move="true"
						:can-move-box="true"
						:center-box="true"
						:fixed="fixed"
						:fixed-number="fixedNumber"
						:img="currentMedia.data.url"
						:info="true"
						:output-size="1"
						:output-type="'webp'"
						@real-time="realTime"
					/>
					<div class="bg-toggle">
						<el-radio-group v-model="cropperBg" size="small">
							<el-radio-button label="Transparent" value="checkered" />
							<el-radio-button label="White" value="white" />
							<el-radio-button label="Black" value="black" />
						</el-radio-group>
					</div>
				</div>
				<div class="editor-controls">
					<div class="control-group">
						<span class="label">Aspect Ratio</span>
						<el-radio-group v-model="aspectRatio" size="small" @change="handleRatioChange">
							<el-radio-button label="Free" value="free" />
							<el-radio-button label="1:1" value="1:1" />
							<el-radio-button label="4:3" value="4:3" />
							<el-radio-button label="16:9" value="16:9" />
						</el-radio-group>
					</div>
					<div class="control-group">
						<span class="label">Rotate</span>
						<el-button-group>
							<el-button size="small" :icon="RefreshLeft" @click="rotateLeft" />
							<el-button size="small" :icon="RefreshRight" @click="rotateRight" />
						</el-button-group>
					</div>
					<div class="control-group">
						<span class="label">Flip</span>
						<el-button-group>
							<el-button size="small" @click="flipX">
								<el-icon><Sort /></el-icon>
							</el-button>
							<el-button size="small" @click="flipY">
								<el-icon style="transform: rotate(90deg)"><Sort /></el-icon>
							</el-button>
						</el-button-group>
					</div>
				</div>
			</div>

			<div class="editor-sidebar">
				<div class="preview-title">Preview</div>
				<div class="preview-box">
					<div :style="previewStyle" class="preview-inner">
						<img :src="currentMedia.data.url" :style="previewImgStyle" class="preview-img" />
					</div>
				</div>

				<div class="export-options">
					<div class="label">Export Settings</div>
					<el-checkbox v-model="convertToWebP">Convert to WebP</el-checkbox>
					<el-form label-position="top">
						<el-form-item label="Quality">
							<el-slider v-model="quality" :max="100" :min="10" />
						</el-form-item>
					</el-form>
				</div>
			</div>
		</div>

		<template #footer>
			<el-button @click="closeEditor">Cancel</el-button>
			<el-button :loading="isSaving" type="primary" @click="handleFinish"> Save as New Version </el-button>
		</template>
	</UiModal>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { VueCropper } from 'vue-cropper'

import { UiModal } from '@admin-panel/ui'
import { RefreshLeft, RefreshRight, Sort } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

import { useMedia } from '#entities/media'

import 'vue-cropper/dist/index.css'

const { currentMedia } = useMedia()

const isEditorOpen = ref(false)
const isSaving = ref(false)
const cropper = ref<any>(null)

const aspectRatio = ref('free')
const fixed = ref(false)
const fixedNumber = ref([1, 1])
const convertToWebP = ref(true)
const quality = ref(90)

const previewStyle = ref<any>({})
const previewImgStyle = ref<any>({})
const cropperBg = ref('checkered')

const realTime = (data: any) => {
	previewStyle.value = {
		width: data.w + 'px',
		height: data.h + 'px',
		overflow: 'hidden',
		margin: '0',
		zoom: 200 / data.w, // Scale to fit preview box
	}

	previewImgStyle.value = data.img
}

const openEditor = () => {
	isEditorOpen.value = true
}

const closeEditor = () => {
	isEditorOpen.value = false
}

const handleRatioChange = (val: string) => {
	if (val === 'free') {
		fixed.value = false
	} else {
		fixed.value = true

		const [w, h] = val.split(':').map(Number)

		fixedNumber.value = [w, h]
	}
}

const rotateLeft = () => cropper.value.rotateLeft()
const rotateRight = () => cropper.value.rotateRight()
const flipX = () => cropper.value.turnLeft()
const flipY = () => cropper.value.turnRight()

const handleFinish = () => {
	isSaving.value = true

	cropper.value.getCropBlob(async (data: Blob) => {
		const formData = new FormData()
		const originalName = currentMedia.value?.data?.name || 'edited_image'
		const fileName = originalName.endsWith('.webp') ? originalName : `${originalName}_edited.webp`

		formData.append('file', data, fileName)

		formData.append('source', 'cms')

		formData.append('title', `${currentMedia.value?.data?.title || ''} (Edited)`)

		formData.append('category', currentMedia.value?.data?.category || '')

		const { data: responseData, messages } = await useMedia().createMedia(formData)

		if (responseData) {
			ElMessage.success('Image saved successfully as new version')
		} else {
			ElMessage.error(messages?.[0] || 'Failed to save image')
		}

		isSaving.value = false

		closeEditor()
	})
}

defineExpose({ openEditor })
</script>

<style scoped>
.editor-layout {
	height: 600px;
	display: grid;
	grid-template-columns: 1fr 280px;
	gap: 24px;
}

.editor-main {
	display: flex;
	flex-direction: column;
	gap: 16px;
}

.cropper-wrapper {
	min-height: 400px;
	position: relative;
	flex: 1;
	border-radius: 8px;
	overflow: hidden;
}

.cropper-wrapper.checkered {
	background-image:
		linear-gradient(45deg, #333 25%, transparent 25%), linear-gradient(-45deg, #333 25%, transparent 25%),
		linear-gradient(45deg, transparent 75%, #333 75%), linear-gradient(-45deg, transparent 75%, #333 75%);
	background-position:
		0 0,
		0 10px,
		10px -10px,
		-10px 0;
	background-size: 20px 20px;
	background-color: #1a1a1a;
}

.cropper-wrapper.white {
	background: #fff;
}

.cropper-wrapper.black {
	background: #000;
}

.bg-toggle {
	top: 12px;
	right: 12px;
	position: absolute;
	z-index: 10;
}

.editor-controls {
	display: flex;
	border: 1px solid var(--gp-glass-border);
	border-radius: var(--gp-radius-sm);
	background: var(--gp-bg-element);
	padding: 16px;
	gap: 24px;
}

.control-group {
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.label {
	font-weight: 600;
	font-size: 11px;
	letter-spacing: 0.05em;
	text-transform: uppercase;
	color: var(--gp-text-secondary);
}

.editor-sidebar {
	width: 280px;
	display: flex;
	flex-direction: column;
	border-left: 1px solid var(--gp-border-color);
	padding-left: 24px;
	gap: 24px;
}

.preview-title {
	font-weight: 600;
	font-size: 14px;
	color: var(--gp-text-main);
}

.preview-box {
	width: 200px;
	height: 200px;
	display: flex;
	align-items: center;
	justify-content: center;
	border: 1px solid var(--gp-border-color);
	border-radius: var(--gp-radius-sm);
	background: var(--gp-bg-main);
	overflow: hidden;
}

.preview-inner {
	display: block;
	transform-origin: center;
}

.preview-img {
	max-width: none !important;
	display: block;
}

.export-options {
	display: flex;
	flex-direction: column;
	color: var(--gp-text-main);
	gap: 16px;
}

:deep(.el-radio-button__inner) {
	border-color: var(--gp-border-color);
	color: var(--gp-text-main);
	background: var(--gp-bg-element);
}

:deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
	border-color: var(--gp-primary);
	color: #fff;
	background: var(--gp-primary);
}

:global(.strong-overlay) {
	background-color: rgb(0, 0, 0, 0.85) !important;
	backdrop-filter: blur(12px) !important;
}

.cropper-wrapper :deep(.vue-cropper) {
	background: transparent !important;
	background-image: none !important;
}

.editor-controls :deep(.el-icon) {
	font-size: 18px;
	color: var(--gp-text-main);
}
</style>

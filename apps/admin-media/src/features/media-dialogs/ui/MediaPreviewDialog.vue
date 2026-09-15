<template>
	<UiModal v-model="isPreviewDialogOpen" title="Media Preview" :width="850" @close="closePreviewDialog">
		<div v-if="currentMedia?.data && currentMedia.data.uuid === currentMediaUuid" class="preview-container">
			<div class="media-display-wrapper">
				<div class="media-display" :class="previewBg">
					<el-image
						v-if="currentMedia.data.mediaType === 'image'"
						class="preview-img"
						fit="contain"
						lazy
						:src="activeVariantUrl || currentMedia.data.url"
					/>
					<video
						v-else-if="currentMedia.data.mediaType === 'video'"
						class="preview-img"
						controls
						playsinline
						:src="currentMedia.data.url"
					/>
					<div v-else class="file-placeholder">
						<el-icon :size="64"><Document /></el-icon>
						<span class="name">{{ currentMedia.data.name }}</span>
					</div>

					<div class="bg-toggle">
						<el-radio-group v-model="previewBg" size="small">
							<el-radio-button label="Transparent" value="checkered" />
							<el-radio-button label="White" value="white" />
							<el-radio-button label="Black" value="black" />
						</el-radio-group>
					</div>
				</div>

				<div v-if="currentMedia.data.mediaType === 'image' && currentMedia.data.variants" class="variant-selector">
					<span class="variant-label">Preview Size:</span>
					<el-radio-group v-model="selectedVariantKey" size="small">
						<el-radio-button value="original">Original</el-radio-button>
						<el-radio-button v-if="currentMedia.data.variants.large" value="large">Large</el-radio-button>
						<el-radio-button v-if="currentMedia.data.variants.medium" value="medium">Medium</el-radio-button>
						<el-radio-button v-if="currentMedia.data.variants.thumbnail" value="thumbnail">Thumb</el-radio-button>
					</el-radio-group>
				</div>
			</div>

			<div class="media-info">
				<el-descriptions
					border
					:column="1"
					label-width="100px"
					title="Information"
					:content-style="{ 'word-break': 'break-all' }"
				>
					<el-descriptions-item label="Title">
						{{ currentMedia.data.title || 'no title' }}
					</el-descriptions-item>
					<el-descriptions-item label="Alt Text">
						{{ currentMedia.data.alt || 'no alt text' }}
					</el-descriptions-item>
					<el-descriptions-item label="Type">
						<el-tag size="small" type="info">{{ currentMedia.data.mediaType }}</el-tag>
					</el-descriptions-item>
					<el-descriptions-item label="Dimensions">
						{{
							currentMedia.data.width && currentMedia.data.height
								? `${currentMedia.data.width} × ${currentMedia.data.height} px`
								: '—'
						}}
					</el-descriptions-item>
					<el-descriptions-item label="Category">
						{{ currentMedia.data.category || '—' }}
					</el-descriptions-item>
					<el-descriptions-item label="Tags">
						<div class="tags-list">
							<el-tag v-for="tag in currentMedia.data.tags" :key="tag" class="media-tag" size="small">
								{{ tag }}
							</el-tag>
							<span v-if="!currentMedia.data.tags?.length" class="no-tags">—</span>
						</div>
					</el-descriptions-item>
					<el-descriptions-item label="Name">
						{{ currentMedia.data.name || 'unknown' }}
					</el-descriptions-item>
					<el-descriptions-item v-if="currentMedia.data.dominantColor" label="Color">
						<div class="color-badge" @click="copyHex(currentMedia.data.dominantColor)">
							<span class="color-dot" :style="{ backgroundColor: currentMedia.data.dominantColor }" />
							<span class="color-hex">{{ currentMedia.data.dominantColor }}</span>
						</div>
					</el-descriptions-item>
					<el-descriptions-item label="Size">
						{{ formatFileSize(currentMedia.data.sizeBytes) }}
					</el-descriptions-item>
					<el-descriptions-item label="Added">
						{{ formatDate(currentMedia.data.createdAt) }}
					</el-descriptions-item>
				</el-descriptions>

				<div v-if="currentMedia.data.palette && currentMedia.data.palette.length" class="palette-box">
					<div class="palette-header">
						<span class="palette-title">Color Palette</span>
					</div>
					<div class="palette-swatches">
						<div
							v-for="color in currentMedia.data.palette"
							:key="color"
							class="palette-swatch"
							:style="{ backgroundColor: color }"
							:title="`Click to copy ${color}`"
							@click="copyHex(color)"
						>
							<span class="swatch-hex">{{ color }}</span>
						</div>
					</div>
				</div>

				<div v-if="currentMedia.data.exif && hasExifData(currentMedia.data.exif)" class="exif-box">
					<div class="exif-header">
						<span class="exif-title">Camera & Metadata</span>
						<el-tag v-if="currentMedia.data.exif.sanitized" size="small" type="success">✓ Sanitized</el-tag>
					</div>
					<div class="exif-details">
						<div v-if="currentMedia.data.exif.make || currentMedia.data.exif.model" class="exif-row">
							<span class="exif-label">Camera:</span>
							<span class="exif-val">{{
								[currentMedia.data.exif.make, currentMedia.data.exif.model].filter(Boolean).join(' ')
							}}</span>
						</div>
						<div v-if="currentMedia.data.exif.dateTime" class="exif-row">
							<span class="exif-label">Taken:</span>
							<span class="exif-val">{{ currentMedia.data.exif.dateTime }}</span>
						</div>
						<div
							v-if="currentMedia.data.exif.fNumber || currentMedia.data.exif.exposureTime || currentMedia.data.exif.iso"
							class="exif-row"
						>
							<span class="exif-label">Settings:</span>
							<span class="exif-val">
								{{
									[
										currentMedia.data.exif.fNumber ? `f/${currentMedia.data.exif.fNumber}` : '',
										currentMedia.data.exif.exposureTime ? `${currentMedia.data.exif.exposureTime}s` : '',
										currentMedia.data.exif.iso ? `ISO ${currentMedia.data.exif.iso}` : '',
										currentMedia.data.exif.focalLength ? `${currentMedia.data.exif.focalLength}mm` : '',
									]
										.filter(Boolean)
										.join(' · ')
								}}
							</span>
						</div>
						<div v-if="currentMedia.data.exif.gpsStripped" class="exif-privacy-row">
							<span class="privacy-note">🔒 Sensitive GPS location stripped</span>
						</div>
					</div>
				</div>

				<div v-if="currentMedia.data.mediaType === 'image'" class="variants-box">
					<div class="variants-header">
						<span class="variants-title">WebP Variants</span>
						<el-button size="small" :loading="isOptimizing" @click="onOptimize"> Regenerate </el-button>
					</div>
					<div v-if="currentMedia.data.variants" class="variants-list">
						<div v-if="currentMedia.data.variants.thumbnail" class="variant-row">
							<span class="variant-tag">Thumb</span>
							<span class="variant-meta"
								>{{ currentMedia.data.variants.thumbnail.width }}×{{
									currentMedia.data.variants.thumbnail.height
								}}</span
							>
							<span class="variant-meta">{{ formatFileSize(currentMedia.data.variants.thumbnail.sizeBytes) }}</span>
							<el-button link size="small" type="primary" @click="copyUrl(currentMedia.data.variants.thumbnail.url)"
								>Copy</el-button
							>
						</div>
						<div v-if="currentMedia.data.variants.medium" class="variant-row">
							<span class="variant-tag">Medium</span>
							<span class="variant-meta"
								>{{ currentMedia.data.variants.medium.width }}×{{ currentMedia.data.variants.medium.height }}</span
							>
							<span class="variant-meta">{{ formatFileSize(currentMedia.data.variants.medium.sizeBytes) }}</span>
							<el-button link size="small" type="primary" @click="copyUrl(currentMedia.data.variants.medium.url)"
								>Copy</el-button
							>
						</div>
						<div v-if="currentMedia.data.variants.large" class="variant-row">
							<span class="variant-tag">Large</span>
							<span class="variant-meta"
								>{{ currentMedia.data.variants.large.width }}×{{ currentMedia.data.variants.large.height }}</span
							>
							<span class="variant-meta">{{ formatFileSize(currentMedia.data.variants.large.sizeBytes) }}</span>
							<el-button link size="small" type="primary" @click="copyUrl(currentMedia.data.variants.large.url)"
								>Copy</el-button
							>
						</div>
					</div>
				</div>
			</div>
		</div>

		<template #footer>
			<div class="dialog-footer">
				<el-button @click="closePreviewDialog">Close</el-button>
				<el-link
					class="download-link"
					:download="currentMedia?.data?.name"
					:href="activeVariantUrl || currentMedia?.data?.url"
					target="_blank"
				>
					<el-button type="primary">Download</el-button>
				</el-link>
			</div>
		</template>
	</UiModal>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

import { UiModal } from '@admin-panel/ui'
import { Document } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

import { useMedia } from '#entities/media'
import { mediaUtils } from '#entities/media/utils/media.utils'

const { currentMedia, isPreviewDialogOpen, closePreviewDialog, currentMediaUuid, handleOptimize } = useMedia()

const previewBg = ref('checkered')
const selectedVariantKey = ref<string>('original')
const isOptimizing = ref(false)

const activeVariantUrl = computed(() => {
	if (!currentMedia.value?.data) return ''
	const item = currentMedia.value.data

	if (selectedVariantKey.value === 'thumbnail' && item.variants?.thumbnail) {
		return item.variants.thumbnail.url
	}

	if (selectedVariantKey.value === 'medium' && item.variants?.medium) {
		return item.variants.medium.url
	}

	if (selectedVariantKey.value === 'large' && item.variants?.large) {
		return item.variants.large.url
	}

	return item.url
})

const onOptimize = async () => {
	if (!currentMediaUuid.value) return
	isOptimizing.value = true

	try {
		await handleOptimize(currentMediaUuid.value)

		ElMessage.success('WebP варианты успешно созданы')
	} catch (e: any) {
		ElMessage.error(`Ошибка оптимизации: ${e?.message || 'Не удалось сгенерировать'}`)
	} finally {
		isOptimizing.value = false
	}
}

const copyUrl = async (url: string) => {
	try {
		await navigator.clipboard.writeText(url)

		ElMessage.success('Ссылка скопирована')
	} catch {
		ElMessage.error('Не удалось скопировать ссылку')
	}
}

const copyHex = async (hex: string) => {
	try {
		await navigator.clipboard.writeText(hex)

		ElMessage.success(`Цвет ${hex} скопирован`)
	} catch {
		ElMessage.error('Не удалось скопировать цвет')
	}
}

const hasExifData = (exif: Record<string, any>) => {
	return Boolean(
		exif.make ||
			exif.model ||
			exif.dateTime ||
			exif.iso ||
			exif.fNumber ||
			exif.exposureTime ||
			exif.sanitized ||
			exif.gpsStripped
	)
}

const formatFileSize = (bytes: number) => mediaUtils.formatFileSize(bytes)
const formatDate = (date: Date | string) => mediaUtils.formatDate(date)
</script>

<style scoped>
.preview-container {
	display: grid;
	grid-template-columns: 1fr 320px;
	gap: 24px;
}

.media-display-wrapper {
	display: flex;
	flex-direction: column;
	gap: 12px;
}

.media-display {
	width: 100%;
	height: 400px;
	position: relative;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	border: 1px solid var(--border-color);
	border-radius: 12px;
	background: var(--bg-surface);
	overflow: hidden;
}

.variant-selector {
	display: flex;
	align-items: center;
	gap: 8px;
}

.variant-label {
	font-size: 12px;
	color: var(--text-muted);
}

.media-display.checkered {
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

.media-display.white {
	background: #fff !important;
}

.media-display.black {
	background: #000 !important;
}

.bg-toggle {
	top: 12px;
	right: 12px;
	position: absolute;
	z-index: 10;
}

.preview-img {
	width: 100%;
	height: 100%;
}

.file-placeholder {
	display: flex;
	flex-direction: column;
	align-items: center;
	color: var(--text-muted);
	gap: 16px;
}

.name {
	font-size: 14px;
	word-break: break-all;
	text-align: center;
	padding: 0 20px;
}

.media-info {
	min-width: 0;
	display: flex;
	flex-direction: column;
	overflow: hidden;
	gap: 16px;
}

.tags-list {
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
}

.media-tag {
	border-radius: 4px;
}

.no-tags {
	color: var(--text-muted);
}

.variants-box {
	display: flex;
	flex-direction: column;
	border: 1px solid var(--border-color);
	border-radius: 8px;
	background: var(--bg-surface);
	padding: 12px;
	gap: 8px;
}

.variants-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.variants-title {
	font-weight: 600;
	font-size: 13px;
}

.variants-list {
	display: flex;
	flex-direction: column;
	gap: 6px;
}

.variant-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	font-size: 12px;
}

.variant-tag {
	width: 50px;
	font-weight: 500;
	color: var(--text-primary);
}

.variant-meta {
	color: var(--text-muted);
}

.color-badge {
	display: inline-flex;
	align-items: center;
	border-radius: 4px;
	transition: background 0.15s;
	cursor: pointer;
	padding: 2px 6px;
	gap: 6px;
}

.color-badge:hover {
	background: var(--bg-hover, rgb(0, 0, 0, 0.05));
}

.color-dot {
	width: 12px;
	height: 12px;
	display: inline-block;
	border: 1px solid rgb(0, 0, 0, 0.15);
	border-radius: 50%;
}

.color-hex {
	font-family: monospace;
	font-size: 12px;
}

.palette-box,
.exif-box {
	display: flex;
	flex-direction: column;
	border: 1px solid var(--border-color);
	border-radius: 8px;
	background: var(--bg-surface);
	padding: 12px;
	gap: 8px;
}

.palette-header,
.exif-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.palette-title,
.exif-title {
	font-weight: 600;
	font-size: 13px;
}

.palette-swatches {
	display: flex;
	flex-wrap: wrap;
	gap: 6px;
}

.palette-swatch {
	height: 32px;
	min-width: 44px;
	position: relative;
	display: flex;
	flex: 1;
	align-items: center;
	justify-content: center;
	border: 1px solid rgb(0, 0, 0, 0.15);
	border-radius: 6px;
	transition:
		transform 0.15s,
		box-shadow 0.15s;
	cursor: pointer;
}

.palette-swatch:hover {
	box-shadow: 0 4px 8px rgb(0, 0, 0, 0.15);
	transform: translateY(-2px);
}

.swatch-hex {
	font-family: monospace;
	font-size: 10px;
	text-shadow: 0 1px 2px rgb(0, 0, 0, 0.8);
	color: #fff;
	opacity: 0.9;
}

.exif-details {
	display: flex;
	flex-direction: column;
	font-size: 12px;
	gap: 4px;
}

.exif-row {
	display: flex;
	gap: 6px;
}

.exif-label {
	min-width: 60px;
	color: var(--text-muted);
}

.exif-val {
	font-weight: 500;
	color: var(--text-primary);
}

.exif-privacy-row {
	border-top: 1px dashed var(--border-color);
	padding-top: 4px;
	margin-top: 4px;
}

.privacy-note {
	font-weight: 500;
	font-size: 11px;
	color: var(--el-color-success, #67c23a);
}

.dialog-footer {
	display: flex;
	justify-content: flex-end;
	gap: 12px;
}

.download-link {
	text-decoration: none;
}
</style>

<template>
	<div class="exif-box">
		<div class="exif-header">
			<span class="exif-title">Camera & Metadata</span>
			<el-tag v-if="exif.sanitized" size="small" type="success">
				<el-icon class="exif-tag-icon"><CircleCheck /></el-icon>
				Sanitized
			</el-tag>
		</div>
		<div class="exif-details">
			<div v-if="exif.make || exif.model" class="exif-row">
				<span class="exif-label">Camera:</span>
				<span class="exif-val">{{ [exif.make, exif.model].filter(Boolean).join(' ') }}</span>
			</div>
			<div v-if="exif.dateTime" class="exif-row">
				<span class="exif-label">Taken:</span>
				<span class="exif-val">{{ exif.dateTime }}</span>
			</div>
			<div v-if="exif.fNumber || exif.exposureTime || exif.iso" class="exif-row">
				<span class="exif-label">Settings:</span>
				<span class="exif-val">
					{{
						[
							exif.fNumber ? `f/${exif.fNumber}` : '',
							exif.exposureTime ? `${exif.exposureTime}s` : '',
							exif.iso ? `ISO ${exif.iso}` : '',
							exif.focalLength ? `${exif.focalLength}mm` : '',
						]
							.filter(Boolean)
							.join(' · ')
					}}
				</span>
			</div>
			<div v-if="exif.gpsStripped" class="exif-privacy-row">
				<span class="privacy-note">
					<el-icon class="privacy-note-icon"><Lock /></el-icon>
					Sensitive GPS location stripped
				</span>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { CircleCheck, Lock } from '@element-plus/icons-vue'

defineProps<{
	exif: Record<string, any>
}>()
</script>

<style scoped>
.exif-box {
	display: flex;
	flex-direction: column;
	border: 1px solid var(--border-color);
	border-radius: 8px;
	background: var(--bg-surface);
	padding: 12px;
	gap: 8px;
}

.exif-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.exif-title {
	font-weight: 600;
	font-size: 13px;
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
	display: inline-flex;
	align-items: center;
	font-weight: 500;
	font-size: 11px;
	color: var(--el-color-success, #67c23a);
	gap: 4px;
}

.privacy-note-icon {
	width: 1em;
	height: 1em;
	flex-shrink: 0;
}

.exif-tag-icon {
	width: 1em;
	height: 1em;
	flex-shrink: 0;
	vertical-align: -0.15em;
}
</style>

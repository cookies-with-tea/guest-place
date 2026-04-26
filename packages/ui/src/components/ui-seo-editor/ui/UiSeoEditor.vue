<template>
	<div class="ui-seo-editor">
		<el-card class="seo-card" shadow="never">
			<template #header>
				<div class="card-header">
					<span>Search Engine Optimization (SEO)</span>
				</div>
			</template>

			<el-form label-position="top">
				<div class="form-grid">
					<el-form-item label="Browser Title">
						<el-input
							:model-value="modelValue.title"
							placeholder="Enter page title..."
							@input="(val: string) => emitField('title', val)"
						/>
						<div class="field-info">Recommended: 50-60 characters. Current: {{ (modelValue.title || '').length }}</div>
					</el-form-item>

					<el-form-item label="Meta Description">
						<el-input
							:model-value="modelValue.description"
							type="textarea"
							:rows="3"
							placeholder="Enter meta description..."
							@input="(val: string) => emitField('description', val)"
						/>
						<div class="field-info"
							>Recommended: 150-160 characters. Current: {{ (modelValue.description || '').length }}</div
						>
					</el-form-item>

					<el-form-item label="Keywords (Comma separated)">
						<el-input
							:model-value="modelValue.keywords"
							placeholder="keyword1, keyword2..."
							@input="(val: string) => emitField('keywords', val)"
						/>
					</el-form-item>
				</div>

				<el-divider content-position="left">Social Media (OpenGraph)</el-divider>

				<div class="social-preview-grid">
					<div class="social-form">
						<el-form-item label="OG Title">
							<el-input
								:model-value="modelValue.ogTitle"
								placeholder="Social media title..."
								@input="(val: string) => emitField('ogTitle', val)"
							/>
						</el-form-item>
						<el-form-item label="OG Description">
							<el-input
								:model-value="modelValue.ogDescription"
								type="textarea"
								:rows="2"
								placeholder="Social media description..."
								@input="(val: string) => emitField('ogDescription', val)"
							/>
						</el-form-item>
						<el-form-item label="OG Image URL">
							<UiMediaPicker
								:model-value="modelValue.ogImage"
								@update:model-value="(val: string) => emitField('ogImage', val)"
							/>
						</el-form-item>
					</div>

					<div class="google-preview">
						<span class="preview-label">Google Search Preview</span>
						<div class="google-snippet">
							<div class="google-title">{{ modelValue.title || 'Page Title Placeholder' }}</div>
							<div class="google-url">https://guest-place.com › ...</div>
							<div class="google-desc">
								{{
									modelValue.description ||
									'Provide a meta description to see how your page might appear in search results.'
								}}
							</div>
						</div>
					</div>
				</div>
			</el-form>
		</el-card>
	</div>
</template>

<script setup lang="ts">
import UiMediaPicker from '../../ui-media-picker'

interface SeoData {
	title?: string
	description?: string
	keywords?: string
	ogTitle?: string
	ogDescription?: string
	ogImage?: string
}

const props = defineProps<{
	modelValue: SeoData
}>()

const emit = defineEmits(['update:modelValue'])

const emitField = (field: keyof SeoData, value: string | undefined) => {
	emit('update:modelValue', {
		...props.modelValue,
		[field]: value,
	})
}
</script>

<style scoped>
.ui-seo-editor {
	width: 100%;
	margin-top: 24px;
}

.seo-card {
	border: 1px solid var(--border-color);
	border-radius: 12px;
	background: var(--bg-card);
}

.card-header {
	display: flex;
	align-items: center;
	font-weight: 600;
	gap: 10px;
}

.form-grid {
	display: grid;
	grid-template-columns: 1fr;
	gap: 16px;
}

.field-info {
	font-size: 11px;
	color: var(--text-muted);
	margin-top: 4px;
}

.social-preview-grid {
	display: grid;
	grid-template-columns: 1fr 1fr;
	margin-top: 16px;
	gap: 32px;
}

.google-preview {
	display: flex;
	flex-direction: column;
	border: 1px solid #dfe1e5;
	border-radius: 8px;
	background: #fff;
	padding: 20px;
	gap: 4px;
}

.is-dark .google-preview {
	border-color: #3c4043;
	background: #202124;
}

.preview-label {
	font-weight: 600;
	font-size: 11px;
	text-transform: uppercase;
	color: var(--text-muted);
	margin-bottom: 12px;
}

.google-title {
	font-size: 20px;
	text-decoration: none;
	color: #1a0dab;
	cursor: pointer;
	margin-bottom: 4px;
}

.is-dark .google-title {
	color: #8ab4f8;
}

.google-url {
	font-size: 14px;
	color: #202124;
	margin-bottom: 4px;
}

.is-dark .google-url {
	color: #bdc1c6;
}

.google-desc {
	font-size: 14px;
	line-height: 1.58;
	color: #4d5156;
}

.is-dark .google-desc {
	color: #bdc1c6;
}

@media (width <= 1024px) {
	.social-preview-grid {
		grid-template-columns: 1fr;
	}
}
</style>

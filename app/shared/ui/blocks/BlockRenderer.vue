<template>
	<div class="cms-blocks-container">
		<template v-for="(block, index) in normalizedBlocks" :key="block.id || `block-${index}`">
			<div
				class="cms-block-wrapper"
				:class="[
					getBlockThemeClass(block.style?.theme),
					getBlockPaddingClass(block.style?.padding),
					getBlockMarginClass(block.style?.margin),
				]"
				:style="getBlockStyleObject(block.style)"
				:data-block-type="block.type"
				:data-block-id="block.id"
			>
				<!-- Registered Component -->
				<component
					:is="resolveBlockComponent(block.type)"
					v-if="hasBlockComponent(block.type)"
					:data="block.data || {}"
					:block="block"
					:block-id="block.id"
					:style-config="block.style || {}"
					class="cms-block-item"
				/>

				<!-- Fallback Stub for missing / not yet implemented blocks -->
				<BlockFallback
					v-else
					:block-type="block.type"
					:data="block.data"
					:block-id="block.id"
				/>
			</div>
		</template>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getCmsBlock } from './registry'
import BlockFallback from './BlockFallback.vue'

export interface BlockStyle {
	theme?: string
	padding?: string
	margin?: string
	backgroundColor?: string
	backgroundGradient?: string
	backgroundImage?: string
	customCss?: string
}

export interface CmsBlockItem {
	id?: string
	type: string
	data?: Record<string, any>
	style?: BlockStyle
}

const props = defineProps<{
	blocks?: CmsBlockItem[] | null
}>()

const normalizedBlocks = computed(() => {
	if (!props.blocks || !Array.isArray(props.blocks)) {
		return []
	}
	return props.blocks
})

function hasBlockComponent(type: string): boolean {
	return !!getCmsBlock(type)?.component
}

function resolveBlockComponent(type: string) {
	return getCmsBlock(type)?.component
}

function getBlockThemeClass(theme?: string): string {
	if (!theme || theme === 'light') return 'theme-light'
	return `theme-${theme}`
}

function getBlockPaddingClass(padding?: string): string {
	if (!padding || padding === 'md') return 'pad-md'
	return `pad-${padding}`
}

function getBlockMarginClass(margin?: string): string {
	if (!margin || margin === 'none') return 'mar-none'
	return `mar-${margin}`
}

function getBlockStyleObject(style?: BlockStyle): Record<string, string> {
	if (!style) return {}
	const res: Record<string, string> = {}
	if (style.backgroundColor) {
		res['background-color'] = style.backgroundColor
	}
	if (style.backgroundGradient) {
		res['background'] = style.backgroundGradient
	}
	if (style.backgroundImage) {
		res['background-image'] = `url(${style.backgroundImage})`
		res['background-size'] = 'cover'
		res['background-position'] = 'center'
	}
	return res
}
</script>

<style scoped>
.cms-blocks-container {
	width: 100%;
	display: flex;
	flex-direction: column;
}

.cms-block-wrapper {
	width: 100%;
	position: relative;
	transition: background-color 0.25s ease, color 0.25s ease;
}

/* Themes */
.theme-light {
	background-color: transparent;
	color: inherit;
}

.theme-dark {
	background-color: #0f172a;
	color: #f8fafc;
}

.theme-dark :deep(h1),
.theme-dark :deep(h2),
.theme-dark :deep(h3),
.theme-dark :deep(h4),
.theme-dark :deep(p),
.theme-dark :deep(span):not(.badge) {
	color: #f8fafc !important;
}

.theme-dark :deep(.feature-col),
.theme-dark :deep(.news-card) {
	background: rgba(255, 255, 255, 0.05) !important;
	border-color: rgba(255, 255, 255, 0.1) !important;
}

.theme-accent {
	background-color: #6366f1;
	color: #ffffff;
}

.theme-accent :deep(h1),
.theme-accent :deep(h2),
.theme-accent :deep(h3),
.theme-accent :deep(h4),
.theme-accent :deep(p) {
	color: #ffffff !important;
}

.theme-muted {
	background-color: #f8fafc;
	color: #334155;
}

.theme-transparent {
	background-color: transparent;
}

/* Paddings */
.pad-none {
	padding-top: 0 !important;
	padding-bottom: 0 !important;
}

.pad-sm {
	padding-top: 24px;
	padding-bottom: 24px;
}

.pad-md {
	padding-top: 48px;
	padding-bottom: 48px;
}

.pad-lg {
	padding-top: 80px;
	padding-bottom: 80px;
}

.pad-xl {
	padding-top: 120px;
	padding-bottom: 120px;
}

/* Margins */
.mar-none {
	margin-top: 0 !important;
	margin-bottom: 0 !important;
}

.mar-sm {
	margin-top: 16px;
	margin-bottom: 16px;
}

.mar-md {
	margin-top: 32px;
	margin-bottom: 32px;
}

.mar-lg {
	margin-top: 64px;
	margin-bottom: 64px;
}
</style>

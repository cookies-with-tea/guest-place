<template>
	<div class="preview-split-frame">
		<div class="preview-frame-header">
			<div class="preview-frame-header__info">
				<span class="preview-live-badge">● LIVE</span>
				<span class="preview-frame-title">/p/{{ pageForm.slug || 'about' }}</span>
			</div>

			<div class="preview-device-controls">
				<button
					type="button"
					:class="['preview-device-btn', { 'is-active': livePreview.previewDevice === 'desktop' }]"
					title="Десктоп (100% / 1440px)"
					@click="livePreview.previewDevice = 'desktop'"
				>
					<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<rect x="2" y="3" width="20" height="14" rx="2" />
						<path d="M8 21h8M12 17v4" />
					</svg>
					<span>Desktop</span>
				</button>
				<button
					type="button"
					:class="['preview-device-btn', { 'is-active': livePreview.previewDevice === 'tablet' }]"
					title="Планшет (768px)"
					@click="livePreview.previewDevice = 'tablet'"
				>
					<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<rect x="4" y="2" width="16" height="20" rx="2" />
						<circle cx="12" cy="18" r="1" fill="currentColor" />
					</svg>
					<span>Tablet (768px)</span>
				</button>
				<button
					type="button"
					:class="['preview-device-btn', { 'is-active': livePreview.previewDevice === 'mobile' }]"
					title="Мобильный (375px)"
					@click="livePreview.previewDevice = 'mobile'"
				>
					<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<rect x="5" y="2" width="14" height="20" rx="2" />
						<circle cx="12" cy="18" r="1" fill="currentColor" />
						<path d="M9 5h6" />
					</svg>
					<span>Mobile (375px)</span>
				</button>
			</div>

			<div class="preview-frame-header__actions">
				<el-button size="small" link @click="livePreview.reloadPreview">↻ Обновить</el-button>
			</div>
		</div>

		<div class="preview-panel__viewport" :class="`is-${livePreview.previewDevice}`">
			<iframe
				:ref="(el) => (livePreview.previewIframe = el as HTMLIFrameElement)"
				:src="livePreview.previewUrl"
				class="preview-iframe"
			/>
		</div>
	</div>
</template>

<script setup lang="ts">
import type { LivePreview } from '../composables/useLivePreview'

defineProps<{
	pageForm: { slug: string }
	livePreview: LivePreview
}>()
</script>

<style scoped lang="scss">
.preview-split-frame {
	height: 100%;
	min-width: 340px;
	display: flex;
	flex-direction: column;
	border-left: 1px solid var(--border-color);
	background: #0f1117;
	overflow: hidden;
}

.preview-frame-header {
	height: 42px;
	display: flex;
	flex-shrink: 0;
	align-items: center;
	justify-content: space-between;
	border-bottom: 1px solid var(--border-color);
	font-size: 12px;
	color: var(--text-muted);
	background: var(--bg-card);
	padding: 0 12px;
	z-index: 2;
	gap: 8px;
}

.preview-frame-header__info {
	min-width: 0;
	display: flex;
	align-items: center;
	font-size: 11px;
	gap: 6px;
}

.preview-live-badge {
	font-weight: 800;
	font-size: 10px;
	letter-spacing: 0.5px;
	color: #10b981;
}

.preview-frame-title {
	font-family: monospace;
	font-weight: 500;
	white-space: nowrap;
	text-overflow: ellipsis;
	color: var(--text-main);
	overflow: hidden;
}

.preview-device-controls {
	display: flex;
	align-items: center;
	border: 1px solid var(--border-color);
	border-radius: 8px;
	background: rgb(0, 0, 0, 0.04);
	padding: 2px 4px;
	gap: 3px;
}

.preview-device-btn {
	display: flex;
	align-items: center;
	border: none;
	border-radius: 6px;
	font-weight: 500;
	font-size: 11px;
	color: var(--text-muted);
	background: transparent;
	transition: all 0.2s;
	cursor: pointer;
	padding: 3px 8px;
	gap: 4px;

	&:hover {
		color: var(--text-main);
		background: rgb(0, 0, 0, 0.05);
	}

	&.is-active {
		box-shadow: 0 2px 4px rgb(99, 102, 241, 0.25);
		color: #fff;
		background: var(--gp-primary);
	}
}

.preview-panel__viewport {
	position: relative;
	display: flex;
	flex: 1;
	align-items: flex-start;
	justify-content: center;
	background: #0f1117;
	transition: all 0.3s ease;
	overflow: auto;

	&.is-desktop {
		background: #fff;
		padding: 0;
	}

	&.is-tablet {
		padding: 20px 16px;
	}

	&.is-mobile {
		padding: 20px 16px;
	}
}

.preview-iframe {
	width: 100%;
	height: 100%;
	display: block;
	background: #fff;
	transition: all 0.3s ease;
}

.preview-panel__viewport.is-desktop .preview-iframe {
	border: none;
	border-radius: 0;
	box-shadow: none;
}

.preview-panel__viewport.is-tablet .preview-iframe {
	width: 768px;
	height: calc(100% - 10px);
	min-height: 680px;
	max-width: 100%;
	border: 8px solid #2d3748;
	border-radius: 20px;
	box-shadow: 0 20px 50px rgb(0, 0, 0, 0.6);
}

.preview-panel__viewport.is-mobile .preview-iframe {
	width: 375px;
	height: calc(100% - 10px);
	min-height: 667px;
	max-width: 100%;
	border: 10px solid #2d3748;
	border-radius: 32px;
	box-shadow: 0 20px 50px rgb(0, 0, 0, 0.6);
}
</style>

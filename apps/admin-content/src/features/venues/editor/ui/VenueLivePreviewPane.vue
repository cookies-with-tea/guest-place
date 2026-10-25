<template>
	<div class="editor-preview-pane">
		<div class="preview-bar">
			<div class="preview-urlbar">
				<span class="urlbar-origin">Nuxt Client</span>
				<span class="urlbar-path">/venues/{{ venueForm.form.slug || 'loft-forest-hall' }}</span>
				<button
					type="button"
					class="preview-refresh-btn"
					title="Обновить iframe"
					@click="livePreview.reloadPreviewIframe"
					>↻</button
				>
			</div>

			<div class="preview-devices">
				<button
					type="button"
					class="device-btn"
					:class="{ 'is-active': livePreview.previewDevice === 'desktop' }"
					title="Desktop view"
					@click="livePreview.previewDevice = 'desktop'"
				>
					🖥️ Desktop
				</button>
				<button
					type="button"
					class="device-btn"
					:class="{ 'is-active': livePreview.previewDevice === 'tablet' }"
					title="Tablet view (768px)"
					@click="livePreview.previewDevice = 'tablet'"
				>
					📱 Tablet
				</button>
				<button
					type="button"
					class="device-btn"
					:class="{ 'is-active': livePreview.previewDevice === 'mobile' }"
					title="Mobile view (375px)"
					@click="livePreview.previewDevice = 'mobile'"
				>
					📱 Mobile
				</button>
				<button
					type="button"
					class="device-btn"
					title="Открыть в новой вкладке"
					@click="openLanding(venueForm.form.slug)"
				>
					↗ Вкладка
				</button>
			</div>
		</div>

		<div class="preview-viewport-wrapper" :class="`device-${livePreview.previewDevice}`">
			<iframe
				:ref="(el) => (livePreview.previewIframeRef = el as HTMLIFrameElement)"
				:src="livePreview.previewIframeUrl"
				class="preview-iframe"
				@load="livePreview.onIframeLoad"
			/>
		</div>
	</div>
</template>

<script setup lang="ts">
import type { VenueForm } from '../composables/useVenueForm'
import type { VenueLivePreview } from '../composables/useVenueLivePreview'
import { openLanding } from '../../lib/helpers'

defineProps<{
	venueForm: VenueForm
	livePreview: VenueLivePreview
}>()
</script>

<style scoped lang="scss">
.editor-preview-pane {
	height: 100%;
	display: flex;
	flex-direction: column;
	background: #030712;
}

.preview-bar {
	display: flex;
	flex-shrink: 0;
	flex-wrap: wrap;
	align-items: center;
	justify-content: space-between;
	border-bottom: 1px solid var(--border-color);
	background: #0f172a;
	padding: 8px 14px;
	gap: 12px;
}

.preview-urlbar {
	display: flex;
	flex: 1;
	align-items: center;
	border: 1px solid rgb(255, 255, 255, 0.1);
	border-radius: 6px;
	font-size: 12px;
	background: rgb(255, 255, 255, 0.05);
	padding: 4px 10px;
	overflow: hidden;
	gap: 8px;
}

.urlbar-origin {
	font-weight: 600;
	font-size: 11px;
	color: #10b981;
}

.urlbar-path {
	white-space: nowrap;
	text-overflow: ellipsis;
	color: var(--text-primary);
	overflow: hidden;
}

.preview-refresh-btn {
	border: none;
	font-size: 14px;
	color: var(--text-muted);
	background: transparent;
	cursor: pointer;
	padding: 0 4px;
	margin-left: auto;

	&:hover {
		color: #fff;
	}
}

.preview-devices {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: 4px;
}

.device-btn {
	border: 1px solid transparent;
	border-radius: 5px;
	font-size: 11px;
	color: var(--text-muted);
	background: transparent;
	transition: all 0.15s;
	cursor: pointer;
	padding: 4px 8px;

	&:hover {
		color: #fff;
		background: rgb(255, 255, 255, 0.06);
	}

	&.is-active {
		font-weight: 600;
		color: #0f172a;
		background: var(--accent-primary, #38bdf8);
	}
}

.preview-viewport-wrapper {
	position: relative;
	display: flex;
	flex: 1;
	align-items: center;
	justify-content: center;
	background: #020617;
	overflow: hidden;

	&.device-desktop .preview-iframe {
		width: 100%;
		height: 100%;
		border: none;
	}

	&.device-tablet {
		padding: 20px;

		.preview-iframe {
			width: 768px;
			height: 100%;
			max-width: 100%;
			border: 4px solid #334155;
			border-radius: 12px;
			box-shadow: 0 20px 40px rgb(0, 0, 0, 0.6);
		}
	}

	&.device-mobile {
		padding: 20px;

		.preview-iframe {
			width: 375px;
			height: 100%;
			max-width: 100%;
			border: 6px solid #334155;
			border-radius: 20px;
			box-shadow: 0 20px 40px rgb(0, 0, 0, 0.6);
		}
	}
}

.preview-iframe {
	width: 100%;
	height: 100%;
	border: none;
	background: #fff;
}
</style>

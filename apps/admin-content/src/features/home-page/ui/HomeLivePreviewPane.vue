<template>
	<div class="editor-preview-pane">
		<div class="preview-toolbar">
			<div class="preview-toolbar__url">
				<span class="origin-tag">Nuxt 3 Client</span>
				<span class="url-path">/ (Home Page)</span>
				<button
					type="button"
					class="icon-action-btn"
					title="Перезагрузить страницу в фрейме"
					@click="livePreview.reloadPreviewIframe"
					>↻</button
				>
			</div>

			<div class="preview-toolbar__devices">
				<button
					type="button"
					class="device-chip"
					:class="{ active: livePreview.previewDevice === 'desktop' }"
					title="Десктоп (100%)"
					@click="livePreview.previewDevice = 'desktop'"
				>
					🖥️ Desktop
				</button>
				<button
					type="button"
					class="device-chip"
					:class="{ active: livePreview.previewDevice === 'tablet' }"
					title="Планшет (768px)"
					@click="livePreview.previewDevice = 'tablet'"
				>
					📱 Tablet
				</button>
				<button
					type="button"
					class="device-chip"
					:class="{ active: livePreview.previewDevice === 'mobile' }"
					title="Смартфон (375px)"
					@click="livePreview.previewDevice = 'mobile'"
				>
					📱 Mobile
				</button>
				<button
					type="button"
					class="device-chip link-chip"
					title="Открыть в новой вкладке браузера"
					@click="livePreview.openClientPreview"
					>↗ Вкладка</button
				>
			</div>
		</div>

		<div class="preview-viewport-shell" :class="`device-${livePreview.previewDevice}`">
			<iframe
				:ref="(el) => (livePreview.previewIframeRef = el as HTMLIFrameElement)"
				:src="livePreview.previewUrl"
				class="preview-iframe"
				@load="livePreview.onIframeLoad"
			/>
		</div>
	</div>
</template>

<script setup lang="ts">
import type { HomeLivePreview } from '../composables/useHomeLivePreview'

defineProps<{
	livePreview: HomeLivePreview
}>()
</script>

<style scoped lang="scss">
.editor-preview-pane {
	height: 100%;
	display: flex;
	flex-direction: column;
	background: #090e17;
}

.preview-toolbar {
	display: flex;
	flex-shrink: 0;
	align-items: center;
	justify-content: space-between;
	border-bottom: 1px solid var(--gp-glass-border, rgb(255, 255, 255, 0.08));
	background: var(--gp-bg-surface, #1e293b);
	padding: 10px 16px;

	&__url {
		display: flex;
		align-items: center;
		border: 1px solid var(--gp-glass-border, rgb(255, 255, 255, 0.06));
		border-radius: 6px;
		font-size: 12px;
		background: rgb(0, 0, 0, 0.35);
		padding: 4px 10px;
		gap: 8px;
	}

	&__devices {
		display: flex;
		align-items: center;
		gap: 6px;
	}
}

.origin-tag {
	font-weight: 700;
	font-size: 11px;
	color: var(--gp-primary, #42b883);
}

.url-path {
	color: #e2e8f0;
}

.icon-action-btn {
	border: none;
	font-size: 14px;
	color: #94a3b8;
	background: transparent;
	transition: color 0.15s;
	cursor: pointer;
	padding: 0 4px;

	&:hover {
		color: #fff;
	}
}

.device-chip {
	border: 1px solid var(--gp-glass-border, rgb(255, 255, 255, 0.08));
	border-radius: 6px;
	font-size: 11px;
	color: var(--gp-text-secondary, #94a3b8);
	background: rgb(255, 255, 255, 0.05);
	transition: all 0.15s;
	cursor: pointer;
	padding: 4px 8px;

	&:hover {
		color: #fff;
		background: rgb(255, 255, 255, 0.1);
	}

	&.active {
		border-color: var(--accent-primary, #0284c7);
		font-weight: 600;
		color: #fff;
		background: var(--accent-primary, #0284c7);
	}

	&.link-chip {
		border-color: rgb(16, 185, 129, 0.3);
		color: #10b981;
		background: rgb(16, 185, 129, 0.08);

		&:hover {
			background: rgb(16, 185, 129, 0.2);
		}
	}
}

.preview-viewport-shell {
	width: 100%;
	display: flex;
	flex: 1;
	align-items: center;
	justify-content: center;
	background: #090e17;
	padding: 12px;
	overflow: hidden;

	&.device-desktop .preview-iframe {
		width: 100%;
		height: 100%;
		border-radius: 8px;
	}

	&.device-tablet .preview-iframe {
		width: 768px;
		height: 100%;
		border-radius: 12px;
		box-shadow: 0 20px 40px rgb(0, 0, 0, 0.6);
	}

	&.device-mobile .preview-iframe {
		width: 375px;
		height: 100%;
		border-radius: 16px;
		box-shadow: 0 20px 40px rgb(0, 0, 0, 0.6);
	}
}

.preview-iframe {
	border: 1px solid var(--gp-glass-border, rgb(255, 255, 255, 0.1));
	background: #fff;
	transition: width 0.25s ease;
}
</style>

<template>
	<transition name="preview-slide">
		<div v-if="preview.isSplitPreview" class="preview-panel">
			<div class="preview-panel__header">
				<div class="preview-panel__title">
					<span class="preview-panel__badge">LIVE PREVIEW</span>
					<span class="preview-panel__name">{{ schemaName || 'Live View' }}</span>
				</div>

				<div class="preview-panel__center">
					<!-- Preset page quick links -->
					<div class="preview-presets">
						<button
							type="button"
							:class="['preset-btn', { 'is-active': preview.activePreset === 'about' }]"
							@click="preview.selectPreset('/about')"
						>
							/about
						</button>
						<button
							type="button"
							:class="['preset-btn', { 'is-active': preview.activePreset === 'guests' }]"
							@click="preview.selectPreset('/guests')"
						>
							/guests
						</button>
						<button
							type="button"
							:class="['preset-btn', { 'is-active': preview.activePreset === 'platforms' }]"
							@click="preview.selectPreset('/platforms')"
						>
							/platforms
						</button>
					</div>

					<!-- URL input bar -->
					<div class="preview-urlbar">
						<span class="urlbar-origin">{{ preview.clientBaseUrl }}</span>
						<input
							v-model="preview.previewPathInput"
							class="urlbar-input"
							placeholder="/about"
							@keydown.enter="preview.applyCustomPath"
							@blur="preview.applyCustomPath"
						/>
						<button
							type="button"
							class="urlbar-btn"
							title="Обновить iframe (проверка сохранения)"
							@click="preview.reloadIframe"
						>
							<svg
								width="13"
								height="13"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2.2"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
							</svg>
						</button>
					</div>
				</div>

				<div class="preview-panel__controls">
					<button
						:class="['device-btn', { 'is-active': preview.previewDevice === 'desktop' }]"
						title="Desktop"
						@click="preview.previewDevice = 'desktop'"
					>
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
							<rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" stroke-width="1.5" />
							<path d="M8 21H16M12 17V21" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
						</svg>
					</button>
					<button
						:class="['device-btn', { 'is-active': preview.previewDevice === 'tablet' }]"
						title="Tablet"
						@click="preview.previewDevice = 'tablet'"
					>
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
							<rect x="4" y="2" width="16" height="20" rx="2" stroke="currentColor" stroke-width="1.5" />
							<circle cx="12" cy="18" r="1" fill="currentColor" />
						</svg>
					</button>
					<button
						:class="['device-btn', { 'is-active': preview.previewDevice === 'mobile' }]"
						title="Mobile"
						@click="preview.previewDevice = 'mobile'"
					>
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
							<rect x="5" y="2" width="14" height="20" rx="2" stroke="currentColor" stroke-width="1.5" />
							<circle cx="12" cy="18" r="1" fill="currentColor" />
							<path d="M9 5H15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
						</svg>
					</button>
					<button class="device-btn" title="Open in new tab" @click="preview.openInNewTab">
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path
								d="M18 13V19C18 19.5523 17.5523 20 17 20H5C4.44772 20 4 19.5523 4 19V7C4 6.44772 4.44772 6 5 6H11"
								stroke="currentColor"
								stroke-width="1.5"
								stroke-linecap="round"
							/>
							<path
								d="M15 4H20M20 4V9M20 4L10 14"
								stroke="currentColor"
								stroke-width="1.5"
								stroke-linecap="round"
								stroke-linejoin="round"
							/>
						</svg>
					</button>
				</div>
			</div>
			<div class="preview-panel__viewport" :class="`is-${preview.previewDevice}`">
				<iframe
					:ref="(el) => (preview.splitIframeRef = el as HTMLIFrameElement)"
					:src="preview.previewUrl"
					class="preview-panel__iframe"
					@load="preview.onIframeLoad"
				/>
			</div>
		</div>
	</transition>
</template>

<script setup lang="ts">
import type { SplitPreview } from '../../composables/useSplitPreview'

defineProps<{
	preview: SplitPreview
	schemaName?: string
}>()
</script>

<style scoped lang="scss">
.preview-panel {
	max-height: calc(100vh - 32px);
	display: flex;
	flex-direction: column;
	border: 1px solid var(--gp-glass-border, rgb(255, 255, 255, 0.08));
	border-radius: 12px;
	box-shadow: 0 8px 32px rgb(0, 0, 0, 0.35);
	background: var(--bg-card, #161b26);
	overflow: hidden;
}

.preview-panel__header {
	display: flex;
	flex-shrink: 0;
	align-items: center;
	justify-content: space-between;
	border-bottom: 1px solid var(--gp-glass-border, rgb(255, 255, 255, 0.06));
	background: rgb(255, 255, 255, 0.03);
	padding: 10px 14px;
	gap: 12px;
}

.preview-panel__title {
	display: flex;
	align-items: center;
	font-weight: 600;
	font-size: 13px;
	white-space: nowrap;
	color: var(--gp-text-secondary, #94a3b8);
	gap: 8px;
}

.preview-panel__badge {
	border: 1px solid rgb(99, 102, 241, 0.35);
	border-radius: 4px;
	font-weight: 800;
	font-size: 9px;
	letter-spacing: 0.12em;
	color: #a5b4fc;
	background: rgb(99, 102, 241, 0.15);
	padding: 2px 6px;
}

.preview-panel__name {
	max-width: 120px;
	white-space: nowrap;
	text-overflow: ellipsis;
	overflow: hidden;
}

.preview-panel__center {
	min-width: 0;
	max-width: 480px;
	display: flex;
	flex: 1;
	align-items: center;
	gap: 8px;
}

.preview-presets {
	display: flex;
	flex-shrink: 0;
	align-items: center;
	gap: 4px;
}

.preset-btn {
	border: 1px solid rgb(255, 255, 255, 0.1);
	border-radius: 4px;
	font-weight: 500;
	font-size: 11px;
	color: var(--gp-text-secondary, #94a3b8);
	background: rgb(255, 255, 255, 0.05);
	transition: all 0.15s ease;
	cursor: pointer;
	padding: 3px 8px;

	&:hover {
		color: #fff;
		background: rgb(255, 255, 255, 0.1);
	}

	&.is-active {
		border-color: rgb(99, 102, 241, 0.5);
		color: #a5b4fc;
		background: rgb(99, 102, 241, 0.2);
	}
}

.preview-urlbar {
	min-width: 0;
	display: flex;
	flex: 1;
	align-items: center;
	border: 1px solid rgb(255, 255, 255, 0.1);
	border-radius: 6px;
	background: rgb(15, 23, 42, 0.6);
	padding: 2px 6px 2px 10px;
	gap: 4px;

	.urlbar-origin {
		font-size: 11px;
		white-space: nowrap;
		color: var(--gp-text-secondary, #64748b);
		user-select: none;
	}

	.urlbar-input {
		min-width: 50px;
		flex: 1;
		outline: none;
		border: none;
		font-family: monospace;
		font-size: 12px;
		color: #e2e8f0;
		background: transparent;
	}

	.urlbar-btn {
		display: flex;
		align-items: center;
		border: none;
		border-radius: 4px;
		color: var(--gp-text-secondary, #94a3b8);
		background: transparent;
		transition: all 0.15s ease;
		cursor: pointer;
		padding: 3px;

		&:hover {
			color: #38bdf8;
			background: rgb(255, 255, 255, 0.1);
		}
	}
}

.preview-panel__controls {
	display: flex;
	flex-shrink: 0;
	align-items: center;
	gap: 4px;
}

.device-btn {
	width: 30px;
	height: 30px;
	display: flex;
	align-items: center;
	justify-content: center;
	border: none;
	border-radius: 6px;
	text-decoration: none;
	color: var(--gp-text-secondary, #64748b);
	background: transparent;
	transition: all 0.15s ease;
	cursor: pointer;

	&:hover {
		color: var(--gp-text-main, #e2e8f0);
		background: rgb(255, 255, 255, 0.06);
	}

	&.is-active {
		color: #a5b4fc;
		background: rgb(99, 102, 241, 0.15);
	}
}

.preview-panel__viewport {
	min-height: 500px;
	display: flex;
	flex: 1;
	align-items: flex-start;
	justify-content: center;
	background: #f1f5f9;
	transition: all 0.3s ease;
	overflow: auto;

	&.is-tablet,
	&.is-mobile {
		background: #0f1117;
		padding: 20px;
	}
}

.preview-panel__iframe {
	width: 100%;
	height: 100%;
	min-height: 560px;
	display: block;
	border: none;
	background: #fff;
	transition: all 0.3s ease;
}

.preview-panel__viewport.is-tablet .preview-panel__iframe {
	min-height: 600px;
	max-width: 768px;
	border: 6px solid #334155;
	border-radius: 16px;
	box-shadow: 0 20px 60px rgb(0, 0, 0, 0.5);
}

.preview-panel__viewport.is-mobile .preview-panel__iframe {
	min-height: 667px;
	max-width: 390px;
	border: 8px solid #334155;
	border-radius: 32px;
	box-shadow: 0 20px 60px rgb(0, 0, 0, 0.5);
}

/* Slide-in transition */
.preview-slide-enter-active,
.preview-slide-leave-active {
	transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.preview-slide-enter-from,
.preview-slide-leave-to {
	transform: translateX(24px);
	opacity: 0;
}
</style>

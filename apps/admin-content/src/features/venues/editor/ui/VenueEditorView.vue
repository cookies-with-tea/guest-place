<template>
	<div class="venues-live-editor-view">
		<VenueEditorTopBar
			:venue-form="venueForm"
			:live-preview="livePreview"
			@close="emit('close')"
			@save="emit('save')"
		/>

		<div class="editor-content-container" :class="[`split-${livePreview.splitRatio}`]">
			<div class="editor-form-pane">
				<div class="venue-tabs-nav">
					<button
						v-for="t in tabs.venueTabs"
						:key="t.id"
						type="button"
						class="venue-tab-btn"
						:class="{ active: tabs.activeFormTab === t.id }"
						@click="tabs.activeFormTab = t.id"
					>
						<span class="tab-icon">{{ t.icon }}</span>
						<span class="tab-label">{{ t.label }}</span>
						<span v-if="'badge' in t" class="tab-badge">{{ t.badge }}</span>
					</button>
				</div>

				<div class="form-scrollable-area">
					<VenueBasicInfoTab
						v-show="tabs.activeFormTab === 'basic'"
						:venue-form="venueForm"
						:on-change="livePreview.syncLivePreview"
					/>
					<VenueHallsRoomsTab
						v-show="tabs.activeFormTab === 'halls'"
						:venue-form="venueForm"
						:on-change="livePreview.syncLivePreview"
					/>
					<VenuePricingTab
						v-show="tabs.activeFormTab === 'pricing'"
						:venue-form="venueForm"
						:on-change="livePreview.syncLivePreview"
					/>
					<VenueMenuTab
						v-show="tabs.activeFormTab === 'menu'"
						:venue-form="venueForm"
						:on-change="livePreview.syncLivePreview"
					/>
					<VenueFeedTab
						v-show="tabs.activeFormTab === 'feed'"
						:venue-form="venueForm"
						:on-change="livePreview.syncLivePreview"
					/>
					<VenueReviewsFaqTab
						v-show="tabs.activeFormTab === 'chat'"
						:venue-form="venueForm"
						:on-change="livePreview.syncLivePreview"
					/>
					<VenueFeaturesTab
						v-show="tabs.activeFormTab === 'features'"
						:venue-form="venueForm"
						:on-change="livePreview.syncLivePreview"
					/>
					<VenueGalleryTab
						v-show="tabs.activeFormTab === 'media'"
						:venue-form="venueForm"
						:on-change="livePreview.syncLivePreview"
					/>
					<VenueDescriptionTab
						v-show="tabs.activeFormTab === 'description'"
						:venue-form="venueForm"
						:on-change="livePreview.syncLivePreview"
					/>
				</div>

				<div class="form-bottom-actions">
					<div class="bottom-sync-status">
						<span class="sync-dot"></span>
						<span class="sync-label">Live Preview синхронизирован</span>
					</div>

					<div class="bottom-buttons">
						<el-button plain @click="emit('close')"> ✕ Закрыть </el-button>
						<el-button type="primary" size="large" :loading="venueForm.saving" @click="emit('save')">
							💾 Сохранить площадку
						</el-button>
					</div>
				</div>
			</div>

			<VenueLivePreviewPane
				v-if="livePreview.splitRatio !== 'full'"
				:venue-form="venueForm"
				:live-preview="livePreview"
			/>
		</div>
	</div>
</template>

<script setup lang="ts">
import type { VenueForm } from '../composables/useVenueForm'
import type { VenueLivePreview } from '../composables/useVenueLivePreview'
import type { VenueEditorTabs } from '../composables/useVenueEditorTabs'
import VenueEditorTopBar from './VenueEditorTopBar.vue'
import VenueLivePreviewPane from './VenueLivePreviewPane.vue'
import VenueBasicInfoTab from './tabs/VenueBasicInfoTab.vue'
import VenueDescriptionTab from './tabs/VenueDescriptionTab.vue'
import VenueFeaturesTab from './tabs/VenueFeaturesTab.vue'
import VenueFeedTab from './tabs/VenueFeedTab.vue'
import VenueGalleryTab from './tabs/VenueGalleryTab.vue'
import VenueHallsRoomsTab from './tabs/VenueHallsRoomsTab.vue'
import VenueMenuTab from './tabs/VenueMenuTab.vue'
import VenuePricingTab from './tabs/VenuePricingTab.vue'
import VenueReviewsFaqTab from './tabs/VenueReviewsFaqTab.vue'

defineProps<{
	venueForm: VenueForm
	livePreview: VenueLivePreview
	tabs: VenueEditorTabs
}>()

const emit = defineEmits<{
	close: []
	save: []
}>()
</script>

<style scoped lang="scss">
.venues-live-editor-view {
	width: 100%;
	height: calc(100vh - 60px);
	display: flex;
	flex-direction: column;
	background: var(--gp-bg-main, #0b1120);
	overflow: hidden;
}

.editor-content-container {
	width: 100%;
	display: flex;
	flex: 1;
	overflow: hidden;

	&.split-50-50 {
		.editor-form-pane {
			width: 50%;
			border-right: 1px solid var(--border-color);
		}

		.editor-preview-pane {
			width: 50%;
		}
	}

	&.split-60-40 {
		.editor-form-pane {
			width: 60%;
			border-right: 1px solid var(--border-color);
		}

		.editor-preview-pane {
			width: 40%;
		}
	}

	&.split-full {
		.editor-form-pane {
			width: 100%;
		}

		.editor-preview-pane {
			display: none;
		}
	}
}

.editor-form-pane {
	height: 100%;
	position: relative;
	display: flex;
	flex-direction: column;
	background: var(--gp-bg-main, #0b1120);
	overflow: hidden;
}

.form-scrollable-area {
	flex: 1;
	padding: 20px 24px;
	overflow-y: auto;
}

.venue-tabs-nav {
	display: flex;
	flex-shrink: 0;
	flex-wrap: wrap;
	border-bottom: 1px solid var(--border-color);
	background: var(--bg-surface, #1e293b);
	padding: 12px 24px;
	gap: 6px;
}

.venue-tab-btn {
	display: inline-flex;
	align-items: center;
	border: 1px solid var(--gp-glass-border, rgb(255, 255, 255, 0.08));
	border-radius: 8px;
	font-weight: 500;
	font-size: 12px;
	color: var(--gp-text-secondary, #94a3b8);
	background: rgb(255, 255, 255, 0.04);
	transition: all 0.15s;
	cursor: pointer;
	padding: 6px 12px;
	gap: 6px;

	&:hover {
		color: #fff;
		background: rgb(255, 255, 255, 0.08);
	}

	&.active {
		border-color: var(--gp-primary, #42b883);
		box-shadow: 0 0 12px rgb(66, 184, 131, 0.2);
		font-weight: 600;
		color: #fff;
		background: rgb(66, 184, 131, 0.15);
	}
}

.tab-badge {
	border-radius: 8px;
	font-weight: 700;
	font-size: 10px;
	color: var(--gp-primary, #42b883);
	background: rgb(0, 0, 0, 0.35);
	padding: 1px 5px;
}

.form-bottom-actions {
	bottom: 0;
	position: sticky;
	display: flex;
	align-items: center;
	justify-content: space-between;
	border-top: 1px solid var(--border-color);
	background: rgb(15, 23, 42, 0.95);
	padding: 12px 24px;
	z-index: 10;
	backdrop-filter: blur(16px);
}

.bottom-sync-status {
	display: flex;
	align-items: center;
	font-size: 12px;
	color: var(--gp-text-secondary, #94a3b8);
	gap: 8px;
}

.sync-dot {
	width: 8px;
	height: 8px;
	border-radius: 50%;
	box-shadow: 0 0 8px #10b981;
	background: #10b981;
}

.bottom-buttons {
	display: flex;
	align-items: center;
	gap: 10px;
}
</style>

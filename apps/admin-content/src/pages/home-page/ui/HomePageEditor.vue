<template>
	<div class="home-page-editor">
		<HomeEditorTopBar :home-form="homeForm" :live-preview="livePreview" @save="handleSave" />

		<div class="editor-container" :class="[`split-${livePreview.splitRatio}`]">
			<div class="editor-form-pane">
				<div v-if="homeForm.loading" class="editor-loading">
					<el-skeleton :rows="10" animated />
				</div>

				<div v-else class="form-scrollable-content">
					<HomeEditorTabsNav :tabs="tabs" :home-form="homeForm" />

					<div class="tab-pane-content">
						<HomeHeroTab
							v-show="tabs.active === 'hero'"
							:home-form="homeForm"
							:on-change="livePreview.syncLivePreview"
						/>
						<HomeCategoriesTab
							v-show="tabs.active === 'categories'"
							:home-form="homeForm"
							:on-change="livePreview.syncLivePreview"
						/>
						<HomeLatestVenuesTab
							v-show="tabs.active === 'latest'"
							:home-form="homeForm"
							:on-change="livePreview.syncLivePreview"
						/>
						<HomePopularVenuesTab
							v-show="tabs.active === 'popular'"
							:home-form="homeForm"
							:on-change="livePreview.syncLivePreview"
						/>
						<HomeInteractionsTab
							v-show="tabs.active === 'interactions'"
							:home-form="homeForm"
							:on-change="livePreview.syncLivePreview"
						/>
						<HomeBannerTab
							v-show="tabs.active === 'banner'"
							:home-form="homeForm"
							:on-change="livePreview.syncLivePreview"
						/>
					</div>
				</div>

				<div class="form-bottom-actions">
					<div class="bottom-sync-status">
						<span class="sync-dot"></span>
						<span class="sync-label">Live Preview активен</span>
					</div>

					<div class="bottom-buttons">
						<el-button plain :icon="Close" @click="router.push('/pages')"> Отмена </el-button>
						<el-button type="primary" size="large" :icon="Check" :loading="homeForm.saving" @click="handleSave">
							Сохранить изменения
						</el-button>
					</div>
				</div>
			</div>

			<HomeLivePreviewPane v-if="livePreview.splitRatio !== 'full'" :live-preview="livePreview" />
		</div>
	</div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Check, Close } from '@element-plus/icons-vue'
import { useHomeEditorTabs } from '#features/home-page/composables/useHomeEditorTabs'
import { useHomeLivePreview } from '#features/home-page/composables/useHomeLivePreview'
import { useHomePageForm } from '#features/home-page/composables/useHomePageForm'
import HomeEditorTabsNav from '#features/home-page/ui/HomeEditorTabsNav.vue'
import HomeEditorTopBar from '#features/home-page/ui/HomeEditorTopBar.vue'
import HomeLivePreviewPane from '#features/home-page/ui/HomeLivePreviewPane.vue'
import HomeBannerTab from '#features/home-page/ui/tabs/HomeBannerTab.vue'
import HomeCategoriesTab from '#features/home-page/ui/tabs/HomeCategoriesTab.vue'
import HomeHeroTab from '#features/home-page/ui/tabs/HomeHeroTab.vue'
import HomeInteractionsTab from '#features/home-page/ui/tabs/HomeInteractionsTab.vue'
import HomeLatestVenuesTab from '#features/home-page/ui/tabs/HomeLatestVenuesTab.vue'
import HomePopularVenuesTab from '#features/home-page/ui/tabs/HomePopularVenuesTab.vue'

const router = useRouter()

const tabs = useHomeEditorTabs()
const homeForm = useHomePageForm(() => livePreview.syncLivePreview())
const livePreview = useHomeLivePreview(homeForm)

async function handleSave() {
	const ok = await homeForm.handleSave()
	if (ok) livePreview.reloadPreviewIframe()
}

onMounted(() => {
	homeForm.fetchData()
})
</script>

<style scoped lang="scss">
.home-page-editor {
	width: 100%;
	height: calc(100vh - 60px);
	display: flex;
	flex-direction: column;
	color: var(--gp-text-main, #f8fafc);
	background: var(--gp-bg-main, #0b1120);
	overflow: hidden;
}

.editor-container {
	width: 100%;
	display: flex;
	flex: 1;
	overflow: hidden;

	&.split-50-50 {
		.editor-form-pane {
			width: 50%;
			border-right: 1px solid var(--gp-glass-border, rgb(255, 255, 255, 0.08));
		}

		.editor-preview-pane {
			width: 50%;
		}
	}

	&.split-60-40 {
		.editor-form-pane {
			width: 60%;
			border-right: 1px solid var(--gp-glass-border, rgb(255, 255, 255, 0.08));
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
	overflow-y: auto;
}

.form-scrollable-content {
	flex: 1;
	padding: 24px;
	overflow-y: auto;
}

.form-bottom-actions {
	bottom: 0;
	position: sticky;
	display: flex;
	align-items: center;
	justify-content: space-between;
	border-top: 1px solid var(--gp-glass-border, rgb(255, 255, 255, 0.08));
	background: rgb(15, 23, 42, 0.95);
	padding: 14px 24px;
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

/* Deep Theme Form Overrides — apply to el-form fields rendered by any tab */
:deep(.el-form-item__label) {
	font-weight: 500;
	font-size: 13px;
	color: var(--gp-text-secondary, #94a3b8) !important;
	margin-bottom: 6px;
}

:deep(.el-input__wrapper),
:deep(.el-textarea__inner) {
	border-radius: 8px;
	box-shadow: 0 0 0 1px var(--gp-glass-border, rgb(255, 255, 255, 0.12)) inset !important;
	color: var(--gp-text-main, #f8fafc) !important;
	background-color: var(--gp-bg-element, rgb(15, 23, 42, 0.5)) !important;

	input {
		color: var(--gp-text-main, #f8fafc) !important;
	}

	&.is-focus,
	&:focus {
		box-shadow: 0 0 0 1px var(--gp-primary, #7c3aed) inset !important;
	}
}

:deep(.el-textarea__inner) {
	border: none !important;
}
</style>

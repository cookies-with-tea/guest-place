<template>
	<div v-if="!about.loading" class="about-page-editor">
		<AboutPageHeader :saving="about.saving" @refresh="about.fetchData" @save="about.handleSave" />

		<div class="editor-content">
			<el-row :gutter="24">
				<!-- LEFT COLUMN -->
				<el-col :lg="12" :md="24" :sm="24" :xl="12" :xs="24">
					<div class="content-group">
						<GeneralSettingsCard :form="about.form" />
						<OpportunitiesSection :form="about.form" />
						<LeadershipCard :form="about.form" />
					</div>
				</el-col>

				<!-- RIGHT COLUMN -->
				<el-col :lg="12" :md="24" :sm="24" :xl="12" :xs="24">
					<div class="content-group">
						<WhoWeAreSection :form="about.form" />
						<NewsCard :form="about.form" />
					</div>
				</el-col>
			</el-row>
		</div>
	</div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

import { useAboutData } from './composables/useAboutData'
import AboutPageHeader from './components/AboutPageHeader.vue'
import GeneralSettingsCard from './components/GeneralSettingsCard.vue'
import LeadershipCard from './components/LeadershipCard.vue'
import NewsCard from './components/NewsCard.vue'
import OpportunitiesSection from './components/OpportunitiesSection.vue'
import WhoWeAreSection from './components/WhoWeAreSection.vue'

const about = useAboutData()

onMounted(about.fetchData)
</script>

<style scoped lang="scss">
.about-page-editor {
	max-width: 1600px;
	padding: 24px;
	margin: 0 auto;
}

.content-group {
	display: flex;
	flex-direction: column;
	gap: 24px;
}

// Shared "form section" design system used by every child card/section
// component in ./components/ — :deep() is required to reach across those
// component boundaries.
:deep() {
	.section-header {
		h2 {
			font-weight: 700;
			font-size: 1.25rem;
			color: var(--gp-primary);
			margin: 0;
		}
	}

	.mb-8 {
		margin-bottom: 8px;
	}

	.mb-16 {
		margin-bottom: 16px;
	}

	.mb-24 {
		margin-bottom: 24px;
	}

	.mb-32 {
		margin-bottom: 32px;
	}

	.mt-16 {
		margin-top: 16px;
	}

	.section-card {
		border: 1px solid var(--gp-glass-border);
		background: var(--gp-bg-card);
		backdrop-filter: blur(8px);
	}

	.card-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		font-weight: 600;
	}

	.dynamic-list {
		display: flex;
		flex-direction: column;
		gap: 24px;
	}

	.list-item-wrapper {
		transition: transform 0.2s;

		&:hover {
			transform: translateX(4px);
		}
	}

	.add-btn {
		align-self: flex-start;
		padding: 12px 24px;
		margin-top: 16px;
	}

	.guide-hint {
		font-weight: 600;
		font-size: 0.85rem;
		text-align: center;
		color: var(--gp-primary);
		margin: 8px 0 0;
	}

	.el-form-item__label {
		font-weight: 600;
		color: var(--gp-text-primary);
		margin-bottom: 8px !important;
	}
}
</style>

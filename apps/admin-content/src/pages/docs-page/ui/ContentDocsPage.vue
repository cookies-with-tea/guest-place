<template>
	<div class="content-docs-page">
		<!-- Header -->
		<div class="docs-header glass-card">
			<div class="docs-header__left">
				<el-button :icon="Back" plain size="small" @click="goBack"> Назад к схемам </el-button>
				<div class="docs-header__title-block">
					<div class="badge-row">
						<el-tag effect="dark" size="small" type="primary">ARCHITECTURE & GUIDE</el-tag>
						<el-tag effect="plain" size="small" type="info">Headless CMS v2.0</el-tag>
					</div>
					<h1>Архитектура: Схемы, Split View & Live Preview</h1>
					<p class="docs-subtitle">
						Полное руководство по работе с контент-схемами, двухпанельным разделением и реактивным предпросмотром
					</p>
				</div>
			</div>
			<div class="docs-header__right">
				<el-button :icon="Plus" type="primary" @click="goToCreateSchema"> Создать новую схему </el-button>
			</div>
		</div>

		<!-- Main Content Tabs -->
		<div class="docs-body">
			<el-tabs v-model="activeTab" class="docs-tabs glass-card">
				<el-tab-pane label="0. Три модели контента (Обзор)" name="overview">
					<DocsOverviewTab />
				</el-tab-pane>

				<el-tab-pane label="1. Схемы данных (Schemas)" name="schemas">
					<DocsSchemasTab />
				</el-tab-pane>

				<el-tab-pane label="2. Сплит-вью (Split View)" name="split-view">
					<DocsSplitViewTab />
				</el-tab-pane>

				<el-tab-pane label="3. Междоменный Live Preview (postMessage)" name="live-preview">
					<DocsLivePreviewTab />
				</el-tab-pane>

				<el-tab-pane label="4. Устранение неполадок (Troubleshooting)" name="troubleshooting">
					<DocsTroubleshootingTab />
				</el-tab-pane>
			</el-tabs>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import { Back, Plus } from '@element-plus/icons-vue'

import DocsLivePreviewTab from './tabs/DocsLivePreviewTab.vue'
import DocsOverviewTab from './tabs/DocsOverviewTab.vue'
import DocsSchemasTab from './tabs/DocsSchemasTab.vue'
import DocsSplitViewTab from './tabs/DocsSplitViewTab.vue'
import DocsTroubleshootingTab from './tabs/DocsTroubleshootingTab.vue'

const router = useRouter()
const activeTab = ref('overview')

const goBack = () => {
	router.push('/content')
}

const goToCreateSchema = () => {
	router.push({ path: '/content', query: { create: 'true' } })
}
</script>

<style scoped lang="scss">
.content-docs-page {
	color: var(--gp-text-main, #fff);
	padding: 0;
}

.docs-header {
	display: flex;
	flex-wrap: wrap;
	align-items: flex-start;
	justify-content: space-between;
	border-radius: 14px;
	padding: 24px;
	margin-bottom: 24px;
	gap: 16px;

	&__left {
		display: flex;
		align-items: flex-start;
		gap: 16px;
	}

	&__title-block {
		display: flex;
		flex-direction: column;

		h1 {
			font-weight: 700;
			font-size: 1.6rem;
			letter-spacing: -0.3px;
			margin: 8px 0 4px;
		}

		.docs-subtitle {
			font-size: 0.9rem;
			color: var(--gp-text-secondary, #a0aec0);
			margin: 0;
		}
	}
}

.badge-row {
	display: flex;
	gap: 8px;
}

.docs-body {
	width: 100%;
}

.docs-tabs {
	border-radius: 14px;
	padding: 20px 24px;
}

// Shared "docs content" design system, rendered by the tab-content components
// in ./tabs/ rather than this page's own template — :deep() is required for
// every selector here to reach across that component boundary.
:deep() {
	.tab-content {
		padding: 16px 0;
	}

	.section-intro {
		margin-bottom: 24px;

		h2 {
			font-weight: 600;
			font-size: 1.35rem;
			margin: 0 0 8px;
		}

		p {
			font-size: 0.95rem;
			line-height: 1.6;
			color: var(--gp-text-secondary, #a0aec0);
			margin: 0;
		}
	}

	.grid-2-col {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
		gap: 20px;
	}

	.info-card {
		border: 1px solid rgb(255, 255, 255, 0.08);
		border-radius: 12px;
		background: rgb(255, 255, 255, 0.02);
		padding: 20px;

		.card-icon {
			font-size: 28px;
			margin-bottom: 12px;
		}

		h3 {
			font-weight: 600;
			font-size: 1.1rem;
			margin: 0 0 10px;
		}

		p {
			font-size: 0.88rem;
			line-height: 1.5;
			color: var(--gp-text-secondary, #a0aec0);
		}
	}

	.styled-list {
		font-size: 0.85rem;
		line-height: 1.6;
		color: var(--gp-text-secondary, #a0aec0);
		padding-left: 20px;
		margin: 12px 0 0;

		li {
			margin-bottom: 6px;
		}

		code {
			border-radius: 4px;
			font-family: monospace;
			color: var(--gp-primary, #42b883);
			background: rgb(66, 184, 131, 0.1);
			padding: 2px 6px;
		}
	}

	.field-types-chips {
		display: flex;
		flex-wrap: wrap;
		margin-top: 10px;
		gap: 6px;
	}

	.code-block-card {
		border: 1px solid rgb(255, 255, 255, 0.08);
		border-radius: 12px;
		background: rgb(0, 0, 0, 0.3);
		padding: 20px;

		.code-header {
			display: flex;
			align-items: center;
			justify-content: space-between;
			font-weight: 500;
			font-size: 0.85rem;
			color: var(--gp-text-secondary, #a0aec0);
			margin-bottom: 12px;
		}

		.code-content {
			font-family: 'JetBrains Mono', monospace;
			font-size: 0.8rem;
			line-height: 1.5;
			color: #e2e8f0;
			background: transparent;
			margin: 0;
			overflow-x: auto;
		}
	}

	// Comparison Cards
	.comparison-cards {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
		gap: 20px;
	}

	.split-card {
		position: relative;
		border: 1px solid rgb(255, 255, 255, 0.08);
		border-radius: 12px;
		background: rgb(255, 255, 255, 0.02);
		padding: 24px;

		.split-badge {
			top: 16px;
			right: 16px;
			position: absolute;
			border-radius: 6px;
			font-weight: 700;
			font-size: 0.7rem;
			color: #646cff;
			background: rgb(100, 108, 255, 0.2);
			padding: 3px 8px;

			&--live {
				color: var(--gp-primary, #42b883);
				background: rgb(66, 184, 131, 0.2);
			}

			&--entity {
				color: #ec4899;
				background: rgb(236, 72, 153, 0.2);
			}
		}

		h3 {
			font-weight: 600;
			font-size: 1.15rem;
			padding-right: 70px;
			margin: 0 0 8px;
		}

		.split-desc {
			font-size: 0.85rem;
			color: var(--gp-text-secondary, #a0aec0);
			margin-bottom: 16px;
		}
	}

	.split-visual-schema,
	.split-visual-content {
		display: flex;
		align-items: center;
		justify-content: space-between;
		border-radius: 8px;
		background: rgb(0, 0, 0, 0.25);
		padding: 12px;
		margin-bottom: 16px;
		gap: 8px;

		.col-visual {
			display: flex;
			flex: 1;
			flex-direction: column;
			align-items: center;
			border: 1px dashed rgb(255, 255, 255, 0.15);
			border-radius: 6px;
			text-align: center;
			background: rgb(255, 255, 255, 0.02);
			padding: 8px;

			strong {
				font-size: 0.75rem;
				color: var(--gp-text-main, #fff);
			}

			span {
				font-size: 0.65rem;
				color: var(--gp-text-muted, #718096);
				margin-top: 2px;
			}
		}

		.col-arrow {
			font-size: 14px;
			color: var(--gp-primary, #42b883);
		}
	}

	// Protocol Timeline
	.protocol-timeline {
		border: 1px solid rgb(255, 255, 255, 0.08);
		border-radius: 12px;
		background: rgb(0, 0, 0, 0.2);
		padding: 24px;

		h3 {
			font-weight: 600;
			font-size: 1.15rem;
			margin: 0 0 20px;
		}
	}

	.protocol-step {
		position: relative;
		display: flex;
		margin-bottom: 20px;
		gap: 16px;

		.step-num {
			width: 32px;
			height: 32px;
			display: flex;
			flex-shrink: 0;
			align-items: center;
			justify-content: center;
			border-radius: 50%;
			font-weight: 700;
			color: #000;
			background: var(--gp-primary, #42b883);
		}

		.step-body {
			flex: 1;

			h4 {
				font-weight: 600;
				font-size: 0.95rem;
				color: var(--gp-text-main, #fff);
				margin: 0 0 6px;
			}

			p {
				font-size: 0.85rem;
				line-height: 1.5;
				color: var(--gp-text-secondary, #a0aec0);
				margin: 0 0 8px;
			}
		}

		&:last-child {
			margin-bottom: 0;
		}
	}

	.code-inline {
		display: block;
		border-radius: 6px;
		font-family: monospace;
		font-size: 0.8rem;
		color: #646cff;
		background: rgb(0, 0, 0, 0.4);
		padding: 6px 10px;
		overflow-x: auto;
	}

	// FAQ
	.faq-accordion {
		.el-collapse {
			border: none;
			background: transparent;
		}

		.el-collapse-item__header {
			border-bottom: 1px solid rgb(255, 255, 255, 0.06);
			border-radius: 8px;
			font-weight: 600;
			font-size: 0.95rem;
			color: var(--gp-text-main, #fff);
			background: rgb(255, 255, 255, 0.02);
			padding: 0 16px;
			margin-bottom: 8px;
		}

		.el-collapse-item__wrap {
			border: none;
			background: transparent;
		}

		.el-collapse-item__content {
			font-size: 0.88rem;
			line-height: 1.6;
			color: var(--gp-text-secondary, #a0aec0);
			padding: 12px 16px 20px;
		}
	}

	.faq-answer {
		strong {
			color: var(--gp-text-main, #fff);
		}

		ul {
			padding-left: 20px;
			margin: 8px 0 0;
		}

		li {
			margin-bottom: 4px;
		}
	}
}
</style>

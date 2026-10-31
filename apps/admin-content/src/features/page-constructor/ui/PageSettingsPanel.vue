<template>
	<div class="inspector-tab-pane inspector-page-settings">
		<div class="inspector-header">
			<el-icon class="inspector-icon"><Setting /></el-icon>
			<div>
				<h3>Настройки страницы</h3>
				<span class="inspector-type">Основные параметры, статус и SEO</span>
			</div>
		</div>

		<div class="inspector-form">
			<el-form label-position="top">
				<el-form-item label="Название страницы">
					<el-input v-model="document.pageForm.title" placeholder="О платформе" />
				</el-form-item>
				<el-form-item label="URL страницы (slug)">
					<el-input
						:model-value="document.pageForm.slug"
						placeholder="about"
						@update:model-value="document.onSlugInput"
					>
						<template #prepend>/p/</template>
					</el-input>
				</el-form-item>

				<el-form-item label="Статус публикации (Workflow)">
					<el-select v-model="document.pageForm.status" style="width: 100%" @change="document.onStatusSelectChange">
						<el-option label="Черновик (DRAFT)" value="draft" />
						<el-option label="На проверке (REVIEW)" value="review" />
						<el-option label="Опубликовано (PUBLISHED)" value="published" />
					</el-select>
					<div v-if="document.pageForm.published_at" class="published-time-hint">
						<el-icon><Promotion /></el-icon>Опубликовано: {{ formatDate(document.pageForm.published_at) }}
					</div>
				</el-form-item>

				<el-form-item label="Родительская страница (Иерархия & Хлебные крошки)">
					<el-select
						v-model="document.pageForm.parent_id"
						clearable
						placeholder="— Корневая страница (без родителя) —"
						style="width: 100%"
					>
						<el-option label="— Корневая страница (без родителя) —" :value="null" />
						<el-option
							v-for="parent in document.availableParentPages"
							:key="parent.id"
							:label="`${parent.title} (/p/${parent.slug})`"
							:value="parent.id"
						/>
					</el-select>
					<div class="seo-field-hint">Определяет цепочку Breadcrumbs на клиенте и структуру навигации сайта.</div>
				</el-form-item>

				<el-divider style="margin: 20px 0 16px" content-position="left">
					<span style="display: inline-flex; align-items: center; font-weight: 600; font-size: 13px; gap: 4px">
						<el-icon><Search /></el-icon>SEO & Поисковые сниппеты
					</span>
				</el-divider>

				<el-form-item>
					<template #label>
						<div class="seo-label-row">
							<span>SEO Title (заголовок вкладки)</span>
							<el-tag size="small" :type="seo.seoTitleLengthStatus" effect="plain">
								{{ seo.effectiveSeoTitle.length }}/60 символов
							</el-tag>
						</div>
					</template>
					<el-input
						v-model="document.pageForm.seo.title"
						:placeholder="
							document.pageForm.title
								? `${document.pageForm.title} | Guest & Place`
								: 'Заголовок страницы для поисковиков'
						"
					/>
					<div class="seo-field-hint">Оптимальная длина: 50–60 символов для отображения в Google без обрезки.</div>
				</el-form-item>

				<el-form-item>
					<template #label>
						<div class="seo-label-row">
							<span>SEO Description (мета-описание)</span>
							<el-tag size="small" :type="seo.seoDescLengthStatus" effect="plain">
								{{ (document.pageForm.seo.description || '').length }}/160 символов
							</el-tag>
						</div>
					</template>
					<el-input
						v-model="document.pageForm.seo.description"
						type="textarea"
						:rows="3"
						placeholder="Краткое привлекательное описание страницы для выдачи поисковых систем"
					/>
					<div class="seo-field-hint">Оптимальная длина: 120–160 символов.</div>
				</el-form-item>

				<el-form-item label="OG Image (превью для соцсетей и мессенджеров)">
					<el-input v-model="document.pageForm.seo.og_image" placeholder="https://... или /uploads/image.jpg">
						<template #prefix
							><el-icon><Picture /></el-icon
						></template>
					</el-input>
				</el-form-item>

				<el-form-item label="Canonical URL (канонический адрес)">
					<el-input v-model="document.pageForm.seo.canonical" :placeholder="seo.computedCanonicalUrl" />
				</el-form-item>

				<el-form-item>
					<el-checkbox v-model="document.pageForm.seo.no_index">
						Запретить индексацию роботами (noindex, nofollow)
					</el-checkbox>
				</el-form-item>

				<!-- SERP / Social preview -->
				<div class="serp-preview-section">
					<div class="serp-preview-header">
						<div class="serp-preview-title">
							<span>Предпросмотр сниппета</span>
						</div>
						<el-radio-group v-model="seo.serpPreviewTab" size="small">
							<el-radio-button label="google">Google</el-radio-button>
							<el-radio-button label="social">Соцсети</el-radio-button>
						</el-radio-group>
					</div>

					<div v-if="seo.serpPreviewTab === 'google'" class="google-snippet-card">
						<div class="google-snippet-topbar">
							<div class="google-favicon">G</div>
							<div class="google-site-info">
								<span class="google-site-name">Guest & Place</span>
								<span class="google-snippet-url">https://guestplace.ru › p › {{ seo.breadcrumbSlugDisplay }}</span>
							</div>
						</div>
						<div class="google-snippet-title">
							{{ seo.effectiveSeoTitle }}
						</div>
						<div class="google-snippet-desc">
							{{ seo.effectiveSeoDesc }}
						</div>
					</div>

					<div v-else class="social-snippet-card">
						<div class="social-snippet-thumb" :style="seo.ogImageStyle">
							<span v-if="!document.pageForm.seo.og_image" class="social-thumb-placeholder">
								<el-icon><Picture /></el-icon>Превью по умолчанию
							</span>
						</div>
						<div class="social-snippet-body">
							<div class="social-snippet-domain">GUESTPLACE.RU</div>
							<div class="social-snippet-title">{{ seo.effectiveSeoTitle }}</div>
							<div class="social-snippet-desc">{{ seo.effectiveSeoDesc }}</div>
						</div>
					</div>
				</div>

				<div class="sitemap-info-box">
					<el-icon class="sitemap-info-icon"><MapLocation /></el-icon>
					<div class="sitemap-info-text">
						<strong>Sitemap XML генерация:</strong>
						<p>Страница автоматически попадает в <code>sitemap.xml</code> при публикации (статус PUBLISHED).</p>
					</div>
					<el-button size="small" plain @click="seo.openSitemapXml"> Открыть sitemap.xml </el-button>
				</div>
			</el-form>
		</div>
	</div>
</template>

<script setup lang="ts">
import { MapLocation, Picture, Promotion, Search, Setting } from '@element-plus/icons-vue'
import type { PageDocument } from '../composables/usePageDocument'
import type { PageSeo } from '../composables/usePageSeo'
import { formatDate } from '../lib/helpers'

defineProps<{
	document: PageDocument
	seo: PageSeo
}>()
</script>

<style scoped>
.inspector-page-settings {
	padding: 16px;
}

.inspector-header {
	display: flex;
	align-items: center;
	margin-bottom: 4px;
	gap: 10px;
}

.inspector-icon {
	width: 24px;
	height: 24px;
	flex-shrink: 0;
	color: var(--gp-primary, #6366f1);
}

.inspector-form {
	display: flex;
	flex-direction: column;
}

.seo-label-row {
	width: 100%;
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	justify-content: space-between;
	gap: 4px;
}

.seo-field-hint {
	font-size: 11px;
	line-height: 1.4;
	color: #6b7280;
	margin-top: 4px;
}

.published-time-hint {
	display: flex;
	align-items: center;
	font-size: 11px;
	color: var(--text-muted);
	margin-top: 4px;
	gap: 4px;
}

.published-time-hint .el-icon {
	width: 1em;
	height: 1em;
}

.serp-preview-section {
	border: 1px solid #e5e7eb;
	border-radius: 12px;
	background: #f9fafb;
	padding: 16px;
	margin: 16px 0;
}

.serp-preview-header {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 12px;
	gap: 8px;
}

.serp-preview-title {
	font-weight: 700;
	font-size: 12px;
	letter-spacing: 0.5px;
	text-transform: uppercase;
	color: #6b7280;
}

.google-snippet-card {
	border: 1px solid #dfe1e5;
	border-radius: 10px;
	box-shadow: 0 1px 4px rgb(0, 0, 0, 0.04);
	font-family: 'Arial', sans-serif;
	text-align: left;
	background: #fff;
	padding: 14px 16px;
	overflow: hidden;
}

.google-snippet-topbar {
	display: flex;
	align-items: center;
	margin-bottom: 6px;
	gap: 10px;
}

.google-favicon {
	width: 22px;
	height: 22px;
	display: flex;
	flex-shrink: 0;
	align-items: center;
	justify-content: center;
	border-radius: 50%;
	font-weight: 700;
	font-size: 12px;
	color: #fff;
	background: #4285f4;
}

.google-site-info {
	min-width: 0;
	display: flex;
	flex-direction: column;
	font-size: 12px;
	line-height: 1.3;
}

.google-site-name {
	font-weight: 500;
	color: #202124;
}

.google-snippet-url {
	font-size: 11px;
	white-space: nowrap;
	text-overflow: ellipsis;
	color: #4d5156;
	overflow: hidden;
}

.google-snippet-title {
	font-weight: 400;
	font-size: 18px;
	line-height: 1.3;
	color: #1a0dab;
	cursor: pointer;
	margin-bottom: 4px;
	overflow-wrap: anywhere;
}

.google-snippet-title:hover {
	text-decoration: underline;
}

.google-snippet-desc {
	font-size: 13px;
	line-height: 1.5;
	color: #4d5156;
	overflow-wrap: anywhere;
}

.social-snippet-card {
	border: 1px solid #dfe1e5;
	border-radius: 10px;
	box-shadow: 0 1px 4px rgb(0, 0, 0, 0.04);
	background: #fff;
	overflow: hidden;
}

.social-snippet-thumb {
	height: 130px;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 13px;
	color: #9ca3af;
	background: #f3f4f6;
}

.social-thumb-placeholder {
	display: inline-flex;
	align-items: center;
	gap: 4px;
}

.social-thumb-placeholder .el-icon {
	width: 1em;
	height: 1em;
}

.social-snippet-body {
	padding: 12px 14px;
}

.social-snippet-domain {
	font-weight: 700;
	font-size: 10px;
	letter-spacing: 0.5px;
	color: #9ca3af;
	margin-bottom: 4px;
}

.social-snippet-title {
	font-weight: 700;
	font-size: 15px;
	line-height: 1.3;
	color: #111827;
	margin-bottom: 4px;
}

.social-snippet-desc {
	display: -webkit-box;
	font-size: 12px;
	line-height: 1.4;
	color: #4b5563;
	overflow: hidden;
	-webkit-box-orient: vertical;
	-webkit-line-clamp: 2;
}

.sitemap-info-box {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	border: 1px solid rgb(16, 185, 129, 0.25);
	border-radius: 8px;
	background: rgb(16, 185, 129, 0.06);
	padding: 12px 14px;
	margin-top: 14px;
	gap: 12px;
}

.sitemap-info-icon {
	width: 24px;
	height: 24px;
	flex-shrink: 0;
	color: #10b981;
}

.sitemap-info-text {
	min-width: 0;
	flex: 1;
	font-size: 12px;
	line-height: 1.4;
	color: #111827;
}

.sitemap-info-text p {
	color: #6b7280;
	margin: 2px 0 0;
}
</style>

<template>
	<div v-if="!loading" class="about-page-editor">
		<header class="editor-header">
			<div>
				<h1>About Platform</h1>
				<p class="subtitle">Design-first content management</p>
			</div>
			<div class="header-actions">
				<el-button @click="fetchData" :icon="Refresh" circle />
				<el-button type="primary" :loading="saving" :icon="Check" @click="handleSave"> Save Changes </el-button>
			</div>
		</header>

		<div class="editor-content">
			<el-row :gutter="24">
				<!-- LEFT COLUMN -->
				<el-col :lg="12" :md="24">
					<div class="content-group">
						<!-- GENERAL SECTION -->
						<el-card class="section-card mb-24">
							<template #header>
								<div class="card-header">
									<span>General Settings</span>
								</div>
							</template>
							<el-form label-position="top">
								<el-form-item label="Main Hero Title">
									<el-input v-model="form.title" placeholder="Platform main title" />
								</el-form-item>
								<el-form-item label="Main Hero Description">
									<el-input
										v-model="form.description"
										type="textarea"
										:rows="4"
										placeholder="Platform main vision and mission"
									/>
								</el-form-item>
								<div class="section-guide-embed">
									<UiMediaPicker v-model="form.heroGuideUuid" />
									<p class="guide-hint">Hero Section Preview</p>
								</div>
							</el-form>
						</el-card>

						<!-- OPPORTUNITIES SECTION -->
						<div class="section-header mb-16">
							<h2>Opportunities</h2>
						</div>
						<div class="dynamic-list">
							<div v-for="(opp, index) in form.opportunities" :key="index" class="list-item-wrapper mb-16">
								<el-card class="section-card">
									<template #header>
										<div class="card-header">
											<span>Opportunity Card #{{ index + 1 }}</span>
											<el-button type="danger" link :icon="Delete" @click="removeItem(form.opportunities, index)" />
										</div>
									</template>
									<el-form label-position="top">
										<el-row :gutter="20">
											<el-col :span="16">
												<el-form-item label="Title">
													<el-input v-model="opp.title" placeholder="e.g., Sustainability" />
												</el-form-item>
											</el-col>
											<el-col :span="8">
												<el-form-item label="Card Icon">
													<UiMediaPicker v-model="opp.iconUuid" />
												</el-form-item>
											</el-col>
										</el-row>
										<el-row :gutter="20">
											<el-col :span="12">
												<el-form-item label="Button Text">
													<el-input v-model="opp.buttonText" placeholder="e.g., More Details" />
												</el-form-item>
											</el-col>
											<el-col :span="12">
												<el-form-item label="Link">
													<el-input v-model="opp.link" placeholder="e.g., /careers" />
												</el-form-item>
											</el-col>
										</el-row>
										<el-form-item label="Features List">
											<div v-for="(item, iIdx) in opp.items" :key="iIdx" class="sub-item">
												<el-input v-model="opp.items[iIdx]" placeholder="Feature text">
													<template #append>
														<el-button :icon="Delete" @click="removeItem(opp.items, iIdx as number)" />
													</template>
												</el-input>
											</div>
											<el-button class="mt-8" type="primary" link :icon="Plus" @click="addItem(opp.items, '')">
												Add Feature
											</el-button>
										</el-form-item>
									</el-form>
								</el-card>
							</div>
							<div class="mb-16">
								<UiMediaPicker v-model="form.opportunitiesGuideUuid" />
								<p class="guide-hint">Opportunities Preview</p>
							</div>
							<el-button class="add-btn mb-32" type="primary" plain :icon="Plus" @click="addOpportunity">
								Add New Opportunity Card
							</el-button>
						</div>

						<!-- LEADERSHIP SECTION -->
						<el-card class="section-card mb-24">
							<template #header>
								<div class="card-header">
									<span>Leadership Overview</span>
								</div>
							</template>
							<el-form label-position="top">
								<el-row :gutter="20">
									<el-col :span="16">
										<el-form-item label="Header Title">
											<el-input v-model="form.leadershipTitle" />
										</el-form-item>
									</el-col>
									<el-col :span="8">
										<el-form-item label="Section Logo">
											<UiMediaPicker v-model="form.leadershipLogoUuid" />
										</el-form-item>
									</el-col>
								</el-row>
								<el-form-item label="Section Introduction">
									<el-input v-model="form.leadershipDescription" type="textarea" :rows="3" />
								</el-form-item>
								<div class="divider">Team Members & Key Points</div>
								<div v-for="(item, index) in form.leadershipItems" :key="index" class="sub-item-complex">
									<el-row :gutter="12" align="middle">
										<el-col :span="14">
											<el-input v-model="item.text" placeholder="Leader name or description" />
										</el-col>
										<el-col :span="6">
											<UiMediaPicker v-model="item.iconUuid" />
										</el-col>
										<el-col :span="2">
											<el-button type="danger" link :icon="Delete" @click="removeItem(form.leadershipItems, index)" />
										</el-col>
									</el-row>
								</div>
								<el-button type="primary" link :icon="Plus" @click="addLeadershipItem"> Add Leadership Item </el-button>
								<div class="mt-16">
									<UiMediaPicker v-model="form.leadershipGuideUuid" />
									<p class="guide-hint">Leadership Preview</p>
								</div>
							</el-form>
						</el-card>
					</div>
				</el-col>

				<!-- RIGHT COLUMN -->
				<el-col :lg="12" :md="24">
					<div class="content-group">
						<!-- WHO WE ARE SECTION -->
						<div class="section-header mb-16">
							<h2>Who We Are</h2>
						</div>
						<div class="dynamic-list">
							<div v-for="(item, index) in form.whoWeAre" :key="index" class="list-item-wrapper mb-16">
								<el-card class="section-card">
									<template #header>
										<div class="card-header">
											<span>Member/Section #{{ index + 1 }}</span>
											<el-button type="danger" link :icon="Delete" @click="removeItem(form.whoWeAre, index)" />
										</div>
									</template>
									<el-form label-position="top">
										<el-row :gutter="20">
											<el-col :span="14">
												<el-form-item label="Title">
													<el-input v-model="item.title" />
												</el-form-item>
											</el-col>
											<el-col :span="10">
												<el-form-item label="Member Image">
													<UiMediaPicker v-model="item.imageUuid" />
												</el-form-item>
											</el-col>
										</el-row>
										<el-form-item label="Description">
											<el-input v-model="item.description" type="textarea" :rows="2" />
										</el-form-item>
									</el-form>
								</el-card>
							</div>
							<div class="mb-16">
								<UiMediaPicker v-model="form.whoWeAreGuideUuid" />
								<p class="guide-hint">Who We Are Preview</p>
							</div>
							<el-button class="add-btn mb-32" type="primary" plain :icon="Plus" @click="addWhoWeAreItem">
								Add Member/Section
							</el-button>
						</div>

						<!-- NEWS SECTION -->
						<el-card class="section-card mb-24">
							<template #header>
								<div class="card-header">
									<span>News Highlights</span>
								</div>
							</template>
							<el-form label-position="top">
								<el-form-item label="News Section Title">
									<el-input v-model="form.newsTitle" />
								</el-form-item>
								<div class="divider">News Items</div>
								<div v-for="(item, index) in form.newsItems" :key="index" class="sub-item-complex">
									<el-row :gutter="12" align="middle">
										<el-col :span="14">
											<el-input v-model="item.text" placeholder="News text" />
										</el-col>
										<el-col :span="6">
											<UiMediaPicker v-model="item.iconUuid" />
										</el-col>
										<el-col :span="2">
											<el-button type="danger" link :icon="Delete" @click="removeItem(form.newsItems, index)" />
										</el-col>
									</el-row>
								</div>
								<el-button type="primary" link :icon="Plus" @click="addNewsItem"> Add News Item </el-button>
								<div class="mt-16">
									<UiMediaPicker v-model="form.newsGuideUuid" />
									<p class="guide-hint">News Section Preview</p>
								</div>
							</el-form>
						</el-card>
					</div>
				</el-col>
			</el-row>
		</div>
	</div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue'
import { useI18n } from '@admin-panel/i18n'
import { createApi } from '@admin-panel/lib'
import { ElMessage } from 'element-plus'
import { Plus, Delete, Refresh, Check } from '@element-plus/icons-vue'
import { UiMediaPicker } from '@admin-panel/ui'

interface IAboutData {
	title: string
	description: string
	heroGuide?: { url: string }
	opportunitiesGuide?: { url: string }
	leadershipGuide?: { url: string }
	whoWeAreGuide?: { url: string }
	newsGuide?: { url: string }
	heroGuideUuid?: string | null
	opportunitiesGuideUuid?: string | null
	leadershipGuideUuid?: string | null
	whoWeAreGuideUuid?: string | null
	newsGuideUuid?: string | null
	opportunities: {
		items: Array<{
			title: string
			icon?: { uuid: string }
			items: string[]
			link: string
			buttonText: string
		}>
	}
	leadership: {
		title: string
		description: string
		logo?: { uuid: string }
		items: Array<{
			text: string
			icon?: { uuid: string }
		}>
	}
	whoWeAre: Array<{
		title: string
		description: string
		image?: { uuid: string }
	}>
	news: {
		title: string
		items: Array<{
			text: string
			icon?: { uuid: string }
		}>
	}
}

const { t } = useI18n()
const { fetchData: apiFetch } = createApi('about')

const activeTab = ref('general')
const loading = ref(false)
const saving = ref(false)

const form = reactive({
	title: '',
	description: '',
	heroGuideUuid: null as string | null,
	opportunitiesGuideUuid: null as string | null,
	leadershipGuideUuid: null as string | null,
	whoWeAreGuideUuid: null as string | null,
	newsGuideUuid: null as string | null,
	opportunities: [] as any[],
	leadershipTitle: '',
	leadershipDescription: '',
	leadershipLogoUuid: null as string | null,
	leadershipItems: [] as any[],
	whoWeAre: [] as any[],
	newsTitle: '',
	newsItems: [] as any[],
})

const fetchData = async () => {
	loading.value = true
	try {
		const response = await apiFetch<IAboutData>('')
		if (response.data) {
			const d = response.data
			form.title = d.title
			form.description = d.description
			
			form.heroGuideUuid = d.heroGuideUuid || null
			form.opportunitiesGuideUuid = d.opportunitiesGuideUuid || null
			form.leadershipGuideUuid = d.leadershipGuideUuid || null
			form.whoWeAreGuideUuid = d.whoWeAreGuideUuid || null
			form.newsGuideUuid = d.newsGuideUuid || null

			form.opportunities = d.opportunities.items.map((o: any) => ({
				title: o.title,
				iconUuid: o.icon?.uuid || null,
				items: o.items || [],
				link: o.link || '',
				buttonText: o.buttonText || '',
			}))
			form.leadershipTitle = d.leadership.title
			form.leadershipDescription = d.leadership.description
			form.leadershipLogoUuid = d.leadership.logo?.uuid || null
			form.leadershipItems = d.leadership.items.map((i: any) => ({
				text: i.text,
				iconUuid: i.icon?.uuid || null,
			}))
			form.whoWeAre = d.whoWeAre.map((w: any) => ({
				title: w.title,
				description: w.description,
				imageUuid: w.image?.uuid || null,
			}))
			form.newsTitle = d.news.title
			form.newsItems = d.news.items.map((n: any) => ({
				text: n.text,
				iconUuid: n.icon?.uuid || null,
			}))
		}
	} catch (error) {
		ElMessage.error('Failed to load about data')
	} finally {
		loading.value = false
	}
}

const handleSave = async () => {
	saving.value = true
	try {
		await apiFetch('', {
			method: 'PUT',
			body: form,
		})
		ElMessage.success('About page updated successfully')
		fetchData() // Refresh to get URLs
	} catch (error) {
		ElMessage.error('Failed to save changes')
	} finally {
		saving.value = false
	}
}

const autoSave = async () => {
	if (loading.value || saving.value) return
	try {
		await apiFetch('', {
			method: 'PUT',
			body: form,
		})
		console.log('Section preview auto-saved')
		fetchData() // Refresh to get URLs for the picker
	} catch (error) {
		console.error('Auto-save failed:', error)
	}
}

// Watch section guide UUIDs for auto-save
const guideUuids = [
	'heroGuideUuid',
	'opportunitiesGuideUuid',
	'leadershipGuideUuid',
	'whoWeAreGuideUuid',
	'newsGuideUuid',
]

guideUuids.forEach((field) => {
	watch(
		() => (form as any)[field],
		(newVal, oldVal) => {
			if (oldVal !== undefined && newVal !== oldVal) {
				autoSave()
			}
		}
	)
})

const addItem = (list: any[], defaultVal: any) => {
	list.push(defaultVal)
}

const removeItem = (list: any[], index: number) => {
	list.splice(index, 1)
}

const addOpportunity = () => {
	form.opportunities.push({ title: '', iconUuid: null, items: [], link: '', buttonText: '' })
}

const addLeadershipItem = () => {
	form.leadershipItems.push({ text: '', iconUuid: null })
}

const addWhoWeAreItem = () => {
	form.whoWeAre.push({ title: '', description: '', imageUuid: null })
}

const addNewsItem = () => {
	form.newsItems.push({ text: '', iconUuid: null })
}

onMounted(fetchData)
</script>

<style scoped lang="scss">
.section-header {
	h2 {
		font-size: 1.25rem;
		font-weight: 700;
		margin: 0;
		color: var(--gp-primary);
	}
}

.content-group {
	display: flex;
	flex-direction: column;
}

.mb-8 { margin-bottom: 8px; }
.mb-16 { margin-bottom: 16px; }
.mb-24 { margin-bottom: 24px; }
.mb-32 { margin-bottom: 32px; }

.mt-16 { margin-top: 16px; }

.section-card {
	background: var(--gp-bg-card);
	border: 1px solid var(--gp-glass-border);
	backdrop-filter: blur(8px);
}

.card-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	font-weight: 600;
}

.dynamic-list {
	display: flex;
	flex-direction: column;
	gap: 16px;
}

.list-item-wrapper {
	transition: transform 0.2s;

	&:hover {
		transform: translateX(4px);
	}
}

.sub-item {
	margin-bottom: 8px;
}

.sub-item-complex {
	margin-bottom: 12px;
	padding-bottom: 12px;
	border-bottom: 1px dashed var(--gp-glass-border);

	&:last-child {
		border-bottom: none;
	}
}

.divider {
	font-size: 0.9rem;
	font-weight: 600;
	color: var(--gp-primary);
	margin: 24px 0 16px 0;
	display: flex;
	align-items: center;

	&::after {
		content: '';
		flex: 1;
		height: 1px;
		background: linear-gradient(to right, var(--gp-primary), transparent);
		margin-left: 16px;
	}
}

.add-btn {
	align-self: flex-start;
}

.guide-hint {
	font-size: 0.85rem;
	color: var(--gp-primary);
	margin: 8px 0 0 0;
	text-align: center;
	font-weight: 600;
}

.section-guide-embed {
	margin-top: 20px;
	padding: 16px;
	background: rgba(var(--gp-primary-rgb), 0.05);
	border: 1px dashed var(--gp-glass-border);
	border-radius: 8px;
}

:deep(.el-form-item__label) {
	font-weight: 600;
	color: var(--gp-text-primary);
	margin-bottom: 8px !important;
}
</style>

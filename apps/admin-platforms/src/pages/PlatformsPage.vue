<template>
	<div v-if="!loading" class="platforms-page-editor">
		<header class="editor-header">
			<div>
				<h1>Platforms Platform</h1>
				<p class="subtitle">Design-first content management</p>
			</div>
			<div class="header-actions">
				<el-button circle :icon="Refresh" @click="fetchData" />
				<el-button :icon="Check" :loading="saving" type="primary" @click="handleSave"> Save Changes </el-button>
			</div>
		</header>

		<div class="editor-content">
			<el-row :gutter="24">
				<!-- LEFT COLUMN -->
				<el-col :lg="12" :md="24" :sm="24" :xl="12" :xs="24">
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
										placeholder="Platform main vision and mission"
										:rows="4"
										type="textarea"
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
											<el-button :icon="Delete" link type="danger" @click="removeItem(form.opportunities, index)" />
										</div>
									</template>
									<el-form label-position="top">
										<el-row :gutter="20">
											<el-col :span="24">
												<el-form-item label="Card Icon">
													<div style="max-width: 250px">
														<UiMediaPicker v-model="opp.iconUuid" />
													</div>
												</el-form-item>
											</el-col>
											<el-col :span="24">
												<el-form-item label="Title">
													<el-input v-model="opp.title" placeholder="e.g., Sustainability" />
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
											<div style="width: 100%; display: flex; flex-direction: column; gap: 12px">
												<div v-for="(item, iIdx) in opp.items" :key="iIdx" class="sub-item">
													<el-input v-model="opp.items[iIdx]" placeholder="Feature text">
														<template #append>
															<el-button :icon="Delete" @click="removeItem(opp.items, iIdx as number)" />
														</template>
													</el-input>
												</div>
												<el-button
													:icon="Plus"
													plain
													style="align-self: flex-start"
													type="primary"
													@click="addItem(opp.items, '')"
												>
													Add Feature
												</el-button>
											</div>
										</el-form-item>
									</el-form>
								</el-card>
							</div>
							<div class="mb-16">
								<UiMediaPicker v-model="form.opportunitiesGuideUuid" />
								<p class="guide-hint">Opportunities Preview</p>
							</div>
							<el-button class="add-btn mb-32" :icon="Plus" plain type="primary" @click="addOpportunity">
								Add New Opportunity Card
							</el-button>
						</div>
					</div>
				</el-col>

				<!-- RIGHT COLUMN -->
				<el-col :lg="12" :md="24" :sm="24" :xl="12" :xs="24">
					<div class="content-group">
						<!-- TOOLS AND SERVICES SECTION -->
						<el-card class="section-card mb-24">
							<template #header>
								<div class="card-header">
									<span>Tools & Services Overview</span>
								</div>
							</template>
							<el-form label-position="top">
								<el-row :gutter="20">
									<el-col :span="24">
										<el-form-item label="Section SVG Logo">
											<div style="max-width: 250px">
												<UiMediaPicker v-model="form.toolsLogoUuid" />
											</div>
										</el-form-item>
									</el-col>
									<el-col :span="24">
										<el-form-item label="Header Title">
											<el-input v-model="form.toolsTitle" placeholder="e.g., Инструменты и сервисы от GP Platform" />
										</el-form-item>
									</el-col>
								</el-row>
								<div class="divider">Service Cards</div>
								<div v-for="(item, index) in form.toolsItems" :key="index" class="sub-item-complex">
									<el-row align="middle" :gutter="12">
										<el-col :span="22">
											<el-form-item class="mb-8" label="Card Title">
												<el-input v-model="item.title" placeholder="Card title" />
											</el-form-item>
											<el-form-item class="mb-8" label="Card Text">
												<el-input v-model="item.text" placeholder="Description/Card text" :rows="2" type="textarea" />
											</el-form-item>
										</el-col>
										<el-col :span="2">
											<el-button :icon="Delete" link type="danger" @click="removeItem(form.toolsItems, index)" />
										</el-col>
									</el-row>
								</div>
								<el-button
									:icon="Plus"
									plain
									style="margin-top: 12px; margin-bottom: 24px"
									type="primary"
									@click="addToolItem"
								>
									Add Service Card
								</el-button>
								<div class="mt-16">
									<UiMediaPicker v-model="form.toolsGuideUuid" />
									<p class="guide-hint">Tools Section Preview</p>
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

import { createApi } from '@admin-panel/lib'
import { UiMediaPicker } from '@admin-panel/ui'
import { Check, Delete, Plus, Refresh } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

interface IPlatformsData {
	title: string
	description: string
	heroGuideUuid?: string | null
	opportunitiesGuideUuid?: string | null
	toolsGuideUuid?: string | null
	opportunities: {
		items: Array<{
			title: string
			icon?: { uuid: string }
			items: string[]
			link: string
			buttonText: string
		}>
	}
	toolsAndServices: {
		title: string
		logo?: { uuid: string }
		items: Array<{
			title: string
			text: string
		}>
	}
}

const { fetchData: apiFetch } = createApi('platforms')

const loading = ref(false)
const saving = ref(false)

const form = reactive({
	title: '',
	description: '',
	heroGuideUuid: null as string | null,
	opportunitiesGuideUuid: null as string | null,
	toolsGuideUuid: null as string | null,
	opportunities: [] as any[],
	toolsTitle: '',
	toolsLogoUuid: null as string | null,
	toolsItems: [] as any[],
})

const fetchData = async () => {
	loading.value = true

	try {
		const response = await apiFetch<IPlatformsData>('')

		if (response.data) {
			const d = response.data

			form.title = d.title

			form.description = d.description

			form.heroGuideUuid = d.heroGuideUuid || null

			form.opportunitiesGuideUuid = d.opportunitiesGuideUuid || null

			form.toolsGuideUuid = d.toolsGuideUuid || null

			form.opportunities = d.opportunities.items.map((o: any) => ({
				title: o.title,
				iconUuid: o.icon?.uuid || null,
				items: o.items || [],
				link: o.link || '',
				buttonText: o.buttonText || '',
			}))

			form.toolsTitle = d.toolsAndServices?.title || ''

			form.toolsLogoUuid = d.toolsAndServices?.logo?.uuid || null

			form.toolsItems = (d.toolsAndServices?.items || []).map((i: any) => ({
				title: i.title,
				text: i.text,
			}))
		}
	} catch {
		ElMessage.error('Failed to load platforms data')
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

		ElMessage.success('Platforms page updated successfully')

		fetchData()
	} catch {
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

		fetchData()
	} catch {
		ElMessage.error('Auto-save failed')
	}
}

const guideUuids = ['heroGuideUuid', 'opportunitiesGuideUuid', 'toolsGuideUuid']

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

const addToolItem = () => {
	form.toolsItems.push({ title: '', text: '' })
}

onMounted(fetchData)
</script>

<style scoped lang="scss">
.platforms-page-editor {
	max-width: 1600px;
	padding: 24px;
	margin: 0 auto;
}

.editor-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	border-bottom: 1px solid var(--gp-glass-border);
	padding-bottom: 24px;
	margin-bottom: 32px;

	h1 {
		font-weight: 800;
		font-size: 1.75rem;
		-webkit-text-fill-color: transparent;
		background: linear-gradient(to right, var(--gp-primary), var(--gp-text-primary));
		-webkit-background-clip: text;
		background-clip: text;
		margin: 0;
	}

	.subtitle {
		font-size: 0.95rem;
		color: var(--gp-text-secondary);
		margin: 4px 0 0;
	}

	.header-actions {
		display: flex;
		gap: 12px;
	}
}

.section-header {
	h2 {
		font-weight: 700;
		font-size: 1.25rem;
		color: var(--gp-primary);
		margin: 0;
	}
}

.content-group {
	display: flex;
	flex-direction: column;
	gap: 24px;
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

.sub-item {
	margin-bottom: 8px;
}

.sub-item-complex {
	border-bottom: 1px dashed var(--gp-glass-border);
	padding-bottom: 12px;
	margin-bottom: 12px;

	&:last-child {
		border-bottom: none;
	}
}

.divider {
	display: flex;
	align-items: center;
	font-weight: 600;
	font-size: 0.9rem;
	color: var(--gp-primary);
	margin: 24px 0 16px;

	&::after {
		content: '';
		height: 1px;
		flex: 1;
		background: linear-gradient(to right, var(--gp-primary), transparent);
		margin-left: 16px;
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

.section-guide-embed {
	border: 1px dashed var(--gp-glass-border);
	border-radius: 8px;
	background: rgb(var(--gp-primary-rgb), 0.05);
	padding: 16px;
	margin-top: 20px;
}

:deep(.el-form-item__label) {
	font-weight: 600;
	color: var(--gp-text-primary);
	margin-bottom: 8px !important;
}
</style>

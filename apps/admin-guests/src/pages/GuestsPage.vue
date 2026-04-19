<template>
	<div v-if="!loading" class="guests-page-editor">
		<header class="editor-header">
			<div>
				<h1>Guests Page Management</h1>
				<p class="subtitle">Manage content for the "Guests" client page</p>
			</div>
			<div class="header-actions">
				<el-button @click="fetchData" :icon="Refresh" circle />
				<el-button type="primary" :loading="saving" :icon="Check" @click="handleSave"> Save Changes </el-button>
			</div>
		</header>

		<div class="editor-content">
			<el-row :gutter="24">
				<!-- LEFT COLUMN -->
				<el-col :xl="12" :lg="12" :md="24" :sm="24" :xs="24">
					<div class="content-group">
						<!-- GENERAL SECTION -->
						<el-card class="section-card mb-24">
							<template #header>
								<div class="card-header">
									<span>General Settings</span>
								</div>
							</template>
							<el-form label-position="top">
								<el-form-item label="Page Title">
									<el-input v-model="form.title" placeholder="e.g., Гостям" />
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
													<el-input v-model="opp.title" placeholder="e.g., Возможности GP Platform" />
												</el-form-item>
											</el-col>
											<el-col :span="8">
												<el-form-item label="Card Icon">
													<UiMediaPicker v-model="opp.iconUuid" />
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
							<el-button class="add-btn mb-24" type="primary" plain :icon="Plus" @click="addOpportunity">
								Add Opportunity Card
							</el-button>
						</div>

						<!-- SEARCH PROMO SECTION -->
						<el-card class="section-card mb-24">
							<template #header>
								<div class="card-header">
									<span>Quick Search Promo</span>
								</div>
							</template>
							<el-form label-position="top">
								<el-form-item label="Promo Title">
									<el-input v-model="form.searchPromoTitle" placeholder="Main promo title" />
								</el-form-item>
								<el-form-item label="Promo Description">
									<el-input v-model="form.searchPromoDescription" type="textarea" :rows="3" />
								</el-form-item>
								<div class="mt-16">
									<UiMediaPicker v-model="form.searchPromoGuideUuid" />
									<p class="guide-hint">Search Promo Preview</p>
								</div>
							</el-form>
						</el-card>
					</div>
				</el-col>

				<!-- RIGHT COLUMN -->
				<el-col :xl="12" :lg="12" :md="24" :sm="24" :xs="24">
					<div class="content-group">
						<!-- INTERACTION CARDS SECTION -->
						<div class="section-header mb-16">
							<h2>Interaction Cards</h2>
						</div>
						<div class="dynamic-list">
							<div v-for="(card, index) in form.interactionCards" :key="index" class="list-item-wrapper mb-16">
								<el-card class="section-card">
									<template #header>
										<div class="card-header">
											<span>Interaction Card #{{ index + 1 }}</span>
											<el-button type="danger" link :icon="Delete" @click="removeItem(form.interactionCards, index)" />
										</div>
									</template>
									<el-form label-position="top">
										<el-row :gutter="20">
											<el-col :span="18">
												<el-form-item label="Title">
													<el-input v-model="card.title" />
												</el-form-item>
											</el-col>
											<el-col :span="6">
												<el-form-item label="Icon">
													<UiMediaPicker v-model="card.iconUuid" />
												</el-form-item>
											</el-col>
										</el-row>
										<el-form-item label="Description">
											<el-input v-model="card.text" type="textarea" :rows="2" />
										</el-form-item>
										<el-row :gutter="20">
											<el-col :span="12">
												<el-form-item label="Button Text">
													<el-input v-model="card.buttonText" />
												</el-form-item>
											</el-col>
											<el-col :span="12">
												<el-form-item label="Link">
													<el-input v-model="card.link" />
												</el-form-item>
											</el-col>
										</el-row>
									</el-form>
								</el-card>
							</div>
							<div class="mb-16">
								<UiMediaPicker v-model="form.interactionCardsGuideUuid" />
								<p class="guide-hint">Interaction Cards Preview</p>
							</div>
							<el-button class="add-btn mb-24" type="primary" plain :icon="Plus" @click="addInteractionCard">
								Add Interaction Card
							</el-button>
						</div>

						<!-- ADDITIONAL SERVICES SECTION -->
						<el-card class="section-card mb-24">
							<template #header>
								<div class="card-header">
									<span>Additional Services</span>
								</div>
							</template>
							<el-form label-position="top">
								<div v-for="(item, index) in form.additionalServices" :key="index" class="sub-item-complex">
									<el-row :gutter="12" align="middle">
										<el-col :span="14">
											<el-input v-model="item.text" placeholder="Service text" />
										</el-col>
										<el-col :span="6">
											<UiMediaPicker v-model="item.iconUuid" />
										</el-col>
										<el-col :span="2">
											<el-button
												type="danger"
												link
												:icon="Delete"
												@click="removeItem(form.additionalServices, index)"
											/>
										</el-col>
									</el-row>
								</div>
								<el-button type="primary" link :icon="Plus" @click="addAdditionalService"> Add Service Item </el-button>
								<div class="mt-16">
									<UiMediaPicker v-model="form.additionalServicesGuideUuid" />
									<p class="guide-hint">Additional Services Preview</p>
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
import { onMounted, reactive, ref } from 'vue'
import { createApi } from '@admin-panel/lib'
import { ElMessage } from 'element-plus'
import { Plus, Delete, Refresh, Check } from '@element-plus/icons-vue'
import { UiMediaPicker } from '@admin-panel/ui'

interface IGuestsData {
	title: string
	heroGuideUuid?: string | null
	opportunitiesGuideUuid?: string | null
	interactionCardsGuideUuid?: string | null
	searchPromoGuideUuid?: string | null
	additionalServicesGuideUuid?: string | null
	opportunities: Array<{
		title: string
		iconUuid?: string | null
		items: string[]
	}>
	interactionCards: Array<{
		title: string
		text: string
		buttonText: string
		link: string
		iconUuid?: string | null
	}>
	searchPromo: {
		title: string
		description: string
	}
	additionalServices: Array<{
		text: string
		iconUuid?: string | null
	}>
}

const { fetchData: apiFetch } = createApi('guests')

const loading = ref(false)
const saving = ref(false)

const form = reactive({
	title: '',
	heroGuideUuid: null as string | null,
	opportunitiesGuideUuid: null as string | null,
	interactionCardsGuideUuid: null as string | null,
	searchPromoGuideUuid: null as string | null,
	additionalServicesGuideUuid: null as string | null,
	opportunities: [] as any[],
	interactionCards: [] as any[],
	searchPromoTitle: '',
	searchPromoDescription: '',
	additionalServices: [] as any[],
})

const fetchData = async () => {
	loading.value = true

	try {
		const response = await apiFetch<IGuestsData>('')

		if (response.data) {
			const d = response.data

			form.title = d.title

			form.heroGuideUuid = d.heroGuideUuid || null

			form.opportunitiesGuideUuid = d.opportunitiesGuideUuid || null

			form.interactionCardsGuideUuid = d.interactionCardsGuideUuid || null

			form.searchPromoGuideUuid = d.searchPromoGuideUuid || null

			form.additionalServicesGuideUuid = d.additionalServicesGuideUuid || null

			form.opportunities = d.opportunities.map((o: any) => ({
				title: o.title,
				iconUuid: o.iconUuid || o.icon?.uuid || null,
				items: o.items || [],
			}))

			form.interactionCards = d.interactionCards.map((c: any) => ({
				title: c.title,
				text: c.text,
				buttonText: c.buttonText,
				link: c.link,
				iconUuid: c.iconUuid || c.icon?.uuid || null,
			}))

			form.searchPromoTitle = d.searchPromo?.title || ''

			form.searchPromoDescription = d.searchPromo?.description || ''

			form.additionalServices = d.additionalServices.map((s: any) => ({
				text: s.text,
				iconUuid: s.iconUuid || s.icon?.uuid || null,
			}))
		}
	} catch {
		ElMessage.error('Failed to load guests data')
	} finally {
		loading.value = false
	}
}

const handleSave = async () => {
	saving.value = true

	try {
		const body = {
			title: form.title,
			heroGuideUuid: form.heroGuideUuid,
			opportunitiesGuideUuid: form.opportunitiesGuideUuid,
			interactionCardsGuideUuid: form.interactionCardsGuideUuid,
			searchPromoGuideUuid: form.searchPromoGuideUuid,
			additionalServicesGuideUuid: form.additionalServicesGuideUuid,
			opportunities: form.opportunities,
			interactionCards: form.interactionCards,
			searchPromo: {
				title: form.searchPromoTitle,
				description: form.searchPromoDescription,
			},
			additionalServices: form.additionalServices,
		}

		await apiFetch('', {
			method: 'PUT',
			body,
		})

		ElMessage.success('Guests page updated successfully')

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
		const body = {
			title: form.title,
			heroGuideUuid: form.heroGuideUuid,
			opportunitiesGuideUuid: form.opportunitiesGuideUuid,
			interactionCardsGuideUuid: form.interactionCardsGuideUuid,
			searchPromoGuideUuid: form.searchPromoGuideUuid,
			additionalServicesGuideUuid: form.additionalServicesGuideUuid,
			opportunities: form.opportunities,
			interactionCards: form.interactionCards,
			searchPromo: {
				title: form.searchPromoTitle,
				description: form.searchPromoDescription,
			},
			additionalServices: form.additionalServices,
		}

		await apiFetch('', {
			method: 'PUT',
			body,
		})

		// eslint-disable-next-line no-console
		console.log('Section preview auto-saved')

		fetchData()
	} catch (error) {
		// eslint-disable-next-line no-console
		console.error('Auto-save failed:', error)
	}
}

import { watch } from 'vue'
const guideUuids = [
	'heroGuideUuid',
	'opportunitiesGuideUuid',
	'interactionCardsGuideUuid',
	'searchPromoGuideUuid',
	'additionalServicesGuideUuid',
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
	form.opportunities.push({ title: '', iconUuid: null, items: [] })
}

const addInteractionCard = () => {
	form.interactionCards.push({ title: '', text: '', buttonText: '', link: '', iconUuid: null })
}

const addAdditionalService = () => {
	form.additionalServices.push({ text: '', iconUuid: null })
}

onMounted(fetchData)
</script>

<style scoped lang="scss">
.guests-page-editor {
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

.mt-8 {
	margin-top: 8px;
}

.add-btn {
	align-self: flex-start;
	padding: 12px 24px;
	margin-top: 16px;
}

.glass-tabs {
	:deep(.el-tabs__nav-wrap::after) {
		background-color: var(--gp-glass-border);
	}

	:deep(.el-tabs__item) {
		font-weight: 500;
		color: var(--gp-text-secondary);

		&.is-active {
			font-weight: 700;
			color: var(--gp-primary);
		}
	}
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

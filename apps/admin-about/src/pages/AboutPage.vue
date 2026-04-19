<template>
	<div class="about-page-editor">
		<header class="editor-header">
			<div class="header-left">
				<h1>{{ t('general.about_page_management') }}</h1>
				<p class="subtitle">Configure and manage content for the platform's "About" section.</p>
			</div>
			<div class="header-actions">
				<el-button :loading="loading" @click="fetchData">
					<el-icon><Refresh /></el-icon>
					Reload
				</el-button>
				<el-button type="primary" :loading="saving" :icon="Check" @click="handleSave">
					Save Changes
				</el-button>
			</div>
		</header>

		<div v-if="loading && !form.title" class="loading-state">
			<el-skeleton :rows="10" animated />
		</div>

		<el-tabs v-else v-model="activeTab" class="editor-tabs glass-tabs">
			<!-- GENERAL SECTION -->
			<el-tab-pane label="General Info" name="general">
				<el-card class="section-card">
					<el-form label-position="top">
						<el-form-item label="Main Title">
							<el-input v-model="form.title" placeholder="Platform main title" />
						</el-form-item>
						<el-form-item label="Main Description">
							<el-input
								v-model="form.description"
								type="textarea"
								:rows="4"
								placeholder="Platform main vision and mission"
							/>
						</el-form-item>
					</el-form>
				</el-card>
			</el-tab-pane>

			<!-- OPPORTUNITIES SECTION -->
			<el-tab-pane label="Opportunities" name="opportunities">
				<div class="dynamic-list">
					<div v-for="(opp, index) in form.opportunities" :key="index" class="list-item-wrapper">
						<el-card class="section-card">
							<template #header>
								<div class="card-header">
									<span>Opportunity #{{ index + 1 }}</span>
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
										<el-form-item label="Icon (Media UUID)">
											<el-input v-model="opp.iconUuid" placeholder="Media UUID" />
										</el-form-item>
									</el-col>
								</el-row>

								<el-form-item label="Features List">
									<div v-for="(item, iIdx) in opp.items" :key="iIdx" class="sub-item">
										<el-input v-model="opp.items[iIdx]" placeholder="Feature text">
											<template #append>
												<el-button :icon="Delete" @click="removeItem(opp.items, iIdx)" />
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

					<el-button class="add-btn" type="primary" plain :icon="Plus" @click="addOpportunity">
						Add New Opportunity
					</el-button>
				</div>
			</el-tab-pane>

			<!-- LEADERSHIP SECTION -->
			<el-tab-pane label="Leadership" name="leadership">
				<el-card class="section-card">
					<el-form label-position="top">
						<el-row :gutter="20">
							<el-col :span="16">
								<el-form-item label="Leadership Title">
									<el-input v-model="form.leadershipTitle" />
								</el-form-item>
							</el-col>
							<el-col :span="8">
								<el-form-item label="Logo (Media UUID)">
									<el-input v-model="form.leadershipLogoUuid" placeholder="Media UUID" />
								</el-form-item>
							</el-col>
						</el-row>

						<el-form-item label="Leadership Description">
							<el-input v-model="form.leadershipDescription" type="textarea" :rows="3" />
						</el-form-item>

						<div class="divider">Leadership List</div>

						<div v-for="(item, index) in form.leadershipItems" :key="index" class="sub-item-complex">
							<el-row :gutter="12">
								<el-col :span="18">
									<el-input v-model="item.text" placeholder="Leader text" />
								</el-col>
								<el-col :span="4">
									<el-input v-model="item.iconUuid" placeholder="Icon UUID" />
								</el-col>
								<el-col :span="2">
									<el-button type="danger" link :icon="Delete" @click="removeItem(form.leadershipItems, index)" />
								</el-col>
							</el-row>
						</div>
						<el-button type="primary" link :icon="Plus" @click="addLeadershipItem"> Add Leadership Item </el-button>
					</el-form>
				</el-card>
			</el-tab-pane>

			<!-- WHO WE ARE SECTION -->
			<el-tab-pane label="Who We Are" name="whoweare">
				<div class="dynamic-list">
					<div v-for="(item, index) in form.whoWeAre" :key="index" class="list-item-wrapper">
						<el-card class="section-card">
							<template #header>
								<div class="card-header">
									<span>Member/Section #{{ index + 1 }}</span>
									<el-button type="danger" link :icon="Delete" @click="removeItem(form.whoWeAre, index)" />
								</div>
							</template>
							<el-form label-position="top">
								<el-row :gutter="20">
									<el-col :span="16">
										<el-form-item label="Title">
											<el-input v-model="item.title" />
										</el-form-item>
									</el-col>
									<el-col :span="8">
										<el-form-item label="Image (Media UUID)">
											<el-input v-model="item.imageUuid" />
										</el-form-item>
									</el-col>
								</el-row>
								<el-form-item label="Description">
									<el-input v-model="item.description" type="textarea" :rows="2" />
								</el-form-item>
							</el-form>
						</el-card>
					</div>
					<el-button class="add-btn" type="primary" plain :icon="Plus" @click="addWhoWeAreItem">
						Add Member/Section
					</el-button>
				</div>
			</el-tab-pane>

			<!-- NEWS SECTION -->
			<el-tab-pane label="News" name="news">
				<el-card class="section-card">
					<el-form label-position="top">
						<el-form-item label="News Section Title">
							<el-input v-model="form.newsTitle" />
						</el-form-item>

						<div class="divider">News Items</div>

						<div v-for="(item, index) in form.newsItems" :key="index" class="sub-item-complex">
							<el-row :gutter="12">
								<el-col :span="18">
									<el-input v-model="item.text" placeholder="News text" />
								</el-col>
								<el-col :span="4">
									<el-input v-model="item.iconUuid" placeholder="Icon UUID" />
								</el-col>
								<el-col :span="2">
									<el-button type="danger" link :icon="Delete" @click="removeItem(form.newsItems, index)" />
								</el-col>
							</el-row>
						</div>
						<el-button type="primary" link :icon="Plus" @click="addNewsItem"> Add News Item </el-button>
					</el-form>
				</el-card>
			</el-tab-pane>
		</el-tabs>
	</div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useI18n } from '@admin-panel/i18n'
import { createApi } from '@admin-panel/lib'
import { ElMessage } from 'element-plus'
import { Plus, Delete, Refresh, Check } from '@element-plus/icons-vue'

interface IAboutData {
	title: string
	description: string
	opportunities: {
		items: Array<{
			title: string
			icon?: { uuid: string }
			items: string[]
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
			form.opportunities = d.opportunities.items.map((o: any) => ({
				title: o.title,
				iconUuid: o.icon?.uuid,
				items: o.items,
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
	} catch (error) {
		ElMessage.error('Failed to save changes')
	} finally {
		saving.value = false
	}
}

const addItem = (list: any[], defaultVal: any) => {
	list.push(defaultVal)
}

const removeItem = (list: any[], index: number) => {
	list.splice(index, 1)
}

const addOpportunity = () => {
	form.opportunities.push({ title: '', iconUuid: null, items: [] })
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
.about-page-editor {
	display: flex;
	flex-direction: column;
	gap: 24px;
}

.editor-header {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;

	h1 {
		font-size: 1.75rem;
		font-weight: 700;
		margin: 0;
	}

	.subtitle {
		color: var(--gp-text-secondary);
		margin: 4px 0 0 0;
	}

	.header-actions {
		display: flex;
		gap: 12px;
	}
}

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

.mt-8 {
	margin-top: 8px;
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

.glass-tabs {
	:deep(.el-tabs__nav-wrap::after) {
		background-color: var(--gp-glass-border);
	}

	:deep(.el-tabs__item) {
		color: var(--gp-text-secondary);
		font-weight: 500;

		&.is-active {
			color: var(--gp-primary);
			font-weight: 700;
		}
	}
}

.loading-state {
	padding: 40px;
}
</style>

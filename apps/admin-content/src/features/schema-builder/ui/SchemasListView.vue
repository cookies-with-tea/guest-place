<template>
	<div class="schemas-view">
		<div class="page-header">
			<div class="page-header__left">
				<h1>Content Schemas</h1>
				<p class="page-subtitle">Define the structure of your content collections</p>
			</div>
			<div class="page-header__actions">
				<el-button :icon="Grid" type="success" plain @click="router.push({ name: 'PageList' })">
					Конструктор страниц
				</el-button>
				<el-button
					:icon="MagicStick"
					plain
					type="warning"
					:loading="seedAboutPage.isSeedingAbout"
					@click="seedAboutPage.seedAboutPage"
				>
					Шаблон «О платформе»
				</el-button>
				<el-button :icon="Notebook" plain @click="schemaList.goToDocs"> Документация подхода </el-button>
				<el-button :icon="Plus" type="primary" @click="emit('add')"> Create Schema </el-button>
			</div>
		</div>

		<div class="page-content">
			<div v-if="schemaList.loading" class="loading-grid">
				<div v-for="i in 4" :key="i" class="schema-skeleton">
					<el-skeleton animated :rows="2" />
				</div>
			</div>

			<div v-else-if="schemaList.schemas.length === 0" class="empty-state">
				<el-icon class="empty-state__icon"><FolderOpened /></el-icon>
				<h3>No schemas yet</h3>
				<p>Create your first content schema to start building structured content</p>
				<el-button :icon="Plus" type="primary" @click="emit('add')">Create Schema</el-button>
			</div>

			<div v-else class="schemas-grid">
				<div v-for="schema in schemaList.schemas" :key="schema.id" class="schema-card" @click="emit('edit', schema)">
					<div class="schema-card__header">
						<el-icon class="schema-card__icon">
							<component :is="schema.isSingleton ? Document : Files" />
						</el-icon>
						<div class="schema-card__badges">
							<el-tag v-if="schema.isSingleton" size="small" type="warning">Singleton</el-tag>
						</div>
					</div>
					<div class="schema-card__body">
						<h3 class="schema-card__name">{{ schema.name }}</h3>
						<code class="schema-card__slug">{{ schema.slug }}</code>
					</div>
					<div class="schema-card__footer">
						<span class="schema-card__fields">
							<strong>{{ schema.fields?.length || 0 }}</strong> field{{ schema.fields?.length !== 1 ? 's' : '' }}
						</span>
						<div class="schema-card__actions" @click.stop>
							<el-button
								:icon="Document"
								plain
								size="small"
								type="success"
								@click="schemaList.goToEntries(schema.slug)"
							>
								Entries
							</el-button>
							<el-button :icon="Edit" plain size="small" @click="emit('edit', schema)">Edit</el-button>
							<el-button :icon="Delete" plain size="small" type="danger" @click="schemaList.deleteSchema(schema.id)">
								Delete
							</el-button>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import type { ContentSchema } from '@admin-panel/lib'
import { Delete, Document, Edit, Files, FolderOpened, Grid, MagicStick, Notebook, Plus } from '@element-plus/icons-vue'
import type { SchemaList } from '../composables/useSchemaList'
import type { SeedAboutPage } from '../composables/useSeedAboutPage'

defineProps<{
	schemaList: SchemaList
	seedAboutPage: SeedAboutPage
}>()

const emit = defineEmits<{
	add: []
	edit: [schema: ContentSchema]
}>()

const router = useRouter()
</script>

<style scoped>
.schemas-view {
	padding: 32px;
}

.page-header {
	display: flex;
	flex-wrap: wrap;
	align-items: flex-start;
	justify-content: space-between;
	margin-bottom: 32px;
	gap: 16px;
}

.page-header__actions {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: 12px;
}

.page-header h1 {
	font-weight: 800;
	font-size: 2rem;
	letter-spacing: -0.02em;
	color: var(--gp-text-main);
	margin: 0 0 4px;
}

.page-subtitle {
	font-size: 14px;
	color: var(--gp-text-secondary);
	margin: 0;
}

.schemas-grid,
.loading-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
	gap: 20px;
}

.schema-card {
	display: flex;
	flex-direction: column;
	border: 1px solid var(--gp-glass-border-inner);
	border-radius: var(--gp-radius-md);
	background: var(--gp-bg-glass);
	transition:
		border-color 0.2s ease,
		box-shadow 0.2s ease,
		transform 0.15s ease;
	cursor: pointer;
	padding: 20px;
	gap: 16px;
}

.schema-card:hover {
	border-color: var(--gp-primary-light);
	box-shadow: var(--gp-glass-shadow);
	transform: translateY(-2px);
}

.schema-card__header {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.schema-card__icon {
	width: 1em;
	height: 1em;
	flex-shrink: 0;
	font-size: 24px;
	line-height: 1;
	color: var(--gp-primary);
}

.schema-card__body {
	flex: 1;
}

.schema-card__name {
	font-weight: 700;
	font-size: 16px;
	color: var(--gp-text-main);
	margin: 0 0 6px;
}

.schema-card__slug {
	border-radius: 4px;
	font-family: 'JetBrains Mono', monospace;
	font-size: 12px;
	color: var(--gp-text-secondary);
	background: var(--gp-bg-glass-hover);
	padding: 2px 8px;
}

.schema-card__footer {
	display: flex;
	align-items: center;
	justify-content: space-between;
	border-top: 1px solid var(--gp-glass-border);
	padding-top: 14px;
}

.schema-card__fields {
	font-size: 13px;
	color: var(--gp-text-secondary);
}

.schema-card__actions {
	display: flex;
	transition: opacity 0.2s ease;
	opacity: 0;
	gap: 6px;
}

.schema-card:hover .schema-card__actions {
	opacity: 1;
}

.schema-skeleton {
	border: 1px solid var(--gp-glass-border);
	border-radius: var(--gp-radius-md);
	padding: 20px;
}

.empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	border: 2px dashed var(--gp-glass-border);
	border-radius: var(--gp-radius-lg);
	text-align: center;
	padding: 80px 40px;
	gap: 12px;
}

.empty-state__icon {
	width: 1em;
	height: 1em;
	font-size: 40px;
	line-height: 1;
	color: var(--gp-text-secondary);
}

.empty-state h3 {
	font-weight: 700;
	font-size: 20px;
	color: var(--gp-text-main);
	margin: 0;
}

.empty-state p {
	font-size: 14px;
	color: var(--gp-text-secondary);
	margin: 0;
}
</style>

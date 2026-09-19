<template>
	<div class="version-diff-viewer" :class="{ 'is-dark': isDark }">
		<!-- Header -->
		<div class="diff-header">
			<div class="diff-col diff-col--old">
				<div class="diff-col__badge diff-col__badge--old">VERSION {{ version?.version_number ?? '?' }}</div>
				<div class="diff-col__meta">
					{{ version ? formatDate(version.created_at) : '—' }}
					<span v-if="version?.comment" class="diff-col__comment">"{{ version.comment }}"</span>
				</div>
			</div>
			<div class="diff-divider-header">
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path d="M5 12H19M12 5L19 12L12 19" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
				</svg>
			</div>
			<div class="diff-col diff-col--new">
				<div class="diff-col__badge diff-col__badge--new">CURRENT</div>
				<div class="diff-col__meta">Unsaved draft</div>
			</div>
		</div>

		<!-- No diff / all same -->
		<div v-if="diffItems.length === 0" class="diff-empty">
			<svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="opacity:0.3">
				<path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 12 7.02944 21 12Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
			</svg>
			<p>No differences found between this version and the current state.</p>
		</div>

		<!-- Diff rows -->
		<div v-else class="diff-body">
			<div
				v-for="item in diffItems"
				:key="item.fieldName"
				class="diff-row"
				:class="{
					'is-added': item.type === 'added',
					'is-removed': item.type === 'removed',
					'is-changed': item.type === 'changed',
					'is-unchanged': item.type === 'unchanged',
				}"
			>
				<div class="diff-row__label">
					<span class="diff-row__field-name">{{ item.fieldLabel }}</span>
					<span class="diff-row__type-badge" :class="`is-${item.type}`">{{ typeBadge(item.type) }}</span>
				</div>
				<div class="diff-row__body">
					<!-- Old value -->
					<div class="diff-cell diff-cell--old">
						<template v-if="item.type !== 'added'">
							<DiffCellContent :value="item.oldValue" :field-type="item.fieldType" :is-old="true" />
						</template>
						<div v-else class="diff-cell__empty">—</div>
					</div>
					<div class="diff-divider-body" />
					<!-- New value -->
					<div class="diff-cell diff-cell--new">
						<template v-if="item.type !== 'removed'">
							<DiffCellContent :value="item.newValue" :field-type="item.fieldType" :is-old="false" />
						</template>
						<div v-else class="diff-cell__empty">—</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Summary -->
		<div v-if="diffItems.length > 0" class="diff-summary">
			<span class="diff-summary__item is-changed">
				<span class="dot" />{{ changedCount }} changed
			</span>
			<span v-if="addedCount > 0" class="diff-summary__item is-added">
				<span class="dot" />{{ addedCount }} added
			</span>
			<span v-if="removedCount > 0" class="diff-summary__item is-removed">
				<span class="dot" />{{ removedCount }} removed
			</span>
			<span class="diff-summary__item is-unchanged">
				<span class="dot" />{{ unchangedCount }} unchanged
			</span>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import type { ContentSchema } from '@admin-panel/lib'
import { useTheme } from '@admin-panel/ui'

import DiffCellContent from './DiffCellContent.vue'

interface Version {
	id: string
	version_number: number
	data: Record<string, any>
	i18n: Record<string, any>
	created_at: string
	comment?: string
}

interface Props {
	version: Version | null
	currentData: Record<string, any>
	schema: ContentSchema | null
}

const props = defineProps<Props>()
const { isDark } = useTheme()

type DiffType = 'added' | 'removed' | 'changed' | 'unchanged'

interface DiffItem {
	fieldName: string
	fieldLabel: string
	fieldType: string
	type: DiffType
	oldValue: any
	newValue: any
}

const diffItems = computed<DiffItem[]>(() => {
	if (!props.schema || !props.version) return []

	const fields = props.schema.fields as any[]
	const oldData = props.version.data as Record<string, any>
	const newData = props.currentData || {}

	return fields.map((field): DiffItem => {
		const oldVal = oldData[field.name]
		const newVal = newData[field.name]

		const oldStr = serialize(oldVal)
		const newStr = serialize(newVal)

		let type: DiffType
		const oldEmpty = isEmpty(oldVal)
		const newEmpty = isEmpty(newVal)

		if (oldEmpty && !newEmpty) {
			type = 'added'
		} else if (!oldEmpty && newEmpty) {
			type = 'removed'
		} else if (oldStr !== newStr) {
			type = 'changed'
		} else {
			type = 'unchanged'
		}

		return {
			fieldName: field.name,
			fieldLabel: field.label,
			fieldType: field.fieldType || field.field_type || 'Text',
			type,
			oldValue: oldVal,
			newValue: newVal,
		}
	})
})

const changedCount = computed(() => diffItems.value.filter((i) => i.type === 'changed').length)
const addedCount = computed(() => diffItems.value.filter((i) => i.type === 'added').length)
const removedCount = computed(() => diffItems.value.filter((i) => i.type === 'removed').length)
const unchangedCount = computed(() => diffItems.value.filter((i) => i.type === 'unchanged').length)

const serialize = (val: any): string => {
	if (val === null || val === undefined) return ''
	if (typeof val === 'object') return JSON.stringify(val)
	return String(val)
}

const isEmpty = (val: any): boolean => {
	if (val === null || val === undefined || val === '') return true
	if (Array.isArray(val)) return val.length === 0
	return false
}

const formatDate = (iso: string) => {
	try {
		return new Date(iso).toLocaleString('ru-RU', {
			day: '2-digit',
			month: 'short',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		})
	} catch {
		return iso
	}
}

const typeBadge = (type: DiffType) => {
	const map: Record<DiffType, string> = {
		changed: 'changed',
		added: 'added',
		removed: 'removed',
		unchanged: 'same',
	}
	return map[type]
}
</script>

<style scoped>
.version-diff-viewer {
	font-family: 'Inter', -apple-system, sans-serif;
	display: flex;
	flex-direction: column;
	gap: 0;
}

/* Header */
.diff-header {
	display: grid;
	grid-template-columns: 1fr 32px 1fr;
	gap: 0;
	margin-bottom: 16px;
	padding: 14px 20px;
	background: var(--gp-bg-glass-hover, rgba(255,255,255,0.04));
	border: 1px solid var(--gp-glass-border, rgba(255,255,255,0.08));
	border-radius: 12px;
	align-items: center;
}

.diff-col {
	display: flex;
	flex-direction: column;
	gap: 4px;
}

.diff-col--new {
	align-items: flex-end;
	text-align: right;
}

.diff-col__badge {
	display: inline-flex;
	font-size: 10px;
	font-weight: 800;
	letter-spacing: 0.1em;
	padding: 3px 8px;
	border-radius: 4px;
}

.diff-col__badge--old {
	color: #f59e0b;
	background: rgba(245, 158, 11, 0.12);
	border: 1px solid rgba(245, 158, 11, 0.3);
}

.diff-col__badge--new {
	color: #34d399;
	background: rgba(52, 211, 153, 0.12);
	border: 1px solid rgba(52, 211, 153, 0.3);
}

.diff-col__meta {
	font-size: 12px;
	color: var(--gp-text-secondary, #64748b);
}

.diff-col__comment {
	font-style: italic;
	margin-left: 4px;
}

.diff-divider-header {
	display: flex;
	align-items: center;
	justify-content: center;
	color: var(--gp-text-secondary, #475569);
}

/* Empty */
.diff-empty {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 16px;
	padding: 60px 24px;
	color: var(--gp-text-secondary, #64748b);
	font-size: 14px;
	text-align: center;
}

/* Body */
.diff-body {
	display: flex;
	flex-direction: column;
	gap: 12px;
}

.diff-row {
	border: 1px solid var(--gp-glass-border, rgba(255,255,255,0.07));
	border-radius: 10px;
	overflow: hidden;
	transition: border-color 0.2s;
}

.diff-row.is-changed { border-color: rgba(99, 102, 241, 0.35); }
.diff-row.is-added   { border-color: rgba(52, 211, 153, 0.3); }
.diff-row.is-removed { border-color: rgba(239, 68, 68, 0.3); }
.diff-row.is-unchanged { opacity: 0.55; }

.diff-row__label {
	display: flex;
	align-items: center;
	gap: 10px;
	padding: 8px 16px;
	background: var(--gp-bg-glass-hover, rgba(255,255,255,0.03));
	border-bottom: 1px solid var(--gp-glass-border, rgba(255,255,255,0.06));
}

.diff-row__field-name {
	font-weight: 700;
	font-size: 12px;
	color: var(--gp-text-main, #e2e8f0);
}

.diff-row__type-badge {
	font-size: 9px;
	font-weight: 800;
	letter-spacing: 0.1em;
	text-transform: uppercase;
	padding: 2px 7px;
	border-radius: 4px;
}

.diff-row__type-badge.is-changed  { color: #818cf8; background: rgba(99,102,241,0.15); }
.diff-row__type-badge.is-added    { color: #34d399; background: rgba(52,211,153,0.12); }
.diff-row__type-badge.is-removed  { color: #f87171; background: rgba(239,68,68,0.12);  }
.diff-row__type-badge.is-unchanged{ color: #64748b; background: rgba(100,116,139,0.1); }

.diff-row__body {
	display: grid;
	grid-template-columns: 1fr 1px 1fr;
}

.diff-cell {
	padding: 14px 16px;
	font-size: 13px;
	line-height: 1.6;
	min-height: 48px;
	overflow-x: auto;
}

.diff-cell--old { background: rgba(239, 68, 68, 0.04); }
.diff-cell--new { background: rgba(52, 211, 153, 0.04); }

.diff-cell__empty {
	color: var(--gp-text-secondary, #475569);
	font-style: italic;
}

.diff-divider-body {
	background: var(--gp-glass-border, rgba(255,255,255,0.07));
	width: 1px;
}

/* Summary bar */
.diff-summary {
	display: flex;
	align-items: center;
	gap: 20px;
	padding: 14px 4px 0;
	border-top: 1px dashed var(--gp-glass-border, rgba(255,255,255,0.07));
	margin-top: 16px;
	flex-wrap: wrap;
}

.diff-summary__item {
	display: flex;
	align-items: center;
	gap: 6px;
	font-size: 12px;
	font-weight: 600;
	color: var(--gp-text-secondary, #64748b);
}

.dot {
	width: 8px;
	height: 8px;
	border-radius: 50%;
}

.diff-summary__item.is-changed .dot  { background: #818cf8; }
.diff-summary__item.is-added .dot    { background: #34d399; }
.diff-summary__item.is-removed .dot  { background: #f87171; }
.diff-summary__item.is-unchanged .dot{ background: #475569; }
</style>

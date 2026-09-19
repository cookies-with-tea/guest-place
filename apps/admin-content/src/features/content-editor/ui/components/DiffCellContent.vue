<template>
	<div class="diff-cell-content" :class="{ 'is-old': isOld, 'is-new': !isOld }">
		<!-- Boolean -->
		<template v-if="fieldType === 'Boolean'">
			<span class="bool-chip" :class="value ? 'is-true' : 'is-false'">
				{{ value ? '✓ Yes' : '✗ No' }}
			</span>
		</template>

		<!-- Number -->
		<template v-else-if="fieldType === 'Number'">
			<span class="number-value">{{ value ?? '—' }}</span>
		</template>

		<!-- Date -->
		<template v-else-if="fieldType === 'Date'">
			<span class="date-value">{{ value ? new Date(value).toLocaleDateString('ru-RU') : '—' }}</span>
		</template>

		<!-- RichText: render stripped plain text + show word diff badge -->
		<template v-else-if="fieldType === 'RichText'">
			<div class="richtext-preview" v-html="value || '<em style=\'opacity:0.4\'>empty</em>'" />
		</template>

		<!-- Media -->
		<template v-else-if="fieldType === 'Media'">
			<div v-if="value" class="media-preview">
				<img
					v-if="isImage(value)"
					:src="value"
					class="media-img"
					:alt="isOld ? 'Old version' : 'Current version'"
				/>
				<span v-else class="media-file">📎 {{ getFilename(value) }}</span>
			</div>
			<span v-else class="empty-val">—</span>
		</template>

		<!-- Text / Relation / default -->
		<template v-else>
			<span v-if="value !== null && value !== undefined && value !== ''" class="text-value">{{ value }}</span>
			<span v-else class="empty-val">—</span>
		</template>
	</div>
</template>

<script setup lang="ts">
interface Props {
	value: any
	fieldType: string
	isOld: boolean
}

defineProps<Props>()

const isImage = (url: string) => /\.(jpg|jpeg|png|gif|webp|avif|svg)(\?.*)?$/i.test(url)

const getFilename = (url: string) => (url || '').split('/').pop() || 'file'
</script>

<style scoped>
.diff-cell-content {
	font-size: 13px;
	line-height: 1.65;
	color: var(--gp-text-main, #e2e8f0);
	word-break: break-word;
}

.bool-chip {
	display: inline-flex;
	align-items: center;
	font-size: 12px;
	font-weight: 600;
	padding: 3px 10px;
	border-radius: 20px;

	&.is-true  { color: #4ade80; background: rgba(34,197,94,0.12); border: 1px solid rgba(34,197,94,0.25); }
	&.is-false { color: #f87171; background: rgba(239,68,68,0.1);  border: 1px solid rgba(239,68,68,0.2);  }
}

.number-value {
	font-size: 22px;
	font-weight: 700;
	color: #818cf8;
}

.date-value {
	font-size: 13px;
	color: var(--gp-text-secondary, #94a3b8);
}

.richtext-preview {
	font-size: 13px;
	line-height: 1.6;
	color: var(--gp-text-main, #e2e8f0);
	max-height: 260px;
	overflow-y: auto;

	:deep(h1), :deep(h2), :deep(h3) { font-size: 14px; font-weight: 700; margin: 4px 0; }
	:deep(p)  { margin: 2px 0; }
	:deep(strong) { font-weight: 700; }
	:deep(em)     { font-style: italic; }
	:deep(code)   { font-family: monospace; font-size: 12px; background: rgba(99,102,241,0.15); padding: 1px 4px; border-radius: 3px; }
	:deep(ul), :deep(ol) { padding-left: 16px; margin: 2px 0; }
	:deep(blockquote) { border-left: 2px solid #4f46e5; padding-left: 8px; opacity: 0.8; }
}

.is-old .richtext-preview { opacity: 0.85; }

.media-preview { display: flex; flex-direction: column; gap: 6px; }

.media-img {
	max-width: 100%;
	max-height: 180px;
	border-radius: 8px;
	object-fit: cover;
	border: 1px solid rgba(255,255,255,0.06);
}

.media-file {
	font-size: 12px;
	color: #818cf8;
}

.text-value {
	color: var(--gp-text-main, #e2e8f0);
}

.empty-val {
	color: var(--gp-text-secondary, #475569);
	font-style: italic;
}
</style>

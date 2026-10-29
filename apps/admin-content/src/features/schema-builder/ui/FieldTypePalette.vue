<template>
	<aside class="palette">
		<div class="palette__title">Field Types</div>
		<div class="palette__list">
			<button
				v-for="ft in fieldBuilder.fieldTypePalette"
				:key="ft.value"
				class="palette-item"
				:title="ft.description"
				@click="fieldBuilder.addFieldOfType(ft.value)"
			>
				<span class="palette-item__icon">{{ ft.icon }}</span>
				<div class="palette-item__info">
					<span class="palette-item__label">{{ ft.label }}</span>
					<span class="palette-item__desc">{{ ft.description }}</span>
				</div>
				<svg
					class="palette-item__add"
					fill="none"
					height="14"
					stroke="currentColor"
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2.5"
					viewBox="0 0 24 24"
					width="14"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path d="M12 5v14M5 12h14" />
				</svg>
			</button>
		</div>

		<div class="palette__title palette__title--blocks">Blocks</div>
		<div class="palette__list">
			<button
				v-for="block in fieldBlocks"
				:key="block.id"
				class="palette-item"
				:title="`Insert as a Group field named “${block.name}”`"
				@click="fieldBuilder.insertBlock(block.label, block.name, block.fields)"
			>
				<span class="palette-item__icon">{{ block.icon }}</span>
				<div class="palette-item__info">
					<span class="palette-item__label">{{ block.label }}</span>
					<span class="palette-item__desc">{{ block.description }}</span>
				</div>
				<svg
					class="palette-item__add"
					fill="none"
					height="14"
					stroke="currentColor"
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2.5"
					viewBox="0 0 24 24"
					width="14"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path d="M12 5v14M5 12h14" />
				</svg>
			</button>
		</div>
	</aside>
</template>

<script setup lang="ts">
import { FIELD_BLOCKS } from '../composables/useFieldBlocks'
import type { FieldBuilder } from '../composables/useFieldBuilder'

defineProps<{
	fieldBuilder: FieldBuilder
}>()

const fieldBlocks = FIELD_BLOCKS
</script>

<style scoped>
.palette {
	display: flex;
	flex-direction: column;
	border-right: 1px solid var(--gp-glass-border);
	background: var(--gp-bg-glass);
	padding: 16px 12px;
	overflow-y: auto;
	gap: 4px;
}

.palette__title {
	font-weight: 800;
	font-size: 10px;
	letter-spacing: 0.1em;
	text-transform: uppercase;
	color: var(--gp-text-secondary);
	padding: 0 4px 12px;
}

.palette__title--blocks {
	border-top: 1px solid var(--gp-glass-border);
	padding-top: 16px;
	margin-top: 8px;
}

.palette__list {
	display: flex;
	flex-direction: column;
	gap: 4px;
}

.palette-item {
	display: flex;
	align-items: center;
	border: 1px solid transparent;
	border-radius: 10px;
	text-align: left;
	background: transparent;
	transition:
		background 0.15s,
		border-color 0.15s;
	cursor: pointer;
	padding: 10px;
	gap: 10px;

	&:hover {
		border-color: var(--gp-glass-border);
		background: var(--gp-bg-glass-hover);
	}

	&:hover .palette-item__add {
		opacity: 1;
	}
}

.palette-item__icon {
	flex-shrink: 0;
	font-size: 20px;
	line-height: 1;
}

.palette-item__info {
	min-width: 0;
	display: flex;
	flex: 1;
	flex-direction: column;
	gap: 2px;
}

.palette-item__label {
	font-weight: 600;
	font-size: 13px;
	line-height: 1.3;
	color: var(--gp-text-main);
}

.palette-item__desc {
	font-size: 10px;
	line-height: 1.3;
	white-space: nowrap;
	text-overflow: ellipsis;
	color: var(--gp-text-secondary);
	overflow: hidden;
}

.palette-item__add {
	flex-shrink: 0;
	color: var(--gp-text-secondary);
	transition: opacity 0.15s;
	opacity: 0;
}
</style>

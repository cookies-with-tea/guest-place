<template>
	<div class="ui-table">
		<div class="ui-table__scroll">
			<el-table
				v-loading="loading"
				v-bind="$attrs"
				:data="computedData"
				border
				stripe
				row-key="id"
				:fit="false"
				highlight-current-row
				style="width: 100%"
			>
				<!-- Декларативные колонки -->
				<template v-if="columns && columns.length">
					<UiTableColumn v-for="col in columns" :key="col.prop" v-bind="col" />
				</template>

				<!-- Прямой проброс всех слотов -->
				<template v-for="(_, name) in $slots" #[name]="slotData">
					<slot :name="name" v-bind="slotData || {}" />
				</template>
			</el-table>
		</div>

		<!-- Пагинация -->
		<div v-if="total !== undefined" class="ui-table__pagination">
			<el-pagination
				:current-page="page"
				:page-size="limit"
				:total="total"
				layout="total, sizes, prev, pager, next, jumper"
				:page-sizes="[10, 20, 50, 100]"
				background
				:disabled="loading"
				@update:current-page="$emit('update:page', $event)"
				@update:page-size="$emit('update:limit', $event)"
			/>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import UiTableColumn from '../../ui-table-column'

interface ColumnConfig {
	label?: string
	prop?: string
	width?: string | number
	minWidth?: string | number
	sortable?: boolean
	filterable?: boolean
	[key: string]: any
}

interface Props {
	data?: any[]
	columns?: ColumnConfig[]
	total?: number
	page?: number
	limit?: number
	loading?: boolean
	skeletonRows?: number
}

const props = withDefaults(defineProps<Props>(), {
	data: () => [],
	columns: () => [],
	skeletonRows: 10,
})

defineEmits<{
	(e: 'update:page', val: number): void
	(e: 'update:limit', val: number): void
}>()

const computedData = computed(() => {
	if (props.loading && props.data.length === 0) {
		return Array.from({ length: props.skeletonRows }).map((_, i) => ({
			__isSkeleton: true,
			id: `skeleton-${i}`,
		}))
	}

	return props.data
})

defineOptions({
	inheritAttrs: false,
})
</script>

<style scoped lang="scss">
.ui-table {
	border: 1px solid var(--border-color);
	border-radius: 16px;
	box-shadow: var(--shadow-sm);
	background-color: var(--bg-card) !important;
	overflow: hidden;
}

/* With `fit="false"` the table can render wider than its container when columns need more
   room — this wrapper turns that into a horizontal scrollbar instead of clipped/overlapping
   columns on narrow viewports (e.g. when the sidebar's secondary column is also open).
   `.el-table` itself defaults to `overflow: hidden` (for its own rounded corners) and
   relies on its own internal custom scrollbar for horizontal scroll, which stays hidden
   until hovered/dragged — overriding it to `visible` here lets the overflow reach this
   wrapper instead, which gives a plain, always-available native scrollbar. */
.ui-table__scroll {
	overflow-x: auto;

	:deep(.el-table) {
		overflow: visible;
	}
}

:deep(.el-table) {
	--el-table-header-bg-color: var(--bg-header);
	--el-table-row-hover-bg-color: var(--bg-surface);
	--el-table-border-color: var(--border-color);

	color: var(--text-primary);
	background-color: var(--bg-card) !important;
}

:deep(.el-table__header-wrapper th) {
	height: 60px;
	border-bottom: 1px solid var(--border-color) !important;
	font-weight: 700;
	color: var(--text-muted);
	background-color: var(--bg-header) !important;
}

/* Удаление лишних бордеров из Element Plus, которые могут дублироваться */
:deep(.el-table--border) {
	border: none !important;
}

:deep(.el-table__inner-wrapper::before) {
	display: none !important;
}

.ui-table__pagination {
	display: flex;
	justify-content: center;
	border-top: 1px solid var(--border-color);
	background-color: var(--bg-header);
	padding: 16px 24px;
}
</style>

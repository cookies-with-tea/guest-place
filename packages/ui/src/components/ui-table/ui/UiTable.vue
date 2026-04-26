<template>
	<div class="ui-table">
		<el-table v-bind="$attrs">
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
</template>

<script setup lang="ts">
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
	columns?: ColumnConfig[]
}

defineProps<Props>()

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
</style>

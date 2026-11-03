<template>
	<el-popover
		v-if="filterable"
		placement="bottom-start"
		popper-class="gp-popover"
		:show-arrow="true"
		trigger="click"
		:width="240"
	>
		<template #reference>
			<div class="header-interactive" :class="{ 'is-active': isActive }">
				<span>{{ label }}</span>
				<div class="sort-controls">
					<el-icon :class="{ active: sortOrder === 'ASC' && sortBy === prop }" @click.stop="onSort('ASC')">
						<CaretTop />
					</el-icon>
					<el-icon :class="{ active: sortOrder === 'DESC' && sortBy === prop }" @click.stop="onSort('DESC')">
						<CaretBottom />
					</el-icon>
				</div>
			</div>
		</template>
		<div class="filter-popover-content">
			<span class="popover-label">Filter by {{ label }}</span>
			<slot name="filter"></slot>
		</div>
	</el-popover>
	<div v-else class="header-interactive" :class="{ 'is-active': isActive }">
		<span>{{ label }}</span>
		<div class="sort-controls">
			<el-icon :class="{ active: sortOrder === 'ASC' && sortBy === prop }" @click.stop="onSort('ASC')">
				<CaretTop />
			</el-icon>
			<el-icon :class="{ active: sortOrder === 'DESC' && sortBy === prop }" @click.stop="onSort('DESC')">
				<CaretBottom />
			</el-icon>
		</div>
	</div>
</template>

<script setup lang="ts">
import { CaretBottom, CaretTop } from '@element-plus/icons-vue'

interface Props {
	label: string
	prop: string
	sortBy?: string
	sortOrder?: string | null
	filterable?: boolean
	isActive?: boolean
}

const props = withDefaults(defineProps<Props>(), {
	sortBy: '',
	sortOrder: null,
	filterable: false,
	isActive: false,
})

const emit = defineEmits<{
	sort: [column: string, order: 'ASC' | 'DESC']
	'update:sortBy': [val: string]
	'update:sortOrder': [val: 'ASC' | 'DESC' | null]
}>()

const onSort = (order: 'ASC' | 'DESC') => {
	emit('update:sortBy', props.prop)

	emit('update:sortOrder', order)

	emit('sort', props.prop, order)
}
</script>

<style scoped>
.header-interactive {
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: space-between;
	transition: all 0.2s ease;
	cursor: pointer;
	user-select: none;
	padding: 12px 16px;
}

.header-interactive:hover {
	background-color: var(--bg-surface);
}

.header-interactive.is-active {
	color: var(--accent-primary);
	background-color: var(--bg-surface);
}

.sort-controls {
	display: flex;
	flex-direction: column;
	transition: opacity 0.2s;
	margin-left: 8px;
	opacity: 0.3;
	gap: 0;
}

.header-interactive:hover .sort-controls {
	opacity: 1;
}

.sort-controls .el-icon {
	font-size: 12px;
	transition: color 0.2s;
	cursor: pointer;
}

.sort-controls .el-icon:hover {
	color: var(--accent-hover);
}

.sort-controls .el-icon.active {
	color: var(--accent-primary);
	opacity: 1;
}

.filter-popover-content {
	display: flex;
	flex-direction: column;
	gap: 12px;
}

.popover-label {
	font-weight: 600;
	font-size: 12px;
	letter-spacing: 0.05em;
	text-transform: uppercase;
	color: #94a3b8;
}

:deep(.gp-popover) {
	border: 1px solid var(--border-color) !important;
	border-radius: 12px !important;
	box-shadow: var(--shadow-sm) !important;
	background: var(--bg-card) !important;
	padding: 16px !important;
}
</style>

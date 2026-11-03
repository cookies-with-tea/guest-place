<template>
	<el-table-column v-bind="$attrs" :prop="prop">
		<template #header>
			<UiSortableHeader
				v-if="sortable || filterable"
				v-model:sortBy="localSortBy"
				v-model:sortOrder="localSortOrder"
				:filterable="filterable"
				:isActive="showFilterActive"
				:label="label || ''"
				:prop="prop || ''"
				@sort="onSort"
			>
				<template v-if="$slots.filter" #filter>
					<slot name="filter" />
				</template>
			</UiSortableHeader>
			<template v-else>
				{{ label }}
			</template>
		</template>

		<template #default="scope">
			<template v-if="scope.row.__isSkeleton">
				<el-skeleton animated>
					<template #template>
						<el-skeleton-item variant="text" style="width: 80%" />
					</template>
				</el-skeleton>
			</template>
			<slot v-else v-bind="scope">{{ scope.row[prop || ''] }}</slot>
		</template>
	</el-table-column>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import UiSortableHeader from '../../ui-sortable-header'

interface Props {
	label?: string
	prop?: string
	sortable?: boolean
	filterable?: boolean
	sortBy?: string
	sortOrder?: 'ASC' | 'DESC' | null
	showFilterActive?: boolean
}

const props = withDefaults(defineProps<Props>(), {
	label: '',
	prop: '',
	sortable: false,
	filterable: false,
	sortBy: '',
	sortOrder: null,
	showFilterActive: false,
})

const emit = defineEmits<{
	'update:sortBy': [val: string]
	'update:sortOrder': [val: 'ASC' | 'DESC' | null]
	sort: [column: string, order: 'ASC' | 'DESC']
}>()

const localSortBy = computed({
	get: () => props.sortBy,
	set: (val) => emit('update:sortBy', val),
})

const localSortOrder = computed({
	get: () => props.sortOrder,
	set: (val) => emit('update:sortOrder', val),
})

const onSort = (column: string, order: 'ASC' | 'DESC') => {
	emit('sort', column, order)
}
</script>

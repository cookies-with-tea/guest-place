<template>
	<div class="divider">{{ dividerLabel }}</div>
	<div v-for="(item, index) in items" :key="index" class="sub-item-complex">
		<el-row align="middle" :gutter="12">
			<el-col :span="14">
				<el-input v-model="item.text" :placeholder="textPlaceholder" />
			</el-col>
			<el-col :span="6">
				<UiMediaPicker v-model="item.iconUuid" />
			</el-col>
			<el-col :span="2">
				<el-button :icon="Delete" link type="danger" @click="items.splice(index, 1)" />
			</el-col>
		</el-row>
	</div>
	<el-button :icon="Plus" plain style="margin-top: 12px; margin-bottom: 24px" type="primary" @click="addItem">
		{{ addLabel }}
	</el-button>
</template>

<script setup lang="ts">
import { UiMediaPicker } from '@admin-panel/ui'
import { Delete, Plus } from '@element-plus/icons-vue'

const props = defineProps<{
	items: Array<{ text: string; iconUuid: string | null }>
	dividerLabel: string
	addLabel: string
	textPlaceholder: string
}>()

// Mutates the caller's reactive array directly — same default shape as every current usage
const addItem = () => {
	props.items.push({ text: '', iconUuid: null })
}
</script>

<style scoped lang="scss">
.divider {
	display: flex;
	align-items: center;
	font-weight: 600;
	font-size: 0.9rem;
	color: var(--gp-primary);
	margin: 24px 0 16px;

	&::after {
		content: '';
		height: 1px;
		flex: 1;
		background: linear-gradient(to right, var(--gp-primary), transparent);
		margin-left: 16px;
	}
}

.sub-item-complex {
	border-bottom: 1px dashed var(--gp-glass-border);
	padding-bottom: 12px;
	margin-bottom: 12px;

	&:last-child {
		border-bottom: none;
	}
}
</style>

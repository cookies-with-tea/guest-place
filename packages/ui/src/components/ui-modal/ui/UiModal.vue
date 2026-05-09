<template>
	<el-dialog v-bind="$attrs" class="ui-modal" :align-center="true" :destroy-on-close="true">
		<!-- Проброс слотов (header, default, footer и т.д.) -->
		<template v-for="(_, name) in $slots" #[name]="slotData">
			<slot :name="name" v-bind="slotData || {}" />
		</template>

		<!-- Дефолтный футер, если не передан свой слот footer -->
		<template v-if="!$slots.footer && showDefaultFooter" #footer>
			<div class="ui-modal__footer">
				<el-button @click="emit('cancel')">{{ cancelText }}</el-button>
				<el-button type="primary" :loading="loading" @click="emit('confirm')">
					{{ confirmText }}
				</el-button>
			</div>
		</template>
	</el-dialog>
</template>

<script setup lang="ts">
/**
 * UiModal — универсальная обертка над el-dialog.
 */
interface Props {
	showDefaultFooter?: boolean
	cancelText?: string
	confirmText?: string
	loading?: boolean
}

withDefaults(defineProps<Props>(), {
	showDefaultFooter: false,
	cancelText: 'Cancel',
	confirmText: 'Confirm',
	loading: false,
})

const emit = defineEmits<{
	cancel: []
	confirm: []
}>()
</script>

<style scoped lang="scss">
.ui-modal__footer {
	display: flex;
	justify-content: flex-end;
	gap: 12px;
}
</style>

<style lang="scss">
.el-dialog.ui-modal {
	border-radius: var(--gp-radius-md) !important;
	overflow: hidden;

	.el-dialog__header {
		border-bottom: 1px solid var(--gp-border-color);
		padding-bottom: 20px;
		margin-right: 0;
	}

	.el-dialog__footer {
		border-top: 1px solid var(--gp-border-color);
		padding-top: 20px;
	}
}
</style>

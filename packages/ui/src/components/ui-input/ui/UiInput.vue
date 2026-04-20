<template>
	<div class="ui-input">
		<input
			:class="['ui-input__control', `ui-input__control--${size}`]"
			:placeholder="placeholder"
			:type="type"
			:value="modelValue"
			@input="onInput"
		/>
	</div>
</template>

<script lang="ts" setup>
interface IProps {
	modelValue?: string
	placeholder?: string
	type?: 'text' | 'password' | 'email'
	size?: 'm' | 'l'
}

withDefaults(defineProps<IProps>(), {
	modelValue: '',
	placeholder: '',
	type: 'text',
	size: 'l',
})

const emit = defineEmits<{
	(e: 'update:modelValue', value: string): void
}>()

function onInput(event: Event) {
	const target = event.target as HTMLInputElement

	emit('update:modelValue', target.value)
}
</script>

<style scoped lang="scss">
.ui-input {
	width: 100%;
}

.ui-input__control {
	width: 100%;
	border: 1px solid #d0d5dd;
	border-radius: 8px;
	padding: 10px 12px;
}

.ui-input__control--m {
	padding: 8px 10px;
}
</style>

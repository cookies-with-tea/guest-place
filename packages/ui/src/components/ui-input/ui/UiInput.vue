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
	outline: none;
	border: 1px solid var(--gp-glass-border-inner);
	border-radius: var(--gp-radius-md);
	box-shadow: 0 0 0 1px var(--gp-glass-border) inset;
	font-family: inherit;
	font-size: 14px;
	color: var(--gp-text-main);
	background: var(--gp-glass-gradient);
	background-color: var(--gp-bg-glass);
	transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
	padding: 12px 16px;
	backdrop-filter: blur(var(--gp-glass-blur));

	&::placeholder {
		color: var(--gp-text-secondary);
		transition: opacity 0.3s ease;
	}

	&:hover:not(:focus) {
		box-shadow: 0 0 0 1px var(--gp-glass-border-inner) inset;
		background-color: var(--gp-bg-glass-hover);
	}

	&:focus {
		border-color: var(--gp-primary);
		box-shadow:
			0 0 0 1px var(--gp-primary) inset,
			0 8px 16px -4px var(--gp-primary-light);
		background: var(--gp-bg-glass-hover);
		transform: translateY(-1px);

		&::placeholder {
			opacity: 0.7;
		}
	}
}

.ui-input__control--m {
	border-radius: var(--gp-radius-sm);
	font-size: 13px;
	padding: 8px 12px;
}

.ui-input__control--l {
	font-size: 15px;
	padding: 14px 20px;
}
</style>

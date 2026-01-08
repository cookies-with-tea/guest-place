<template>
  <div :class="classes" class="ui-form-item">
    <slot />

    <slot v-if="errorMessage" :error="errorMessage" name="error">
      <span class="ui-form-item__error">
        {{ errorMessage }}
      </span>
    </slot>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useFormErrors } from '../../../composables'

interface IProps {
  name?: string
}

const props = defineProps<IProps>()

const { formErrors } = useFormErrors()

const errorMessage = computed(() => {
  return props.name ? formErrors.value[props.name] : undefined
})

const classes = computed(() => {
  return {
    'ui-form-item--error': errorMessage.value,
  }
})
</script>

<style scoped lang="scss">
.ui-form-item {
  position: relative;

  &__error {
    width: 100%;
    display: block;
    font-size: 12px;
    text-align: right;
    color: var(--color-error);
    margin-top: 8px;
  }

  &--error {
    :deep() {
      .ui-input {
        --ui-textfield-border-color: var(--color-error);
      }
    }
  }
}
</style>

<template>
  <div class="ui-input" :class="classes">
    <input :id="id" v-model="model" class="ui-input__inner" :placeholder="placeholder" />
  </div>
</template>

<script setup lang="ts">
import { computed, useId } from 'vue'

interface IProps {
  placeholder: string
  showPassword: boolean
  type?: 'text' | 'password' | 'textarea' | 'number' | 'email'
  suffixIcon?: boolean
  disabled?: boolean
  size?: 's' | 'md'
  rows?: number
}

const props = withDefaults(defineProps<IProps>(), {
  type: 'text',
  suffixIcon: false,
  showPassword: false,
  disabled: false,
  size: 's',
  rows: 4,
})

const model = defineModel()
const id = useId()

const classes = computed(() => `ui-input--${props.size}`)
</script>

<style scoped lang="scss">
.ui-input {
  //TODO: сделать глобально. повторяется во втором компоненте!
  --ui-input-primary-shadow-color: 0 4px 15px 0 #694e4b24;
  --ui-input-primary-border-color: transparent;

  width: 100%;
  display: flex;
  align-items: center;
  border: 1px solid var(--ui-input-primary-border-color);
  border-radius: 50px;
  box-shadow: var(--ui-input-primary-shadow-color);
  background-color: var(--color-white);
  transition: border-color var(--transition-duration-primary) ease;

  &__inner {
    @include typography(body);

    width: 100%;
    height: 100%;
    color: var(--color-text-dark);

    &::placeholder {
      @include typography(body);

      color: var(--color-text-light);
    }
  }

  &:focus-within {
    --ui-input-primary-border-color: var(--color-accent);
  }

  &--md {
    height: 62px;

    .ui-input__inner {
      padding: 0 40px;
    }
  }

  &--s {
    height: 38px;

    .ui-input__inner {
      padding: 0 25px;
    }
  }
}
</style>

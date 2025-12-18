<template>
  <div v-if="isTextarea" ref="input-wrapper" class="ui-textarea" :class="classes">
    <textarea
      :id
      ref="element-ref"
      class="ui-textarea__inner"
      :rows="props.rows"
      :disabled="props.disabled"
      :placeholder="props.placeholder"
      spellcheck
    />
  </div>

  <div v-else ref="input-wrapper" class="ui-input" :class="classes">
    <div v-if="$slots['prefix-icon'] || props.prefixIcon" class="ui-input__icon ui-input__icon--prefix">
      <slot name="prefix-icon">
        <UiIcon :name="props.prefixIcon" />
      </slot>
    </div>

    <input
      :id
      ref="element-ref"
      v-model="model"
      class="ui-input__inner"
      :placeholder="props.placeholder"
      :disabled="props.disabled"
      :type
      @focus="handlePlayAnimate"
      @blur="handleStopAnimate"
    />

    <button
      v-if="props.showPassword"
      type="button"
      class="ui-input__password-icon"
      :class="passwordIconClasses"
      :disabled="isAnimating"
      @click="togglePassword"
    >
      <UiIcon ref="eye" name="eye" />
    </button>

    <div v-if="$slots['suffix-icon'] || props.suffixIcon" class="ui-input__icon ui-input__icon--suffix">
      <slot name="suffix-icon">
        <UiIcon :name="props.suffixIcon" />
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { UiIcon } from '#shared/ui'
import { computed, useId, ref, useTemplateRef } from 'vue'
import { useAnimateIcon } from '../composables'

// TODO: сделать кейс валидации
interface IProps {
  placeholder: string
  type?: 'text' | 'search' | 'url' | 'email' | 'password' | 'textarea' | 'number'
  suffixIcon?: string
  prefixIcon?: string
  showPassword?: boolean
  disabled?: boolean
  size?: 's' | 'md'
  rows?: number
}

const props = withDefaults(defineProps<IProps>(), {
  type: 'text',
  showPassword: false,
  disabled: false,
  size: 's',
  rows: 4,
})

const model = defineModel<string>({ default: '' })

const id = useId()
const isInputFocus = ref(false)

const inputWrapper = useTemplateRef<HTMLDivElement>('input-wrapper')
const elementRef = useTemplateRef<HTMLInputElement>('element-ref')

// TODO: создать отдельный composable или директиву для clickOutside
function onClickOutside(event: Event) {
  if (inputWrapper.value && !inputWrapper.value.contains(event.target as HTMLInputElement)) {
    isInputFocus.value = false

    return
  }

  if (elementRef.value) {
    isInputFocus.value = true

    elementRef.value.focus()
  }
}

onMounted(() => {
  document.addEventListener('click', onClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onClickOutside)
})

const classes = computed(() => ({
  [`ui-input--${props.size}`]: props.type !== 'textarea',
  'is-disabled': props.disabled,
  'is-focus': isInputFocus.value,
}))

const passwordIconClasses = computed(() => {
  return { 'ui-input__password-icon--active': isFocus.value }
})

const { handlePlayAnimate, handleStopAnimate, togglePassword, isPasswordVisible, isFocus, isAnimating } =
  useAnimateIcon(model)

const type = computed(() => (isPasswordVisible.value ? 'text' : props.type))

const isTextarea = computed(() => props.type === 'textarea')
</script>

<style scoped lang="scss">
.ui-textarea,
.ui-input {
  --ui-textfield-border-color: transparent;
  --ui-textfield-focus-border-color: var(--color-accent);
  --ui-textfield-bg-color: var(--color-white);
  --ui-textfield-disabled-bg-color: #e0e0e0;
  --ui-textfield-disabled-placeholder-color: #9e9e9e;
}

.ui-input {
  --ui-input-prefix-icon-color: var(--color-text-light);
  --ui-input-suffix-icon-color: var(--color-text-light);
  --ui-input-primary-icon-color: var(--color-text-light);
  --ui-input-secondary-icon-color: #fff;
  --ui-input-focus-primary-icon-color: #333;

  width: 100%;
  position: relative;
  display: flex;
  align-items: center;
  border-radius: 50px;
  box-shadow: var(--shadow-md);
  background-color: var(--ui-textfield-bg-color);
  transition: border-color var(--transition-duration-primary) ease;

  &::before {
    content: '';
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    position: absolute;
    border-radius: 50px;
    box-shadow: 0 0 0 1px var(--ui-textfield-border-color) inset;
    transition: box-shadow var(--transition-duration-secondary) ease-out;
  }

  &__password-icon {
    display: flex;
    align-items: center;
    margin-left: 8px;

    :deep(.ui-icon) {
      --bg-color: var(--ui-input-secondary-icon-color);

      font-size: 24px;
      color: var(--ui-input-primary-icon-color);
      transition: color var(--transition-duration-primary);

      @include hover {
        color: var(--ui-input-focus-primary-icon-color);
      }
    }

    &--active {
      :deep(.ui-icon) {
        color: var(--ui-input-focus-primary-icon-color);
      }
    }
  }

  &__icon {
    height: 100%;
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;

    :deep(.ui-icon) {
      font-size: 24px;
    }

    &--prefix {
      :deep(.ui-icon) {
        color: var(--ui-input-prefix-icon-color);
        margin-right: 8px;
      }
    }

    &--suffix {
      :deep(.ui-icon) {
        color: var(--ui-input-suffix-icon-color);
        margin-left: 8px;
      }
    }
  }

  &__inner {
    width: 100%;
    height: 100%;
    position: relative;
    color: var(--color-text-dark);
    z-index: 100;

    &::placeholder {
      color: var(--color-text-light);
    }
  }

  &.is-focus {
    --ui-textfield-border-color: var(--ui-textfield-focus-border-color);
  }

  &.is-disabled {
    --ui-textfield-bg-color: var(--ui-textfield-disabled-bg-color);

    pointer-events: none;
    user-select: none;

    .ui-input__inner {
      &::placeholder {
        color: var(--ui-textfield-disabled-placeholder-color);
      }
    }
  }

  &--md {
    height: 62px;
    padding: 0 40px;
  }

  &--s {
    height: 38px;
    padding: 0 25px;
  }

  &__inner,
  &__inner::placeholder {
    @include typography(body);
  }
}

.ui-textarea {
  --ui-textareas-scrollbar-thumb: #c6c6cc;
  $root: &;

  width: 100%;
  position: relative;
  border-radius: 30px;
  box-shadow: var(--shadow-md);
  background-color: var(--ui-textfield-bg-color);
  padding: 16px;

  &::before {
    content: '';
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    position: absolute;
    border-radius: 30px;
    box-shadow: 0 0 0 1px var(--ui-textfield-border-color) inset;
    transition: box-shadow var(--transition-duration-secondary) ease-out;
  }

  &__inner {
    width: 100%;
    height: 100%;
    min-width: 80px;
    min-height: 50px;
    position: relative;
    color: var(--color-text-dark);
    resize: none;
    padding-right: 5px;
    z-index: 100;

    // TODO: вынести в миксин
    scrollbar-color: var(--ui-textareas-scrollbar-thumb) transparent;
    scrollbar-width: thin;

    &::-webkit-scrollbar {
      width: 5px;
      height: 5px;
      background-color: transparent;
    }

    &::-webkit-scrollbar-thumb {
      border-radius: 30px;
      background-color: var(--ui-textareas-scrollbar-thumb);
    }

    &::-webkit-scrollbar-button {
      width: 0;
      display: none;
    }

    &::placeholder {
      color: var(--color-text-light);
    }

    &,
    &::placeholder {
      @include typography(body);
    }
  }

  &.is-focus {
    --ui-textfield-border-color: var(--ui-textfield-focus-border-color);
  }

  &.is-disabled {
    --ui-textfield-bg-color: var(--ui-textfield-disabled-bg-color);

    pointer-events: none;
    user-select: none;

    #{$root}__inner {
      &::placeholder {
        color: var(--ui-textfield-disabled-placeholder-color);
      }
    }
  }
}
</style>

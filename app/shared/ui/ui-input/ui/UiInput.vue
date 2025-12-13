<template>
  <div v-if="!isInput" ref="input-wrapper" class="ui-textarea" :class="classes">
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
import { computed, useId, ref, useTemplateRef, onMounted, onBeforeUnmount } from 'vue'
import { useAnimateIcon } from '../composables'

const model = defineModel<string>({ default: '' })

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

const { handlePlayAnimate, handleStopAnimate, togglePassword, isPasswordVisible, isFocus, isAnimating } =
  useAnimateIcon(model)

const id = useId()
const isInputFocus = ref(false)

const inputWrapper = useTemplateRef<HTMLDivElement>('input-wrapper')
const elementRef = useTemplateRef<HTMLInputElement>('element-ref')

const typedClasses = computed(() => {
  return isInput.value ? 'input' : 'textarea'
})

const classes = computed(() => ({
  [`ui-${typedClasses.value}--disabled`]: props.disabled,
  [`ui-${typedClasses.value}--focus`]: isInputFocus.value,
  [`ui-input--${props.size}`]: isInput.value,
}))

const passwordIconClasses = computed(() => {
  return { 'ui-input__password-icon--active': isFocus.value }
})

const type = computed(() => (isPasswordVisible.value ? 'text' : props.type))

const isInput = computed(() => props.type !== 'textarea')

onMounted(() => {
  document.addEventListener('click', onClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onClickOutside)
})

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
</script>

<style scoped lang="scss">
.ui-textarea,
.ui-input {
  --ui-textfield-border-color: transparent;
  --ui-textfield-focus-border-color: var(--color-accent);
  --ui-textfield-bg-color: var(--color-white);
  --ui-textfield-disabled-bg-color: #e0e0e0;
  --ui-textfield-disabled-placeholder-color: #9e9e9e;
  $self: &;

  width: 100%;
  position: relative;
  box-shadow: var(--shadow-md);
  background-color: var(--ui-textfield-bg-color);

  &::before {
    content: '';
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    position: absolute;
    box-shadow: 0 0 0 1px var(--ui-textfield-border-color) inset;
    transition: box-shadow var(--transition-duration-secondary) ease-out;
  }

  &--focus {
    --ui-textfield-border-color: var(--ui-textfield-focus-border-color);
  }

  &--disabled {
    --ui-textfield-bg-color: var(--ui-textfield-disabled-bg-color);

    pointer-events: none;
    user-select: none;

    #{$self}__inner {
      &::placeholder {
        color: var(--ui-textfield-disabled-placeholder-color);
      }
    }
  }
}

.ui-input {
  --ui-input-prefix-icon-color: var(--color-text-light);
  --ui-input-suffix-icon-color: var(--color-text-light);
  --ui-input-primary-icon-color: var(--color-text-light);
  --ui-input-secondary-icon-color: #fff;
  --ui-input-focus-primary-icon-color: #333;

  display: flex;
  align-items: center;
  border-radius: 50px;

  &::before {
    border-radius: 50px;
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
    position: relative;
    color: var(--color-text-dark);
    z-index: 100;

    &::placeholder {
      color: var(--color-text-light);
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
  --ui-textarea-scrollbar-thumb: #c6c6cc;

  border-radius: 30px;
  padding: 16px;

  &::before {
    border-radius: 30px;
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
    scrollbar-color: var(--ui-textarea-scrollbar-thumb) transparent;
    scrollbar-width: thin;

    &::-webkit-scrollbar {
      width: 5px;
      height: 5px;
      background-color: transparent;
    }

    &::-webkit-scrollbar-thumb {
      border-radius: 30px;
      background-color: var(--ui-textarea-scrollbar-thumb);
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
}
</style>

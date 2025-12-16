<template>
  <div v-if="isTextarea" ref="input-wrapper" class="ui-textarea" :class="classes">
     <textarea
       :id
       ref="input-focus"
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
      ref="input"
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
      :class="{'ui-input__password-icon_active': isFocus}"
      class="ui-input__password-icon"
      :disabled="isAnimating"
      @click="togglePassword"
    >
      <UiIcon
        ref="eye" name="eye"
      />
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
import { computed, useId, ref, useTemplateRef, type Ref } from 'vue'
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

const model = defineModel<string>()

const id = useId()
const isFocusInput = ref(false)

const inputWrapper = useTemplateRef<HTMLDivElement>('input-wrapper')
const inputFocus = useTemplateRef<HTMLInputElement>('input')

// TODO: создать отдельный composable или директиву для clickOutside
function onClickOutside(event: Event) {
  if (inputWrapper.value && !inputWrapper.value.contains(event.target as HTMLInputElement)) {
    isFocusInput.value = false

    return
  }

  isFocusInput.value = true

  if (inputFocus.value) {
    inputFocus.value.focus()
  }
}

onMounted(() => {
  document.addEventListener('click', onClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onClickOutside)
})

const classes = computed(() => {
    return [
      {[`ui-input--${props.size}`]: props.type !== 'textarea'},
      {'is-disabled': props.disabled},
      {'is-focus': isFocusInput.value}
    ]
  }
)

const {
  handlePlayAnimate,
  handleStopAnimate,
  togglePassword,
  isPasswordVisible,
  isFocus,
  isAnimating,
} = useAnimateIcon(model as Ref<string>)

const type = computed(() => isPasswordVisible.value ? 'text': props.type)

const isTextarea = computed(() => props.type === 'textarea')
</script>

<style scoped lang="scss">
.ui-input {
  --ui-input-primary-border-color: transparent;
  --ui-input-prefix-icon-color: var(--color-text-light);
  --ui-input-suffix-icon-color: var(--color-text-light);
  --ui-input-bg-color: var(--color-white);
  --ui-input-disabled-bg-color: #e0e0e0;
  --ui-input-disabled-placeholder-color: #9e9e9e;
  --ui-input-focus-border-color: var(--color-accent);
  --ui-input-primary-icon-color: var(--color-text-light);
  --ui-input-secondary-icon-color: #fff;
  --ui-input-focus-primary-icon-color: #333;

  width: 100%;
  position: relative;
  display: flex;
  align-items: center;
  border-radius: 50px;
  box-shadow: var(--shadow-md);
  background-color: var(--ui-input-bg-color);
  transition: border-color var(--transition-duration-primary) ease;

  &::before {
    content: "";
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    position: absolute;
    border-radius: 50px;
    box-shadow: 0 0 0 1px var(--ui-input-primary-border-color) inset;
    transition: box-shadow var(--transition-duration-secondary) ease-out;
  }

  .ui-input__password-icon {
    display: flex;
    align-items: center;
    margin-left: 8px;

    :deep(.ui-icon){
      --bg-color: var(--ui-input-secondary-icon-color);

      font-size: 24px;
      color: var(--ui-input-primary-icon-color);
      transition: color var(--transition-duration-primary);

      @include hover {
        color: var(--ui-input-focus-primary-icon-color)
      }
    }

    &.ui-input__password-icon_active {
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

    &--prefix:deep(.ui-icon) {
      color: var(--ui-input-prefix-icon-color);
      margin-right: 8px;
    }

    &--suffix:deep(.ui-icon) {
      color: var(--ui-input-suffix-icon-color);
      margin-left: 8px;
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
    --ui-input-primary-border-color: var(--ui-input-focus-border-color)
  }

  &.is-disabled {
    background-color: var(--ui-input-disabled-bg-color);
    pointer-events: none;
    user-select: none;

    .ui-input__inner {
      &::placeholder {
        color: var(--ui-input-disabled-placeholder-color);
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
  --ui-textarea-border-color: transparent;
  --ui-textarea-bg-color: var(--color-white);
  --ui-textareas-scrollbar-thumb: #c6c6cc;
  --ui-textarea-focus-border-color: var(--color-accent);
  --ui-textarea-disabled-bg-color: #e0e0e0;
  --ui-textarea-disabled-placeholder-color: #9e9e9e;

  width: 100%;
  position: relative;
  border-radius: 30px;
  box-shadow: var(--shadow-md);
  background-color: var(--ui-textarea-bg-color);
  padding: 16px;

  &::before {
    content: "";
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    position: absolute;
    border-radius: 30px;
    box-shadow: 0 0 0 1px var(--ui-textarea-border-color) inset;
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


    &, &::placeholder {
      @include typography(body);
    }

    // TODO: вынести в миксин
    @document url-prefix() {
      scrollbar-color: var(--ui-textareas-scrollbar-thumb) transparent;
      scrollbar-width: thin;
    }
  }


  &.is-focus {
    --ui-textarea-border-color: var(--ui-textarea-focus-border-color)
  }

  &.is-disabled {
    background-color: var(--ui-textarea-disabled-bg-color);
    pointer-events: none;
    user-select: none;

    .ui-textarea__inner {
      &::placeholder {
        color: var(--ui-textarea-disabled-placeholder-color);
      }
    }
  }
}

</style>

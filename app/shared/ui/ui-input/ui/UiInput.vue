<template>
  <div v-if="isTextarea" class="ui-textarea" :class="resizeClasses">
     <textarea
       class="ui-textarea__inner"
       :id="id"
       :rows="props.rows"
       :disabled="props.disabled"
       :placeholder="props.placeholder"
       spellcheck
     />
  </div>

  <div v-else class="ui-input" :class="classes">
    <div v-if="$slots['prefix-icon'] || props.prefixIcon" class="ui-input__icon prefix-icon">
      <slot name="prefix-icon">
        <UiIcon :name="props.prefixIcon" />
      </slot>
    </div>

    <input
      :id="id"
      v-model="model"
      class="ui-input__inner"
      :placeholder="props.placeholder"
      @focus="handlePlayAnimate"
      @blur="handleStopAnimate"
      :disabled="props.disabled"
      :type="type"
    />

    <button
      v-if="props.showPassword"
      type="button"
      :class="{'ui-input__password-icon_active': isFocus}"
      class="ui-input__password-icon"
      @click="togglePassword"
      :disabled="isAnimating"
    >
      <UiIcon
        name="eye" ref="eye"
      />
    </button>

    <div v-if="$slots['suffix-icon'] || props.suffixIcon" class="ui-input__icon suffix-icon">
      <slot name="suffix-icon">
        <UiIcon :name="props.suffixIcon" />
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { UiIcon } from '#shared/ui'
import { computed, useId } from 'vue'
import { useAnimateIcon } from '../composables'

// TODO: сделать кейс валидации
interface IProps {
  placeholder: string
  resize?: 'vertical' | 'horizontal'
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

const iconEye = useTemplateRef<HTMLDivElement>('eye')
const model = defineModel()
const id = useId()

const classes = computed(() => {
    return [
      `ui-input--${props.size}`,
      {'is-disabled': props.disabled}
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
} = useAnimateIcon(iconEye, model)

const type = computed(() => isPasswordVisible.value ? 'text': props.type)

const isTextarea = computed(() => props.type === 'textarea')

const resizeClasses = computed(() => {
  return [{[`ui-textarea--with-resize-${props.resize}`]: !!props.resize}]
})

</script>

<style scoped lang="scss">
.ui-input {
  --ui-input-primary-border-color: transparent;
  --ui-input-prefix-icon-color: var(--color-text-light);
  --ui-input-suffix-icon-color: var(--color-text-light);
  --ui-input-bg-color: var(--color-white);

  --ui-input-disabled-bg-color: #E0E0E0;
  --ui-input-disabled-placeholder-color: #9E9E9E;

  --ui-input-primary-icon-color: var(--color-text-light);
  --ui-input-secondary-icon-color: #fff;

  --ui-input-focus-primary-icon-color: #333;

  width: 100%;
  display: flex;
  align-items: center;
  border: 1px solid var(--ui-input-primary-border-color);
  border-radius: 50px;
  box-shadow: var(--shadow-md);
  background-color: var(--ui-input-bg-color);
  transition: border-color var(--transition-duration-primary) ease;

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

  &:focus-within {
    --ui-input-primary-border-color: var(--color-accent);
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
        color: var(--color-text-primary-hover)
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
  }

  .prefix-icon:deep(.ui-icon) {
    color: var(--ui-input-prefix-icon-color);
    margin-right: 8px;
  }

  .suffix-icon:deep(.ui-icon) {
    color: var(--ui-input-suffix-icon-color);
    margin-left: 8px;
  }

  &__inner {
    width: 100%;
    height: 100%;
    color: var(--color-text-dark);

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
  --ui-textarea-border-color: transparent;
  --ui-textarea-bg-color: var(--color-white);

  --ui-textarea-focus-border-color: var(--color-accent);

  width: 100%;

  padding: 20px 16px 16px 40px;
  border-radius: 30px;
  box-shadow: var(--shadow-md);
  background-color: var(--ui-textarea-bg-color);
  position: relative;
  //box-shadow: 0 0 0 1px var(--el-input-focus-border-color) inset;

  &:focus-within {
    --ui-textarea-border-color: var(--ui-textarea-focus-border-color)
  }

  &:before {
    content: "";
    position: absolute;
    top: 0;
    height: 100%;
    width: 100%;
    left: 0;
    border-radius: 30px;
    box-shadow: 0 0 0 1px var(--ui-textarea-border-color) inset;
  }

  &--with-resize {
    &-vertical .ui-textarea__inner {
      resize: vertical;
    }

    &-horizontal .ui-textarea__inner {
      resize: horizontal;
    }
  }

  &__inner {
    min-height: 50px;
    width: 100%;
    height: 100%;
    resize: none;
    color: var(--color-text-dark);
    padding-right: 15px;
    position: relative;
    z-index: 100;

    &, &::placeholder {
      @include typography(body);
    }

    &::placeholder {
      color: var(--color-text-light);
    }
  }
}

</style>

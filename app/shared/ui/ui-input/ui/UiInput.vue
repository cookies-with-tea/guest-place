<template>
  <div class="ui-input" :class="classes">
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
      @focus="playAnimateEye"
      @blur="resetAnimateEye"
    />

    <button
      type="button"
      :class="{'ui-input__password-icon_active': isFocus}"
      class="ui-input__password-icon"
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
import { computed, ref, useId } from 'vue'
import { useAnimateIcon } from '../composables'

// TODO: сделать кейс валидации
// useCheckElement()
interface IProps {
  placeholder: string
  showPassword?: boolean
  type?: 'text' | 'password' | 'textarea' | 'number' | 'email'
  suffixIcon?: string
  prefixIcon?: string
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
const isFocus = ref(false)
const classes = computed(() => `ui-input--${props.size}`)
const controller = new AbortController()
const {moveEye, startBlinking, stopBlinking} = useAnimateIcon(iconEye)

const playAnimateEye = () => {
  isFocus.value = true
  window.addEventListener('pointermove', (event) => {
    if(!isFocus.value) return

    moveEye(event)
    startBlinking()
    console.log(event.target)
  },{signal: controller.signal})
}
const resetAnimateEye = () => {
  isFocus.value = !isFocus.value
  stopBlinking()
}

// Вспомогательный элемент для scramble
// const proxyDiv = document.createElement('div')
// proxyDiv.style.display = 'none'
// document.body.appendChild(proxyDiv)


// onBeforeUnmount(() => {
//   if (blinkTimeline.value) blinkTimeline.value.kill()
//   window.removeEventListener('pointermove', moveEye)
//   if (resetEyeTimer) resetEyeTimer.kill()
//   if (proxyDiv.parentNode) proxyDiv.parentNode.removeChild(proxyDiv)
// })
onUnmounted(() => {

})
</script>

<style scoped lang="scss">


.ui-input {
  //TODO: сделать глобально. повторяется во втором компоненте!
  --ui-input-primary-shadow-color: 0 4px 15px 0 #694e4b24;
  --ui-input-primary-border-color: transparent;
  --ui-input-prefix-icon-color: var(--color-text-light);
  --ui-input-suffix-icon-color: var(--color-text-light);

  --ui-input-primary-icon-color: var(--color-text-light);
  --ui-input-secondary-icon-color: #fff;

  --ui-input-focus-primary-icon-color: #333;

  width: 100%;
  display: flex;
  align-items: center;
  border: 1px solid var(--ui-input-primary-border-color);
  border-radius: 50px;
  box-shadow: var(--ui-input-primary-shadow-color);
  background-color: var(--color-white);
  transition: border-color var(--transition-duration-primary) ease;

  .ui-input__password-icon {
    display: flex;
    align-items: center;
    margin-left: 8px;

    :deep(.ui-icon){
      --bg-color: var(--ui-input-secondary-icon-color);

      font-size: 24px;
      color: var(--ui-input-primary-icon-color);

      transition: color var(--transition-duration-primary);
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

  &:focus-within {
    --ui-input-primary-border-color: var(--color-accent);
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
</style>

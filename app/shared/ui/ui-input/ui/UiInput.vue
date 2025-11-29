<template>
  <div class="ui-input" :class="classes">
    <div v-if="$slots['prefix-icon'] || props.prefixIcon" class="ui-input__icon prefix-icon">
      <slot name="prefix-icon">
        <UiIcon :name="props.prefixIcon" />
      </slot>
    </div>

    <input :id="id" v-model="model" class="ui-input__inner" :placeholder="props.placeholder" />

    <button
      type="button"
      class="ui-input__password-icon"
      :aria-pressed="isPasswordVisible"
      :disabled="isAnimating"
      @click="useCheckElement"
    >
      <UiIcon name="eye" ref="eye"/>
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
import { computed, nextTick, useId } from 'vue'
import { useAnimateIcon, useCheckElement } from '../composables'

// TODO: сделать кейс валидации
// useCheckElement()
interface IProps {
  placeholder: string
  showPassword: boolean
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

// console.log(props.prefixIcon)
// const { togglePassword } = useAnimateIcon()
const model = defineModel()
const id = useId()

const classes = computed(() => `ui-input--${props.size}`)
// import { ref, onMounted, onBeforeUnmount } from 'vue'

// const iconEye = useTemplateRef('eye-ref')
// const iconContainer = iconEye.value?.$el
// console.log(iconContainer)
// import { gsap } from 'gsap'
// import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin'
// import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin'
//
// // Регистрация плагинов GSAP
// gsap.registerPlugin(MorphSVGPlugin, ScrambleTextPlugin)
//
// // Константы



// Референсы
// const passwordInput = ref(null)

// Состояния
// const passwordValue = ref('')
// const isPasswordVisible = ref(false)
// const isAnimating = ref(false)
// const blinkTimeline = ref(null)
//
// const iconEye = useTemplateRef('eye')

// Вспомогательный элемент для scramble
// const proxyDiv = document.createElement('div')
// proxyDiv.style.display = 'none'
// document.body.appendChild(proxyDiv)

// const startBlinking = () => {
//   if (blinkTimeline.value) blinkTimeline.value.kill()
//   const delay = gsap.utils.random(2, 8)
//   const repeat = Math.random() > 0.5 ? 3 : 1
//
//   const iconContainer = iconEye.value?.$el
//
//   if (!iconContainer) return
//
//   const eyeOpen = iconContainer.querySelector('#eye-open path')
//   const eyeClosed = iconContainer.querySelector('#eye-closed path')
//   const eye = iconContainer.getElementById('eye')
//   const upper = iconContainer.getElementById('lid--upper')
//   const lower = iconContainer.getElementById('lid--lower')
//
//   blinkTimeline.value = gsap
//     .timeline({
//       delay,
//       onComplete: startBlinking,
//       repeat,
//       yoyo: true,
//     })
//     .to(upper, { morphSVG: lower, duration: BLINK_SPEED }, 0)
//     .to(eyeOpen, { morphSVG: eyeClosed, duration: BLINK_SPEED }, 0)
// }
//
// let resetEyeTimer = null
// const moveEye = (e) => {
//   const iconContainer = iconEye.value?.$el
//
//   if (!iconContainer) return
//
//   const eyeOpen = iconContainer.querySelector('#eye-open path')
//   const eyeClosed = iconContainer.querySelector('#eye-closed path')
//   const eye = iconContainer.getElementById('eye')
//   const upper = iconContainer.getElementById('lid--upper')
//   const lower = iconContainer.getElementById('lid--lower')
//
//   if (resetEyeTimer) resetEyeTimer.kill()
//
//   resetEyeTimer = gsap.delayedCall(2, () => {
//     gsap.to(eye, { xPercent: 0, yPercent: 0, duration: 0.2 })
//   })
//
//   const bounds = iconContainer.getBoundingClientRect()
//   const xPercent = gsap.utils.clamp(-30, 30, gsap.utils.mapRange(-100, 100, 30, -30)(bounds.x - e.clientX))
//   const yPercent = gsap.utils.clamp(-30, 30, gsap.utils.mapRange(-100, 100, 30, -30)(bounds.y - e.clientY))
//   gsap.set(eye, { xPercent, yPercent })
// }
//
//
// const togglePassword = async () => {
//   if (isAnimating.value) return
//   isAnimating.value = true
//
//   const currentValue = passwordValue.value
//   const wasPassword = !isPasswordVisible.value
//
//   const iconContainer = iconEye.value?.$el
//
//   if (!iconContainer) return
//
//   const eyeOpen = iconContainer.querySelector('#eye-open path')
//   const eyeClosed = iconContainer.querySelector('#eye-closed path')
//   const upper = iconContainer.getElementById('lid--upper')
//   const lower = iconContainer.getElementById('lid--lower')
//
//
//   if (wasPassword) {
//     // Закрываем глаз
//     if (blinkTimeline.value) blinkTimeline.value.kill()
//     await gsap
//       .timeline()
//       .to(upper, { morphSVG: lower, duration: TOGGLE_SPEED }, 0)
//       .to(eyeOpen, { morphSVG: eyeClosed, duration: TOGGLE_SPEED }, 0)
//       .to(proxyDiv, {
//         duration: ENCRYPT_SPEED,
//         scrambleText: {
//           chars,
//           text: currentValue || '••••••••',
//         },
//         onStart: () => {
//           isPasswordVisible.value = true
//         },
//         onUpdate: () => {
//           const proxyText = proxyDiv.innerText
//           const placeholder = '•'.repeat(Math.max(0, currentValue.length - proxyText.length))
//           passwordValue.value = proxyText + placeholder
//         },
//         onComplete: () => {
//           passwordValue.value = currentValue // восстанавливаем оригинал
//           proxyDiv.innerHTML = ''
//         },
//       }, 0)
//   } else {
//     // Открываем глаз
//     await gsap
//       .timeline()
//       .to(upper, { morphSVG: upper, duration: TOGGLE_SPEED }, 0)
//       .to(eyeOpen, { morphSVG: eyeOpen, duration: TOGGLE_SPEED }, 0)
//       .to(proxyDiv, {
//         duration: ENCRYPT_SPEED,
//         scrambleText: {
//           chars,
//           text: '•'.repeat(currentValue.length || 8),
//         },
//         onStart: () => {
//           isPasswordVisible.value = false
//         },
//         onUpdate: () => {
//           const proxyText = proxyDiv.innerText
//           passwordValue.value = proxyText + currentValue.slice(proxyText.length)
//         },
//         onComplete: () => {
//           passwordValue.value = currentValue // финальное значение
//           proxyDiv.innerHTML = ''
//         },
//       }, 0)
//     startBlinking()
//   }
//
//   isAnimating.value = false
// }

// === Жизненный цикл ===
onMounted(async () => {
  await nextTick()
  useCheckElement()
  // startBlinking()
  // window.addEventListener('pointermove', moveEye)
})

// onBeforeUnmount(() => {
//   if (blinkTimeline.value) blinkTimeline.value.kill()
//   window.removeEventListener('pointermove', moveEye)
//   if (resetEyeTimer) resetEyeTimer.kill()
//   if (proxyDiv.parentNode) proxyDiv.parentNode.removeChild(proxyDiv)
// })
</script>

<style scoped lang="scss">
//.btn {
//
//}

.ui-input {
  //TODO: сделать глобально. повторяется во втором компоненте!
  --ui-input-primary-shadow-color: 0 4px 15px 0 #694e4b24;
  --ui-input-primary-border-color: transparent;
  --ui-input-prefix-icon-color: var(--color-text-light);
  --ui-input-suffix-icon-color: var(--color-text-light);

  width: 100%;
  display: flex;
  align-items: center;
  border: 1px solid var(--ui-input-primary-border-color);
  border-radius: 50px;
  box-shadow: var(--ui-input-primary-shadow-color);
  background-color: var(--color-white);
  transition: border-color var(--transition-duration-primary) ease;

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

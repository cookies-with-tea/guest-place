import { gsap } from 'gsap'
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin'
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin'
import { onMounted, ref } from 'vue'
import {useCheckElement} from './useCheckElement'

gsap.registerPlugin(MorphSVGPlugin, ScrambleTextPlugin)

const BLINK_SPEED = 0.075
const TOGGLE_SPEED = 0.125
const ENCRYPT_SPEED = 1
const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789`~,.<>?/;":][}{+_)(*&^%$#@!±=-§'

const startBlinking = () => {
  if (blinkTimeline.value) blinkTimeline.value.kill()
  const delay = gsap.utils.random(2, 8)
  const repeat = Math.random() > 0.5 ? 3 : 1

  const {eyeOpen, eyeClosed, upper, lower} = useCheckElement()

  blinkTimeline.value = gsap
    .timeline({
      delay,
      onComplete: startBlinking,
      repeat,
      yoyo: true,
    })
    .to(upper, { morphSVG: lower, duration: BLINK_SPEED }, 0)
    .to(eyeOpen, { morphSVG: eyeClosed, duration: BLINK_SPEED }, 0)
}

const moveEye = (e) => {
  const resetEyeTimer = ref(null)
  const {iconContainer, eye } = useCheckElement()

  if (resetEyeTimer) resetEyeTimer.kill()

  resetEyeTimer.value = gsap.delayedCall(2, () => {
    gsap.to(eye, { xPercent: 0, yPercent: 0, duration: 0.2 })
  })

  const bounds = iconContainer.getBoundingClientRect()
  const xPercent = gsap.utils.clamp(-30, 30, gsap.utils.mapRange(-100, 100, 30, -30)(bounds.x - e.clientX))
  const yPercent = gsap.utils.clamp(-30, 30, gsap.utils.mapRange(-100, 100, 30, -30)(bounds.y - e.clientY))

  gsap.set(eye, { xPercent, yPercent })
}

export const useAnimateIcon = () => {
  const passwordInput = ref(null)
  // const passwordValue = ref('')
  const isPasswordVisible = ref(false)
  const isAnimating = ref(false)
  const blinkTimeline = ref(null)

  const { eyeOpen, eyeClosed, upper, lower} = useCheckElement()

  const togglePassword = async () => {
    if (isAnimating.value) return
    isAnimating.value = true

    const currentValue = passwordValue.value
    const wasPassword = !isPasswordVisible.value




    if (wasPassword) {
      // Закрываем глаз
      if (blinkTimeline.value) blinkTimeline.value.kill()
      await gsap
        .timeline()
        .to(upper, { morphSVG: lower, duration: TOGGLE_SPEED }, 0)
        .to(eyeOpen, { morphSVG: eyeClosed, duration: TOGGLE_SPEED }, 0)
        .to(proxyDiv, {
          duration: ENCRYPT_SPEED,
          scrambleText: {
            chars,
            text: currentValue || '••••••••',
          },
          onStart: () => {
            isPasswordVisible.value = true
          },
          onUpdate: () => {
            const proxyText = proxyDiv.innerText
            const placeholder = '•'.repeat(Math.max(0, currentValue.length - proxyText.length))
            passwordValue.value = proxyText + placeholder
          },
          onComplete: () => {
            passwordValue.value = currentValue // восстанавливаем оригинал
            proxyDiv.innerHTML = ''
          },
        }, 0)
    } else {
      // Открываем глаз
      await gsap
        .timeline()
        .to(upper, { morphSVG: upper, duration: TOGGLE_SPEED }, 0)
        .to(eyeOpen, { morphSVG: eyeOpen, duration: TOGGLE_SPEED }, 0)
        .to(proxyDiv, {
          duration: ENCRYPT_SPEED,
          scrambleText: {
            chars,
            text: '•'.repeat(currentValue.length || 8),
          },
          onStart: () => {
            isPasswordVisible.value = false
          },
          onUpdate: () => {
            const proxyText = proxyDiv.innerText
            passwordValue.value = proxyText + currentValue.slice(proxyText.length)
          },
          onComplete: () => {
            passwordValue.value = currentValue // финальное значение
            proxyDiv.innerHTML = ''
          },
        }, 0)
      startBlinking()
    }

    isAnimating.value = false
  }

  onMounted(() => {
    startBlinking()
    window.addEventListener('pointermove', moveEye)
  })

  return { togglePassword}
}



import { gsap } from 'gsap'
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin'
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin'
import { ref, type Ref, useTemplateRef } from 'vue'
import type { UiIconInstanceType } from '#shared/ui/ui-icon/types'
import type { TemplateRef } from 'vue'

gsap.registerPlugin(MorphSVGPlugin, ScrambleTextPlugin)

const BLINK_SPEED = 0.075
const TOGGLE_SPEED = 0.125
const ENCRYPT_SPEED = 1
const CHARS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789`~,.<>?/;":][}{+_)(*&^%$#@!±=-§'

let proxyDiv: HTMLElement | null = null

const getProxyDiv = (): HTMLElement => {
  if (proxyDiv) return proxyDiv

  if (process.server) {
    // TODO: Добавить переводы
    throw new Error('ScrambleTextPlugin работает только в браузере')
  }

  proxyDiv = document.createElement('div')

  proxyDiv.style.display = 'none'

  document.body.appendChild(proxyDiv)

  return proxyDiv
}

const getElementReferences = (iconEye: TemplateRef<UiIconInstanceType>)  => {
  const iconContainer = iconEye.value?.$el

  if (!iconContainer) {
    return {
      iconContainer: null, eyeOpen: null,
      eyeClosed: null, eye: null,
      upper: null, lower: null
    }
  }

  const eyeOpen = iconContainer.querySelector('#eye-open path')
  const eyeClosed = iconContainer.querySelector('#eye-closed path')
  const eye = iconContainer.getElementById('eye')
  const upper = iconContainer.getElementById('lid--upper')
  const lower = iconContainer.getElementById('lid--lower')

  return { iconContainer, eyeOpen, eyeClosed, eye, upper, lower }
}


export const useAnimateIcon = (modelRef: Ref<string>) => {
  const iconEye = useTemplateRef<UiIconInstanceType>('eye')

  const isPasswordVisible = ref(false)
  const isAnimating = ref(false)
  const blinkTimeline = ref<gsap.core.Timeline | null>(null)
  const resetEyeTimer = ref<gsap.core.Tween | null>(null)
  const isFocus = ref(false)

  const controller = new AbortController()

  const startBlinking = () => {
    if (isAnimating.value) {
      return
    }

    blinkTimeline.value?.kill()

    const { upper, eyeOpen, lower, eyeClosed } = getElementReferences(iconEye)

    if(!upper) return

    const delay = gsap.utils.random(2, 8)
    const repeat = Math.random() > 0.5 ? 3 : 1

    blinkTimeline.value = gsap
      .timeline({ delay, onComplete: startBlinking, repeat, yoyo: true })
      .to(upper, { morphSVG: lower, duration: BLINK_SPEED }, 0)
      .to(eyeOpen, { morphSVG: eyeClosed, duration: BLINK_SPEED }, 0)
  }

  const togglePassword = async () => {
    if (isAnimating.value) return
    isAnimating.value = true

    const { upper, eyeOpen, lower, eyeClosed } = getElementReferences(iconEye)

    if(!upper) return

    const currentValue = modelRef.value
    const wasPassword = !isPasswordVisible.value
    const isEmpty = currentValue.trim() === ''

    if (wasPassword) {
      blinkTimeline.value?.kill()

      isPasswordVisible.value = true

      if (isEmpty) {
        await gsap.timeline()
          .to(upper, { morphSVG: lower, duration: TOGGLE_SPEED }, 0)
          .to(eyeOpen, { morphSVG: eyeClosed, duration: TOGGLE_SPEED }, 0)
      } else {
        const proxyDiv = getProxyDiv()

        await gsap.timeline()
          .to(upper, { morphSVG: lower, duration: TOGGLE_SPEED }, 0)
          .to(eyeOpen, { morphSVG: eyeClosed, duration: TOGGLE_SPEED }, 0)
          .to(proxyDiv, {
            duration: ENCRYPT_SPEED,
            scrambleText: { CHARS, text: currentValue },
            onUpdate: () => {
              const proxyText = proxyDiv.innerText
              const placeholder = '•'.repeat(Math.max(0, currentValue.length - proxyText.length))

              modelRef.value = proxyText + placeholder
            },
            onComplete: () => {
              proxyDiv.innerHTML = ''

              modelRef.value = currentValue
            },
          }, 0)
      }

      isAnimating.value = false
    } else {
      if (!isEmpty) {
        const proxyDiv = getProxyDiv()

        await gsap.timeline({
          onComplete: () => {
            proxyDiv.innerHTML = ''

            modelRef.value = currentValue

            isPasswordVisible.value = false

            startBlinking()
          },
        })
          .to(upper, { morphSVG: upper, duration: TOGGLE_SPEED })
          .to(eyeOpen, { morphSVG: eyeOpen, duration: TOGGLE_SPEED })
          .to(proxyDiv, {
            duration: ENCRYPT_SPEED,
            scrambleText: { CHARS, text: '•'.repeat(currentValue.length) },
            onUpdate: () => {
              const proxyText = proxyDiv.innerText

              modelRef.value = proxyText + currentValue.slice(proxyText.length)
            },
          }, 0)
      } else {
        await gsap.timeline()
          .to(upper, { morphSVG: upper, duration: TOGGLE_SPEED })
          .to(eyeOpen, { morphSVG: eyeOpen, duration: TOGGLE_SPEED })

        isPasswordVisible.value = false

        startBlinking()
      }

      isAnimating.value = false
    }
  }

  const moveEye = (e: PointerEvent) => {
    const { eye, iconContainer } = getElementReferences(iconEye)

    if(!eye) return

    if (resetEyeTimer.value) {
      resetEyeTimer.value.kill()
    }

    resetEyeTimer.value = gsap.delayedCall(2, () => {
      gsap.to(eye, { xPercent: 0, yPercent: 0, duration: 0.2 })
    })

    const bounds = iconContainer.getBoundingClientRect()

    const x = gsap.utils.clamp(-30, 30, gsap.utils.mapRange(-100, 100, 30, -30)(bounds.left - e.clientX))
    const y = gsap.utils.clamp(-30, 30, gsap.utils.mapRange(-100, 100, 30, -30)(bounds.top - e.clientY))

    gsap.set(eye, { xPercent: x, yPercent: y })
  }

  const handlePlayAnimate = () => {
    isFocus.value = true

    window.addEventListener('pointermove', (event) => {
      if(!isFocus.value) {
        return
      }

      moveEye(event)

      startBlinking()
    }, { signal: controller.signal })
  }

  const handleStopAnimate = () => {
    isFocus.value = !isFocus.value

    blinkTimeline.value?.kill()
  }

  onUnmounted(() => {
    controller.abort()
  })

  return {
    handlePlayAnimate,
    handleStopAnimate,
    togglePassword,
    isPasswordVisible,
    isFocus,
    isAnimating
  }
}

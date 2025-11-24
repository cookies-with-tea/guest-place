// composables/useAnimateIcon.ts
import type { Ref } from 'vue'
import { gsap } from 'gsap'

export const useAnimateIcon = (
  isAnimating: Ref<boolean>,
  plusIconRef: Ref<{ $el: HTMLElement } | null>,
  newActive: boolean,
  oldActive: boolean,
  onAnimateComplete?: () => void
) => {
  const iconContainer = plusIconRef.value?.$el

  if (!iconContainer) return

  const circle = iconContainer.querySelector('#plus-bg-circle')
  const horLine = iconContainer.querySelector('#plus-line-h')
  const verLine = iconContainer.querySelector('#plus-line-v')

  if (!circle || !horLine || !verLine) return

  isAnimating.value = true

  const rotatingElements = [circle, horLine, verLine]

  const tl = gsap.timeline({
    onComplete: () => {
      isAnimating.value = false
      onAnimateComplete?.()
    },
  })

  tl.to(rotatingElements, {
    scale: 1.2,
    transformOrigin: 'center',
    duration: 0.15,
    ease: 'power2.out',
  })

  const rotation = oldActive ? '-=360' : '+=360'

  tl.to(
    rotatingElements,
    {
      rotation,
      transformOrigin: 'center',
      duration: 0.4,
      ease: 'power2.out',
    },
    '<'
  )

  tl.to(rotatingElements, {
    scale: 1,
    transformOrigin: 'center',
    duration: 0.15,
    ease: 'power2.in',
  })

  tl.to(verLine, {
    opacity: newActive ? 0 : 1,
    duration: 0.15,
    ease: 'power2.inOut',
  })
}

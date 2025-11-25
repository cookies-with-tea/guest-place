import type { Ref, ShallowRef } from 'vue'
import { gsap } from 'gsap'
import type { UiIconInstanceType } from '#shared/ui/ui-icon'

export const useAnimateIcon = (
  isAnimating: Ref<boolean>,
  plusIconRef: Readonly<ShallowRef<UiIconInstanceType>>,
  newActive: boolean,
  oldActive: boolean
) => {
  const iconContainer = plusIconRef.value?.$el

  if (!iconContainer) return

  const circle = iconContainer.getElementById('plus-bg-circle')
  const horLine = iconContainer.getElementById('plus-line-h')
  const verLine = iconContainer.getElementById('plus-line-v')

  if (!circle || !horLine || !verLine) return

  isAnimating.value = true

  const rotatingElements = [circle, horLine, verLine]

  const tl = gsap.timeline({
    onComplete: () => {
      isAnimating.value = false
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

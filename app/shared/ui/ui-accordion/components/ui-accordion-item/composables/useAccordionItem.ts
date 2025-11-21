import { ref, watch } from 'vue'
import type UiIcon from '../../../../ui-icon'
import { gsap } from 'gsap'

export const useAccordionItem = (isActive: any) => {
  const plusIconRef = ref<InstanceType<typeof UiIcon> | null>(null)
  let isAnimating = false
  let isFirstWatch = true

  const animateIcon = (newActive: boolean, oldActive: boolean) => {
    const iconContainer = plusIconRef.value?.$el

    if (!iconContainer) return

    const circle = iconContainer.querySelector('#plus-bg-circle')
    const horLine = iconContainer.querySelector('#plus-line-h')
    const verLine = iconContainer.querySelector('#plus-line-v')

    if (!circle || !horLine || !verLine) return

    isAnimating = true

    const rotatingElements = [circle, horLine, verLine]

    const tl = gsap.timeline({
      onComplete: () => {
        isAnimating = false
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

  watch(
    () => isActive(),
    (newActive, oldActive) => {
      if (isFirstWatch) {
        isFirstWatch = false

        return
      }

      if (typeof oldActive !== 'boolean') return
      if (newActive === oldActive) return
      if (isAnimating) return

      animateIcon(newActive, oldActive)
    },
    { immediate: true }
  )

  return plusIconRef
}

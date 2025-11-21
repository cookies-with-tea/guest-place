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

    const tl = gsap.timeline({
      onComplete: () => {
        isAnimating = false
      },
    })

    // 1. Увеличение
    tl.to([circle, horLine, verLine], {
      scale: 1.25,
      transformOrigin: 'center',
      duration: 0.25,
      ease: 'power2.out',
    })

    // 2. Вращение: направление зависит от того, открываем или закрываем
    const rotation = oldActive ? '-=360' : '+=360'

    tl.to(
      [horLine, verLine],
      {
        rotation,
        transformOrigin: 'center',
        duration: 0.6,
        ease: 'power2.out',
      },
      '<'
    )

    // 3. Возврат размера
    tl.to([circle, horLine, verLine], {
      scale: 1,
      transformOrigin: 'center',
      duration: 0.25,
      ease: 'power2.in',
    })

    // 4. Плавное появление/исчезновение вертикальной линии
    tl.to(verLine, {
      opacity: newActive ? 0 : 1, // true → минус (вертикаль исчезает), false → плюс (появляется)
      duration: 0.25,
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

      // Убедимся, что oldActive — boolean
      if (typeof oldActive !== 'boolean') return

      if (newActive === oldActive) return
      if (isAnimating) return

      animateIcon(newActive, oldActive)
    },
    { immediate: true }
  )

  return plusIconRef
}

import { ref, watch } from 'vue'
import type UiIcon from '../../../../ui-icon'
import { useAnimateIcon } from './useAnimateIcon'

export const useAccordionItem = (isActive: () => boolean) => {
  const plusIconRef = useTemplateRef<InstanceType<typeof UiIcon> | null>('accordion-icon')
  const isAnimating = ref(false)
  const isButtonDisabled = ref(false) // ← новое состояние

  let isFirstWatch = true

  watch(
    isActive,
    (newActive, oldActive) => {
      if (isFirstWatch) {
        isFirstWatch = false
        return
      }

      if (typeof oldActive !== 'boolean') return
      if (newActive === oldActive) return
      if (isAnimating.value) return

      // 🔒 Блокируем кнопку
      isButtonDisabled.value = true

      // Запускаем анимацию с callback'ом
      useAnimateIcon(
        isAnimating,
        plusIconRef,
        newActive,
        oldActive,
        () => {
          // ✅ Разблокируем кнопку после анимации
          isButtonDisabled.value = false
        }
      )
    },
    { immediate: true }
  )

  return { plusIconRef, isButtonDisabled }
}

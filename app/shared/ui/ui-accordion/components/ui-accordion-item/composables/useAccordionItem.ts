import { ref, watch } from 'vue'
import type UiIcon from '../../../../ui-icon'
import { useAnimateIcon } from './useAnimateIcon'

export const useAccordionItem = (isActive: any) => {
  const plusIconRef = ref<InstanceType<typeof UiIcon> | null>(null)
  const isAnimating = ref(false)

  let isFirstWatch = true

  watch(
    () => isActive(),
    (newActive, oldActive) => {
      if (isFirstWatch) {
        isFirstWatch = false

        return
      }

      if (typeof oldActive !== 'boolean') return
      if (newActive === oldActive) return
      if (isAnimating.value) return

      useAnimateIcon(isAnimating, plusIconRef, newActive, oldActive)
    },
    { immediate: true }
  )

  return plusIconRef
}

import { onMounted, ref, watch } from 'vue'
import type { Ref } from 'vue'
import type UiIcon from '../../../../ui-icon'
import { useAnimateIcon } from './useAnimateIcon'

function changeHeight(accordionContent: Ref<HTMLDivElement | null>, newActive: boolean) {
  if (accordionContent.value) {
    accordionContent.value.style.maxHeight = newActive ? `${accordionContent.value.scrollHeight}px` : '0px'
  }
}

const shouldAnimate = (isFirstRun: boolean, oldActive: unknown, newActive: boolean, isAnimating: boolean): boolean => {
  return !(isFirstRun && typeof oldActive !== 'boolean' && newActive === oldActive && isAnimating)
}

export const useAccordionItem = (isActive: () => boolean, accordionContent: Ref<HTMLDivElement | null>) => {
  const plusIconRef = useTemplateRef<InstanceType<typeof UiIcon> | null>('accordion-icon')
  const isAnimating = ref(false)
  const isButtonDisabled = ref(false)

  let isFirstRun = true

  watch(
    isActive,
    (newActive, oldActive) => {
      changeHeight(accordionContent, newActive)

      if (isFirstRun) {
        isFirstRun = false

        return
      }

      if (!shouldAnimate(isFirstRun, oldActive, newActive, isAnimating.value)) {
        return
      }

      isButtonDisabled.value = true

      useAnimateIcon(isAnimating, plusIconRef, newActive, oldActive as boolean, () => {
        isButtonDisabled.value = false
      })
    },
    { immediate: true }
  )

  onMounted(() => {
    const verLine = plusIconRef.value?.$el?.querySelector('#plus-line-v')

    if (verLine) {
      verLine.style.opacity = isActive() ? '0' : '1'
    }

    changeHeight(accordionContent, isActive())
  })

  return isButtonDisabled
}

import { onMounted, ref, watch } from 'vue'
import type { Ref } from 'vue'
import type { UiIconInstanceType } from '#shared/ui/ui-icon/types'
import { useAnimateIcon } from './useAnimateIcon'
import type { IUiAccordionProvider } from '../../../interfaces'
import { UiAccordionInjectionKey } from '../../../constants'

const changeHeight = (accordionContent: Ref<HTMLDivElement | null>, newActive: boolean) => {
  if (accordionContent.value) {
    accordionContent.value.style.maxHeight = newActive ? `${accordionContent.value.scrollHeight}px` : '0px'
  }
}

export const useAccordionItem = (name: string | number) => {
  const { model, multiple } = inject<IUiAccordionProvider>(UiAccordionInjectionKey)!

  const accordionContent = useTemplateRef<HTMLDivElement>('accordion-content')
  const plusIconRef = useTemplateRef<UiIconInstanceType>('accordion-icon')

  const isAnimating = ref(false)

  const currentName = computed(() => name.toString())
  const isActive = computed<boolean>(() => {
    return Array.isArray(model.value) ? model.value.includes(currentName.value) : model.value === currentName.value
  })

  watch(
    isActive,
    (newActive, oldActive) => {
      changeHeight(accordionContent, newActive)

      useAnimateIcon(isAnimating, plusIconRef, newActive, oldActive as boolean)
    },
    { immediate: true }
  )

  onMounted(() => {
    const verLine = plusIconRef.value?.$el?.getElementById('plus-line-v')

    if (verLine) {
      verLine.style.opacity = isActive.value ? '0' : '1'
    }

    changeHeight(accordionContent, isActive.value)
  })

  const toggleAccordion = () => {
    if (multiple) {
      const currentList = model.value as string[]

      model.value = isActive.value
        ? currentList.filter((id) => id !== currentName.value)
        : [...currentList, currentName.value]

      return
    }

    model.value = isActive.value ? '0' : currentName.value
  }

  return {
    isAnimating,
    toggleAccordion,
  }
}

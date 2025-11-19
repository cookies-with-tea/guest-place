<template>
  <li class="ui-accordion-item">
    <div class="ui-accordion-item__trigger">
      {{ props.title }}

      <!--      <UiIcon name="plus" width="48" height="48" />-->

      <button @click="toggleAccordion">
        <UiIcon ref="plusIconRef" name="accordion-plus-minus" width="58px" height="58px" />
      </button>
    </div>
    <!--    v-if="isActive(nameToString)"-->
    <div class="ui-accordion-item__content" :class="{ 'ui-accordion-item__content_show': isActive(nameToString) }">
      <slot />
    </div>
  </li>
</template>

<script setup lang="ts">
import { computed, inject, ref } from 'vue'
import { gsap } from 'gsap'
import UiIcon from '../../../ui-icon'

interface IProps {
  title: string | number
  name: string | number
}

interface AccordionContext {
  isActive: (currentIndex: string) => boolean
  showContent: (currentIndex: string) => void
}

const props = defineProps<IProps>()

const { isActive, showContent } = inject<AccordionContext>('activeItems')!
const nameToString = computed(() => props.name.toString())

// Ссылка на иконку
const plusIconRef = ref<InstanceType<typeof UiIcon> | null>(null)

// Флаг, чтобы избежать повторной анимации при повторном клике на активный элемент
let isAnimating = false

const toggleAccordion = () => {
  if (isAnimating) return

  const wasActive = isActive(nameToString.value)

  showContent(nameToString.value)

  const iconContainer = plusIconRef.value?.$el

  if (!iconContainer) return

  const circle = iconContainer?.querySelector('#plus-bg-circle')
  const horLine = iconContainer?.querySelector('#plus-line-h')
  const verLine = iconContainer?.querySelector('#plus-line-v')

  if (!iconContainer || !circle || !horLine || !verLine) return

  isAnimating = true

  const tl = gsap.timeline({
    onComplete: () => {
      isAnimating = false
    },
  })

  // --- 1. Увеличение ---
  tl.to([circle, horLine, verLine], {
    scale: 1.25,
    transformOrigin: 'center',
    duration: 0.25,
    ease: 'power2.out',
  })

  // --- 2. Вращение: направление зависит от действия ---
  const rotationDirection = wasActive ? '-=360' : '+=360' // ← ключевая строка!

  tl.to(
    [horLine, verLine],
    {
      rotation: rotationDirection,
      transformOrigin: 'center',
      duration: 0.6,
      ease: 'power2.out',
    },
    '<'
  )

  // --- 3. Возврат к исходному размеру ---
  tl.to([circle, horLine, verLine], {
    scale: 1,
    transformOrigin: 'center',
    duration: 0.25,
    ease: 'power2.in',
  })

  // --- 4. Финальный переход + ↔ – ---
  if (!wasActive) {
    // ➕ → ➖ : исчезает вертикаль
    tl.to(verLine, {
      opacity: 0,
      duration: 0.25,
      ease: 'power2.inOut',
    })
  } else {
    // ➖ → ➕ : появляется вертикаль
    tl.to(verLine, {
      opacity: 1,
      duration: 0.25,
      ease: 'power2.inOut',
    })
  }
}
</script>

<style scoped lang="scss">
.ui-accordion-item {
  display: flex;
  flex-direction: column;
  border-radius: 50px;
  box-shadow: 0 4px 15px 0 #694e4b24;
  background-color: var(--color-white);
  padding: 13px 30px;

  &__trigger {
    @include typography(h5);

    display: flex;
    align-items: center;
    justify-content: space-between;
    color: var(--color-regular);
    gap: 33px;

    &:deep(svg) {
      align-self: flex-start;
    }
  }

  &__content {
    @include typography(h5);

    max-height: 0;
    color: var(--color-text-light);
    transform: translateY(-10px);
    transition:
      max-height 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94),
      opacity 0.4s ease,
      transform 0.4s ease;
    padding: 0;
    margin: 0;
    overflow: hidden;
    opacity: 0;

    &_show {
      max-height: 500px;
      transform: translateY(0);
      padding-top: 20px;
      opacity: 1;
    }
  }
}
</style>

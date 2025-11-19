<template>
  <li class="ui-accordion-item">
    <div class="ui-accordion-item__trigger">
      {{ props.title }}

      <!--      <UiIcon name="plus" width="48" height="48" />-->

      <button @click="toggleAccordion">
        <UiIcon ref="plusIconRef" name="accordion-plus-minus" width="58px" height="58px" />
      </button>
    </div>

    <div v-if="isActive(nameToString)" class="ui-accordion-item__content">
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

  const isActiveNow = isActive(nameToString.value)

  showContent(nameToString.value)

  // Получаем корневой элемент иконки: либо <svg>, либо контейнер с ним
  const iconContainer = plusIconRef.value?.$el

  if (!iconContainer) return

  const svgEl = iconContainer.tagName === 'svg' ? iconContainer : iconContainer.querySelector('svg')

  const horLine = svgEl?.querySelector('#plus-line-h')
  const verLine = svgEl?.querySelector('#plus-line-v')

  if (!svgEl || !horLine || !verLine) return

  isAnimating = true

  const tl = gsap.timeline({
    onComplete: () => {
      isAnimating = false
    },
  })

  if (!isActiveNow) {
    // --- Открытие: + → (360°) → scale up → scale back → минус ---
    tl.to([horLine, verLine], {
      rotation: 360,
      transformOrigin: 'center',
      duration: 0.6,
      ease: 'power2.out',
    })
      .to(svgEl, {
        scale: 1.2,
        duration: 0.2,
        ease: 'power2.out',
      })
      .to(svgEl, {
        scale: 1,
        duration: 0.2,
        ease: 'power2.in',
      })
      .to(verLine, {
        opacity: 0,
        duration: 0.2,
        ease: 'power1.in',
      })
  } else {
    // --- Закрытие: - → (показ вертикали) → 360° → scale up → scale back → плюс ---
    tl.set(verLine, { opacity: 1 })
      .to([horLine, verLine], {
        rotation: 360,
        transformOrigin: 'center',
        duration: 0.6,
        ease: 'power2.out',
      })
      .to(svgEl, {
        scale: 1.2,
        duration: 0.2,
        ease: 'power2.out',
      })
      .to(svgEl, {
        scale: 1,
        duration: 0.2,
        ease: 'power2.in',
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
  gap: 20px;

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

    color: var(--color-text-light);
  }
}
</style>

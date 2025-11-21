<template>
  <li class="ui-accordion-item">
    <div class="ui-accordion-item__trigger">
      {{ props.title }}

      <button @click="toggleAccordion">
        <UiIcon ref="plusIconRef" name="accordion-plus-minus" width="58px" height="58px" />
      </button>
    </div>
    <div class="ui-accordion-item__content" :class="{ 'ui-accordion-item__content_show': isActive(nameToString) }">
      <slot />
    </div>
  </li>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue'
import UiIcon from '../../../ui-icon'
import { useAccordionItem } from './composables'

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

const plusIconRef = useAccordionItem(() => isActive(nameToString.value))

const toggleAccordion = () => {
  showContent(nameToString.value)
}

onMounted(() => {
  const verLine = plusIconRef.value?.$el?.querySelector('#plus-line-v')

  if (verLine) {
    verLine.style.opacity = isActive(nameToString.value) ? '0' : '1'
  }
})
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

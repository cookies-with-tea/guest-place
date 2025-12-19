<template>
  <li class="ui-accordion-item">
    <button class="ui-accordion-item__trigger" type="button" :disabled="isAnimating" @click="toggleAccordion">
      <span>{{ props.title }}</span>

      <UiIcon ref="accordion-icon" name="accordion-plus-minus" />
    </button>

    <div ref="accordion-content" class="ui-accordion-item__content">
      <slot />
    </div>
  </li>
</template>

<script setup lang="ts">
import { UiIcon } from '#shared/ui'
import { useAccordionItem } from '../composables'

interface IProps {
  title: string | number
  name: string | number
}

const props = defineProps<IProps>()

const { isAnimating, toggleAccordion } = useAccordionItem(props.name)
</script>

<style scoped lang="scss">
.ui-accordion-item {
  display: flex;
  flex-direction: column;
  border-radius: 50px;
  box-shadow: var(--shadow-md);
  background-color: var(--color-white);
  padding: 13px 30px;

  &__trigger {
    @include typography(h5);

    display: flex;
    align-items: center;
    justify-content: space-between;
    color: var(--color-regular);
    transition: color var(--transition-duration-secondary) ease-out;
    gap: 33px;

    &:deep(.ui-icon) {
      top: 6px;
      width: 58px;
      height: 58px;
      position: relative;
    }

    @include hover {
      color: var(--color-text-primary-hover);
    }
  }

  &__content {
    @include typography(h5);

    max-height: 0;
    color: var(--color-text-light);
    transition:
      max-height var(--transition-duration-secondary),
      padding-bottom var(--transition-duration-secondary),
      padding-top var(--transition-duration-secondary);
    will-change: max-height;
    overflow: hidden;
  }
}
</style>

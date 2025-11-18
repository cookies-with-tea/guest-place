<template>
  <li class="ui-accordion-item">
    <div class="ui-accordion-item__trigger" @click="showContent(nameToString)">
      {{ props.title }}

      <UiIcon name="plus" width="48" height="48" />
    </div>

    <div v-if="isActive(nameToString)" class="ui-accordion-item__content">
      <slot />
    </div>
  </li>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue'
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

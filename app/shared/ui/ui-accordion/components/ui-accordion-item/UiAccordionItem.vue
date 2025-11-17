<template>
  <li class="ui-accordion-item">
    <div class="ui-accordion-item__trigger">
      {{ props.title }}

      <UiIcon name="plus" width="48" height="48" />
    </div>

    <div class="ui-accordion-item__content">
      <slot />
    </div>
  </li>
</template>

<script setup lang="ts">
import UiIcon from '../../../ui-icon'

// const model = defineModel()

interface IProps {
  title: string | number
}

const props = defineProps<IProps>()
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

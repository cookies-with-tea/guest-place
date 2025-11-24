<template>
  <li class="ui-accordion-item">
    <button class="ui-accordion-item__trigger" type="button" :disabled="isButtonDisabled" @click="toggleAccordion">
      {{ props.title }}
      <UiIcon ref="accordion-icon" name="accordion-plus-minus" />
    </button>

    <div ref="accordion-content" class="ui-accordion-item__content">
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
  model: { value: string | string[] }
  multiple: boolean
}

const props = defineProps<IProps>()
const { model, multiple } = inject<AccordionContext>('activeItems')!
const nameToString = computed(() => props.name.toString())

const accordionContent = useTemplateRef<HTMLDivElement>('accordion-content')

const isActive = computed(() => {
  return Array.isArray(model.value) ? model.value.includes(nameToString.value) : model.value === nameToString.value
})

const isButtonDisabled = useAccordionItem(() => isActive.value, accordionContent)

const showContent = () => {
  if (multiple) {
    const currentList = model.value as string[]

    model.value = isActive.value
      ? currentList.filter((id) => id !== nameToString.value)
      : [...currentList, nameToString.value]

    return
  }

  model.value = isActive.value ? '0' : nameToString.value
}

const toggleAccordion = () => {
  if (isButtonDisabled.value) return

  showContent()
}
</script>

<style scoped lang="scss">
.ui-accordion-item {
  --ui-accordion-primary-shadow-color: #694e4b24;
  --transition: 0.22s ease-out;
  --padding: 24px;

  display: flex;
  flex-direction: column;
  border-radius: 50px;
  box-shadow: 0 4px 15px 0 var(--ui-accordion-primary-shadow-color);
  background-color: var(--color-white);
  padding: 13px 30px;

  &__trigger {
    @include typography(h5);

    display: flex;
    align-items: center;
    justify-content: space-between;
    color: var(--color-regular);
    transition: color 0.5s ease;
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

    //max-height: 0;
    color: var(--color-text-light);
    transition:
      max-height var(--transition),
      padding-bottom var(--transition),
      padding-top var(--transition);
    will-change: max-height;

    //transform: translateY(-10px);
    //transition:
    //  max-height 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94),
    //  opacity 0.4s ease,
    //  transform 0.4s ease;
    //padding: 0;
    //margin: 0;
    //overflow: hidden;
    //opacity: 0;

    padding: 0 var(--padding);
    overflow: hidden;
  }

  //&.ui-accordion-item__content_show {
  //  .ui-accordion-item__content {
  //    max-height: 500px;
  //    transform: translateY(0);
  //    padding-top: 20px;
  //    opacity: 1;
  //  }
  //}

  &.ui-accordion-item__content_show .ui-accordion-item__content {
    padding-top: 0;
    padding-bottom: var(--padding);
  }
}
</style>

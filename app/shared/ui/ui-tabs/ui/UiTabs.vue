<template>
  <div class="ui-tabs">
    <div class="ui-tabs__buttons">
      <button
        v-for="tab in tabs"
        :key="tab.name"
        type="button"
        class="ui-tabs__item"
        :class="{ 'ui-tabs--active': model === tab.name }"
        @click="handleClickTab(tab)"
      >
        {{ tab.title }}
      </button>
    </div>

    <div class="ui-tabs__content">
      <component :is="activeTab.content" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
import { computed } from 'vue'

const model = defineModel<string>({ default: '' })

interface ITab {
  title: string
  content: Component
  name: string
}

interface IProps {
  tabs: ITab[]
  variant?: 'primary' | 'secondary'
}

const props = withDefaults(defineProps<IProps>(), {
  variant: 'primary',
})

const activeTab = computed(() => {
  return props.tabs!.find((tab) => tab.name === model.value)
})

// const classes = computed(() => {
//     return [
//       {[`ui-input--${props.size}`]: props.type !== 'textarea'},
//       {'is-disabled': props.disabled},
//       {'is-focus': isFocusInput.value}
//     ]
//   }
// )

const handleClickTab = (tab: ITab) => {
  model.value = tab.name
}
</script>

<style scoped lang="scss">
.ui-tabs {
  width: 100%;
  position: relative;

  &__buttons {
    width: 100%;

    &::before {
      content: '';
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      position: absolute;
      border-radius: 30px 30px 0 0;
      box-shadow: 0 0 15px 0 #694e4b1a;

      //background-color: red;
      //opacity: 0.2;

      background-color: var(--color-white);
      z-index: 1;
    }
  }

  &__item {
    @include typography(h4);

    //z-index: 11111;
    position: relative;
    border-radius: 30px 30px 0 0;
    color: var(--color-text-dark);
    background-color: var(--color-accent-2);
    padding: 40px;
    z-index: 1111111111111111;
  }

  &__content {
    //background-color: var(--color-white);
    position: relative;
    border-radius: 30px;
    box-shadow: 0 0 15px 0 #694e4b1a;
    padding: 65px;
    z-index: 100;
  }

  &--active {
    position: relative;

    //box-shadow: 0 0 15px 0 #694E4B1A;
    background-color: var(--color-white);
    z-index: 10000;

    //&:before {
    //  content: "";
    //  position: absolute;
    //  top: 0;
    //  left: 0;
    //  //background-color: red;
    //  //opacity: 0.2;
    //
    //  background-color: var(--color-white);
    //  box-shadow: 0 0 15px 0 #694E4B1A;
    //  width: 100%;
    //  height: 100%;
    //  z-index: 1;
    //}
  }
}
</style>

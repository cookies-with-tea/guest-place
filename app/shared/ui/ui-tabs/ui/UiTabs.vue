<template>
  <div class="ui-tabs">
    <div class="ui-tabs__buttons">
      <button
        v-for="item in tabs"
        type="button"
        class="ui-tabs__item"
        :class="{'ui-tabs__item_active': false}"
      >
        {{ item.title }}
      </button>
    </div>

    <div class="ui-tabs__content">
      <component is=""/>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue';

const model = defineModel({ default: ''})

interface ITab {
  title: string,
  content: Component,
  name: string,
}

interface IProps {
  tabs: ITab[]
}

const props = withDefaults(defineProps<IProps>(), {

})
console.log(props.tabs)
</script>

<style scoped lang="scss">
.ui-tabs {
  width: 100%;

  &__buttons {
    width: 100%;
  }

  &__item {
    @include typography(h4);

    background-color: var(--color-accent-2);
    padding: 40px;

    color: var(--color-text-dark);
    border-radius: 30px 30px 0 0;
  }
}
</style>

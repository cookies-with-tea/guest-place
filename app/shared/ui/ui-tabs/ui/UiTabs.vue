<template>
  <div class="ui-tabs">
    <div class="ui-tabs__buttons">
      <button
        v-for="tab in tabs"
        :key="tab.name"
        type="button"
        class="ui-tabs__item"
        :class="activeTabClass(tab.name)"
        @click="handleClickTab(tab)"
      >
        {{ tab.title }}
      </button>

    </div>

    <div class="ui-tabs__content">
      <!--TODO:
        Сделать скелетон или лоудер,чтоб
        при ассинхроной подгрузке компонента контент не прыгал
      -->
        <KeepAlive v-bind="keepAlivesProps">
          <component :is="activeTab" />
        </KeepAlive>
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import type { Component } from 'vue'
import { computed } from 'vue'

interface ITab {
  title: string
  content: Component
  name: string
}

interface IProps {
  tabs: ITab[]
  variant?: 'primary' | 'secondary'
  exclude: string | string[]
  isQuery: boolean
}

const route = useRoute()

const model = defineModel<string>({ default: '' })

const props = withDefaults(defineProps<IProps>(), {
  variant: 'primary',
})

// const activeTab = computed(() => {
//   if(props.isQuery) {
//     return props.tabs.find((tab) => tab.name === route.query.tab)?.content
//   } else {
//     return props.tabs.find((tab) => tab.name === model.value)?.content
//   }
// })

const keepAlivesProps = computed(() => ({
  exclude: props.exclude ?  props.exclude: undefined
}))

watch(model, async (newValue) => {
  await navigateTo({
    query: {
      tab: newValue,
    },
  })
},  { immediate: true })

const activeTabClass = computed(() => (name: string) => ({'ui-tabs--active': model.value === name}))

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
    min-height: 200px;

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

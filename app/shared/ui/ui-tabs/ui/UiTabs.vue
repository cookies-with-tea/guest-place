<template>
  <div class="ui-tabs" :class="classes">
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
      <KeepAlive v-bind="keepAliveProps">
        <component :is="currentContent" />
      </KeepAlive>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, useAttrs, onMounted, type Component } from 'vue'
import { useRoute } from 'vue-router'
import { navigateTo } from 'nuxt/app'

const getAttributes = useAttrs()

interface ITab {
  title: string
  content: Component
  name: string
}

interface IProps {
  tabs: ITab[]
  variant?: 'primary' | 'secondary'
  exclude?: string | string[]
  isQuery?: boolean
}

const route = useRoute()

const currentTab = defineModel<string>({ default: '' })

const idTabs = getAttributes.id as string

const props = withDefaults(defineProps<IProps>(), {
  variant: 'primary',
})

const tabQuery = computed(() =>  route.query?.tab as string)

// TODO: дать нормальный неминг
const valueQuery = computed(() => (name: string) => {
  return props.isQuery ?
    (tabQuery.value ?? props.tabs[0]?.name) === name:
    currentTab.value === name
})

const currentContent = computed(() => {
    return props.tabs.find(({name}) => valueQuery.value(name))?.content
  }
)

const keepAliveProps = computed(() => ({
  exclude: props.exclude,
}))

const activeTabClass = computed(() => (name: string) => {
  return { 'ui-tabs--active': valueQuery.value(name)}
})

const classes = computed(() => {
  return [
    `ui-tabs--${props.variant}`,
  ]
})

onMounted( async () => {
  if (!props.isQuery && !currentTab.value) {
    throw new Error('v-model is required if there is no isQuery prop')
  }

  if (!props.isQuery && tabQuery.value) {
    const newQuery = { ...route.query }

    delete newQuery.tab

    await navigateTo({
      path: route.path,
      query: newQuery,
    })
  }
})

const handleClickTab = async (tab: ITab) => {
  if (props.isQuery) {
    const tabPath = tab.name as string

    await navigateTo({
      query: {
        tab: tabPath,
      },
      hash: `#${idTabs}`
    })
  } else {
    currentTab.value = tab.name
  }
}
</script>

<style scoped lang="scss">
.ui-tabs {
  --ui-tabs-box-shadow: 0 0 15px 0 #694e4b1a;
  --ui-tabs-color: var(--color-text-dark);
  --ui-tabs-bg-color: var(--color-accent-2);
  --ui-tabs-active-bg-color: var(--color-white);

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
      box-shadow: var(--ui-tabs-box-shadow);

      //background-color: red;
      //opacity: 0.2;

      background-color: var(--ui-tabs-active-bg-color);
      z-index: 1;
    }
  }

  &__item {
    @include typography(h4);

    //z-index: 11111;
    position: relative;
    border-radius: 30px 30px 0 0;
    color: var(--ui-tabs-color);
    background-color: var(--ui-tabs-bg-color);
    padding: 40px;
    z-index: 1111111111111111;
  }

  &__content {
    min-height: 200px;

    //background-color: var(--ui-tabs-active-bg-color);
    position: relative;
    border-radius: 30px;
    box-shadow: var(--ui-tabs-box-shadow);
    padding: 65px;
    z-index: 100;
  }

  &--primary {

  }

  &--secondary {

  }

  &--active {
    position: relative;
    background-color: var(--ui-tabs-active-bg-color);
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

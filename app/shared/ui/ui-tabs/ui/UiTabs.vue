<template>
  <div class="ui-tabs" :class="classes">
    <div ref="tabs-wrapper" class="ui-tabs__buttons">
      <button
        v-for="tab in tabs"
        :key="tab.name"
        ref="tabs-ref"
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
        <Transition name="tabs-content" mode="out-in">
          <component :is="currentContent" />
        </Transition>
      </KeepAlive>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, useTemplateRef, type Component } from 'vue'
import { useRoute } from 'vue-router'
import { navigateTo } from 'nuxt/app'
import { useFlexWrapFix } from '../composables'

// TODO: Исправить баги. См. https://app.weeek.net/ws/867311/project/1/board/1?modals=m_task&m_task_workspace-id=867311&m_task_id=208

interface ITab {
  title: string
  content: Component
  name: string
}

interface IProps {
  tabs: ITab[]
  variant?: 'primary' | 'secondary'
  excludeFromKeepAlive?: string | string[]
  withQuery?: boolean
  id?: string
}

const route = useRoute()

const currentTab = defineModel<string>({ default: '' })

const props = withDefaults(defineProps<IProps>(), {
  variant: 'primary',
  id: 'tabs',
})

const tabsWrapper = useTemplateRef<HTMLElement>('tabs-wrapper')

const tabQuery = computed(() => route.query?.tab as string)

useFlexWrapFix({ tabsWrapper, className: 'ui-tabs--mobile-view' })

const isTabActive = (name: string) => {
  return props.withQuery ? (tabQuery.value ?? props.tabs[0]?.name) === name : currentTab.value === name
}

const currentContent = computed(() => {
  return props.tabs.find(({ name }) => isTabActive(name))?.content
})

const keepAliveProps = computed(() => ({
  exclude: props.excludeFromKeepAlive,
}))

const classes = computed(() => {
  return [`ui-tabs--${props.variant}`]
})

onMounted(async () => {
  if (!props.withQuery && !currentTab.value) {
    throw new Error('v-model is required if there is no withQuery prop')
  }

  if (!props.withQuery && tabQuery.value) {
    const newQuery = { ...route.query }

    delete newQuery.tab

    await navigateTo({
      path: route.path,
      query: newQuery,
    })
  }
})

const activeTabClass = (name: string) => {
  return { 'ui-tabs__item--active': isTabActive(name) }
}

const handleClickTab = async (tab: ITab) => {
  if (props.withQuery) {
    const tabPath = tab.name as string

    await navigateTo({
      query: {
        tab: tabPath,
      },
      hash: `#${props.id}`,
    })
  } else {
    currentTab.value = tab.name
  }
}
</script>

<style scoped lang="scss">
@use 'public/styles/helpers/mixins' as *;

.ui-tabs {
  --ui-tabs-bg-color: var(--color-accent-2);
  --ui-tabs-active-bg-color: var(--color-white);
  --ui-tabs-content-color: var(--color-white);
  --tabs-animation-ease: cubic-bezier(0.4, 0, 0.2, 1);
  --ui-tabs-border-color: #80808040;

  $self: &;

  width: 100%;
  position: relative;
  font-family: 'Raleway', sans-serif;

  &__buttons {
    position: relative;
    display: flex;
    flex-wrap: wrap;
    z-index: 2;
  }

  &__item {
    @include typography(h4);

    position: relative;
    flex-grow: 1;
    border: none;
    border-radius: 30px 30px 0 0;
    color: var(--color-text-dark);
    background: var(--ui-tabs-bg-color);
    transition: transform var(--transition-duration-secondary) var(--tabs-animation-ease);
    cursor: pointer;
    padding: 65px;
    z-index: 2;

    &:active {
      transform: scale(0.98);
    }

    &--active {
      --ui-tabs-bg-color: var(--ui-tabs-active-bg-color);

      &::before,
      &::after {
        transform: scaleX(1);
      }
    }

    @include responsive-max(xs) {
      @include typography(h7);

      padding: 15px;
    }

    @include hover {
      transform: scale(1.04);
    }
  }

  &:not(.ui-tabs--mobile-view) {
    &::after {
      content: '';
      top: 100px;
      left: 0;
      right: 0;
      width: 100%;
      height: 40px;
      position: absolute;
      background-color: var(--ui-tabs-bg-color);
      pointer-events: none;
      z-index: 1;
    }

    /* TODO: Поддержка 94%. При необходимости переписать на computed isFirstActive и class --first-active | START */
    &:has(.ui-tabs__item:first-child.ui-tabs__item--active) {
      #{$self}__content {
        border-top-left-radius: 0;
      }
    }

    &:has(.ui-tabs__item:last-child.ui-tabs__item--active) {
      #{$self}__content {
        border-top-right-radius: 0;
      }
    }

    #{$self}__item {
      transition: background-color var(--transition-duration-secondary) var(--tabs-animation-ease);

      &::before,
      &::after {
        --s: 40px at;
        --g: #000 100%, #0000;

        content: '';
        bottom: 0;
        width: 50px;
        height: 50px;
        position: absolute;
        -webkit-mask: radial-gradient(var(--s) var(--cut-x) 22%, var(--g)), linear-gradient(#000 0 0);
        -webkit-mask-composite: xor;
        mask-composite: exclude;
        background: var(--ui-tabs-active-bg-color);
        transform: scaleX(0);
        transform-origin: center;
        transition: transform var(--transition-duration-secondary) var(--tabs-animation-ease);
        pointer-events: none;
      }

      &::before {
        --cut-x: 22%;

        left: -50px;
        transform-origin: right;
      }

      &::after {
        --cut-x: 78%;

        right: -50px;
        transform-origin: left;
      }

      &:active {
        transform: scale(0.98);
      }

      &:first-child {
        &::before {
          visibility: hidden;
          opacity: 0;
        }
      }

      &:last-child {
        &::after {
          visibility: hidden;
          opacity: 0;
        }
      }

      &--active {
        --ui-tabs-bg-color: var(--ui-tabs-active-bg-color);

        z-index: 4;

        &::before,
        &::after {
          transform: scaleX(1);
        }
      }

      @include hover {
        transform: scale(1.06);
      }
    }
  }

  &__content {
    position: relative;
    border-radius: 30px;
    background: var(--ui-tabs-content-color);
    transition:
      background-color var(--transition-duration-primary) var(--tabs-animation-ease),
      border-radius var(--transition-duration-primary) var(--tabs-animation-ease);
    padding: 65px;
    margin-top: -3px;
    z-index: 11;
  }

  &.ui-tabs--mobile-view {
    #{$self}__item {
      box-shadow: var(--shadow-md);

      &::before {
        content: '';
        left: 0;
        bottom: -50%;
        width: 100%;
        height: 100%;
        position: absolute;
        border-radius: 30px;
        background-color: var(--ui-tabs-bg-color);
        z-index: -1;
      }
    }

    #{$self}__content {
      border: 1px solid var(--ui-tabs-border-color);
    }
  }

  &--primary {
    --ui-tabs-bg-color: var(--color-accent-2);
    --ui-tabs-active-bg-color: var(--color-white);
    --ui-tabs-content-color: var(--color-white);
  }

  &--secondary {
    --ui-tabs-bg-color: var(--color-white);
    --ui-tabs-active-bg-color: var(--color-accent-2);
    --ui-tabs-content-color: var(--color-accent-2);
  }
}

.tabs-content-enter-active,
.tabs-content-leave-active {
  transition:
    opacity var(--transition-duration-primary) var(--tabs-animation-ease),
    transform var(--transition-duration-primary) var(--tabs-animation-ease);
}

.tabs-content-enter-from,
.tabs-content-leave-to {
  transform: translateY(8px);
  opacity: 0;
}
</style>

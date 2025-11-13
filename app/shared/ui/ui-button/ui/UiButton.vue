<template>
  <component
    :is="tagComponent"
    class="ui-button"
    :class="classes"
    :type="buttonType"
  >
    <slot name="prefix-icon"/>

    <slot />
  </component>
</template>

<script lang="ts" setup>
import { NuxtLink } from '#components'

interface IProps {
  tag?: 'button' | 'nuxt-link',
  type?: 'button' | 'submit',
  variant?: 'primary' | 'secondary' | 'text' | 'icon',
  size?: 'lg' | 'md' | 'sm' | 'xs',
}

// 1. переименовать тег tag done!!!!
// 2. дефолтные пропсы прокинуть type и tag

const props = withDefaults(defineProps<IProps>(), {
  variant: 'primary',
  size: 'md',
})

const classes = computed(() => {
  return [
    `ui-button--${props.variant}`,
    {[`ui-button--${props.size}`]: props.variant !== 'text' && props.variant !== 'icon' }
  ]
})

// 2. возможность сократить код
const buttonType = computed(() => {
  return props.tag === 'button' ? props.type || 'button' : undefined
})

const tagComponent = computed(() => {
  return props.tag === 'nuxt-link' ? NuxtLink : 'button'
})
</script>

<style lang="scss" scoped>
.ui-button {
  --ui-button-color-white: #fff;
  --ui-button-color-black: #333333;
  --ui-button-color-black-hover: #333;
  --ui-button-color-blue-hover: #0066CC;

  --ui-button-bg-color-purle: #764678;
  --ui-button-border-color-purle: #764678;

  --ui-button-bg-color-disabled-grey: #e0e0e0;
  --ui-button-color-disabled-grey: #9e9e9e;
  --ui-button-border-color-disabled-grey: #bdbdbd;

  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50px;
  text-align: center;
  gap: 5px;

  &[disabled] {
    pointer-events: none;
  }

  &--icon, &--text {
    transition: color 300ms ease;

    &:hover {
      color: var(--ui-button-color-blue-hover)
    }

    &[disabled] {
      color: var(--ui-button-color-disabled-grey);
    }
  }

  &--text {
    //  body
    color: var(--ui-button-color-black);
    font-weight: 400;
    font-size: 14px;
    line-height: 135%;

    //& > svg {
    //  размеры иконки
    //}
  }

  &--primary {
    --bg: var(--gradient-primary);

    position: relative;
    border: none;
    border-radius: 50px;
    color: var(--ui-button-color-white);
    background: var(--bg);
    transition:
      background 0.3s ease,
      сolor 0.3s ease;

    &::before {
      content: '';
      position: absolute;
      border-radius: 52px;
      background: var(--gradient-primary);
      transform: scale(0.96);
      transition:
        opacity 1s cubic-bezier(0.18, 0.89, 0.32, 1.28),
        transform 1s cubic-bezier(0.18, 0.89, 0.32, 1.28),
        color 1s ease;
      opacity: 0;
      z-index: -1;
      inset: -2px;
    }

    &:hover {
      --bg: var(--color-white);

      color: var(--ui-button-color-black);

      &::before {
        transform: scale(1);
        opacity: 1;
      }
    }

    &[disabled] {
      --bg: var(--ui-button-bg-color-disabled-grey);

      color: var(--ui-button-color-disabled-grey);

      &::before {
        border: 2px solid var(--ui-button-border-color-disabled-grey);
        transform: scale(1) !important;
        opacity: 1 !important;
      }
    }
  }

  &--secondary {
    --bg: var(--color-white);

    position: relative;
    border: none;
    border-radius: 50px;
    color: var(--ui-button-color-black);
    background: var(--bg);
    transition:
      background 1s cubic-bezier(0.18, 0.89, 0.32, 1.28),
      color 1s ease;

    &::before {
      content: '';
      position: absolute;
      border-radius: 52px;
      background: var(--gradient-primary);
      z-index: -1;
      inset: -2px;
    }

    &:hover {
      --bg: var(--gradient-primary);

      color: var(--ui-button-color-white);
    }

    &[disabled] {
      --bg: transparent;

      color: var(--ui-button-color-disabled-grey);

      &::before {
        border: 2px solid var(--ui-button-border-color-disabled-grey);
        background: var(--bg);
      }
    }
  }

  &--lg {
    height: 62px;
    font-weight: 700;

    //TODO: Заменить на миксин типографии
    font-size: 16px;
    line-height: 100%;
    padding: 0 55px;
  }

  &--md {
    height: 62px;
    font-weight: 700;

    //TODO: Заменить на миксин типографии
    font-size: 16px;
    line-height: 100%;
    padding: 0 22px;
  }

  &--sm {
    height: 40px;
    font-weight: 700;
    font-size: 14px;
    line-height: 100%;
    padding: 0 13px;

    //TODO: Заменить на миксин типографии
  }

  &--xs {
    height: 40px;
    font-weight: 700;
    font-size: 14px;
    line-height: 100%;
    padding: 0 20px;
  }
}
</style>

<template>
  <component :is="tagComponent" class="ui-button" :class="classes" :type="buttonType">
    <slot name="prefix-icon" />

    <slot />
  </component>
</template>

<script lang="ts" setup>
import { NuxtLink } from '#components'

interface IProps {
  tag?: 'button' | 'nuxt-link'
  type?: 'button' | 'submit'
  variant?: 'primary' | 'secondary' | 'text' | 'icon'
  size?: 'lg' | 'md' | 'sm' | 'xs'
}

// 2. дефолтные пропсы прокинуть type и tag

const props = withDefaults(defineProps<IProps>(), {
  variant: 'primary',
  size: 'md',
})

const classes = computed(() => {
  return [
    `ui-button--${props.variant}`,
    { [`ui-button--${props.size}`]: props.variant !== 'text' && props.variant !== 'icon' },
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
  --ui-button-color-black: #333;
  --ui-button-color-black-hover: #333;
  --ui-button-color-blue-hover: #06c;
  --ui-button-bg-color-purle: #764678;
  --ui-button-border-color-purle: #764678;
  --ui-button-bg-color-disabled-grey: #e0e0e0;
  --ui-button-color-disabled-grey: #9e9e9e;
  --ui-button-border-color-disabled-grey: #bdbdbd;

  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 5px;

  &[disabled] {
    pointer-events: none;
  }

  &--secondary,
  &--primary {
    position: relative;
    border: none;
    border-radius: 50px;
    background: var(--bg);

    &::before {
      content: '';
      position: absolute;
      border-radius: 52px;
      background: var(--gradient-primary);
      z-index: -1;
      inset: -2px;
    }

    &[disabled] {
      color: var(--ui-button-color-disabled-grey);

      &::before {
        border: 2px solid var(--ui-button-border-color-disabled-grey);
      }
    }
  }

  &--icon,
  &--text {
    transition: color 300ms ease;

    &[disabled] {
      color: var(--ui-button-color-disabled-grey);
    }

    @include hover {
      color: var(--ui-button-color-blue-hover);
    }
  }

  &--text {
    @include typography(body);

    color: var(--ui-button-color-black);

    &:deep(.ui-icon) {
      font-size: 26px;
    }
  }

  &--primary {
    --bg: var(--gradient-primary);

    color: var(--ui-button-color-white);
    transition:
      background 0.3s ease,
      сolor 0.3s ease;

    &::before {
      transform: scale(0.96);
      transition:
        opacity 1s cubic-bezier(0.18, 0.89, 0.32, 1.28),
        transform 1s cubic-bezier(0.18, 0.89, 0.32, 1.28),
        color 1s ease;
      opacity: 0;
    }

    &[disabled] {
      --bg: var(--ui-button-bg-color-disabled-grey);

      &::before {
        transform: scale(1) !important;
        opacity: 1 !important;
      }
    }

    @include hover {
      --bg: var(--color-white);

      color: var(--ui-button-color-black);

      &::before {
        transform: scale(1);
        opacity: 1;
      }
    }
  }

  &--secondary {
    --bg: var(--color-white);

    color: var(--ui-button-color-black);
    transition:
      background 1s cubic-bezier(0.18, 0.89, 0.32, 1.28),
      color 1s ease;

    &[disabled] {
      --bg: transparent;

      &::before {
        background: var(--bg);
      }
    }

    @include hover {
      --bg: var(--gradient-primary);

      color: var(--ui-button-color-white);
    }
  }

  &--lg,
  &--md {
    @include typography(body-sm);

    height: 62px;
  }

  &--sm,
  &--xs {
    @include typography(h6);

    height: 40px;
  }

  &--lg {
    padding: 0 55px;
  }

  &--md {
    padding: 0 22px;
  }

  &--sm {
    padding: 0 13px;
  }

  &--xs {
    padding: 0 20px;
  }
}
</style>

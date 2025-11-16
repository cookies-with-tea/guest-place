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
  tag: 'button',
  type: 'button',
})

const classes = computed(() => {
  return [
    `ui-button--${props.variant}`,
    { [`ui-button--${props.size}`]: props.variant !== 'text' && props.variant !== 'icon' },
  ]
})

const buttonType = computed(() => {
  return props.tag === 'button' ? props.type : undefined
})

const tagComponent = computed(() => {
  return props.tag === 'nuxt-link' ? NuxtLink : props.tag
})
</script>

<style lang="scss" scoped>
.ui-button {
  --ui-button-primary-color: #fff;
  --ui-button-secondary-color: #333;
  --ui-button-secondary-color-hover: #333;
  --ui-button-text-color-hover: #06c;
  --ui-button-disabled-bg-color: #e0e0e0;
  --ui-button-disabled-primary-color: #9e9e9e;
  --el-button-disabled-border-color: #bdbdbd;
  --el-button-transition-primary: 0.6s;

  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 5px;

  &[disabled] {
    pointer-events: none;
    user-select: none;
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
      color: var(--ui-button-disabled-primary-color);

      &::before {
        border: 2px solid var(--el-button-disabled-border-color);
      }
    }
  }

  &--icon,
  &--text {
    transition: color 0.3s ease;

    &[disabled] {
      --ui-button-secondary-color: var(--ui-button-disabled-primary-color);
    }

    @include hover {
      color: var(--ui-button-text-color-hover);
    }
  }

  &--text {
    @include typography(body);

    color: var(--ui-button-secondary-color);

    &:deep(.ui-icon) {
      font-size: 26px;
    }
  }

  &--primary {
    --bg: var(--gradient-primary);

    color: var(--ui-button-primary-color);
    transition:
      background var(--el-button-transition-primary) ease,
      color var(--el-button-transition-primary) ease;

    &::before {
      transform: scale(0.96);
      transition:
        transform var(--el-button-transition-primary) cubic-bezier(0.18, 0.89, 0.32, 1.28),
        opacity var(--el-button-transition-primary) cubic-bezier(0.18, 0.89, 0.32, 1.28);
      opacity: 0;
    }

    &[disabled] {
      --bg: var(--ui-button-disabled-bg-color);

      &::before {
        transform: scale(1);
        opacity: 1;
      }
    }

    @include hover {
      --bg: var(--color-white);

      color: var(--ui-button-secondary-color);

      &::before {
        transform: scale(1);
        opacity: 1;
      }
    }
  }

  &--secondary {
    --bg: var(--color-white);

    color: var(--ui-button-secondary-color);
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

      color: var(--ui-button-primary-color);
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

<template>
  <component :is="tagComponent" class="ui-button" :class="classes" :type="buttonType">
    <slot name="prefix-icon" />

    <div class="ui-button__content">
      <slot />
    </div>
  </component>
</template>

<script lang="ts" setup>
import { NuxtLink } from '#components'
import { computed } from 'vue'

interface IProps {
  tag?: 'button' | 'nuxt-link'
  type?: 'button' | 'submit'
  variant?: 'primary' | 'secondary' | 'text' | 'icon'
  size?: 'lg' | 'md' | 'sm' | 'xs'
}

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
  --ui-button-background-color: var(--gradient-primary);
  --ui-button-disabled-bg-color: #e0e0e0;
  --ui-button-disabled-primary-color: #9e9e9e;
  --ui-button-disabled-border-color: #bdbdbd;

  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: var(--ui-button-primary-color);
  transition: color var(--transition-duration-primary) ease;
  overflow: hidden;
  gap: 5px;

  &:disabled {
    pointer-events: none;
    user-select: none;
  }

  &--primary,
  &--secondary {
    border-radius: 50px;

    &:active {
      filter: drop-shadow(0 0 4px #ecdeff) drop-shadow(0 0 6px #dac1fd);
    }

    &:disabled {
      --ui-button-primary-color: var(--ui-button-disabled-primary-color);

      &::before {
        background-image: none;
        background-color: var(--ui-button-disabled-bg-color);
      }
    }
  }

  &--primary {
    &::before {
      content: '';
      width: 190%;
      position: absolute;
      background-image: var(--gradient-primary);
      filter: blur(36px);
      transform: translate(-18%, -50%);
      transition: transform var(--transition-duration-primary) ease;
      pointer-events: none;
      z-index: -1;
      aspect-ratio: 1;
      inset: 0;
    }

    @include hover {
      &::before {
        transform: translate(-20%, -40%) scale(1.3);
      }
    }
  }

  &--secondary {
    --ui-button-primary-color: var(--ui-button-secondary-color);
    --angle: 0.5turn;

    border: 2px solid transparent;
    background:
      linear-gradient(to right, #fff, #fff) content-box,
      conic-gradient(from var(--angle), #8e2dbc 0deg, #ffc5bd 120deg, #db7ae3 240deg, #06c 360deg) border-box;
    animation: none;

    &:disabled {
      border-color: var(--ui-button-disabled-border-color);
    }

    @include hover {
      animation: gradient-border 5s linear infinite;
    }
  }

  &--icon,
  &--text {
    --ui-button-primary-color: var(--ui-button-secondary-color);

    &:disabled {
      --ui-button-primary-color: var(--ui-button-disabled-primary-color);
    }

    @include hover {
      --ui-button-primary-color: var(--color-text-primary-hover);
    }
  }

  &--text {
    @include typography(body);

    &:deep(.ui-icon) {
      font-size: 26px;
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
    .ui-button__content {
      padding: 0 55px;
    }
  }

  &--md {
    .ui-button__content {
      padding: 0 22px;
    }
  }

  &--sm {
    .ui-button__content {
      padding: 0 13px;
    }
  }

  &--xs {
    .ui-button__content {
      padding: 0 20px;
    }
  }
}

@keyframes gradient-border {
  from {
    --angle: 0.5turn;
  }

  to {
    --angle: 2.5turn;
  }
}

@property --angle {
  inherits: true;
  initial-value: 0.5turn;
  syntax: '<angle>';
}
</style>

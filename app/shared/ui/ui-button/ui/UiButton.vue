<template>
  <component :is="props.is" :class="classes">
    <slot />
  </component>
</template>

<script lang="ts" setup>
interface IProps {
  is?: 'button' | 'nuxt-link'
  type?: 'button' | 'submit'
  variant?: 'primary' | 'secondary'
  size?: 'md' | 'sm' | 'xs'
}

const props = withDefaults(defineProps<IProps>(), {
  is: 'button',
  type: 'button',
  variant: 'primary',
  size: 'md',
})

// const props = withDefaults(defineProps<Props>(), {
//   is: 'button',
//   size: 'md',
//   variant: 'primary',
//   borderRadius: '6',
// })

// type Props = {
//   variant: 'primary'
//   postfixIcon?: string,
//   size?:  'md' | 'sm' ,
//   tag?: 'button' | 'router-link',
//   type?: 'button'
//   borderRadius?: string | number,
// }

const classes = computed(() => {
  return ['ui-button', `ui-button--${props.variant}`, `ui-button--${props.size}`]
})

// const buttonType = computed(() => {
//   return props.tag === 'button' ? (props.type || 'button') : undefined
// })
</script>

<style lang="scss" scoped>
.ui-button {
  --ui-button-color-white: #fff;
  --ui-button-color-black-hover: #333;
  --ui-button-bg-color-purle: #764678;
  --ui-button-border-color-purle: #764678;

  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50px;
  text-align: center;
  gap: 5px;

  &--primary {
    --bg: var(--gradient-primary);

    position: relative;
    border: none;
    border-radius: 50px;
    color: var(--ui-button-color-white);
    background: var(--bg);
    transition: background 0.3s ease, color 0.3s ease;

    &::before {
      content: '';
      position: absolute;
      border-radius: 52px;
      background: var(--gradient-primary);
      transform: scale(0.96);

      // Анимация появления
      transition: opacity 1s cubic-bezier(0.18, 0.89, 0.32, 1.28),  transform 1s cubic-bezier(0.18, 0.89, 0.32, 1.28), color 1s ease;
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
  }

  &--secondary {
    --bg: var(--color-white);

    position: relative;
    border: none;
    border-radius: 50px;
    color: var(--ui-button-color-black);
    background: var(--bg);
    transition: background 1s cubic-bezier(0.18, 0.89, 0.32, 1.28), color 1s ease;

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

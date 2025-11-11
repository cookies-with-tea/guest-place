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
    //border: 2px solid transparent;

    color: var(--ui-button-color-white);
    background: var(--gradient-primary);

    &:hover {
      border: 2px solid var(--gradient-primary);
      background: transparent;
    }
  }

  &--secondary {
    border: 2px solid #000;

    //font-weight: 500;
    //font-size: 14px;
    //color: #000;
    //background-color: transparent;
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

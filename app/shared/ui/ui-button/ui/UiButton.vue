<template>
  <component :is="props.is" class="ui-button">
    <slot />
  </component>
</template>

<script lang="ts" setup>
interface IProps {
  is?: 'button' | 'nuxt-link'
}

const props = withDefaults(defineProps<IProps>(), {
  is: 'button',
})
</script>
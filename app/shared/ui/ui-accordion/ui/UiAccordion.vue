<template>
  <ul class="ui-accordion">
    <slot />
  </ul>
</template>

<script setup lang="ts"></script>

<style scoped lang="scss">
.ui-accordion {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
</style>

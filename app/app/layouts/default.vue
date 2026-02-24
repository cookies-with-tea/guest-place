<template>
  <div>
    <span style="color: #8e2dbc"> header </span>

    <div class="wrapper">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped lang="scss">
.wrapper {
  max-width: 1140px;
  padding: 0 15px;
  margin: 0 auto;
}
</style>

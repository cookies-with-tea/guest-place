<template>
  <form class="ui-form">
    <slot />
  </form>
</template>

<style lang="scss" scoped>
.ui-form {
  display: flex;
  flex-direction: column;
  gap: 25px;
}
</style>

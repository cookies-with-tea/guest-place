<template>
  <div class="ui-kit">
    <UiIcon style="color: #000" name="clear" width="50px" height="50px" />

    <UiIcon style="color: #fff" name="eye-off" width="50px" height="50px" />
  </div>
</template>

<script setup lang="ts">
import { UiIcon } from '../shared/ui'
</script>

<style lang="scss" scoped>
.box {
  display: flex;
  border: 1px dashed rgb(89 0 131);
  padding: 20px;
  gap: 40px;
}

.column {
  display: flex;
  flex-direction: column;

  > * {
    display: block;
  }
}
</style>

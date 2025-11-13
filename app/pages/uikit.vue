<template>
  <div class="ui-kit">
    <div class="box">
      <div class="column">
        <UiButton> Показать на карте </UiButton>

        <UiButton variant="secondary"> Показать на карте </UiButton>
      </div>

      <div class="column">
        <UiButton is="nuxt-link" to="/"> Это ссылка. кликни на меня ^_^ </UiButton>

        <UiButton> Hi 2 </UiButton>

        <nuxt-link to="/"> 111 </nuxt-link>
      </div>
    </div>

    <div class="box">
      <UiIcon style="color: #000" name="close" width="50px" height="50px" />

      <UiIcon style="color: #f90" name="user" width="50px" height="50px" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { UiButton, UiIcon } from '../shared/ui'
</script>

<style lang="scss" scoped>
.ui-kit {
  padding: 20px;
}

.box {
  width: fit-content;
  display: flex;
  border: 1px dashed rgb(89 0 131);
  padding: 20px;
  gap: 40px;
}

.column {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
</style>

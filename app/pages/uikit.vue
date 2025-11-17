<template>
  <div class="ui-kit">
    <div class="box">
      <div class="column">
        <UiButton> Показать на карте </UiButton>

        <UiButton variant="secondary"> Показать на карте </UiButton>
      </div>

      <div class="column">
        <UiButton disabled> Показать на карте </UiButton>

        <UiButton variant="secondary" disabled> Показать на карте </UiButton>

        <UiButton tag="nuxt-link" to="/"> Это ссылка. кликни на меня ^_^ </UiButton>
      </div>

      <div class="column">
        <UiButton variant="text" disabled>
          <template #prefix-icon>
            <UiIcon name="house" width="26px" height="26px" />
          </template>

          <template #default> Показать рядом со мной </template>
        </UiButton>

        <UiButton variant="text">
          <template #prefix-icon>
            <UiIcon name="house" />
          </template>

          <template #default> Показать рядом со мной </template>
        </UiButton>
      </div>

      <div class="column">
        <UiButton variant="icon" disabled>
          <UiIcon name="house" width="26px" height="26px" />
        </UiButton>

        <UiButton variant="icon">
          <UiIcon name="house" width="26px" height="26px" />
        </UiButton>
      </div>
    </div>

    <div class="box">
      <UiIcon style="color: #000" name="close" width="50px" height="50px" />

      <UiIcon style="color: #f90" name="user" width="50px" height="50px" />

      <UiIcon style="color: #f90" name="shop-car" width="50px" height="50px" reverse />
    </div>

    <div class="box">
      <UiAccordion />
    </div>
  </div>
</template>

<script setup lang="ts">
import { UiAccordion, UiButton, UiIcon } from '../shared/ui'

// const items = ref<string[]>([])
//
// const faq = ref([
//   {
//     title: 'Test 1',
//     text: 'Text 1',
//   },
//   {
//     title: 'Test 1',
//     text: 'Text 1',
//   }
// ])
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

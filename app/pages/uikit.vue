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

    <div class="box" style="display: block">
      <UiAccordion v-model="items" multiple>
        <UiAccordionItem v-for="(item, index) in faq" :key="index" :title="item.title" :name="index + 1">
          {{ item.text }}
        </UiAccordionItem>
      </UiAccordion>
    </div>
  </div>
</template>

<script setup lang="ts">
import { UiAccordion, UiAccordionItem, UiButton, UiIcon } from '../shared/ui'

const items = ref<string[] | string>(['1', '2'])

const faq = ref([
  {
    title: 'Title',
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
  },
  {
    title: 'Title',
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
  },
  {
    title: 'Title',
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
  },
  {
    title: 'Title',
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
  },
])
</script>

<style lang="scss" scoped>
.ui-kit {
  padding: 20px;
}

.box {
  //width: fit-content;
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

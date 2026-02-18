<template>
  <div class="card">
    <div class="card__title">
      <UiIcon name="house" width="25px" height="33px" />

      Guest
    </div>

    <ul class="card__list">
      <li v-for="(item, index) in listItem" :key="index" class="card__item">
        {{ item }}
      </li>
    </ul>

    <slot />
  </div>
</template>

<script setup lang="ts">
import { UiIcon } from '#shared/ui'

const listItem = [
  'Прямая связь с площадкой в режиме реального времени',
  'Актуальная информация, меню, цены, свободные даты',
  'Заказ столика, банкета, доставка еды, аренда помещения под мероприятия — все в одном месте',
  'Онлайн просмотр',
  'Онлайн просмотр',
  'Онлайн просмотр',
  'Онлайн просмотр',
]
</script>

<style scoped lang="scss">
.card {
  min-height: 500px;
  display: flex;
  flex-direction: column;
  border-radius: 40px;
  box-shadow: var(--shadow-md);
  padding: 40px 45px;
  gap: 30px;

  @media (width <= 375px) {
    padding: 40px 15px;
    gap: 20px;
  }

  &__title {
    @include typography(h3);

    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-text-dark);
    gap: 10px;
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  &__item {
    @include typography(body);

    display: flex;
    color: var(--color-text-regular);
    gap: 5px;

    &::before {
      content: '';
      top: 8px;
      width: 4px;
      height: 4px;
      position: relative;
      display: flex;
      flex-shrink: 0;
      border-radius: 100%;
      background-color: var(--color-accent);
    }
  }

  &:deep(.ui-button) {
    align-self: center;
    margin-top: auto;
  }
}
</style>

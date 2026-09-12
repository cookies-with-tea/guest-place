<template>
  <div class="footer">
    <UiIcon name="footer-decor-one" />

    <UiIcon name="footer-decor-two" />

    <div class="container">
      <div class="footer__wrapper">
        <div class="logo">
          <UiIcon name="logo" width="220" height="25" />

          <span class="logo__subtitle"> Интерактивная платформа </span>
        </div>

        <ul class="footer__list">
          <li v-for="({ text, link }, index) in navList" :key="index" class="footer__item">
            <nuxt-link :to="link">
              {{ text }}
            </nuxt-link>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { UiIcon } from '#shared/ui'

const navList = [
  { text: 'О проекте', link: '/' },
  { text: 'Площадкам', link: '/' },
  { text: 'Гостям', link: '/' },
  { text: 'Контакты', link: '/' },
  { text: 'Помощь', link: '/' },
  { text: 'Вакансии', link: '/' },
  { text: 'Техподдержка', link: '/' },
]
</script>

<style scoped lang="scss">
.footer {
  position: relative;
  border-top: 1px solid #3333331a;

  .ui-icon--footer-decor-one,
  .ui-icon--footer-decor-two {
    top: -5px;
    position: absolute;
  }

  .ui-icon--footer-decor {
    &-one {
      left: 0;
      width: 138px;
      height: 141px;

      @include responsive-max(xs) {
        left: 10px;
      }
    }

    &-two {
      right: 0;
      width: 110px;
      height: 132px;

      @include responsive-max(xs) {
        right: 10px;
      }
    }
  }

  &__wrapper {
    display: flex;
    justify-content: space-between;
    padding: 46px 0 73px;

    @include responsive-max(xs) {
      flex-direction: column;
      padding: 50px 0;
    }

    @include responsive-min(xs) {
      align-items: center;
    }
  }

  &__list {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 30px;

    @include responsive-max(xs) {
      display: grid;
      grid-auto-flow: column; /* заполнение по колонкам, а не по строкам */
      grid-template-columns: 1fr 1fr;
      grid-template-rows: repeat(4, auto); /* 4 строки (ceil(7/2) = 4) */
      gap: 10px;
    }
  }

  &__item {
    @include typography(h5);

    a {
      color: var(--color-text-dark);
    }
  }

  @include responsive-max(xs) {
    :deep(.ui-icon) {
      width: 66px;
      height: 66px;
    }
  }
}

.logo {
  display: flex;
  flex-direction: column;
  margin-right: 160px;
  gap: 5px;

  &__subtitle {
    @include typography(body);

    @include responsive-max(xs) {
      max-width: 130px;
      text-align: center;
    }
  }

  @include responsive-max(xs) {
    align-items: center;

    &:deep(.ui-icon--logo) {
      width: 130px;
      height: 15px;
    }
  }

  @include responsive-max(xs) {
    margin-right: 0;
    margin-bottom: 30px;
  }
}
</style>

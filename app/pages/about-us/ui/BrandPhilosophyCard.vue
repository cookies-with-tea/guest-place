<template>
  <div class="card">
    <div class="card__content">
      <div class="card__title"> наша <span>Миссия</span> </div>

      <div class="card__description">
        Соединяем гостей (людей) и места, создавая простоту и прозрачность в “отношениях”. Предоставляем самые
        современные технологии и инструменты для простого и легкого общения. Наши эксперты помогают Гостям найти
        <nuxt-link to="/">«то самое»</nuxt-link>место.
      </div>
    </div>

    <div class="card__img">
      <img src="https://i.pinimg.com/originals/8f/57/f7/8f57f7e33c00c2c120ad00a5765a90db.jpg" />
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped lang="scss">
@use 'styles/helpers/mixins/responsive' as *;

.card {
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  align-items: center;
  gap: 70px;
  color: var(--color-text-dark);

  @include responsive-min(md) {
    flex-direction: row;
  }

  &__img {
    height: 173px;
    width: 100%;

    @include responsive-min(sm) {
      @include fluid-value(height, sm, md, 173px, 240px);
    }

    @include responsive-min(md) {
      @include fluid-value(height, md, xxl, 240px, 285px);
      @include fluid-value(max-width, md, xxl, 370px, 475px);
    }

    @include responsive-min(xxl) {
      height: 285px;
      max-width: 475px;
      width: 100%;
    }

    img {
      object-fit: cover;
      width: 100%;
      height: 100%;
      border-radius: 40px;
    }
  }

  &__title {
    @include typography(h2);

    text-transform: uppercase;
    margin-bottom: 40px;

    & > span {
      color: var(--color-text-accent);
    }
  }

  &__description {
    @include typography(h5);

    & > a {
      color: var(--color-text-accent);
    }
  }

  &__content {
    flex-shrink: 2;
  }
}
</style>

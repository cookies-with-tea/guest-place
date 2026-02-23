<template>
  <div class="card">
    <div class="card__content">
      <div class="card__title">
        наша <span>Миссия</span>
      </div>

      <div class="card__description">
        Соединяем гостей (людей) и места, создавая простоту и прозрачность в “отношениях”. Предоставляем самые
        современные технологии и инструменты для простого и легкого общения.
        Наши эксперты помогают Гостям найти <nuxt-link to="/">«то самое»</nuxt-link>место.
      </div>
    </div>

    <div class="card__img">
      <img
        src="https://cdn-imgix.headout.com/media/images/c9db3cea62133b6a6bb70597326b4a34-388-dubai-img-worlds-of-adventure-tickets-01.jpg?auto=format&w=1222.3999999999999&h=687.6&q=90&ar=16%3A9&crop=faces&fit=crop">
    </div>

  </div>
</template>

<script setup lang="ts">

</script>

<style scoped lang="scss">
.card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 70px;
  color: var(--color-text-dark);

  &__img {
    max-height: 285px;
    max-width: 475px;

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

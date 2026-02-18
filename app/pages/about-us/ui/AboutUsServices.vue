<template>
  <section class="services">
    <div class="services__title"> Возможности <span>GP Platform</span> </div>

    <div class="services__cards">
      <AboutAdvantagesCard v-for="card in 2" :key="card">
        <UiButton size="lg" tag="nuxt-link"> Зарегистрироваться {{ card }} </UiButton>
      </AboutAdvantagesCard>
    </div>
  </section>
</template>

<script setup lang="ts">
import AboutAdvantagesCard from '#entities/services'
import { UiButton } from '#shared/ui'
</script>

<style scoped lang="scss">
@use 'styles/helpers/mixins/responsive' as *;

.services {
  &__title {
    @include typography(h2);

    text-align: center;
    text-transform: uppercase;
    margin-bottom: 50px;

    span {
      color: var(--color-text-accent);
    }
  }

  &__cards {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 30px;

    @include responsive(xs) {
      grid-template-columns: 1fr;
    }
  }
}
</style>

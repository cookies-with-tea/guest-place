<template>
  <div class="innovative-potential">
    <div class="innovative-potential__head">
      <UiIcon name="logo" width="265px" height="31px" />

      <div class="innovative-potential__subtitle">
        Лидерство на рынке обеспечивается нашей талантливой командой, экспертами своего дела
      </div>
    </div>

    <div class="innovative-potential__list">
      <div v-for="card in 2" :key="card" class="innovative-potential__item">
        <UiIcon name="idea" width="44px" height="44px" />

        {{ card }}

        постоянный поиск новых решений и внедрение новых технологий
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { UiIcon } from '#shared/ui'
</script>

<style scoped lang="scss">
@use 'styles/helpers/mixins/responsive' as *;

.innovative-potential {
  display: flex;
  flex-direction: column;
  border-radius: 40px;
  color: var(--color-text-regular);
  background-color: var(--color-accent-2);
  padding: 90px 70px;
  gap: 70px;

  &__head {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 33px;

    &:deep(.ui-icon) {
      width: 240px;
      height: 28px;
    }

    @include responsive-max(xs) {
      gap: 25px;
    }
  }

  &__subtitle {
    @include typography(h5);

    max-width: 540px;
    text-align: center;
  }

  &__list {
    display: flex;
    gap: 30px;

    @include responsive-max(xs) {
      flex-direction: column;
    }
  }

  &__item {
    @include typography(h5);

    display: flex;
    align-items: center;
    gap: 15px;

    @include responsive-max(xs) {
      flex-direction: column;
      text-align: center;
      gap: 10px;
    }
  }

  @include responsive-max(xs) {
    padding: 60px 20px;
    gap: 25px;
  }
}
</style>

<template>
  <div class="platforms">
    <h1>{{ data.hero_title }}</h1>
    <p>{{ data.hero_description }}</p>
  </div>
</template>
<script lang="ts" setup>
import { watch } from 'vue';
import { useCmsPage } from '~/shared/lib/composables';

const defaultPlatformsData = {
  hero_title: 'Площадкам Guest & Place',
  hero_description: 'Размещайте заведения и получайте бронирования напрямую',
  benefits: '',
  pricing_title: '',
}

const { data } = useCmsPage('page_platforms', defaultPlatformsData)

watch(data, (v) => {
  console.log(v)
}, {immediate: true})
</script>
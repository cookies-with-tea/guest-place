<template>
<div>
  <h1>Admin Translations</h1>
  <UiButton>Remote button</UiButton>
  <div>
    <p>
      default numbers: {{ numbers }}
    </p>

    <p>
      remote formatter numbers: {{ formatNumbers(numbers) }}
    </p>
  </div>

  <HelloWorld msg="Vite + Vue" />
</div>
</template>

<script setup lang="ts">
import HelloWorld from './components/HelloWorld.vue'
import { UiButton } from "@admin-panel/ui";
import {formatNumbers} from '@admin-panel/utils'

const numbers = [1, 2, 3, 4]
</script>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>

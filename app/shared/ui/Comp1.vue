<template>
  <div> content {{ a }} </div>

  <button type="button" @click="a = a +=1" style="color: #007bff">
    click me
  </button>

  <button   type="button" @click="a = 1" style="color: forestgreen; margin-left: 10px">
    reset
  </button>
</template>

<script setup lang="ts">
import {ref} from 'vue'

const a = ref(10)

</script>

<style scoped lang="scss"></style>

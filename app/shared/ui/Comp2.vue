<template>
  <div> content {{ a }} </div>

  <button type="button" style="color: #007bff" @click="a = a +=1">
    click me
  </button>

  <button   type="button" style="color: forestgreen; margin-left: 10px" @click="a = 1">
    reset
  </button>
</template>

<script setup lang="ts">
import {ref} from 'vue'

const a = ref(20)
</script>

<style scoped lang="scss"></style>

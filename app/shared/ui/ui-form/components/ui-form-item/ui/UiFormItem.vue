<template>
  <div class="ui-form-item">
    <slot />

    <slot v-if="errorMessage" :error="errorMessage" name="error">
      <span class="ui-form-item__error">
        {{ errorMessage }}
      </span>
    </slot>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useFormErrors } from '../../../composables'

interface IProps {
  name?: string
}

const props = defineProps<IProps>()

const { formErrors } = useFormErrors()

const errorMessage = computed(() => {
  return props.name ? formErrors.value[props.name] : undefined
})
</script>

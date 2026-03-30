import { ref, watch } from "vue";

export const authToken = ref('');

export const useAuthTemp = () => {
  watch(authToken, (v) => {
    localStorage.setItem('authToken', v)
  })

  return {
    authToken,
  }
}

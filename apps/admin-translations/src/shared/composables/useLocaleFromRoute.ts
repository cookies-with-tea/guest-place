import { computed } from 'vue'
import { useRoute } from 'vue-router'

export function useLocaleFromRoute() {
	const route = useRoute()

	return computed(() => (route.params.locale as string) || 'en')
}

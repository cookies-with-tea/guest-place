import { defineAsyncComponent } from 'vue'

// Lazy — see ui-area-chart/index.ts.
export default defineAsyncComponent(() => import('./ui/UiDonutProgress.vue'))

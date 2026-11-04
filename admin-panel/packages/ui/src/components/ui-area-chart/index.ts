import { defineAsyncComponent } from 'vue'

// Lazy — pulls in echarts/vue-echarts (the main contributor to the ~1.66 MB
// @admin-panel/ui federation shared chunk), which only `admin-orchestrator`'s
// monitoring page actually renders. Same pattern as RichTextFullEditor.vue.
export default defineAsyncComponent(() => import('./ui/UiAreaChart.vue'))

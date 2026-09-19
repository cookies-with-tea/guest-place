<template>
  <div class="preview-page" :class="{ 'is-ready': isReady }">
    <!-- Preview toolbar -->
    <div class="preview-bar">
      <div class="preview-bar__left">
        <span class="preview-bar__badge">LIVE PREVIEW</span>
        <span v-if="schema" class="preview-bar__schema">{{ schema.name }}</span>
      </div>
      <div class="preview-bar__right">
        <span v-if="lastUpdated" class="preview-bar__time">
          Updated {{ lastUpdatedFormatted }}
        </span>
        <div class="preview-bar__indicator" :class="{ 'is-active': isReceiving }" />
      </div>
    </div>

    <!-- Waiting state -->
    <div v-if="!isReady" class="preview-waiting">
      <div class="preview-waiting__icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12Z" stroke="currentColor" stroke-width="1.5"/>
          <path d="M8 12H16M12 8L16 12L12 16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <h2 class="preview-waiting__title">Waiting for preview data</h2>
      <p class="preview-waiting__desc">
        Open the content editor in the admin panel and click <strong>Live Preview</strong> to see changes here in real-time.
      </p>
    </div>

    <!-- Content area -->
    <div v-else class="preview-content">
      <!-- Schema info header -->
      <div class="preview-content__header">
        <h1 class="preview-content__title">
          {{ getTitle() }}
        </h1>
        <div v-if="schema" class="preview-content__meta">
          <span class="preview-content__schema-tag">{{ schema.name }}</span>
          <span v-if="data._seo?.title" class="preview-content__seo-info">
            SEO: {{ data._seo.title }}
          </span>
        </div>
      </div>

      <!-- Dynamic content fields -->
      <div class="preview-fields">
        <template v-for="field in schema?.fields" :key="field.name">
          <div v-if="data[field.name] !== undefined && data[field.name] !== null && data[field.name] !== ''" class="preview-field">
            <div class="preview-field__label">{{ field.label }}</div>

            <!-- RichText -->
            <div
              v-if="field.fieldType === 'RichText'"
              class="preview-field__richtext"
              v-html="data[field.name]"
            />

            <!-- Boolean -->
            <div v-else-if="field.fieldType === 'Boolean'" class="preview-field__bool">
              <span class="preview-field__bool-icon" :class="data[field.name] ? 'is-true' : 'is-false'">
                {{ data[field.name] ? '✓ Yes' : '✗ No' }}
              </span>
            </div>

            <!-- Date -->
            <div v-else-if="field.fieldType === 'Date'" class="preview-field__value">
              {{ data[field.name] ? new Date(data[field.name]).toLocaleDateString('ru-RU') : '—' }}
            </div>

            <!-- Number -->
            <div v-else-if="field.fieldType === 'Number'" class="preview-field__value preview-field__value--number">
              {{ data[field.name] }}
            </div>

            <!-- Media -->
            <div v-else-if="field.fieldType === 'Media'" class="preview-field__media">
              <img
                v-if="isImageUrl(data[field.name])"
                :src="resolveMediaUrl(data[field.name])"
                :alt="field.label"
                class="preview-field__image"
              />
              <a v-else :href="resolveMediaUrl(data[field.name])" target="_blank" class="preview-field__file-link">
                📎 {{ getFileName(data[field.name]) }}
              </a>
            </div>

            <!-- Text / default -->
            <div v-else class="preview-field__value">
              {{ data[field.name] }}
            </div>
          </div>
        </template>
      </div>

      <!-- SEO preview section -->
      <div v-if="data._seo && (data._seo.title || data._seo.description)" class="preview-seo">
        <div class="preview-seo__label">SEO Preview</div>
        <div class="preview-seo__card">
          <div class="preview-seo__url">{{ seoUrl }}</div>
          <div class="preview-seo__title">{{ data._seo.title || getTitle() }}</div>
          <div class="preview-seo__desc">{{ data._seo.description || 'No description' }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const isReady = ref(false)
const isReceiving = ref(false)
const lastUpdated = ref<Date | null>(null)
const data = ref<Record<string, any>>({})
const seo = ref<any>({})
const schema = ref<any>(null)

const lastUpdatedFormatted = computed(() => {
  if (!lastUpdated.value) return ''
  return lastUpdated.value.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
})

const seoUrl = computed(() => {
  const baseUrl = window.location.origin
  return `${baseUrl}/${schema.value?.slug || ''}`
})

// Notify admin panel that we are ready
const sendReadySignal = () => {
  try {
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ type: 'PREVIEW_READY' }, '*')
    }
    if (window.opener) {
      window.opener.postMessage({ type: 'PREVIEW_READY' }, '*')
    }
  } catch (e) {
    console.warn('[LivePreview] Error sending ready signal:', e)
  }
}

const fetchFallbackData = async () => {
  const schemaSlug = route.query.schema as string
  const entryId = route.query.id as string

  if (!schemaSlug) return

  try {
    const backendUrl = (window as any).__NUXT__?.config?.public?.env?.NUXT_BACKEND_BASE_URI || 'http://localhost:8000'
    const schemaRes = await fetch(`${backendUrl}/api/v1/content/schemas/${schemaSlug}`).then((r) => r.json())
    if (schemaRes?.data) {
      schema.value = schemaRes.data
    }

    if (entryId && entryId !== 'new') {
      const entryRes = await fetch(`${backendUrl}/api/v1/content/entries/${entryId}`).then((r) => r.json())
      if (entryRes?.data) {
        data.value = entryRes.data.data || {}
        if (entryRes.data.seo) seo.value = entryRes.data.seo
      }
    }

    if (schema.value) {
      isReady.value = true
    }
  } catch (e) {
    console.warn('[LivePreview] Fallback API fetch failed:', e)
  }
}

const handleMessage = (event: MessageEvent) => {
  if (event.data?.type !== 'CMS_PREVIEW_DATA') return

  const payload = event.data.payload
  if (!payload) return

  isReceiving.value = true
  lastUpdated.value = new Date()

  if (payload.data) data.value = payload.data
  if (payload.seo) seo.value = payload.seo
  if (payload.schema) schema.value = payload.schema

  isReady.value = true

  // Reset receiving indicator after 1s
  setTimeout(() => {
    isReceiving.value = false
  }, 1000)
}

const getTitle = () => {
  if (!schema.value?.fields) return 'Preview'
  // Try to find a "title", "name", "heading" field
  const titleFieldNames = ['title', 'name', 'heading', 'label', 'subject']
  for (const name of titleFieldNames) {
    const field = schema.value.fields.find((f: any) => f.name === name)
    if (field && data.value[name]) return data.value[name]
  }
  // Fallback: first text field
  const firstTextField = schema.value.fields.find((f: any) => f.fieldType === 'Text')
  if (firstTextField && data.value[firstTextField.name]) {
    return data.value[firstTextField.name]
  }
  return schema.value.name || 'Preview'
}

const resolveMediaUrl = (url: string) => {
  if (!url) return ''
  if (url.startsWith('http')) return url
  const backendUrl = (window as any).__NUXT__?.config?.public?.env?.NUXT_BACKEND_BASE_URI || 'http://localhost:8000'
  return `${backendUrl}${url}`
}

const isImageUrl = (url: string) => {
  if (!url) return false
  return /\.(jpg|jpeg|png|gif|webp|avif|svg)(\?.*)?$/i.test(url)
}

const getFileName = (url: string) => {
  if (!url) return 'File'
  return url.split('/').pop() || 'File'
}

onMounted(() => {
  window.addEventListener('message', handleMessage)
  // Signal readiness immediately
  sendReadySignal()

  // Retry signal after short delay to catch late parent listeners
  setTimeout(sendReadySignal, 300)
  setTimeout(sendReadySignal, 800)

  // If still not ready after 1.2s (e.g. opened standalone in new tab), load from API:
  setTimeout(() => {
    if (!isReady.value) {
      fetchFallbackData()
    }
  }, 1200)
})

onBeforeUnmount(() => {
  window.removeEventListener('message', handleMessage)
})
</script>

<style lang="scss" scoped>
.preview-page {
  min-height: 100vh;
  background: #0f1117;
  color: #e2e8f0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  transition: opacity 0.3s ease;
}

/* Preview top bar */
.preview-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 20px;
  background: #1a1f2e;
  border-bottom: 1px solid rgba(99, 102, 241, 0.3);
  position: sticky;
  top: 0;
  z-index: 100;
}

.preview-bar__left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.preview-bar__badge {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: #a5b4fc;
  background: rgba(99, 102, 241, 0.15);
  border: 1px solid rgba(99, 102, 241, 0.4);
  border-radius: 4px;
  padding: 3px 8px;
}

.preview-bar__schema {
  font-size: 13px;
  font-weight: 600;
  color: #94a3b8;
}

.preview-bar__right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.preview-bar__time {
  font-size: 12px;
  color: #64748b;
}

.preview-bar__indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #334155;
  transition: background 0.3s ease;

  &.is-active {
    background: #22c55e;
    box-shadow: 0 0 6px #22c55e;
    animation: pulse 1s ease infinite;
  }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Waiting state */
.preview-waiting {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 48px);
  padding: 40px;
  text-align: center;
  gap: 20px;
}

.preview-waiting__icon {
  color: #4f46e5;
  opacity: 0.6;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

.preview-waiting__title {
  font-size: 22px;
  font-weight: 700;
  color: #e2e8f0;
  margin: 0;
}

.preview-waiting__desc {
  font-size: 14px;
  color: #64748b;
  max-width: 420px;
  line-height: 1.7;
  margin: 0;

  strong {
    color: #a5b4fc;
  }
}

/* Content area */
.preview-content {
  max-width: 860px;
  margin: 0 auto;
  padding: 40px 24px;
}

.preview-content__header {
  margin-bottom: 40px;
  padding-bottom: 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.preview-content__title {
  font-size: 32px;
  font-weight: 800;
  color: #f1f5f9;
  margin: 0 0 12px;
  line-height: 1.2;
}

.preview-content__meta {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.preview-content__schema-tag {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #818cf8;
  background: rgba(99, 102, 241, 0.12);
  border: 1px solid rgba(99, 102, 241, 0.25);
  border-radius: 4px;
  padding: 2px 8px;
  text-transform: uppercase;
}

.preview-content__seo-info {
  font-size: 12px;
  color: #64748b;
}

/* Fields */
.preview-fields {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.preview-field {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.preview-field__label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #475569;
}

.preview-field__value {
  font-size: 16px;
  color: #cbd5e1;
  line-height: 1.6;

  &--number {
    font-size: 24px;
    font-weight: 700;
    color: #818cf8;
  }
}

.preview-field__richtext {
  font-size: 16px;
  color: #cbd5e1;
  line-height: 1.8;

  :deep(h1), :deep(h2), :deep(h3) {
    color: #f1f5f9;
    font-weight: 700;
    margin: 1.5em 0 0.5em;
    line-height: 1.3;
  }

  :deep(h1) { font-size: 28px; }
  :deep(h2) { font-size: 22px; }
  :deep(h3) { font-size: 18px; }

  :deep(p) { margin: 0.8em 0; }

  :deep(strong) { color: #e2e8f0; font-weight: 700; }
  :deep(em) { color: #a5b4fc; }
  :deep(u) { text-decoration: underline; text-underline-offset: 3px; }
  :deep(s) { opacity: 0.5; }

  :deep(mark) {
    background: rgba(234, 179, 8, 0.2);
    color: #fde68a;
    padding: 1px 3px;
    border-radius: 2px;
  }

  :deep(code) {
    font-family: 'JetBrains Mono', monospace;
    background: rgba(99, 102, 241, 0.15);
    color: #a5b4fc;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 0.9em;
  }

  :deep(pre) {
    background: #1e2336;
    border: 1px solid rgba(99, 102, 241, 0.2);
    border-radius: 8px;
    padding: 16px 20px;
    overflow-x: auto;

    code {
      background: none;
      padding: 0;
      color: #a5b4fc;
    }
  }

  :deep(blockquote) {
    border-left: 3px solid #4f46e5;
    margin: 1.5em 0;
    padding: 8px 16px;
    color: #94a3b8;
    font-style: italic;
    background: rgba(99, 102, 241, 0.05);
    border-radius: 0 8px 8px 0;
  }

  :deep(ul), :deep(ol) {
    margin: 0.8em 0;
    padding-left: 1.5em;

    li { margin: 0.3em 0; }
  }

  :deep(a) {
    color: #818cf8;
    text-decoration: underline;
    text-underline-offset: 3px;

    &:hover { color: #a5b4fc; }
  }

  :deep(hr) {
    border: none;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    margin: 2em 0;
  }
}

.preview-field__bool {
  display: flex;
  align-items: center;
}

.preview-field__bool-icon {
  font-size: 14px;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 20px;

  &.is-true {
    background: rgba(34, 197, 94, 0.15);
    color: #4ade80;
    border: 1px solid rgba(34, 197, 94, 0.3);
  }

  &.is-false {
    background: rgba(239, 68, 68, 0.1);
    color: #f87171;
    border: 1px solid rgba(239, 68, 68, 0.2);
  }
}

.preview-field__media {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.preview-field__image {
  max-width: 100%;
  max-height: 480px;
  border-radius: 12px;
  object-fit: cover;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.preview-field__file-link {
  font-size: 14px;
  color: #818cf8;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 6px;

  &:hover { color: #a5b4fc; }
}

/* SEO Preview card */
.preview-seo {
  margin-top: 48px;
  padding-top: 32px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.preview-seo__label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #475569;
  margin-bottom: 12px;
}

.preview-seo__card {
  background: #1a1f2e;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-width: 600px;
}

.preview-seo__url {
  font-size: 12px;
  color: #22c55e;
  font-family: monospace;
}

.preview-seo__title {
  font-size: 18px;
  color: #818cf8;
  font-weight: 600;
  line-height: 1.3;
}

.preview-seo__desc {
  font-size: 13px;
  color: #94a3b8;
  line-height: 1.5;
}
</style>

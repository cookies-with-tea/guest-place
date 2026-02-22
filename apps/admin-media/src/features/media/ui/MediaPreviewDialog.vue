<template>
  <Dialog
    v-model:visible="visible"
    :header="media.title || 'Media Preview'"
    :modal="true"
    class="media-preview-dialog"
    :style="{ width: '80vw', maxWidth: '900px' }"
  >
    <div class="media-preview-content">
      <div v-if="isImage(media)" class="image-preview-large">
        <img
          :src="media.url"
          :alt="media.alt || media.title || 'Media preview'"
          class="preview-image"
        />
      </div>
      <div v-else class="video-preview-large">
        <video controls :src="media.url" class="preview-video">
          <source :src="media.url" :type="getMimeType(media.url)" />
          Your browser does not support the video tag.
        </video>
      </div>
      <div class="media-info">
        <h3>{{ media.title || 'Untitled' }}</h3>
        <p v-if="media.alt" class="alt-text">
          <strong>Alt Text:</strong> {{ media.alt }}
        </p>
        <p class="file-info">
          <strong>File:</strong> {{ media.filename || 'unknown' }}
        </p>
        <p class="file-info">
          <strong>Size:</strong> {{ formatFileSize(media.size) }}
        </p>
        <p class="file-info">
          <strong>Added:</strong> {{ formatDate(media.createdAt) }}
        </p>
      </div>
    </div>
    <template #footer>
      <Button
        label="Close"
        icon="pi pi-times"
        @click="handleClose"
      />
      <Button
        v-if="showEditButton"
        label="Edit"
        icon="pi pi-pencil"
        class="p-button-success"
        @click="handleEdit"
      />
    </template>
  </Dialog>
</template>

<script setup lang="ts" generic="T extends MediaItem">
import { computed } from 'vue'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import type { MediaItem } from '@/entities/media/model'
import { mediaUtils } from '@/entities/media/utils/media.utils'

interface Props {
  media: T
  showEditButton?: boolean
}

interface Emits {
  (e: 'edit', media: T): void
  (e: 'close'): void
}

const visible = defineModel({
  type: Boolean,
  required: true,
})

const props = withDefaults(defineProps<Props>(), {
  showEditButton: true
})

const emit = defineEmits<Emits>()

// Computed
const isImage = computed(() => {
  return mediaUtils.isImage(props.media.url)
})

// Methods
const handleClose = () => {
  emit('update:visible', false)
  emit('close')
}

const handleEdit = () => {
  emit('edit', props.media)
  emit('update:visible', false)
}

const formatFileSize = (bytes: number): string => {
  return mediaUtils.formatFileSize(bytes)
}

const formatDate = (date: Date): string => {
  return mediaUtils.formatDate(date)
}

const getMimeType = (filename: string): string => {
  return mediaUtils.getMimeType(filename)
}
</script>

<style scoped>
.media-preview-dialog :deep(.p-dialog-header) {
  background: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
}

.media-preview-dialog :deep(.p-dialog-content) {
  padding: 0;
}

.media-preview-content {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
  padding: 2rem;
}

.image-preview-large img {
  max-width: 100%;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.video-preview-large video {
  max-width: 100%;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.media-info {
  flex: 1;
  min-width: 250px;
}

.media-info h3 {
  margin-top: 0;
  color: #333;
}

.alt-text {
  color: #666;
  margin: 0.5rem 0;
}

.file-info {
  color: #666;
  margin: 0.25rem 0;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .media-preview-content {
    flex-direction: column;
  }
}
</style>

<template>
  <div class="media-management">
    <div class="media-header">
      <h1>Media Management</h1>
      <div class="media-actions">
        <Button
          label="Add Media"
          icon="pi pi-plus"
          severity="success"
          @click="showAddMediaDialog"
        />
        <Button
          label="Delete Selected"
          icon="pi pi-trash"
          severity="danger"
          :disabled="selectedMedia.length === 0"
          @click="confirmDeleteSelected"
        />

        <TempAuth />
      </div>
    </div>

    <MediaManagementWidget
      :media-items="mediaItems"
      :loading="loading"
      :show-selection="true"
      :show-actions="true"
      :show-add-button="false"
      :show-delete-button="false"
      :show-search="true"
      :paginator-enabled="true"
      :rows-per-page="10"
      :rows-per-page-options="[5, 10, 20, 50]"
      @edit-media="editMedia"
      @delete-media="confirmDelete"
      @preview-media="previewMedia"
      @selection-change="onSelectionChange"
    />

    <!-- Add/Edit Media Dialog -->
    <MediaUploadDialog
      v-model="mediaDialog.visible"
      :is-edit="mediaDialog.isEdit"
      :media="mediaDialog.isEdit && currentMediaForEdit ? currentMediaForEdit : undefined"
      @submit="saveMedia"
      @cancel="closeMediaDialog"
    />

    <!-- Media Preview Dialog -->
    <MediaPreviewDialog
      v-model="previewDialog.visible"
      :media="previewDialog.media"
      @edit="editMedia"
      @close="closePreviewDialog"
    />

    <!-- Confirmation Dialog -->
    <ConfirmDialog />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useConfirm } from 'primevue/useconfirm'
import Button from 'primevue/button'
import ConfirmDialog from 'primevue/confirmdialog'
import MediaManagementWidget from '@/widgets/media/ui/MediaManagementWidget.vue'
import MediaUploadDialog from '@/features/media/ui/MediaUploadDialog.vue'
import MediaPreviewDialog from '@/features/media/ui/MediaPreviewDialog.vue'
import { useMedia } from '@/entities/media/lib/composables/useMedia'
import type { MediaItem } from '#entities/media'
import TempAuth from '#features/temp-auth/TempAuth.vue'

const confirm = useConfirm()

// State
const selectedMedia = ref<MediaItem[]>([])

// Composition API
const {
  mediaItems,
  loading,
  error,
  loadMedia,
  createMedia,
  updateMedia,
  deleteMedia,
  deleteMultipleMedia
} = useMedia()

// Dialog state
const mediaDialog = ref({
  visible: false,
  isEdit: false
})

const previewDialog = ref({
  visible: false,
  media: {} as MediaItem
})

const currentMediaForEdit = ref<MediaItem | null>(null)

// Lifecycle
onMounted(() => {
  loadMedia()
})

// Methods
const showAddMediaDialog = () => {
  mediaDialog.value.visible = true
  mediaDialog.value.isEdit = false
  currentMediaForEdit.value = null
}

const editMedia = (media: MediaItem) => {
  currentMediaForEdit.value = media
  mediaDialog.value.visible = true
  mediaDialog.value.isEdit = true
}

const saveMedia = async (formData: { title?: string; alt?: string; file?: File }) => {
  try {
    if (mediaDialog.value.isEdit && currentMediaForEdit.value) {
      await updateMedia({
        id: currentMediaForEdit.value.id,
        title: formData.title,
        alt: formData.alt
      })
    } else {
      if (!formData.file) {
        throw new Error('File is required')
      }
      await createMedia({
        title: formData.title,
        alt: formData.alt,
        file: formData.file
      })
    }
    closeMediaDialog()
  } catch (error) {
    console.error('Failed to save media:', error)
  }
}

const confirmDelete = (media: MediaItem) => {
  confirm.require({
    message: `Are you sure you want to delete "${media.title || 'this media item'}"?`,
    header: 'Confirmation',
    icon: 'pi pi-exclamation-triangle',
    accept: () => {
      deleteMedia(media.id)
    },
    reject: () => {
      // Do nothing
    }
  })
}

const confirmDeleteSelected = () => {
  confirm.require({
    message: `Are you sure you want to delete ${selectedMedia.value.length} selected media items?`,
    header: 'Confirmation',
    icon: 'pi pi-exclamation-triangle',
    accept: () => {
      const ids = selectedMedia.value.map(m => m.id)
      deleteMultipleMedia(ids)
      selectedMedia.value = []
    },
    reject: () => {
      // Do nothing
    }
  })
}

const previewMedia = (media: MediaItem) => {
  previewDialog.value.media = media
  previewDialog.value.visible = true
}

const onSelectionChange = (media: MediaItem[]) => {
  selectedMedia.value = media
}

const closeMediaDialog = () => {
  mediaDialog.value.visible = false
}

const closePreviewDialog = () => {
  previewDialog.value.visible = false
}
</script>

<style scoped>
.media-management {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.media-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.media-header h1 {
  color: #333;
  font-size: 2rem;
  margin: 0;
}

.media-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .media-management {
    padding: 1rem;
  }

  .media-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .media-actions {
    width: 100%;
    justify-content: space-between;
  }
}
</style>

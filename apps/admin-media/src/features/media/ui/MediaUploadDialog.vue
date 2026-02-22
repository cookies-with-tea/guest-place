<template>
  <Dialog
    v-model:visible="visible"
    :header="isEdit ? 'Edit Media' : 'Upload New Media'"
    :modal="true"
    class="media-upload-dialog"
    :style="{ width: '600px' }"
  >
    <form @submit.prevent="handleSubmit">
      <div class="p-fluid">
        <div class="p-field">
          <label for="mediaTitle">Title</label>
          <InputText
            id="mediaTitle"
            v-model="formData.title"
            placeholder="Enter media title"
            :invalid="!!errors.title"
          />
          <small v-if="errors.title" class="p-error">{{ errors.title }}</small>
        </div>
        <div class="p-field">
          <label for="mediaAlt">Alt Text</label>
          <InputText
            id="mediaAlt"
            v-model="formData.alt"
            placeholder="Enter alt text for accessibility"
            :invalid="!!errors.alt"
          />
          <small v-if="errors.alt" class="p-error">{{ errors.alt }}</small>
        </div>
        <div class="p-field">
          <label for="mediaFile">File</label>
          <div
            class="file-upload-area"
            @click="triggerFileInput"
            @dragover.prevent="handleDragover"
            @drop.prevent="handleDrop"
          >
            <input
              type="file"
              id="mediaFileInput"
              ref="fileInput"
              @change="handleFileChange"
              accept="image/*,video/*,.svg"
              style="display: none"
            />
            <div v-if="!formData.file" class="upload-placeholder">
              <i class="pi pi-cloud-upload" />
              <p>Drag & drop files here or click to browse</p>
              <small>Supported: JPG, PNG, GIF, SVG, MP4, AVI, etc. Max 50MB</small>
            </div>
            <div v-else class="file-preview">
              <div v-if="isImage(formData.file)" class="image-preview">
                <img :src="formData.file.preview" alt="Preview" />
                <span>{{ formData.file.name }}</span>
              </div>
              <div v-else class="video-preview">
                <video controls :src="formData.file.preview">
                  <source :src="formData.file.preview" :type="getMimeType(formData.file.name)" />
                  Your browser does not support the video tag.
                </video>
                <span>{{ formData.file.name }}</span>
              </div>
              <Button
                icon="pi pi-times"
                class="p-button-rounded p-button-danger p-button-text"
                @click="removeFile"
                aria-label="Remove file"
              />
            </div>
          </div>
          <small v-if="errors.file" class="p-error">{{ errors.file }}</small>
        </div>
      </div>
    </form>
    <template #footer>
      <Button
        label="Cancel"
        icon="pi pi-times"
        class="p-button-text"
        @click="handleCancel"
      />
      <Button
        label="Save"
        icon="pi pi-check"
        class="p-button-success"
        @click="handleSubmit"
        :disabled="!isFormValid"
        :loading="loading"
      />
    </template>
  </Dialog>
</template>

<script setup lang="ts" generic="T extends MediaItem">
import { ref, computed, watch } from 'vue'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import type { MediaItem, MediaFile } from '@/entities/media/model'
import { mediaUtils } from '#entities/media'

interface Props {
  isEdit?: boolean
  media?: T
}

interface Emits {
  (e: 'submit', data: { title?: string; alt?: string; file?: File }): void
  (e: 'cancel'): void
}

const visible = defineModel({
  type: Boolean,
  required: true,
})
const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// State
const formData = ref({
  title: '',
  alt: '',
  file: null as MediaFile | null
})

const errors = ref({
  title: '',
  alt: '',
  file: ''
})

const loading = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

// Computed
const isFormValid = computed(() => {
  return !errors.value.title && !errors.value.alt && (!props.isEdit || !!formData.value.file)
})

// Watch for prop changes
watch(visible, (newVal) => {
  if (newVal && props.media && props.isEdit) {
    formData.value.title = props.media.title || ''
    formData.value.alt = props.media.alt || ''
    formData.value.file = null
  } else if (newVal) {
    resetForm()
  }
})

// Methods
const handleSubmit = () => {
  if (!validateForm()) return

  loading.value = true
  try {
    const submitData = {
      title: formData.value.title || undefined,
      alt: formData.value.alt || undefined,
      file: formData.value.file?.file
    }
    emit('submit', submitData)
  } finally {
    loading.value = false
  }
}

const handleCancel = () => {
  visible.value = false
  emit('cancel')
}

const validateForm = (): boolean => {
  let isValid = true

  // Validate title (optional but max length)
  if (formData.value.title && formData.value.title.length > 100) {
    errors.value.title = 'Title must be less than 100 characters'
    isValid = false
  } else {
    errors.value.title = ''
  }

  // Validate alt text (optional but max length)
  if (formData.value.alt && formData.value.alt.length > 200) {
    errors.value.alt = 'Alt text must be less than 200 characters'
    isValid = false
  } else {
    errors.value.alt = ''
  }

  // Validate file (required for new media)
  if (!props.isEdit && !formData.value.file) {
    errors.value.file = 'Please select a file'
    isValid = false
  } else {
    errors.value.file = ''
  }

  return isValid
}

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    const file = target.files[0]
    const validation = mediaUtils.validateMediaFile(file)
    if (!validation.valid) {
      errors.value.file = validation.message || 'Invalid file'
      return
    }
    processFile(file)
  }
}

const processFile = (file: File) => {
  mediaUtils.createFilePreview(file).then((preview) => {
    formData.value.file = {
      file,
      name: file.name,
      type: file.type,
      size: file.size,
      preview
    }
    errors.value.file = ''
  }).catch(() => {
    errors.value.file = 'Failed to process file'
  })
}

const removeFile = () => {
  formData.value.file = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
  errors.value.file = ''
}

const triggerFileInput = () => {
  if (fileInput.value) {
    fileInput.value.click()
  }
}

const handleDragover = (event: DragEvent) => {
  if (event.dataTransfer?.dropEffect) {
    event.dataTransfer.dropEffect = 'copy'
  }
}

const handleDrop = (event: DragEvent) => {
  const files = event.dataTransfer?.files
  if (files && files.length > 0) {
    const file = files[0]
    const validation = mediaUtils.validateMediaFile(file)
    if (!validation.valid) {
      errors.value.file = validation.message || 'Invalid file'
      return
    }
    processFile(file)
  }
}

const isImage = (file: MediaFile | null): boolean => {
  return file ? mediaUtils.isImage(file.file) : false
}

const getMimeType = (filename: string): string => {
  return mediaUtils.getMimeType(filename)
}

const resetForm = () => {
  formData.value = {
    title: '',
    alt: '',
    file: null
  }
  errors.value = {
    title: '',
    alt: '',
    file: ''
  }
}
</script>

<style scoped>
.media-upload-dialog :deep(.p-dialog-header) {
  background: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
}

.media-upload-dialog :deep(.p-dialog-content) {
  padding: 2rem;
}

.file-upload-area {
  border: 2px dashed #ccc;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 0.5rem;
}

.file-upload-area:hover {
  border-color: #6366f1;
  background-color: rgba(99, 102, 241, 0.05);
}

.upload-placeholder {
  color: #666;
}

.upload-placeholder i {
  font-size: 2rem;
  margin-bottom: 1rem;
  display: block;
}

.file-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.image-preview img {
  max-width: 200px;
  max-height: 150px;
  border-radius: 4px;
}

.video-preview video {
  max-width: 200px;
  max-height: 150px;
  border-radius: 4px;
}

.p-error {
  color: #f44336;
  font-size: 0.75rem;
  display: block;
  margin-top: 0.25rem;
}
</style>

<template>
  <div class="media-management-widget">
    <div class="widget-header">
      <h2>{{ title }}</h2>
      <div class="widget-actions">
        <Button
          v-if="showAddButton"
          label="Add Media"
          icon="pi pi-plus"
          severity="success"
          @click="emit('add-media')"
          size="small"
        />
        <Button
          v-if="showDeleteButton && selectedMedia.length > 0"
          label="Delete Selected"
          icon="pi pi-trash"
          severity="danger"
          @click="emit('delete-selected', selectedMedia)"
          size="small"
        />
      </div>
    </div>

    <DataTable
      :value="mediaItems"
      :paginator="paginatorEnabled"
      :rows="rowsPerPage"
      :rowsPerPageOptions="rowsPerPageOptions"
      paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
      :currentPageReportTemplate="'Showing {first} to {last} of {totalRecords} media items'"
      :selection="selectedMedia"
      @selection-change="onSelectionChange"
      dataKey="id"
      v-model:filters="filters"
      filterDisplay="menu"
      :globalFilterFields="['title', 'alt']"
      class="media-table"
      :loading="loading"
      :scrollable="true"
      scrollHeight="flex"
    >
      <template #header>
        <div class="table-header">
          <span v-if="showSearch" class="p-input-icon-left">
            <i class="pi pi-search" />
            <InputText v-model="filters['global'].value" :placeholder="searchPlaceholder" />
          </span>
        </div>
      </template>

      <Column v-if="showSelection" selectionMode="multiple" headerStyle="width: 3rem" />
      <Column field="thumbnail" header="Thumbnail" style="width: 100px">
        <template #body="slotProps">
          <div class="media-thumbnail" @click="emit('preview-media', slotProps.data)">
            <img
              :src="slotProps.data.url"
              :alt="slotProps.data.alt || 'Media thumbnail'"
              class="thumbnail-image"
              @error="handleImageError"
            />
          </div>
        </template>
      </Column>
      <Column field="title" header="Title" sortable>
        <template #body="slotProps">
          <span class="media-title">{{ slotProps.data.title || 'Untitled' }}</span>
        </template>
      </Column>
      <Column field="alt" header="Alt Text" sortable>
        <template #body="slotProps">
          <span class="media-alt">{{ slotProps.data.alt || '-' }}</span>
        </template>
      </Column>
      <Column field="size" header="Size" sortable>
        <template #body="slotProps">
          <span>{{ formatFileSize(slotProps.data.size) }}</span>
        </template>
      </Column>
      <Column field="createdAt" header="Date Added" sortable>
        <template #body="slotProps">
          <span>{{ formatDate(slotProps.data.createdAt) }}</span>
        </template>
      </Column>
      <Column v-if="showActions" header="Actions" style="width: 120px">
        <template #body="slotProps">
          <Button
            icon="pi pi-eye"
            class="p-button-rounded p-button-info p-button-text"
            @click="emit('preview-media', slotProps.data)"
            aria-label="Preview"
          />
          <Button
            icon="pi pi-pencil"
            class="p-button-rounded p-button-success p-button-text"
            @click="emit('edit-media', slotProps.data)"
            aria-label="Edit"
          />
          <Button
            icon="pi pi-trash"
            class="p-button-rounded p-button-danger p-button-text"
            @click="emit('delete-media', slotProps.data)"
            aria-label="Delete"
          />
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup lang="ts" generic="T extends MediaItem">
import { ref, watch } from 'vue'
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'
import type { MediaItem } from '@/entities/media/model'

interface Props {
  title?: string
  mediaItems: T[]
  loading?: boolean
  showSelection?: boolean
  showActions?: boolean
  showAddButton?: boolean
  showDeleteButton?: boolean
  showSearch?: boolean
  searchPlaceholder?: string
  paginatorEnabled?: boolean
  rowsPerPage?: number
  rowsPerPageOptions?: number[]
}

interface Emits {
  (e: 'add-media'): void
  (e: 'edit-media', media: T): void
  (e: 'delete-media', media: T): void
  (e: 'delete-selected', media: T[]): void
  (e: 'preview-media', media: T): void
  (e: 'selection-change', media: T[]): void
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Media Management',
  loading: false,
  showSelection: true,
  showActions: true,
  showAddButton: true,
  showDeleteButton: true,
  showSearch: true,
  searchPlaceholder: 'Search media...',
  paginatorEnabled: true,
  rowsPerPage: 10,
  rowsPerPageOptions: () => [5, 10, 20, 50]
})

const emit = defineEmits<Emits>()

// State
const selectedMedia = ref<T[]>([])
const filters = ref({
  global: { value: null },
  title: { value: null },
  alt: { value: null }
})

// Watch for external changes to mediaItems
watch(() => props.mediaItems, () => {
  // Reset selection when media items change
  selectedMedia.value = []
}, { deep: true })

// Methods
const onSelectionChange = (event: any) => {
  selectedMedia.value = event.data
  emit('selection-change', selectedMedia.value)
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatDate = (date: Date): string => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjZjNmNGY2Ii8+Cjx0ZXh0IHg9IjMwIiB5PSI0MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjNjY2Ij5JbWFnZSB0aGUgbWVkaWE8L3RleHQ+Cjwvc3ZnPgo='
}
</script>

<style scoped>
.media-management-widget {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
}

.widget-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.widget-header h2 {
  color: #333;
  font-size: 1.5rem;
  margin: 0;
}

.widget-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.media-table {
  margin-bottom: 1rem;
}

.media-thumbnail {
  cursor: pointer;
  overflow: hidden;
  border-radius: 4px;
  transition: transform 0.2s ease;
}

.media-thumbnail:hover {
  transform: scale(1.05);
}

.thumbnail-image {
  width: 100%;
  height: 60px;
  object-fit: cover;
  display: block;
}

.media-title, .media-alt {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
  display: block;
}

.table-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1rem;
}

.table-header .p-input-icon-left {
  width: 100%;
}

@media (max-width: 768px) {
  .widget-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .widget-actions {
    width: 100%;
    justify-content: space-between;
  }
}
</style>

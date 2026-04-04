<template>
  <div class="media-management-widget">
    <div class="widget-header">
      <h2>{{ title }}</h2>
      <div class="widget-actions">
        <el-button
          v-if="showAddButton"
          type="success"
          :icon="Plus"
          @click="addMedia"
          size="small"
        >
          Add Media
        </el-button>
        <el-button
          v-if="showDeleteButton && selectedMedia.length > 0"
          type="danger"
          :icon="Delete"
          @click="deleteSelected"
          size="small"
        >
          Delete Selected
        </el-button>
      </div>
    </div>

    <div v-if="showSearch" class="table-toolbar">
      <el-input
        v-model="searchQuery"
        :placeholder="searchPlaceholder"
        :prefix-icon="Search"
        clearable
        class="search-input"
        @input="onSearch"
      />
    </div>

    <el-table
      v-loading="loading"
      :data="mediaItems"
      style="width: 100%"
      @selection-change="handleSelectionChange"
      class="media-table"
    >
      <el-table-column v-if="showSelection" type="selection" width="55" />
      
      <el-table-column label="Thumbnail" width="120">
        <template #default="scope">
          <div class="media-thumbnail" @click="emit('preview-media', scope.row)">
            <el-image
              :src="scope.row.url"
              :alt="scope.row.alt || 'Media thumbnail'"
              class="thumbnail-image"
              fit="cover"
            >
              <template #error>
                <div class="image-slot">
                  <el-icon><Picture /></el-icon>
                </div>
              </template>
            </el-image>
          </div>
        </template>
      </el-table-column>

      <el-table-column prop="title" label="Title" sortable>
        <template #default="scope">
          <span class="media-title" :title="scope.row.title">{{ scope.row.title || 'Untitled' }}</span>
        </template>
      </el-table-column>

      <el-table-column prop="alt" label="Alt Text" sortable>
        <template #default="scope">
          <span class="media-alt" :title="scope.row.alt">{{ scope.row.alt || '-' }}</span>
        </template>
      </el-table-column>

      <el-table-column prop="size" label="Size" sortable width="120">
        <template #default="scope">
          <span>{{ formatFileSize(scope.row.size) }}</span>
        </template>
      </el-table-column>

      <el-table-column prop="createdAt" label="Date Added" sortable width="180">
        <template #default="scope">
          <span>{{ formatDate(scope.row.createdAt) }}</span>
        </template>
      </el-table-column>

      <el-table-column v-if="showActions" label="Actions" width="150" fixed="right">
        <template #default="scope">
          <el-button-group>
            <el-button
              size="small"
              type="primary"
              plain
              @click="editMedia(scope.row)"
            >
              Edit
            </el-button>
            <el-button
              size="small"
              type="danger"
              plain
              @click="deleteMedia(scope.row)"
            >
              Delete
            </el-button>
          </el-button-group>
        </template>
      </el-table-column>
    </el-table>

    <div v-if="paginatorEnabled" class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="rowsPerPageOptions"
        layout="total, sizes, prev, pager, next, jumper"
        :total="mediaItems.length"
      />
    </div>
  </div>
</template>

<script setup lang="ts" generic="T extends MediaItem">
import { ref, watch } from 'vue'
import { Plus, Delete, Search, Edit, View, Picture } from '@element-plus/icons-vue'
import type { MediaItem } from '@/entities/media/model'

export interface Props<T> {
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



const props = withDefaults(defineProps<Props<T>>(), {
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

const emit = defineEmits<{
  'add-media': []
  'edit-media': [media: any]
  'delete-media': [media: any]
  'delete-selected': [media: any[]]
  'preview-media': [media: any]
  'selection-change': [media: any[]]
}>()

// State
const selectedMedia = ref<T[]>([])
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(props.rowsPerPage)

// Watch for external changes to mediaItems
watch(() => props.mediaItems, () => {
  // Reset selection when media items change
  selectedMedia.value = []
}, { deep: true })

// Methods
const addMedia = () => emit('add-media')
const editMedia = (media: T) => emit('edit-media', media)
const deleteMedia = (media: T) => emit('delete-media', media)
const deleteSelected = () => emit('delete-selected', selectedMedia.value)
const previewMedia = (media: T) => emit('preview-media', media)

const handleSelectionChange = (val: T[]) => {
  selectedMedia.value = val
  emit('selection-change', val)
}

const onSearch = () => {
  // Logic for local filtering if needed, or emit to parent
  // Assuming parent handles it via props.mediaItems for now as per previous implementation
}

const formatFileSize = (bytes: number): string => {
  if (!bytes || bytes === 0) return '0 Bytes'
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
</script>

<style scoped>
.media-management-widget {
  width: 100%;
}

.widget-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.widget-header h2 {
  color: #303133;
  font-size: 1.5rem;
  margin: 0;
  font-weight: 600;
}

.widget-actions {
  display: flex;
  gap: 0.5rem;
}

.table-toolbar {
  margin-bottom: 1rem;
  display: flex;
  justify-content: flex-end;
}

.search-input {
  width: 300px;
}

.media-table {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.media-thumbnail {
  cursor: pointer;
  width: 80px;
  height: 60px;
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--gp-bg-glass);
  border: 1px solid var(--gp-glass-border);
  transition: transform 0.2s ease;
}

.media-thumbnail:hover {
  transform: scale(1.05);
}

.thumbnail-image {
  width: 100%;
  height: 100%;
}

.image-slot {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  color: #909399;
  font-size: 20px;
}

.media-title, .media-alt {
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pagination-container {
  margin-top: 1.5rem;
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .widget-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .widget-actions {
    width: 100%;
    justify-content: flex-end;
  }

  .search-input {
    width: 100%;
  }
}
</style>

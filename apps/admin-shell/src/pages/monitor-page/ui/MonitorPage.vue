<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { type RemoteManifest } from '@admin-panel/lib/utils'

const manifest = ref<RemoteManifest | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

const fetchManifest = async () => {
  loading.value = true
  try {
    const response = await fetch('/manifest.json')
    if (!response.ok) throw new Error('Failed to fetch manifest')
    manifest.value = await response.json()
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Unknown error'
  } finally {
    loading.value = false
  }
}

onMounted(fetchManifest)
</script>

<template>
  <div class="monitor-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>Micro-Frontend Monitor</span>
          <el-button type="primary" size="small" @click="fetchManifest" :loading="loading">
            Refresh
          </el-button>
        </div>
      </template>

      <el-alert v-if="error" type="error" :title="error" show-icon />

      <el-table :data="manifest?.remotes || []" stripe style="width: 100%">
        <el-table-column prop="name" label="System Name" width="150" />
        <el-table-column prop="displayName" label="Display Name" width="150" />
        <el-table-column prop="url" label="Entry URL" min-width="300" />
        <el-table-column prop="scope" label="Scope" width="120" />
        <el-table-column prop="order" label="Order" width="80" align="center" />
        <el-table-column label="Status" width="120" align="center">
          <template #default="scope">
            <el-tag v-if="scope && scope.row" type="success">Active</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-card style="margin-top: 20px">
      <template #header>
        <span>Global Registry Status</span>
      </template>
      <div class="registry-info">
        <p><strong>Total Loaded MFs:</strong> {{ (manifest?.remotes || []).length }}</p>
        <p><strong>Orchestrator Version:</strong> 1.0.0 (Dynamic)</p>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.monitor-page {
  padding: 20px;
}
</style>

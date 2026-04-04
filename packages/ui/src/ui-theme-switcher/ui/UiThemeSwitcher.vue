<template>
  <div class="ui-theme-switcher" @click="toggleTheme" :title="isDark ? 'Переключить на светлую тему' : 'Переключить на темную тему'">
    <div class="switcher-icon" :class="{ 'is-dark': isDark }">
      <el-icon v-if="isDark"><Moon /></el-icon>
      <el-icon v-else><Sunny /></el-icon>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Moon, Sunny } from '@element-plus/icons-vue'

const isDark = ref(true)

const toggleTheme = () => {
  isDark.value = !isDark.value
  updateTheme()
}

const updateTheme = () => {
  if (isDark.value) {
    document.documentElement.classList.add('dark')
    document.documentElement.classList.remove('light')
    localStorage.setItem('gp-theme', 'dark')
  } else {
    document.documentElement.classList.add('light')
    document.documentElement.classList.remove('dark')
    localStorage.setItem('gp-theme', 'light')
  }
}

onMounted(() => {
  const savedTheme = localStorage.getItem('gp-theme')
  if (savedTheme) {
    isDark.value = savedTheme === 'dark'
  } else {
    isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
  }
  updateTheme()
})
</script>

<style scoped>
.ui-theme-switcher {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  background: var(--gp-bg-glass);
  backdrop-filter: blur(10px);
  border: 1px solid var(--gp-glass-border);
  transition: all 0.3s ease;
  color: var(--gp-text-main);
  box-shadow: var(--gp-glass-shadow);
}

.ui-theme-switcher:hover {
  background: var(--gp-bg-glass-hover);
  transform: translateY(-2px);
}

.switcher-icon {
  display: flex;
  font-size: 20px;
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.switcher-icon.is-dark {
  transform: rotate(360deg);
  color: #f1c40f;
}

.ui-theme-switcher:not(.is-dark) .switcher-icon {
  color: #ff9f43;
}
</style>

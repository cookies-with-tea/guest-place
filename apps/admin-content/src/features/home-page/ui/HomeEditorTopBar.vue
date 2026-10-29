<template>
	<header class="editor-topbar">
		<div class="editor-topbar__left">
			<el-button plain @click="router.push('/pages')"> ← К страницам </el-button>
			<span class="live-pill"
				><el-icon class="live-pill__icon"><Lightning /></el-icon> LIVE РЕДАКТОР</span
			>
			<h1 class="editor-title">Главная страница</h1>
			<span class="preview-route-pill">/ (Home)</span>
		</div>

		<div class="editor-topbar__right">
			<div class="split-controls">
				<button
					type="button"
					class="split-btn"
					:class="{ active: livePreview.splitRatio === '50-50' }"
					title="Равный сплит (50% / 50%)"
					@click="livePreview.splitRatio = '50-50'"
				>
					◫ 50:50
				</button>
				<button
					type="button"
					class="split-btn"
					:class="{ active: livePreview.splitRatio === '60-40' }"
					title="Широкая форма (60% / 40%)"
					@click="livePreview.splitRatio = '60-40'"
				>
					◧ 60:40
				</button>
				<button
					type="button"
					class="split-btn"
					:class="{ active: livePreview.splitRatio === 'full' }"
					title="Только форма (100%)"
					@click="livePreview.splitRatio = 'full'"
				>
					⛶ 100%
				</button>
			</div>

			<el-button plain :icon="Refresh" title="Перезагрузить данные из БД" @click="homeForm.fetchData">
				Обновить
			</el-button>

			<el-button type="success" plain :icon="Link" @click="livePreview.openClientPreview"> На сайт ↗ </el-button>

			<el-button type="primary" :icon="Check" :loading="homeForm.saving" @click="emit('save')">
				Сохранить изменения
			</el-button>
		</div>
	</header>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Check, Lightning, Link, Refresh } from '@element-plus/icons-vue'
import type { HomePageForm } from '../composables/useHomePageForm'
import type { HomeLivePreview } from '../composables/useHomeLivePreview'

defineProps<{
	homeForm: HomePageForm
	livePreview: HomeLivePreview
}>()

const emit = defineEmits<{
	save: []
}>()

const router = useRouter()
</script>

<style scoped lang="scss">
.editor-topbar {
	display: flex;
	flex-shrink: 0;
	flex-wrap: wrap;
	align-items: center;
	justify-content: space-between;
	border-bottom: 1px solid var(--gp-glass-border, rgb(255, 255, 255, 0.08));
	background: var(--gp-bg-surface, #1e293b);
	padding: 12px 24px;
	z-index: 15;
}

.editor-topbar__left {
	min-width: 0;
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: 12px;
}

.editor-topbar__right {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: 10px;
}

.live-pill {
	display: inline-flex;
	align-items: center;
	border-radius: 6px;
	font-weight: 700;
	font-size: 11px;
	letter-spacing: 0.5px;
	text-transform: uppercase;
	color: #fff;
	background: linear-gradient(135deg, #0ea5e9, #6366f1);
	padding: 4px 10px;
	gap: 4px;

	&__icon {
		width: 1em;
		height: 1em;
		flex-shrink: 0;
	}
}

.editor-title {
	font-weight: 600;
	font-size: 17px;
	color: var(--gp-text-main, #fff);
	margin: 0;
}

.preview-route-pill {
	border-radius: 4px;
	font-size: 12px;
	color: var(--gp-text-secondary, #94a3b8);
	background: rgb(255, 255, 255, 0.06);
	padding: 2px 8px;
}

.split-controls {
	display: flex;
	border: 1px solid var(--gp-glass-border, rgb(255, 255, 255, 0.08));
	border-radius: 8px;
	background: rgb(0, 0, 0, 0.25);
	padding: 2px;
}

.split-btn {
	border: none;
	border-radius: 6px;
	font-weight: 500;
	font-size: 12px;
	color: var(--gp-text-secondary);
	background: transparent;
	transition: all 0.15s;
	cursor: pointer;
	padding: 4px 10px;

	&:hover {
		color: var(--gp-text-main);
	}

	&.active {
		font-weight: 600;
		color: #fff;
		background: var(--gp-primary, #42b883);
	}
}
</style>

<template>
	<div class="editor-topbar">
		<div class="editor-topbar__left">
			<el-button plain @click="emit('close')"> ← К списку </el-button>
			<span class="live-pill">⚡ LIVE РЕДАКТОР</span>
			<h2 class="editor-title">{{ venueForm.isEditing ? venueForm.form.title : 'Новая площадка' }}</h2>
			<a
				v-if="venueForm.form.slug"
				:href="getLandingUrl(venueForm.form.slug)"
				target="_blank"
				class="editor-slug-chip"
				title="Открыть страницу на сайте"
			>
				{{ venueForm.form.slug }} ↗
			</a>
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

			<el-button type="success" plain @click="openLanding(venueForm.form.slug)"> 🌐 На сайт ↗ </el-button>

			<el-button type="primary" :loading="venueForm.saving" @click="emit('save')"> 💾 Сохранить </el-button>
		</div>
	</div>
</template>

<script setup lang="ts">
import type { VenueForm } from '../composables/useVenueForm'
import type { VenueLivePreview } from '../composables/useVenueLivePreview'
import { getLandingUrl, openLanding } from '../../lib/helpers'

defineProps<{
	venueForm: VenueForm
	livePreview: VenueLivePreview
}>()

const emit = defineEmits<{
	close: []
	save: []
}>()
</script>

<style scoped lang="scss">
.editor-topbar {
	display: flex;
	flex-shrink: 0;
	align-items: center;
	justify-content: space-between;
	border-bottom: 1px solid var(--border-color);
	background: var(--bg-surface, #1e293b);
	padding: 12px 24px;
	z-index: 10;

	&__left {
		min-width: 0;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 14px;
	}

	&__right {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 10px;
	}
}

.live-pill {
	border-radius: 6px;
	font-weight: 700;
	font-size: 11px;
	letter-spacing: 0.5px;
	text-transform: uppercase;
	color: #fff;
	background: linear-gradient(135deg, #0ea5e9, #6366f1);
	padding: 4px 10px;
}

.editor-title {
	max-width: 320px;
	font-weight: 600;
	font-size: 17px;
	white-space: nowrap;
	text-overflow: ellipsis;
	color: var(--text-primary, #fff);
	margin: 0;
	overflow: hidden;
}

.editor-slug-chip {
	border: 1px solid rgb(56, 189, 248, 0.25);
	border-radius: 6px;
	font-size: 12px;
	text-decoration: none;
	color: var(--accent-primary, #38bdf8);
	background: rgb(56, 189, 248, 0.1);
	transition: all 0.15s;
	padding: 3px 8px;

	&:hover {
		background: rgb(56, 189, 248, 0.2);
	}
}

.split-controls {
	display: flex;
	border: 1px solid var(--gp-glass-border, rgb(255, 255, 255, 0.08));
	border-radius: 8px;
	background: rgb(0, 0, 0, 0.3);
	padding: 2px;
}

.split-btn {
	border: none;
	border-radius: 6px;
	font-weight: 500;
	font-size: 12px;
	color: var(--gp-text-secondary, #94a3b8);
	background: transparent;
	transition: all 0.15s;
	cursor: pointer;
	padding: 4px 10px;

	&:hover {
		color: #fff;
	}

	&.active {
		font-weight: 600;
		color: #fff;
		background: var(--gp-primary, #42b883);
	}
}
</style>

<template>
	<button type="button" class="ui-info-button" :title="title" @click.stop="isOpen = true">
		<ElIcon class="ui-info-button__icon"><InfoFilled /></ElIcon>
	</button>

	<UiModal v-model="isOpen" :title="title" :width="420">
		<p class="ui-info-button__text">{{ description }}</p>
	</UiModal>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import { InfoFilled } from '@element-plus/icons-vue'
import { ElIcon } from 'element-plus'

import UiModal from '../../ui-modal'

/**
 * UiInfoButton — маленькая кнопка "?" рядом с названием раздела/МФ,
 * открывающая модалку с коротким объяснением "что это и зачем" для
 * контент-менеджера (не документация для разработчика).
 */
interface Props {
	title: string
	description: string
}

defineProps<Props>()

const isOpen = ref(false)
</script>

<style scoped lang="scss">
.ui-info-button {
	width: 20px;
	height: 20px;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	border: none;
	border-radius: 50%;
	color: var(--gp-text-muted, #94a3b8);
	background: transparent;
	transition: all 0.15s ease;
	cursor: pointer;
	padding: 0;

	&__icon {
		font-size: 15px;
	}

	&__text {
		font-size: 13px;
		line-height: 1.6;
		white-space: pre-line;
		color: var(--gp-text-secondary, #94a3b8);
		margin: 0;
	}

	&:hover {
		color: var(--gp-primary, #6366f1);
		background: var(--gp-glass-hover, rgb(99, 102, 241, 0.1));
	}
}
</style>

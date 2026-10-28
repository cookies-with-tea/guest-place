<template>
	<UiGlassCard icon="📰" title="Публикации и новости площадки" description="Посты для интерактивной вкладки «Лента»">
		<template #actions>
			<el-button size="small" type="primary" :icon="Plus" @click="venueForm.addFeedItem">Добавить публикацию</el-button>
		</template>

		<div class="feed-items-list">
			<div v-for="(item, idx) in venueForm.formFeed" :key="item.id" class="feed-item-card">
				<div class="feed-item-top">
					<div class="feed-avatar-preview">
						<img :src="item.authorAvatar || DEFAULT_AVATAR" alt="Аватар" />
					</div>
					<el-input v-model="item.author" placeholder="Автор публикации" style="flex: 1" @input="onChange" />
					<el-input
						v-model="item.publishedAgo"
						placeholder="Дата (4 дня назад)"
						style="width: 140px"
						@input="onChange"
					/>
					<el-button type="danger" link @click="venueForm.removeFeedItem(idx)">✕</el-button>
				</div>

				<UiRichTextField
					v-model="item.text"
					field-path="feed.text"
					mode="simple"
					multiline
					namespace="venues"
					placeholder="Текст новости или анонса мероприятия..."
					style="margin-bottom: 10px"
					@update:model-value="onChange"
				/>

				<el-row :gutter="12">
					<el-col :span="12">
						<el-input v-model="item.imageUrl" placeholder="URL фото обложки" @input="onChange" />
					</el-col>
					<el-col :span="8">
						<el-input v-model="item.videoUrl" placeholder="URL видео (YouTube)" @input="onChange" />
					</el-col>
					<el-col :span="4">
						<el-input-number
							v-model="item.likesCount"
							:min="0"
							controls-position="right"
							style="width: 100%"
							placeholder="Лайки"
							@change="onChange"
						/>
					</el-col>
				</el-row>
			</div>
		</div>
		<div v-if="!venueForm.formFeed.length" class="empty-list-notice"
			>Лента новостей пуста. Нажмите «Добавить публикацию».</div
		>
	</UiGlassCard>
</template>

<script setup lang="ts">
import { UiGlassCard, UiRichTextField } from '@admin-panel/ui'
import { Plus } from '@element-plus/icons-vue'
import { DEFAULT_AVATAR, type VenueForm } from '../../composables/useVenueForm'

defineProps<{
	venueForm: VenueForm
	onChange: () => void
}>()
</script>

<style scoped lang="scss">
.feed-items-list {
	display: flex;
	flex-direction: column;
	gap: 14px;
}

.feed-item-card {
	border: 1px solid var(--border-color);
	border-radius: 8px;
	background: var(--bg-surface);
	padding: 14px;
}

.feed-item-top {
	display: flex;
	align-items: center;
	margin-bottom: 10px;
	gap: 10px;
}

.feed-avatar-preview {
	width: 36px;
	height: 36px;
	flex-shrink: 0;
	border-radius: 50%;
	background: #334155;
	overflow: hidden;

	img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
}

.empty-list-notice {
	border: 1px dashed var(--border-color);
	border-radius: 8px;
	font-size: 13px;
	text-align: center;
	color: var(--text-muted);
	background: var(--bg-surface);
	padding: 24px;
}
</style>

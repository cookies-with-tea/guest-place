<template>
	<div class="ui-notification-bell">
		<el-popover
			v-model:visible="popoverVisible"
			placement="bottom-end"
			:width="380"
			trigger="click"
			popper-class="notification-popover"
		>
			<template #reference>
				<div class="bell-trigger-wrapper">
					<el-badge :value="unreadCount" :max="99" :hidden="unreadCount === 0" class="bell-badge">
						<el-button circle class="bell-btn" :class="{ 'has-unread': unreadCount > 0 }">
							<el-icon><Bell /></el-icon>
						</el-button>
					</el-badge>
					<span
						class="connection-dot"
						:class="connectionStatus"
						:title="connectionStatusText"
					></span>
				</div>
			</template>

			<div class="notifications-panel">
				<div class="panel-header">
					<div class="panel-header__left">
						<span class="panel-title">Уведомления</span>
						<span class="status-indicator" :class="connectionStatus">
							<span class="pulse-dot"></span>
							{{ connectionStatusLabel }}
						</span>
					</div>
					<div class="panel-header__actions">
						<el-button
							v-if="unreadCount > 0"
							link
							type="primary"
							size="small"
							@click="markAllAsRead"
						>
							Прочитать все
						</el-button>
						<el-button
							v-if="notifications.length > 0"
							link
							size="small"
							@click="clearAll"
						>
							Очистить
						</el-button>
					</div>
				</div>

				<div v-if="notifications.length === 0" class="panel-empty">
					<el-icon class="empty-icon"><Bell /></el-icon>
					<p>Нет новых уведомлений</p>
					<span>Здесь будут отображаться события в реальном времени</span>
				</div>

				<div v-else class="notifications-list">
					<div
						v-for="item in notifications"
						:key="item.id"
						class="notification-item"
						:class="{ 'is-unread': !item.read }"
						@click="handleNotificationClick(item)"
					>
						<div class="item-icon" :class="item.type">
							<el-icon v-if="item.type === 'guest_registered'"><User /></el-icon>
							<el-icon v-else-if="item.type === 'media_uploaded'"><Picture /></el-icon>
							<el-icon v-else-if="item.type === 'system_alert'"><Warning /></el-icon>
							<el-icon v-else-if="item.type === 'content_updated'"><Document /></el-icon>
							<el-icon v-else><Bell /></el-icon>
						</div>

						<div class="item-body">
							<div class="item-title-row">
								<span class="item-title">{{ item.title }}</span>
								<span class="item-time">{{ formatTime(item.timestamp) }}</span>
							</div>
							<p class="item-message">{{ item.message }}</p>
						</div>

						<span v-if="!item.read" class="unread-dot"></span>
					</div>
				</div>
			</div>
		</el-popover>
	</div>
</template>

<script lang="ts" setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Bell, Document, Picture, User, Warning } from '@element-plus/icons-vue'
import { useRealtimeNotifications, type IRealtimeNotification } from '@admin-panel/lib'

const router = useRouter()
const popoverVisible = ref(false)

const {
	notifications,
	unreadCount,
	connectionStatus,
	markAsRead,
	markAllAsRead,
	clearAll,
	initSubscriber,
	removeSubscriber,
} = useRealtimeNotifications()

onMounted(() => {
	initSubscriber()
})

onUnmounted(() => {
	removeSubscriber()
})

const connectionStatusText = computed(() => {
	if (connectionStatus.value === 'connected') return 'SSE: Подключено (Online)'
	if (connectionStatus.value === 'connecting') return 'SSE: Подключение...'
	return 'SSE: Отключено (Offline)'
})

const connectionStatusLabel = computed(() => {
	if (connectionStatus.value === 'connected') return 'Online'
	if (connectionStatus.value === 'connecting') return 'Connecting...'
	return 'Offline'
})

const formatTime = (isoString?: string) => {
	if (!isoString) return ''
	try {
		const date = new Date(isoString)
		return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
	} catch {
		return ''
	}
}

const handleNotificationClick = (item: IRealtimeNotification) => {
	markAsRead(item.id)
	if (item.link) {
		popoverVisible.value = false
		if (router) {
			router.push(item.link).catch(() => {})
		} else {
			window.location.href = item.link
		}
	}
}
</script>

<style lang="scss" scoped>
.ui-notification-bell {
	display: inline-flex;
	align-items: center;
}

.bell-trigger-wrapper {
	position: relative;
	display: inline-flex;
	align-items: center;
}

.bell-btn {
	border-color: var(--gp-border-color, rgba(255, 255, 255, 0.12));
	color: var(--gp-text-secondary, #94a3b8);
	background: transparent;
	transition: all 0.2s ease;

	&:hover {
		color: var(--gp-primary, #6366f1);
		background: var(--gp-bg-glass-hover, rgba(255, 255, 255, 0.06));
	}

	&.has-unread {
		color: var(--gp-primary, #6366f1);
	}
}

.connection-dot {
	position: absolute;
	bottom: 0;
	right: 0;
	width: 8px;
	height: 8px;
	border-radius: 50%;
	border: 1.5px solid var(--gp-bg-main, #0f172a);

	&.connected {
		background: #10b981;
		box-shadow: 0 0 6px rgba(16, 185, 129, 0.8);
	}

	&.connecting {
		background: #f59e0b;
		box-shadow: 0 0 6px rgba(245, 158, 11, 0.8);
	}

	&.disconnected {
		background: #ef4444;
	}
}

.notifications-panel {
	display: flex;
	flex-direction: column;
	max-height: 420px;
}

.panel-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding-bottom: 12px;
	border-bottom: 1px solid var(--gp-border-color, rgba(255, 255, 255, 0.08));

	&__left {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	&__actions {
		display: flex;
		align-items: center;
		gap: 8px;
	}
}

.panel-title {
	font-weight: 600;
	font-size: 0.95rem;
	color: var(--gp-text-main, #f8fafc);
}

.status-indicator {
	display: inline-flex;
	align-items: center;
	gap: 5px;
	font-size: 0.72rem;
	padding: 2px 7px;
	border-radius: 999px;
	font-weight: 500;

	.pulse-dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
	}

	&.connected {
		color: #10b981;
		background: rgba(16, 185, 129, 0.12);
		.pulse-dot {
			background: #10b981;
			box-shadow: 0 0 5px #10b981;
		}
	}

	&.connecting {
		color: #f59e0b;
		background: rgba(245, 158, 11, 0.12);
		.pulse-dot {
			background: #f59e0b;
		}
	}

	&.disconnected {
		color: #94a3b8;
		background: rgba(148, 163, 184, 0.12);
		.pulse-dot {
			background: #94a3b8;
		}
	}
}

.panel-empty {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 36px 16px;
	text-align: center;
	color: var(--gp-text-secondary, #94a3b8);

	.empty-icon {
		font-size: 2rem;
		margin-bottom: 8px;
		opacity: 0.4;
	}

	p {
		font-weight: 500;
		margin: 0 0 4px;
		color: var(--gp-text-main, #f8fafc);
	}

	span {
		font-size: 0.78rem;
		opacity: 0.7;
	}
}

.notifications-list {
	display: flex;
	flex-direction: column;
	overflow-y: auto;
	max-height: 340px;
	padding-top: 6px;
}

.notification-item {
	position: relative;
	display: flex;
	align-items: flex-start;
	gap: 12px;
	padding: 10px 12px;
	border-radius: 8px;
	cursor: pointer;
	transition: background 0.15s ease;

	&:hover {
		background: var(--gp-bg-glass-hover, rgba(255, 255, 255, 0.05));
	}

	&.is-unread {
		background: rgba(99, 102, 241, 0.06);

		&:hover {
			background: rgba(99, 102, 241, 0.1);
		}
	}
}

.item-icon {
	flex-shrink: 0;
	width: 32px;
	height: 32px;
	border-radius: 8px;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 1rem;

	&.guest_registered {
		color: #10b981;
		background: rgba(16, 185, 129, 0.12);
	}

	&.media_uploaded {
		color: #3b82f6;
		background: rgba(59, 130, 246, 0.12);
	}

	&.system_alert {
		color: #f59e0b;
		background: rgba(245, 158, 11, 0.12);
	}

	&.content_updated {
		color: #8b5cf6;
		background: rgba(139, 92, 246, 0.12);
	}
}

.item-body {
	flex: 1;
	min-width: 0;
}

.item-title-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 2px;
}

.item-title {
	font-size: 0.85rem;
	font-weight: 600;
	color: var(--gp-text-main, #f8fafc);
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.item-time {
	font-size: 0.72rem;
	color: var(--gp-text-secondary, #94a3b8);
	flex-shrink: 0;
	margin-left: 8px;
}

.item-message {
	font-size: 0.8rem;
	margin: 0;
	color: var(--gp-text-secondary, #94a3b8);
	line-height: 1.35;
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
	overflow: hidden;
}

.unread-dot {
	width: 7px;
	height: 7px;
	border-radius: 50%;
	background: var(--gp-primary, #6366f1);
	position: absolute;
	top: 14px;
	right: 8px;
}
</style>

<template>
	<div class="users-filters">
		<div class="users-filters__card">
			<div class="users-filters__header">
				<div class="users-filters__title">
					<h2>Users Management</h2>
					<p>Filter and manage your platform users</p>
				</div>
				<div class="header-actions">
					<el-button :icon="PlusIcon" type="primary" @click="openAddModal">Add user</el-button>
				</div>
			</div>

			<div v-if="activeFilterTags.length > 0" class="users-filters__tags">
				<span class="tags-label">Active filters:</span>
				<el-tag
					v-for="tag in activeFilterTags"
					:key="tag.key"
					class="gp-tag"
					closable
					effect="dark"
					round
					@close="removeFilter(tag.key as any)"
				>
					<span class="tag-key">{{ tag.label }}:</span>
					<span class="tag-value">{{ tag.value }}</span>
				</el-tag>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { Plus as PlusIcon } from '@element-plus/icons-vue'

import { useUsers } from '#entities/user/lib/composables'

const { filters, openAddModal, removeFilter } = useUsers()

const filterLabels: Record<string, string> = {
	search: 'Search Everywhere',
	name: 'Name',
	email: 'Email',
	city: 'City',
	phone: 'Phone',
	role: 'Role',
	status: 'Status',
}

const statusLabels: Record<string, string> = {
	active: 'Active',
	inactive: 'Inactive',
	in_moderation: 'In moderation',
}

const roleLabels: Record<string, string> = {
	admin: 'Admin',
	user: 'User',
	superadmin: 'Superadmin',
	editor: 'Editor',
}

const activeFilterTags = computed(() => {
	const tags: { key: string; label: string; value: string }[] = []
	const skipKeys = ['sortBy', 'sortOrder', 'search']

	Object.entries(filters.value).forEach(([key, value]) => {
		if (value !== undefined && value !== '' && value !== null && !skipKeys.includes(key)) {
			// Check for non-empty array
			if (Array.isArray(value)) {
				if (value.length > 0) {
					const mappedValues = value.map((val) => {
						if (key === 'role') return roleLabels[val] || val
						if (key === 'status') return statusLabels[val] || val

						return val
					})

					tags.push({
						key,
						label: filterLabels[key] || key,
						value: mappedValues.join(', '),
					})
				}
			} else {
				tags.push({
					key,
					label: filterLabels[key] || key,
					value: String(value),
				})
			}
		}
	})

	return tags
})
</script>

<style scoped>
.users-filters {
	margin-bottom: 24px;
}

.users-filters__card {
	border: 1px solid var(--border-color);
	border-radius: 16px;
	box-shadow: var(--shadow-sm);
	background: var(--bg-card);
	transition: all 0.3s ease;
	padding: 24px;
}

.users-filters__header {
	display: flex;
	align-items: flex-start;
	justify-content: space-between;
	padding-bottom: 20px;
	gap: 24px;
}

.header-actions {
	display: flex;
	align-items: center;
	gap: 12px;
}

.users-filters__title h2 {
	font-weight: 700;
	font-size: 24px;
	color: var(--text-primary);
	margin: 0;
}

.users-filters__title p {
	font-size: 15px;
	color: var(--text-muted);
	margin: 8px 0 0;
}

.users-filters__tags {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	border-top: 1px solid var(--border-color);
	padding-top: 24px;
	gap: 12px;
}

.tags-label {
	font-weight: 500;
	font-size: 14px;
	color: var(--text-muted);
	margin-right: 8px;
}

.gp-tag {
	height: auto;
	border: 1px solid var(--border-color);
	border-radius: 20px;
	color: var(--text-primary);
	background: var(--bg-surface);
	transition: all 0.2s ease;
	padding: 10px 14px;
}

.gp-tag:hover {
	border-color: var(--accent-primary);
}

.tag-key {
	font-weight: 500;
	color: var(--text-muted);
	margin-right: 6px;
}

.tag-value {
	font-weight: 600;
	color: var(--text-primary);
}
</style>

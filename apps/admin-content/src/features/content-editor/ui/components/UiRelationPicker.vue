<template>
	<div class="ui-relation-picker">
		<el-select
			v-model="internalValue"
			:loading="loading"
			:multiple="multiple"
			:placeholder="placeholder"
			:remote-method="searchEntries"
			clearable
			:disabled="disabled"
			filterable
			remote
			reserve-keyword
			style="width: 100%"
			@change="handleChange"
		>
			<el-option v-for="item in options" :key="item.id" :label="getLabel(item)" :value="item.id" />
			<template #loading>
				<div class="loading-state">Searching...</div>
			</template>
		</el-select>
	</div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

import type { ContentEntry } from '@admin-panel/lib'

import { contentApi } from '#entities/content'

interface Props {
	modelValue: string | string[] | null | undefined
	schemaSlug: string | undefined
	multiple?: boolean
	placeholder?: string
	disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
	multiple: false,
	placeholder: 'Search for relation...',
})

const emit = defineEmits<{
	'update:modelValue': [value: string | string[] | null]
}>()

const loading = ref(false)
const options = ref<ContentEntry[]>([])
const schemaId = ref<string | null>(null)
const internalValue = ref<any>(props.modelValue)

// Sync internal value with prop
watch(
	() => props.modelValue,
	(val) => {
		internalValue.value = val
	}
)

const getLabel = (entry: ContentEntry) => {
	const data = entry.data as any

	return data.title || data.name || data.label || entry.slug || entry.id
}

const searchEntries = async (query: string = '') => {
	if (!schemaId.value) return
	loading.value = true

	try {
		const res = await contentApi.getEntries(schemaId.value, { search: query })

		if (res.data) {
			options.value = res.data
		}
	} catch (error) {
		console.error('Failed to search entries:', error)
	} finally {
		loading.value = false
	}
}

const handleChange = (val: any) => {
	emit('update:modelValue', val)
}

const init = async () => {
	if (!props.schemaSlug) return

	try {
		const res = await contentApi.getSchemaByIdentifier(props.schemaSlug)

		if (res.data) {
			schemaId.value = res.data.id

			await searchEntries()

			// If we have an initial value, ensure it's in the options so the label shows up
			if (props.modelValue) {
				const ids = Array.isArray(props.modelValue) ? props.modelValue : [props.modelValue]
				const missingIds = ids.filter((id) => !options.value.find((o) => o.id === id))

				if (missingIds.length > 0) {
					for (const id of missingIds) {
						try {
							const entryRes = await contentApi.getEntry(id)

							if (entryRes.data) {
								options.value.push(entryRes.data)
							}
						} catch (e) {
							console.warn(`Could not load related entry ${id}`, e)
						}
					}
				}
			}
		}
	} catch (error) {
		console.error('Failed to resolve schema identifier:', error)
	}
}

onMounted(init)

// Re-init if schemaSlug changes (unlikely in editor but possible)
watch(() => props.schemaSlug, init)
</script>

<style scoped>
.loading-state {
	font-size: 13px;
	text-align: center;
	color: var(--text-muted);
	padding: 8px 12px;
}
</style>

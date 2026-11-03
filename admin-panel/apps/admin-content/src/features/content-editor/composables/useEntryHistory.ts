import { reactive, ref, watch } from 'vue'
import type { Ref } from 'vue'

import { ElMessage, ElMessageBox } from 'element-plus'

import { contentApi } from '#entities/content'

/** Version history for a content entry: the activity timeline and the diff/rollback drawer. */
export const useEntryHistory = (
	entryId: Ref<string | undefined>,
	emit: (e: 'rollback') => void,
	activeTab: Ref<string>
) => {
	const history = ref<any[]>([])
	const isLoadingHistory = ref(false)

	const isDiffOpen = ref(false)
	const diffVersion = ref<any>(null)

	const fetchHistory = async () => {
		if (!entryId.value) return

		isLoadingHistory.value = true

		try {
			const res = await contentApi.getEntryVersions(entryId.value)

			if (res.data) {
				history.value = res.data
			}
		} catch {
			ElMessage.error('Failed to fetch version history')
		} finally {
			isLoadingHistory.value = false
		}
	}

	const openDiff = (version: any) => {
		diffVersion.value = version
		isDiffOpen.value = true
	}

	const onRollback = (versionId: string) => {
		ElMessageBox.confirm('Are you sure you want to rollback to this version?', 'Warning', {
			confirmButtonText: 'Rollback',
			cancelButtonText: 'Cancel',
			type: 'warning',
		}).then(async () => {
			try {
				if (!entryId.value) return

				await contentApi.rollbackEntryVersion(entryId.value, versionId)

				ElMessage.success('Version restored')

				emit('rollback')
			} catch {
				ElMessage.error('Failed to rollback version')
			}
		})
	}

	const handleRollbackDiff = () => {
		if (diffVersion.value) {
			onRollback(diffVersion.value.id)

			isDiffOpen.value = false
		}
	}

	const formatDate = (iso: string) => {
		try {
			return new Date(iso).toLocaleString('ru-RU', {
				day: '2-digit',
				month: 'short',
				year: 'numeric',
				hour: '2-digit',
				minute: '2-digit',
			})
		} catch {
			return iso
		}
	}

	watch(activeTab, (tab) => {
		if (tab === 'history' && history.value.length === 0) {
			fetchHistory()
		}
	})

	return reactive({
		history,
		isLoadingHistory,
		isDiffOpen,
		diffVersion,
		fetchHistory,
		openDiff,
		onRollback,
		handleRollbackDiff,
		formatDate,
	})
}

export type EntryHistory = ReturnType<typeof useEntryHistory>

import { ref } from 'vue'

import { createApi } from '../api'
import type { FeatureFlag } from '../model/feature-flag'

const { fetchData } = createApi('features')

const flags = ref<FeatureFlag[]>([])
const loading = ref(false)

const initialized = ref(false)

export const useFeatureFlags = () => {
	const loadFlags = async () => {
		if (loading.value) return

		loading.value = true

		try {
			const res = await fetchData<FeatureFlag[]>('')

			flags.value = res.data || []

			initialized.value = true
		} catch (e) {
			// eslint-disable-next-line no-console
			console.error('Failed to load feature flags', e)
		} finally {
			loading.value = false
		}
	}

	const isEnabled = (id: string) => {
		return flags.value.find((f) => f.id === id)?.enabled ?? false
	}

	const updateFlags = async (newFlags: FeatureFlag[]) => {
		try {
			await fetchData('', {
				method: 'POST',
				body: { flags: newFlags },
			})

			flags.value = newFlags
		} catch (e) {
			// eslint-disable-next-line no-console
			console.error('Failed to update feature flags', e)

			throw e
		}
	}

	return {
		flags,
		loading,
		initialized,
		isEnabled,
		loadFlags,
		updateFlags,
	}
}

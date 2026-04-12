import { ref, watch } from 'vue'

export interface FeatureFlag {
	id: string
	name: string
	description: string
	enabled: boolean
}

const STORAGE_KEY = 'gp_feature_flags'

const defaultFlags: FeatureFlag[] = [
	{ id: 'new-media-engine', name: 'New Media Engine', description: 'Enable Rust-based CAS storage', enabled: false },
	{ id: 'mfa-enabled', name: 'MFA Authentication', description: 'Enable multi-factor auth', enabled: true },
	{ id: 'dark-mode-v2', name: 'Dark Mode v2', description: 'Experimental high-contrast theme', enabled: false },
]

const getInitialFlags = (): FeatureFlag[] => {
	if (typeof localStorage !== 'undefined') {
		const saved = localStorage.getItem(STORAGE_KEY)

		if (saved) return JSON.parse(saved)
	}

	return defaultFlags
}

const flags = ref<FeatureFlag[]>(getInitialFlags())

watch(
	flags,
	(newFlags) => {
		if (typeof localStorage !== 'undefined') {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(newFlags))
		}
	},
	{ deep: true }
)

export function useFeatureFlags() {
	const isEnabled = (id: string) => {
		return flags.value.find((f) => f.id === id)?.enabled ?? false
	}

	const toggleFlag = (id: string) => {
		const flag = flags.value.find((f) => f.id === id)

		if (flag) flag.enabled = !flag.enabled
	}

	return {
		flags,
		isEnabled,
		toggleFlag,
	}
}

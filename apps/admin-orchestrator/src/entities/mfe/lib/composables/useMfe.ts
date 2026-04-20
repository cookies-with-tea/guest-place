import { computed, reactive, ref } from 'vue'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'

import { mfeApi } from '../../api'

export const useMfe = () => {
	const queryClient = useQueryClient()
	const dialogVisible = ref(false)
	const isEdit = ref(false)

	const form = reactive({
		id: '',
		name: '',
		displayName: '',
		url: '',
		scope: '',
		module: '',
		icon: '',
		category: 'system',
		orderIndex: 0,
		enabled: true,
	})

	// === Queries ===
	const { data: mfesResponse, isLoading } = useQuery({
		queryKey: ['mfes'],
		queryFn: () => mfeApi.getAll(),
	})

	const microfrontends = computed(() => {
		const rawData = mfesResponse.value?.data

		if (Array.isArray(rawData)) {
			return rawData as any[]
		}

		// Fallback for cases where data might be directly in mfesResponse or nested differently
		if (Array.isArray(mfesResponse.value)) {
			return mfesResponse.value as any[]
		}

		return []
	})

	// === Mutations ===
	const createMutation = useMutation({
		mutationFn: (data: any) => mfeApi.create(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['mfes'] })

			closeDialog()

			window.dispatchEvent(new CustomEvent('mfe:updated'))
		},
		onError: (err) => {
			// eslint-disable-next-line no-console
			console.error('[useMfe] create error:', err)
		},
	})

	const updateMutation = useMutation({
		mutationFn: ({ id, data }: { id: string; data: any }) => mfeApi.update(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['mfes'] })

			window.dispatchEvent(new CustomEvent('mfe:updated'))

			closeDialog()
		},
		onError: (err) => {
			// eslint-disable-next-line no-console
			console.error('[useMfe] update error:', err)
		},
	})

	const deleteMutation = useMutation({
		mutationFn: (id: string) => mfeApi.deleteById(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['mfes'] })

			window.dispatchEvent(new CustomEvent('mfe:updated'))
		},
	})

	// === Actions ===
	const handleCreate = () => {
		isEdit.value = false

		Object.assign(form, {
			id: '',
			name: '',
			displayName: '',
			url: '',
			scope: 'mfe',
			module: './Routes',
			icon: '',
			category: 'system',
			orderIndex: 0,
			enabled: true,
		})

		dialogVisible.value = true
	}

	const handleEdit = (row: any) => {
		isEdit.value = true

		Object.assign(form, row)

		dialogVisible.value = true
	}

	const handleDelete = (row: any) => {
		deleteMutation.mutate(row.id)
	}

	const closeDialog = () => {
		dialogVisible.value = false
	}

	const saveMfe = () => {
		const payload = { ...form }

		if (isEdit.value) {
			const { id, ...data } = payload

			updateMutation.mutate({ id, data })
		} else {
			createMutation.mutate(payload)
		}
	}

	return {
		// state
		microfrontends,
		isLoading,
		dialogVisible,
		isEdit,
		form,
		isSubmitting: computed(() => createMutation.isPending.value || updateMutation.isPending.value),

		// actions
		handleCreate,
		handleEdit,
		handleDelete,
		closeDialog,
		saveMfe,
	}
}

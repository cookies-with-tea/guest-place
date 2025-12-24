import { ref, watch, computed } from 'vue'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { fetchUsers, createUser, updateUser, deleteUser } from '../../api'
import type { UserFilters, User, CreateUserDTO, UpdateUserDTO } from '../../model'
import { USERS_QUERY_KEY } from '../../model'

const isModalOpen = ref(false)

export const useUsers = () => {
	// === State ===
	const filters = ref<UserFilters>({
		status: undefined,
		role: undefined,
		search: undefined,
	})

	const pagination = ref({
		page: 1,
		pageSize: 10,
		total: 0,
	})

	const editingUser = ref<User | null>(null)

	// === Query ===
	const queryKey = computed(() => [
		USERS_QUERY_KEY,
		{ ...filters.value, page: pagination.value.page, pageSize: pagination.value.pageSize },
	])

	const isSubmitting = computed(() => createMutation.isPending.value || updateMutation.isPending.value)

	const queryClient = useQueryClient()

	const usersQuery = useQuery({
		queryKey,
		queryFn: () =>
			fetchUsers({
				...filters.value,
				page: pagination.value.page,
				pageSize: pagination.value.pageSize,
			}),
	})

	watch(
		() => usersQuery.data?.value?.pagination,
		(newPagination) => {
			if (newPagination) pagination.value = { ...newPagination }
		}
	)

	// === Modal ===
	const openAddModal = () => {
		editingUser.value = null

		isModalOpen.value = true
	}

	const openEditModal = (user: User) => {
		editingUser.value = user

		isModalOpen.value = true
	}

	const closeModal = () => {
		isModalOpen.value = false

		editingUser.value = null
	}

	// === Mutations ===
	const createMutation = useMutation({
		mutationFn: createUser,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] })

			closeModal()
		},
	})

	const updateMutation = useMutation({
		mutationFn: updateUser,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] })

			closeModal()
		},
	})

	const deleteMutation = useMutation({
		mutationFn: deleteUser,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] })
		},
	})

	const handleSubmit = (data: CreateUserDTO | UpdateUserDTO) => {
		if ('uuid' in data) {
			// Это UpdateUserDTO (с uuid)
			updateMutation.mutate(data)
		} else {
			// Это CreateUserDTO (без uuid)
			createMutation.mutate(data)
		}
	}

	const handleDelete = (uuid: string) => {
		deleteMutation.mutate(uuid)
	}

	// === Pagination & Filters ===
	const setPage = (page: number) => {
		pagination.value.page = page
	}

	const setPageSize = (size: number) => {
		pagination.value.pageSize = size

		pagination.value.page = 1
	}

	watch(filters, () => {
		pagination.value.page = 1
	})

	return {
		// state
		filters,
		pagination,
		isModalOpen,
		editingUser,

		// data
		users: computed(() => usersQuery.data.value?.data || []),
		isLoading: usersQuery.isLoading,

		// actions
		openAddModal,
		openEditModal,
		closeModal,
		handleSubmit,
		handleDelete,
		setPage,
		setPageSize,
		isSubmitting,
	}
}

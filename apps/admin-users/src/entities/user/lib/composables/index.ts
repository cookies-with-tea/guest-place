import { ref, watch, computed } from 'vue'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { UserFilters, IUserCreateUpdate } from '../../model'
import { USERS_QUERY_KEY } from '../../model'
import { userApi } from '../../api'
import type { IPagination } from '@admin-panel/lib'

const isModalOpen = ref(false)
const isDetailDrawerOpen = ref(false)

const { create, update, getAll, deleteById, getById } = userApi

// === Shared State (Singleton) ===
const filters = ref<UserFilters>({
	status: [],
	role: [],
	search: '',
	name: '',
	email: '',
	phone: '',
	city: '',
	sortBy: 'createdAt',
	sortOrder: 'DESC',
})

const pagination = ref<IPagination>({
	page: 1,
	limit: 10,
	total: 0,
	totalPages: 0,
})

const editingUserUuid = ref<string>('')

export const useUsers = () => {
	const queryClient = useQueryClient()

	// === Query ===
	const queryKey = computed(() => [
		USERS_QUERY_KEY,
		{
			...filters.value,
			page: pagination.value.page,
			limit: pagination.value.limit,
		},
	])

	const isSubmitting = computed(() => createMutation.isPending.value || updateMutation.isPending.value)

	const users = computed(
		() =>
			usersQuery.data.value?.data.items.map((user) => ({
				...user,
				name: [user.firstName, user.secondName, user.lastName].filter(Boolean).join(' '),
			})) || []
	)

	const usersQuery = useQuery({
		queryKey,
		queryFn: () =>
			getAll({
				...filters.value,
				page: pagination.value.page,
				limit: pagination.value.limit,
			}),
	})

	const { data: editingUser, refetch: refetchEditingUser } = useQuery({
		queryKey: [USERS_QUERY_KEY, editingUserUuid.value],
		queryFn: () => getById(editingUserUuid.value || ''),
		enabled: !!editingUserUuid.value,
	})

	watch(
		() => usersQuery.data?.value?.data.pagination,
		(newPagination) => {
			if (newPagination) {
				pagination.value = { ...newPagination }
			}
		}
	)

	// === Modal ===
	const openAddModal = (email?: string) => {
		editingUserUuid.value = ''

		isModalOpen.value = true

		if (email) {
			// Pre-fill email logic could go here
		}
	}

	const openEditModal = (userUuid: string) => {
		editingUserUuid.value = userUuid

		isModalOpen.value = true

		refetchEditingUser()
	}

	const openDetailDrawer = (userUuid: string) => {
		editingUserUuid.value = userUuid

		isDetailDrawerOpen.value = true

		refetchEditingUser()
	}

	const closeDetailDrawer = () => {
		isDetailDrawerOpen.value = false

		editingUserUuid.value = ''
	}

	watch(
		() => editingUserUuid.value,
		(newEditingUserUuid) => {
			if (!newEditingUserUuid) {
				closeModal()
			}
		}
	)

	const closeModal = () => {
		isModalOpen.value = false

		editingUserUuid.value = ''
	}

	// === Mutations ===
	const createMutation = useMutation({
		mutationFn: create,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] })

			closeModal()
		},
	})

	const updateMutation = useMutation({
		mutationFn: ({ id, data }: { id: string; data: IUserCreateUpdate }) => update(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] })

			closeModal()
		},
	})

	const deleteMutation = useMutation({
		mutationFn: deleteById,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] })
		},
	})

	const handleSubmit = (data: IUserCreateUpdate) => {
		if ('uuid' in data) {
			const { uuid, ...rest } = data

			updateMutation.mutate({ id: uuid!, data: rest })
		} else {
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

	const setlimit = (limit: number) => {
		pagination.value.limit = limit

		pagination.value.page = 1
	}

	const isFetching = computed(() => usersQuery.isFetching.value)

	const setSort = (prop: string, order: string | null) => {
		if (!order) {
			filters.value.sortBy = undefined

			filters.value.sortOrder = undefined
		} else {
			filters.value.sortBy = prop

			filters.value.sortOrder = (order === 'ascending' ? 'ASC' : 'DESC') as any
		}
	}

	const removeFilter = (key: keyof UserFilters) => {
		if (key === 'sortBy' || key === 'sortOrder') return

		if (key === 'role' || key === 'status') {
			filters.value[key] = []
		} else {
			filters.value[key] = undefined as any
		}
	}

	watch(
		filters,
		() => {
			pagination.value.page = 1
		},
		{ deep: true }
	)

	return {
		// state
		filters,
		pagination,
		isModalOpen,
		isDetailDrawerOpen,

		// data
		users,
		editingUser,
		editingUserUuid,
		isLoading: usersQuery.isLoading,
		isFetching,

		// actions
		openAddModal,
		openEditModal,
		closeModal,
		openDetailDrawer,
		closeDetailDrawer,
		handleSubmit,
		handleDelete,
		setPage,
		setlimit,
		removeFilter,
		setSort,
		isSubmitting,
	}
}

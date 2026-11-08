import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'

import { userApi } from '../../api'
import type { IChangePassword, IUserCreateUpdate } from '../../model'

export const useProfile = () => {
	const queryClient = useQueryClient()

	const profileQuery = useQuery({
		queryKey: ['profile'],
		queryFn: userApi.getMe,
	})

	const updateMutation = useMutation({
		mutationFn: userApi.updateMe,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['profile'] })
		},
	})

	const passwordMutation = useMutation({
		mutationFn: userApi.changePassword,
	})

	const handleUpdate = (data: IUserCreateUpdate) => {
		return updateMutation.mutateAsync(data)
	}

	const handleChangePassword = (data: IChangePassword) => {
		return passwordMutation.mutateAsync(data)
	}

	return {
		profile: profileQuery.data,
		isLoading: profileQuery.isLoading,
		isUpdating: updateMutation.isPending,
		isChangingPassword: passwordMutation.isPending,
		handleUpdate,
		handleChangePassword,
		updateError: updateMutation.error,
		passwordError: passwordMutation.error,
	}
}

import { computed, reactive, ref } from 'vue'

import { GP_EVENTS, useEvents } from '@admin-panel/lib'
import { ElMessage } from 'element-plus'

import { mfeApi } from '#entities/mfe'

/** Known sidebar routes per MFE, used to pre-populate the per-route enable/disable drawer. */
const KNOWN_MFE_ROUTES: Record<string, { path: string; title: string }[]> = {
	orchestrator: [
		{ path: '/orchestrator', title: 'Топология системы' },
		{ path: '/orchestrator/modules', title: 'Модули (MFE)' },
		{ path: '/orchestrator/monitoring', title: 'Мониторинг ресурсов' },
		{ path: '/orchestrator/features', title: 'Feature Flags' },
		{ path: '/orchestrator/logs', title: 'Логи системы' },
	],
	users: [
		{ path: '/users', title: 'Список пользователей' },
		{ path: '/users/rights', title: 'Права и роли' },
	],
	content: [{ path: '/content', title: 'Схемы контента' }],
	translations: [{ path: '/translations', title: 'Переводы интерфейса' }],
	media: [{ path: '/media', title: 'Медиабиблиотека' }],
	about: [{ path: '/about', title: 'О нас' }],
	guests: [{ path: '/guests', title: 'Гости и предложения' }],
	platforms: [{ path: '/platforms', title: 'Платформы и интеграции' }],
	profile: [{ path: '/profile', title: 'Профиль' }],
	statistics: [{ path: '/statistics', title: 'Аналитика и статистика' }],
}

/** Per-route enable/disable drawer for a single MFE's sidebar menu items. */
export const useModuleRoutes = () => {
	const { dispatch } = useEvents()

	const routesDrawerVisible = ref(false)
	const activeMfe = ref<any>(null)
	const disabledRoutesLocal = ref<string[]>([])
	const customRoutePath = ref('')
	const isSavingRoutes = ref(false)

	const activeMfeRoutes = computed(() => {
		if (!activeMfe.value) return []

		const mfeName = activeMfe.value.name
		const known = KNOWN_MFE_ROUTES[mfeName] || [{ path: `/${mfeName}`, title: activeMfe.value.displayName }]

		// Include any existing disabled routes that aren't in the known list
		const allPaths = new Set(known.map((k) => k.path))
		const extras = disabledRoutesLocal.value
			.filter((p) => !allPaths.has(p))
			.map((p) => ({ path: p, title: `Роут: ${p}` }))

		return [...known, ...extras]
	})

	const openRoutesDrawer = (mfe: any) => {
		activeMfe.value = mfe

		const config = mfe.config || {}
		const disabled = (config.disabledRoutes || config.disabled_routes || []) as string[]

		disabledRoutesLocal.value = [...disabled]
		customRoutePath.value = ''
		routesDrawerVisible.value = true
	}

	const isRouteDisabled = (path: string) => disabledRoutesLocal.value.includes(path)

	const toggleRoute = (path: string) => {
		const idx = disabledRoutesLocal.value.indexOf(path)

		if (idx >= 0) {
			disabledRoutesLocal.value.splice(idx, 1)
		} else {
			disabledRoutesLocal.value.push(path)
		}
	}

	const enableAllRoutes = () => {
		disabledRoutesLocal.value = []
	}

	const disableAllRoutes = () => {
		disabledRoutesLocal.value = activeMfeRoutes.value.map((r) => r.path)
	}

	const addCustomRoute = () => {
		if (!customRoutePath.value.trim()) return

		const path = customRoutePath.value.trim()

		if (!disabledRoutesLocal.value.includes(path)) {
			disabledRoutesLocal.value.push(path)
		}

		customRoutePath.value = ''
	}

	const getDisabledCount = (mfe: any) => {
		const config = mfe.config || {}
		const disabled = (config.disabledRoutes || config.disabled_routes || []) as string[]

		return disabled.length
	}

	const saveRoutesConfig = async () => {
		if (!activeMfe.value) return

		isSavingRoutes.value = true

		try {
			const updatedConfig = {
				...(activeMfe.value.config || {}),
				disabledRoutes: [...disabledRoutesLocal.value],
			}

			await mfeApi.update(activeMfe.value.id, {
				...activeMfe.value,
				config: updatedConfig,
			})

			activeMfe.value.config = updatedConfig

			ElMessage.success('Настройки пунктов меню сохранены в PostgreSQL')
			dispatch(GP_EVENTS.UPDATED)
			routesDrawerVisible.value = false
		} catch (e: any) {
			ElMessage.error(`Ошибка при сохранении: ${e.message || 'Сбой сети'}`)
		} finally {
			isSavingRoutes.value = false
		}
	}

	return reactive({
		routesDrawerVisible,
		activeMfe,
		activeMfeRoutes,
		customRoutePath,
		isSavingRoutes,
		openRoutesDrawer,
		isRouteDisabled,
		toggleRoute,
		enableAllRoutes,
		disableAllRoutes,
		addCustomRoute,
		getDisabledCount,
		saveRoutesConfig,
	})
}

export type ModuleRoutes = ReturnType<typeof useModuleRoutes>

import { reactive, ref } from 'vue'
import type { Router } from 'vue-router'
import { ROUTES } from '@admin-panel/lib'
import { ElMessage } from 'element-plus'
import { pagesApi } from '#entities/pages'
import { buildAboutPageTemplatePayload, seedAboutSchema, seedGuestsSchema, seedPlatformsSchema } from '../lib/demoSeeds'
import type { PagesAndSchemas } from './usePagesAndSchemas'

/** Owns navigation and one-off page/demo-template creation actions for the page list. */
export function usePageListActions(pagesAndSchemas: PagesAndSchemas, router: Router) {
	const isCreatingTemplate = ref(false)

	function goToCreate() {
		router.push({ name: 'PageCreate' })
	}

	function goToEdit(id: string) {
		router.push({ name: 'PageEdit', params: { id } })
	}

	function handleCardClick(item: any) {
		if (item.isSchema) handleEditSchemaPage(item)
		else goToEdit(item.id)
	}

	async function handleEditSchemaPage(item: any) {
		if (item.slug === 'page_home') {
			router.push('/home')
			return
		}

		if (item.hasSchema) {
			router.push({ name: 'EntriesList', params: { schemaIdentifier: item.slug } })
			return
		}

		try {
			pagesAndSchemas.loading = true
			if (item.slug === 'page_about') {
				await seedAboutSchema()
				ElMessage.success('Схема «page_about» успешно инициализирована!')
			} else if (item.slug === 'page_guests') {
				await seedGuestsSchema()
				ElMessage.success('Схема «page_guests» успешно инициализирована!')
			} else if (item.slug === 'page_platforms') {
				await seedPlatformsSchema()
				ElMessage.success('Схема «page_platforms» успешно инициализирована!')
			}
			await pagesAndSchemas.fetchData()
			router.push({ name: 'EntriesList', params: { schemaIdentifier: item.slug } })
		} catch {
			router.push({ name: ROUTES.content.name })
			ElMessage.info(`Настройте схему «${item.title}» в конструкторе схем`)
		} finally {
			pagesAndSchemas.loading = false
		}
	}

	function openSitemap() {
		const base = (import.meta.env.VITE_CLIENT_URL || 'http://localhost:3000').replace(/\/$/, '')
		window.open(`${base}/sitemap.xml`, '_blank')
	}

	function openClientPreview(slug: string) {
		const cleanSlug = slug.replace(/^\/+/, '')
		const frontendUrl = import.meta.env.VITE_CLIENT_URL || 'http://localhost:3000'
		window.open(`${frontendUrl}/p/${cleanSlug}?preview=true`, '_blank')
	}

	function openWebsitePath(path: string) {
		const frontendUrl = import.meta.env.VITE_CLIENT_URL || 'http://localhost:3000'
		window.open(`${frontendUrl}${path}`, '_blank')
	}

	async function handleCreateAboutTemplate() {
		isCreatingTemplate.value = true
		try {
			const res = await pagesApi.createPage(buildAboutPageTemplatePayload() as any)
			ElMessage.success('Блочная страница «О платформе» успешно создана!')
			if (res.data?.id) {
				router.push({ name: 'PageEdit', params: { id: res.data.id } })
			} else {
				pagesAndSchemas.fetchData()
			}
		} catch (err: any) {
			ElMessage.error(err.message || 'Ошибка создания шаблона')
		} finally {
			isCreatingTemplate.value = false
		}
	}

	return reactive({
		isCreatingTemplate,
		goToCreate,
		goToEdit,
		handleCardClick,
		handleEditSchemaPage,
		openSitemap,
		openClientPreview,
		openWebsitePath,
		handleCreateAboutTemplate,
	})
}

export type PageListActions = ReturnType<typeof usePageListActions>

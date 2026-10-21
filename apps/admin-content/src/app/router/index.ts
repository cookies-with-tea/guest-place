import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

import { ROUTES } from '@admin-panel/lib'

export const routes: RouteRecordRaw[] = [
	{
		path: '/',
		name: ROUTES.content.name,
		component: () => import('#pages/SchemaBuilderPage.vue'),
		meta: {
			title: ROUTES.content.title,
		},
	},
	{
		path: '/schemas',
		name: 'Content',
		redirect: '/',
	},
	{
		path: '/content/:schemaIdentifier',
		name: 'EntriesList',
		component: () => import('#pages/content-page/ui/ContentPage.vue'),
		meta: { hideInSidebar: true },
	},
	{
		path: '/content/:schemaIdentifier/create',
		name: 'EntryCreate',
		component: () => import('#pages/content-editor-page/ui/ContentEditorPage.vue'),
		meta: { hideInSidebar: true },
	},
	{
		path: '/content/:schemaIdentifier/edit/:id',
		name: 'EntryEdit',
		component: () => import('#pages/content-editor-page/ui/ContentEditorPage.vue'),
		meta: { hideInSidebar: true },
	},
	{
		path: '/pages',
		name: 'PageList',
		component: () => import('#pages/page-list/ui/PageListPage.vue'),
		meta: { title: 'Страницы сайта' },
	},
	{
		path: '/menus',
		name: 'MenusPage',
		component: () => import('#pages/menus-page/ui/MenusPage.vue'),
		meta: { title: 'Меню и навигация' },
	},
	{
		path: '/redirects',
		name: 'RedirectsPage',
		component: () => import('#pages/redirects-page/ui/RedirectsPage.vue'),
		meta: { title: 'Редиректы 301/302' },
	},
	{
		path: '/venues',
		name: 'VenuesPage',
		component: () => import('#pages/venues-page/ui/VenuesPage.vue'),
		meta: { title: 'Площадки (Venues)' },
	},
	{
		path: '/home',
		name: 'HomePageEditor',
		component: () => import('#pages/home-page/ui/HomePageEditor.vue'),
		meta: { title: 'Главная страница (Home)' },
	},
	{
		path: '/pages/create',
		name: 'PageCreate',
		component: () => import('#pages/page-constructor/ui/PageConstructorPage.vue'),
		meta: { title: 'Создание страницы', hideInSidebar: true },
	},
	{
		path: '/pages/:id/edit',
		name: 'PageEdit',
		component: () => import('#pages/page-constructor/ui/PageConstructorPage.vue'),
		meta: { title: 'Редактор страницы', hideInSidebar: true },
	},
	{
		path: '/docs',
		name: 'ContentDocs',
		component: () => import('#pages/docs-page/ui/ContentDocsPage.vue'),
		meta: { title: 'Документация: Схемы и Live Preview' },
	},
	{
		path: '/settings',
		name: 'GlobalSettings',
		component: () => import('#pages/settings-page/ui/SettingsPage.vue'),
	},
]

export const router = createRouter({
	history: createWebHistory(),
	routes,
})

export default routes

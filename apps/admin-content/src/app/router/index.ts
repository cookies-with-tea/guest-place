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

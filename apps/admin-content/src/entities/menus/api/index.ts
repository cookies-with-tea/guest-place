import { createApi } from '@admin-panel/lib'

export interface MenuItem {
	id: string
	title: string
	type: 'page' | 'url' | 'anchor'
	page_id?: string
	url?: string
	target?: '_self' | '_blank'
	children?: MenuItem[]
	order?: number
}

export interface Menu {
	id: string
	name: string
	location: string
	items: MenuItem[]
	created_at: string
	updated_at: string
}

export interface CreateMenuDTO {
	name: string
	location: string
	items?: MenuItem[]
}

export interface UpdateMenuDTO {
	name?: string
	location?: string
	items?: MenuItem[]
}

const { fetchData: fetchMenus } = createApi('menus')

export const menusApi = {
	getMenus: () => fetchMenus<Menu[]>(''),

	getMenuByLocation: (location: string) => fetchMenus<Menu>(`/${location}`),

	createMenu: (payload: CreateMenuDTO) =>
		fetchMenus<Menu>('', {
			method: 'POST',
			body: payload,
		}),

	updateMenu: (id: string, payload: UpdateMenuDTO) =>
		fetchMenus<Menu>(`/${id}`, {
			method: 'PATCH',
			body: payload,
		}),

	deleteMenu: (id: string) =>
		fetchMenus(`/${id}`, {
			method: 'DELETE',
		}),
}

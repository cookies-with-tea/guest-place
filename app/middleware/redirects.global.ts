import { defineNuxtRouteMiddleware, navigateTo } from '#app'

export default defineNuxtRouteMiddleware(async (to) => {
	// Skip redirect checks for static assets, api calls, or preview pages
	if (
		to.path.startsWith('/_nuxt') ||
		to.path.startsWith('/api') ||
		to.path.startsWith('/__nuxt') ||
		to.query.preview === 'true'
	) {
		return
	}

	try {
		const encoded = encodeURIComponent(to.path)
		const res = await $fetch<{
			data?: {
				matched: boolean
				target_path?: string
				status_code?: number
			}
		}>(`/api/v1/redirects/check?path=${encoded}`)

		if (res?.data?.matched && res.data.target_path) {
			const target = res.data.target_path
			const isExternal = target.startsWith('http://') || target.startsWith('https://')
			const code = res.data.status_code || 301

			return navigateTo(target, {
				redirectCode: code,
				external: isExternal,
			})
		}
	} catch {
		// Ignore fetch error to not break routing
	}
})

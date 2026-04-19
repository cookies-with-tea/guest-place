export interface RemoteManifestItem {
	name: string
	displayName: string
	url: string
	scope: string
	module: string
	icon?: string
	category: string
	order?: number
}

export interface RemoteManifest {
	remotes: RemoteManifestItem[]
}

const initializedRemotes = new Set<string>()

/**
 * Dynamically loads a remote module using Vite Module Federation runtime logic.
 */
export async function loadRemoteModule(remote: RemoteManifestItem, context?: any) {
	try {
		// 1. Import the remote entry as an ES module
		// @ts-ignore
		// console.log(`[Federation] Loading remote: ${remote.name} from ${remote.url}`)
		const container = await import(/* @vite-ignore */ remote.url)

		// 2. Initialize the container (Module Federation init)
		// @ts-ignore
		const sharedScope = window.__federation_shared__ || {}
		// console.log(`[Federation] Initializing ${remote.name} with shared scope keys:`, Object.keys(sharedScope))

		if (container && !initializedRemotes.has(remote.url)) {
			// @ts-ignore
			await container.init(sharedScope)

			initializedRemotes.add(remote.url)
		}

		// 3. Get the module
		// @ts-ignore
		const factory = await container.get(remote.module)
		const module = factory()

		// 4. Run lifecycle hooks if present
		const hooks = module.hooks || module.default?.hooks

		if (hooks && hooks.onMount) {
			await hooks.onMount(context?.app, context)
		}

		return module
	} catch (error) {
		// eslint-disable-next-line no-console
		console.error(`Failed to load remote module: ${remote.name}`, error)

		throw error
	}
}

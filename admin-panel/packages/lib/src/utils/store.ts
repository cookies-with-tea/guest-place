import { getActivePinia, type Pinia, type Store } from 'pinia'

/**
 * Registry for stores that should be accessible across micro-frontends.
 */
const globalStoreRegistry: Record<string, () => Store> = {}

/**
 * Registers a store in the global registry for cross-MF access.
 * @param id Unique ID for the store (e.g., 'users', 'auth')
 * @param useStore The store hook function
 */
export function registerSharedStore(id: string, useStore: () => Store) {
	globalStoreRegistry[id] = useStore
}

/**
 * Retrieves a registered store by its ID.
 * Useful when you need to access state from another micro-frontend without direct imports.
 * @param id The registered store ID
 */
export function getSharedStore<T extends Store>(id: string): T | undefined {
	const useStore = globalStoreRegistry[id]

	if (!useStore) {
		// eslint-disable-next-line no-console
		console.warn(`[Federation] Shared store with ID "${id}" not found.`)

		return undefined
	}

	return useStore() as T
}

/**
 * Ensures that Pinia is initialized correctly in a micro-frontend.
 * If running inside a shell, it will use the shell's Pinia instance.
 */
export function initializePinia(pinia?: Pinia) {
	const activePinia = getActivePinia()

	if (activePinia) return activePinia

	if (pinia) return pinia

	throw new Error('[Federation] Pinia not initialized. Provide an instance or ensure a global one exists.')
}

import { createPinia, defineStore, setActivePinia } from 'pinia'

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getSharedStore, initializePinia, registerSharedStore } from '../../utils/store'

describe('store utils', () => {
	beforeEach(() => {
		setActivePinia(createPinia())
	})

	it('should register and retrieve a shared store', () => {
		const useTestStore = defineStore('test', {
			state: () => ({ count: 0 }),
			actions: {
				increment() {
					this.count++
				},
			},
		})

		registerSharedStore('test', useTestStore)

		const store = getSharedStore<ReturnType<typeof useTestStore>>('test')

		expect(store).toBeDefined()

		expect(store?.count).toBe(0)

		store?.increment()

		expect(store?.count).toBe(1)
	})

	it('should return undefined for unregistered store and log a warning', () => {
		const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
		const store = getSharedStore('non-existent')

		expect(store).toBeUndefined()

		expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('not found'))

		warnSpy.mockRestore()
	})

	describe('initializePinia', () => {
		it('should return existing pinia if already initialized', () => {
			const pinia = createPinia()

			setActivePinia(pinia)

			expect(initializePinia()).toBe(pinia)
		})

		it('should return provided pinia if none is active', () => {
			// Clear active pinia
			setActivePinia(undefined as any)

			const pinia = createPinia()

			expect(initializePinia(pinia)).toBe(pinia)
		})

		it('should throw error if pinia is not initialized and not provided', () => {
			setActivePinia(undefined as any)

			expect(() => initializePinia()).toThrow('[Federation] Pinia not initialized')
		})
	})
})

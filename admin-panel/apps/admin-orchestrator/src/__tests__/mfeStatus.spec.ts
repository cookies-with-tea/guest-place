import { describe, expect, it } from 'vitest'

describe('MFE Health & Status Calculations', () => {
	const formatBytes = (bytes?: number | null) => {
		if (!bytes || bytes === 0) return '0 B'
		const k = 1024
		const sizes = ['B', 'KB', 'MB', 'GB']
		const i = Math.floor(Math.log(bytes) / Math.log(k))
		return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
	}

	const getLatencyType = (latency?: number | null) => {
		if (latency === undefined || latency === null) return 'info'
		if (latency < 50) return 'success'
		if (latency < 200) return 'warning'
		return 'danger'
	}

	it('formats chunk sizes correctly', () => {
		expect(formatBytes(0)).toBe('0 B')
		expect(formatBytes(1024)).toBe('1 KB')
		expect(formatBytes(14500)).toBe('14.2 KB')
		expect(formatBytes(1048576)).toBe('1 MB')
	})

	it('classifies latency properly', () => {
		expect(getLatencyType(null)).toBe('info')
		expect(getLatencyType(15)).toBe('success')
		expect(getLatencyType(80)).toBe('warning')
		expect(getLatencyType(350)).toBe('danger')
	})

	it('correctly filters disabled routes for MFE menu configuration', () => {
		const allRoutes = [
			{ path: '/orchestrator', title: 'Топология' },
			{ path: '/orchestrator/modules', title: 'Модули' },
			{ path: '/orchestrator/logs', title: 'Логи' },
		]

		const disabledRoutes = ['/orchestrator/logs']

		const visibleRoutes = allRoutes.filter((r) => !disabledRoutes.includes(r.path))
		expect(visibleRoutes.length).toBe(2)
		expect(visibleRoutes.map((r) => r.path)).toEqual(['/orchestrator', '/orchestrator/modules'])
	})
})

export interface ProcessStats {
	name: string
	memoryUsed: number
	cpuUsage: number
	isSystem: boolean
}

export interface SystemStats {
	cpuUsage: number
	memoryUsed: number
	memoryTotal: number
	uptime: number
	processes: ProcessStats[]
}

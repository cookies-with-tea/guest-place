import { createApi } from './fetch'

const { fetchData } = createApi('audit')

export interface IAuditLogEntry {
	id: string
	actorUserId: string | null
	actorEmail: string | null
	action: string
	entityType: string | null
	entityId: string | null
	payload: Record<string, any> | null
	createdAt: string
}

export interface IAuditLogQuery {
	actorUserId?: string
	action?: string
	entityType?: string
	page?: number
	limit?: number
}

export const auditApi = {
	list: (params?: IAuditLogQuery) =>
		fetchData<{ items: IAuditLogEntry[]; pagination: unknown }>('', { params }),
}

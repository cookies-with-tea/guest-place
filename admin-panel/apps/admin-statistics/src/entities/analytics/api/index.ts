import { createApi } from '@admin-panel/lib'

import type {
	AnalyticsParams,
	AnalyticsSummary,
	EngagementStats,
	FunnelStats,
	ReferralStats,
	RetentionStats,
	StartSessionPayload,
	TrackEventPayload,
	TrafficStats,
} from '../model'

const { fetchData } = createApi('analytics')

export const analyticsApi = {
	getTraffic: (params?: AnalyticsParams) => fetchData<TrafficStats>('/traffic', { params }),
	getEngagement: (params?: AnalyticsParams) => fetchData<EngagementStats>('/engagement', { params }),
	getSummary: (params?: AnalyticsParams) => fetchData<AnalyticsSummary>('/summary', { params }),
	getReferrals: (params?: AnalyticsParams) => fetchData<ReferralStats>('/referrals', { params }),
	getFunnel: (params?: AnalyticsParams) => fetchData<FunnelStats>('/funnel', { params }),
	getRetention: (params?: AnalyticsParams) => fetchData<RetentionStats>('/retention', { params }),
	startSession: (data: StartSessionPayload) => fetchData('/session', { method: 'POST', body: data }),
	trackEvent: (data: TrackEventPayload) => fetchData('/track', { method: 'POST', body: data }),
}

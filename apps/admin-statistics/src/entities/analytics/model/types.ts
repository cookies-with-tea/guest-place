import type { CamelCasedProperties, paths, SnakeCasedProperties } from '@admin-panel/lib'

export type TrafficStats = CamelCasedProperties<
	NonNullable<paths['/api/v1/analytics/traffic']['get']['responses']['200']['content']['application/json']['data']>
>

export type EngagementStats = CamelCasedProperties<
	NonNullable<paths['/api/v1/analytics/engagement']['get']['responses']['200']['content']['application/json']['data']>
>

export interface AnalyticsParams {
	days?: number
}

export interface AnalyticsSummary {
	totalVisitors: number
	avgSessionDuration: number
	totalClicks: number
	pageViews: number
	visitorsTrend: number
	sessionTrend: number
	clicksTrend: number
	viewsTrend: number
}

export type ReferralStats = CamelCasedProperties<
	NonNullable<paths['/api/v1/analytics/referrals']['get']['responses']['200']['content']['application/json']['data']>
>

export type FunnelStats = CamelCasedProperties<
	NonNullable<paths['/api/v1/analytics/funnel']['get']['responses']['200']['content']['application/json']['data']>
>

export type RetentionStats = CamelCasedProperties<
	NonNullable<paths['/api/v1/analytics/retention']['get']['responses']['200']['content']['application/json']['data']>
>

// For body (request) - we use SnakeCasedProperties if we want to be safe,
// although createApi's fetchData converts body to snake_case automatically.
export type StartSessionPayload = SnakeCasedProperties<
	paths['/api/v1/analytics/session']['post']['requestBody']['content']['application/json']
>

export type TrackEventPayload = SnakeCasedProperties<
	paths['/api/v1/analytics/track']['post']['requestBody']['content']['application/json']
>

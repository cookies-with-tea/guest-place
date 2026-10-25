import { computed, reactive, ref } from 'vue'
import type { VenueForm } from './useVenueForm'

export type VenueFormTabId =
	| 'basic'
	| 'halls'
	| 'pricing'
	| 'menu'
	| 'feed'
	| 'chat'
	| 'features'
	| 'media'
	| 'description'

/** Owns the venue editor's pill tab navigation: which tab is active, and its badge counts. */
export function useVenueEditorTabs(venueForm: VenueForm) {
	const activeFormTab = ref<VenueFormTabId>('basic')

	const venueTabs = computed(() => [
		{ id: 'basic' as const, icon: '🏢', label: 'Основное & Контакты' },
		{
			id: 'halls' as const,
			icon: '🏰',
			label: 'Залы & Номера',
			badge: venueForm.formHalls.length + venueForm.formRooms.length,
		},
		{ id: 'pricing' as const, icon: '💰', label: 'Цены & Аренда' },
		{ id: 'menu' as const, icon: '🍽️', label: 'Меню', badge: venueForm.formMenuPhotos.length },
		{ id: 'feed' as const, icon: '📰', label: 'Лента', badge: venueForm.formFeed.length },
		{
			id: 'chat' as const,
			icon: '💬',
			label: 'Чат, Отзывы & FAQ',
			badge: venueForm.formReviews.length + venueForm.formFaq.length,
		},
		{ id: 'features' as const, icon: '🎯', label: 'Особенности & Услуги' },
		{ id: 'media' as const, icon: '🖼️', label: 'Фотогалерея' },
		{ id: 'description' as const, icon: '📝', label: 'Описание' },
	])

	return reactive({ activeFormTab, venueTabs })
}

export type VenueEditorTabs = ReturnType<typeof useVenueEditorTabs>

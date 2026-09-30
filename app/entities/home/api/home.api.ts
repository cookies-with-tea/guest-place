import { fetchData } from '#shared/api'
import type { VenuePreviewType } from '~/entities/venue/model/types'
import { mapVenueToPreview } from '~/entities/venue/api/venue.api'

export interface HomeCategoryItem {
  id?: number
  title: string
  slug: string
  link: string
  iconUuid?: string | null
  icon?: { url: string; alt?: string } | null
  sortOrder: number
}

export interface HomeInteractionItem {
  id?: number
  stepNumber: number
  title: string
  text: string
  buttonText: string
  link: string
  isAccent: boolean
  sortOrder: number
}

export interface HomeData {
  title: string
  subtitle: string
  heroMapButtonText: string
  heroListButtonText: string
  heroGuideUuid?: string | null
  heroGuide?: { url: string } | null

  categoriesTitle: string
  categories: HomeCategoryItem[]

  latestSectionTitle: string
  latestSectionButtonText: string
  latestSectionButtonLink: string
  latestVenues: VenuePreviewType[]

  popularSectionTitle: string
  popularSectionButtonText: string
  popularSectionButtonLink: string
  popularVenues: VenuePreviewType[]

  interactionsTitle: string
  interactions: HomeInteractionItem[]

  bannerTitle: string
  bannerText: string
  bannerGuideUuid?: string | null
  bannerGuide?: { url: string } | null
}

export const getHomeData = async (): Promise<HomeData> => {
  const res = await fetchData<any>('/api/v1/home', { method: 'GET' })
  const d = res.data || {}

  return {
    title: d.title || 'СОЦИАЛЬНАЯ ИНТЕРАКТИВНАЯ ПЛАТФОРМА',
    subtitle: d.subtitle || 'Соединяем гостей и места\nОбщение, бронирование здесь и сейчас',
    heroMapButtonText: d.heroMapButtonText || d.hero_map_button_text || 'Показать на карте',
    heroListButtonText: d.heroListButtonText || d.hero_list_button_text || 'Показать списком',
    heroGuideUuid: d.heroGuideUuid || d.hero_guide_uuid,
    heroGuide: d.heroGuide || d.hero_guide,

    categoriesTitle: d.categoriesTitle || d.categories_title || 'Места по категориям',
    categories: (d.categories || []).map((c: any) => ({
      id: c.id,
      title: c.title,
      slug: c.slug,
      link: c.link,
      iconUuid: c.iconUuid || c.icon_uuid,
      icon: c.icon,
      sortOrder: c.sortOrder || c.sort_order || 0,
    })),

    latestSectionTitle: d.latestSectionTitle || d.latest_section_title || 'Последние добавленные',
    latestSectionButtonText: d.latestSectionButtonText || d.latest_section_button_text || 'Показать еще',
    latestSectionButtonLink: d.latestSectionButtonLink || d.latest_section_button_link || '/venues',
    latestVenues: (d.latestVenues || d.latest_venues || []).map(mapVenueToPreview),

    popularSectionTitle: d.popularSectionTitle || d.popular_section_title || 'Самые популярные',
    popularSectionButtonText: d.popularSectionButtonText || d.popular_section_button_text || 'В каталог',
    popularSectionButtonLink: d.popularSectionButtonLink || d.popular_section_button_link || '/venues',
    popularVenues: (d.popularVenues || d.popular_venues || []).map(mapVenueToPreview),

    interactionsTitle: d.interactionsTitle || d.interactions_title || 'Варианты взаимодействия с GP Platform',
    interactions: (d.interactions || []).map((item: any) => ({
      id: item.id,
      stepNumber: item.stepNumber || item.step_number || 1,
      title: item.title,
      text: item.text,
      buttonText: item.buttonText || item.button_text,
      link: item.link,
      isAccent: !!(item.isAccent ?? item.is_accent),
      sortOrder: item.sortOrder || item.sort_order || 0,
    })),

    bannerTitle: d.bannerTitle || d.banner_title || 'Для быстрого поиска Вы можете пользоваться всеми вариантами одновременно.',
    bannerText: d.bannerText || d.banner_text || 'GP Платформа позволяет общаться напрямую здесь и сейчас. Мы за «прозрачные отношения»',
    bannerGuideUuid: d.bannerGuideUuid || d.banner_guide_uuid,
    bannerGuide: d.bannerGuide || d.banner_guide,
  }
}

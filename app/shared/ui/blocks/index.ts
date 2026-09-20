import { registerCmsBlock, getCmsBlock, getAllCmsBlocks, getCmsBlocksManifest } from './registry'
import type { CmsBlockDefinition, FieldDefinition } from './registry'

import BlockRenderer from './BlockRenderer.vue'
import BlockFallback from './BlockFallback.vue'
import HeroBlock from './HeroBlock.vue'
import TwoColumnFeaturesBlock from './TwoColumnFeaturesBlock.vue'
import QuoteBannerBlock from './QuoteBannerBlock.vue'
import TextWithImageBlock from './TextWithImageBlock.vue'
import CardGridBlock from './CardGridBlock.vue'
import InfoBannerBlock from './InfoBannerBlock.vue'
import WireframeBlock from './WireframeBlock.vue'

// 0. Wireframe / Placeholder Block (for rapid prototyping before real components)
registerCmsBlock({
	type: 'wireframe',
	name: 'Макет / Вайрфрейм',
	description: 'Свободный прямоугольник с заголовком и текстом для прототипирования структуры',
	icon: '📐',
	category: 'prototype',
	schema: [
		{ name: 'title', label: 'Заголовок / Назначение блока', fieldType: 'Text', required: true },
		{ name: 'subtitle', label: 'Подзаголовок / Секция', fieldType: 'Text' },
		{ name: 'description', label: 'Текст / Описание / ТЗ для верстки', fieldType: 'RichText' },
		{ name: 'cta_text', label: 'Текст кнопки (если нужна)', fieldType: 'Text' },
		{ name: 'cta_link', label: 'Ссылка кнопки', fieldType: 'Text' },
		{ name: 'badge', label: 'Метка статуса (например, «В разработке»)', fieldType: 'Text' },
		{ name: 'height', label: 'Высота блока (small, medium, large)', fieldType: 'Text' },
	],
	component: WireframeBlock,
})

// 1. Hero Block
registerCmsBlock({
	type: 'hero',
	name: 'Hero Секция',
	description: 'Главный баннер страницы с заголовком, описанием и фоновым изображением',
	icon: '🚀',
	category: 'hero',
	schema: [
		{ name: 'title', label: 'Заголовок', fieldType: 'Text', required: true },
		{ name: 'subtitle', label: 'Подзаголовок', fieldType: 'Text' },
		{ name: 'image', label: 'Изображение', fieldType: 'Media' },
		{ name: 'cta_text', label: 'Текст кнопки', fieldType: 'Text' },
		{ name: 'cta_link', label: 'Ссылка кнопки', fieldType: 'Text' },
	],
	component: HeroBlock,
})

// 2. Two Column Features Block
registerCmsBlock({
	type: 'two_column_features',
	name: 'Две колонки возможностей',
	description: 'Сравнение двух направлений с буллетами и кнопками действия',
	icon: '⚖️',
	category: 'content',
	schema: [
		{ name: 'left_title', label: 'Заголовок левой колонки', fieldType: 'Text' },
		{ name: 'left_items', label: 'Пункты левой колонки (через перенос строки)', fieldType: 'RichText' },
		{ name: 'left_cta_text', label: 'Текст левой кнопки', fieldType: 'Text' },
		{ name: 'left_cta_link', label: 'Ссылка левой кнопки', fieldType: 'Text' },
		{ name: 'right_title', label: 'Заголовок правой колонки', fieldType: 'Text' },
		{ name: 'right_items', label: 'Пункты правой колонки (через перенос строки)', fieldType: 'RichText' },
		{ name: 'right_cta_text', label: 'Текст правой кнопки', fieldType: 'Text' },
		{ name: 'right_cta_link', label: 'Ссылка правой кнопки', fieldType: 'Text' },
	],
	component: TwoColumnFeaturesBlock,
})

// 3. Quote Banner Block
registerCmsBlock({
	type: 'quote_banner',
	name: 'Цитата-баннер',
	description: 'Акцентный блок с цитатой, миссией и ключевыми ценностями',
	icon: '💬',
	category: 'content',
	schema: [
		{ name: 'quote', label: 'Текст цитаты / Заголовок', fieldType: 'Text', required: true },
		{ name: 'description', label: 'Описание', fieldType: 'RichText' },
		{ name: 'val1_title', label: 'Ценность 1 (заголовок)', fieldType: 'Text' },
		{ name: 'val1_desc', label: 'Ценность 1 (описание)', fieldType: 'Text' },
		{ name: 'val2_title', label: 'Ценность 2 (заголовок)', fieldType: 'Text' },
		{ name: 'val2_desc', label: 'Ценность 2 (описание)', fieldType: 'Text' },
	],
	component: QuoteBannerBlock,
})

// 4. Text With Image Block
registerCmsBlock({
	type: 'text_with_image',
	name: 'Текст с изображением',
	description: 'Контентный блок с текстом и иллюстрацией (слева или справа)',
	icon: '🖼️',
	category: 'content',
	schema: [
		{ name: 'title_prefix', label: 'Префикс заголовка (обычный)', fieldType: 'Text' },
		{ name: 'title_accent', label: 'Акцентная часть заголовка (цветная)', fieldType: 'Text' },
		{ name: 'text', label: 'Основной текст', fieldType: 'RichText' },
		{ name: 'image', label: 'Изображение', fieldType: 'Media' },
		{ name: 'image_position', label: 'Позиция изображения (left или right)', fieldType: 'Text' },
	],
	component: TextWithImageBlock,
})

// 5. Card Grid Block
registerCmsBlock({
	type: 'card_grid',
	name: 'Сетка карточек',
	description: 'Сетка новостей или преимуществ из нескольких карточек',
	icon: '▦',
	category: 'content',
	schema: [
		{ name: 'title', label: 'Заголовок блока', fieldType: 'Text' },
		{ name: 'subtitle', label: 'Подзаголовок', fieldType: 'Text' },
		{ name: 'card1_title', label: 'Карточка 1: Заголовок', fieldType: 'Text' },
		{ name: 'card1_desc', label: 'Карточка 1: Описание', fieldType: 'Text' },
		{ name: 'card1_icon', label: 'Карточка 1: Иконка / Эмодзи', fieldType: 'Text' },
		{ name: 'card2_title', label: 'Карточка 2: Заголовок', fieldType: 'Text' },
		{ name: 'card2_desc', label: 'Карточка 2: Описание', fieldType: 'Text' },
		{ name: 'card2_icon', label: 'Карточка 2: Иконка / Эмодзи', fieldType: 'Text' },
		{ name: 'card3_title', label: 'Карточка 3: Заголовок', fieldType: 'Text' },
		{ name: 'card3_desc', label: 'Карточка 3: Описание', fieldType: 'Text' },
		{ name: 'card3_icon', label: 'Карточка 3: Иконка / Эмодзи', fieldType: 'Text' },
	],
	component: CardGridBlock,
})

// 6. Info Banner Block
registerCmsBlock({
	type: 'info_banner',
	name: 'Инфо-баннер (CTA)',
	description: 'Центрированный баннер с призывом к действию или информацией',
	icon: '📢',
	category: 'cta',
	schema: [
		{ name: 'title', label: 'Заголовок баннера', fieldType: 'Text', required: true },
		{ name: 'description', label: 'Описание', fieldType: 'Text' },
		{ name: 'button_text', label: 'Текст кнопки', fieldType: 'Text' },
		{ name: 'button_link', label: 'Ссылка кнопки', fieldType: 'Text' },
	],
	component: InfoBannerBlock,
})

export {
	registerCmsBlock,
	getCmsBlock,
	getAllCmsBlocks,
	getCmsBlocksManifest,
	BlockRenderer,
	BlockFallback,
	HeroBlock,
	TwoColumnFeaturesBlock,
	QuoteBannerBlock,
	TextWithImageBlock,
	CardGridBlock,
	InfoBannerBlock,
	WireframeBlock,
}

export type { CmsBlockDefinition, FieldDefinition }

import { createEntry, createSchema } from '#entities/content/api'

/**
 * One-off demo-content seeders for the schema-driven "about / guests / platforms" pages, and the
 * demo block-based "about" page template. Used by the "Инициализировать" / "Сгенерировать демо" actions.
 */

export async function seedAboutSchema() {
	const res = await createSchema({
		name: 'Страница: О платформе',
		slug: 'page_about',
		is_singleton: true,
		fields: [
			{ name: 'city', label: 'Город по умолчанию', field_type: 'text', required: false },
			{ name: 'hero_title', label: 'Главный заголовок (Hero Title)', field_type: 'text', required: true },
			{ name: 'hero_subtitle', label: 'Подзаголовок Hero (многострочный)', field_type: 'text', required: false },
			{ name: 'guest_title', label: 'Название карточки 1 (Guest)', field_type: 'text', required: true },
			{ name: 'guest_features', label: 'Возможности Guest (через новую строку)', field_type: 'text', required: false },
			{ name: 'guest_button_text', label: 'Текст кнопки Guest', field_type: 'text', required: false },
			{ name: 'place_title', label: 'Название карточки 2 (Place)', field_type: 'text', required: true },
			{ name: 'place_features', label: 'Возможности Place (через новую строку)', field_type: 'text', required: false },
			{ name: 'place_button_text', label: 'Текст кнопки Place', field_type: 'text', required: false },
			{ name: 'quote_title', label: 'Заголовок цитаты', field_type: 'text', required: false },
			{ name: 'quote_description', label: 'Текст ценностей', field_type: 'text', required: false },
			{ name: 'mission_title_accent', label: 'Акцент слова Миссии', field_type: 'text', required: false },
			{ name: 'mission_text', label: 'Текст Миссии', field_type: 'rich_text', required: false },
			{ name: 'mission_image', label: 'Изображение Миссии', field_type: 'media', required: false },
			{ name: 'history_title_accent', label: 'Акцент слова Истории', field_type: 'text', required: false },
			{ name: 'history_text', label: 'Текст Истории', field_type: 'rich_text', required: false },
			{ name: 'history_image', label: 'Изображение Истории', field_type: 'media', required: false },
		],
	})

	if (res?.data?.id) {
		await createEntry({
			schema_id: res.data.id,
			slug: 'about-main-entry',
			status: 'published',
			data: {
				city: 'Москва',
				hero_title: 'О платформе Guest & Place',
				hero_subtitle: 'Платформа, позволяющая общаться напрямую!\nПомогаем каждому Гостю найти “свое” место.',
				guest_title: 'Guest',
				guest_features:
					'Прямая связь с площадкой в режиме реального времени\nАктуальная информация, меню, цены, свободные даты\nПрямое онлайн бронирование и оплата',
				guest_button_text: 'Зарегистрироваться',
				place_title: 'Place',
				place_features: 'Чаты, видео-встречи\nОнлайн-показ площадки\nПрямые трансляции, новости, лента событий',
				place_button_text: 'Добавить место',
				quote_title: ' - проект от души :)',
				quote_description: 'Лидерство на рынке обеспечивается нашей талантливой командой',
				mission_title_accent: 'МИССИЯ',
				mission_text: '<p>Соединяем гостей и площадки, обеспечивая честность и открытость взаимодействия.</p>',
				mission_image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&auto=format&fit=crop&q=80',
				history_title_accent: 'СОЗДАНИЯ',
				history_text: '<p>Наша платформа выросла из простого желания убрать лишние барьеры между людьми.</p>',
				history_image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&auto=format&fit=crop&q=80',
			},
		})
	}
}

export async function seedGuestsSchema() {
	const res = await createSchema({
		name: 'Страница: Гостям',
		slug: 'page_guests',
		is_singleton: true,
		fields: [
			{ name: 'city', label: 'Город', field_type: 'text', required: false },
			{ name: 'hero_title', label: 'Заголовок Hero', field_type: 'text', required: true },
			{ name: 'hero_description', label: 'Описание Hero', field_type: 'text', required: false },
			{ name: 'features', label: 'Возможности для гостей (список)', field_type: 'text', required: false },
			{ name: 'catalog_cta_title', label: 'Заголовок CTA каталога', field_type: 'text', required: false },
			{ name: 'catalog_cta_button', label: 'Кнопка перехода в каталог', field_type: 'text', required: false },
		],
	})

	if (res?.data?.id) {
		await createEntry({
			schema_id: res.data.id,
			slug: 'guests-main-entry',
			status: 'published',
			data: {
				city: 'Москва',
				hero_title: 'Все площадки города для ваших мероприятий',
				hero_description: 'Поиск ресторанов, лофтов, банкетных залов и открытых террас с прямым бронированием.',
				features: 'Моментальное подтверждение бронирования\nЧестные отзывы гостей\nОтсутствие скрытых комиссий',
				catalog_cta_title: 'Найдите идеальное место за 2 минуты',
				catalog_cta_button: 'Перейти в каталог',
			},
		})
	}
}

export async function seedPlatformsSchema() {
	const res = await createSchema({
		name: 'Страница: Площадкам',
		slug: 'page_platforms',
		is_singleton: true,
		fields: [
			{ name: 'hero_title', label: 'Заголовок для владельцев площадок', field_type: 'text', required: true },
			{ name: 'hero_description', label: 'Описание преимуществ для бизнеса', field_type: 'text', required: false },
			{ name: 'registration_button_text', label: 'Кнопка регистрации площадки', field_type: 'text', required: false },
			{ name: 'benefits', label: 'Преимущества платформы', field_type: 'text', required: false },
			{ name: 'pricing_title', label: 'Заголовок блока тарифов', field_type: 'text', required: false },
		],
	})

	if (res?.data?.id) {
		await createEntry({
			schema_id: res.data.id,
			slug: 'platforms-main-entry',
			status: 'published',
			data: {
				hero_title: 'Разместите ваше заведение на Guest & Place',
				hero_description: 'Получайте прямые заявки от гостей без посредников и комиссий агентств.',
				registration_button_text: 'Добавить заведение',
				benefits: 'Удобный календарь бронирований\nПрямая связь в чате с гостями\nАналитика просмотров и конверсий',
				pricing_title: 'Прозрачные тарифы без скрытых платежей',
			},
		})
	}
}

export function buildAboutPageTemplatePayload() {
	return {
		title: 'О платформе Guest & Place',
		slug: 'about',
		status: 'published',
		blocks: [
			{
				id: 'hero-1',
				type: 'hero',
				data: {
					title: 'О платформе Guest & Place',
					subtitle:
						'Платформа, позволяющая общаться напрямую!\nПомогаем каждому Гостю найти “свое” место.\nМы за «прозрачные отношения»!',
				},
			},
			{
				id: 'features-1',
				type: 'two_column_features',
				data: {
					left_title: 'Guest',
					left_cta_text: 'Зарегистрироваться',
					right_title: 'Place',
					right_cta_text: 'Добавить место',
				},
			},
			{
				id: 'quote-1',
				type: 'quote_banner',
				data: {
					quote: ' - проект от души :)',
					description: 'Лидерство на рынке обеспечивается нашей талантливой командой, экспертами своего дела',
					val1_title: 'Постоянный поиск',
					val1_desc: 'постоянный поиск новых решений и внедрение новых технологий',
					val2_title: 'Превосходить ожидания',
					val2_desc: 'мы хотим превзойти ожидания пользователей и свои тоже :)',
				},
			},
			{
				id: 'mission-1',
				type: 'text_with_image',
				data: {
					title_prefix: 'НАША',
					title_accent: 'МИССИЯ',
					text: '<p>Соединяем гостей (людей) и места, создавая простоту и прозрачность в “отношениях”. Предоставляем самые современные технологии и инструменты для простого и легкого общения.</p>',
					image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&auto=format&fit=crop&q=80',
					image_position: 'right',
				},
			},
		],
		seo: {
			title: 'О платформе Guest & Place',
			description: 'Интерактивная платформа поиска мест по интересам напрямую',
		},
	}
}

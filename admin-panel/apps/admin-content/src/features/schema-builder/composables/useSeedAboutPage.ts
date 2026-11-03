import { reactive, ref } from 'vue'
import type { Router } from 'vue-router'
import type { ContentSchema } from '@admin-panel/lib'
import { FieldType } from '@admin-panel/lib'
import { ElMessage } from 'element-plus'
import { contentApi } from '#entities/content'
import type { SchemaList } from './useSchemaList'

/**
 * One-off demo-content seeder: creates the "page_about" singleton schema (if missing) with its
 * entry pre-filled, then jumps straight to editing it. Used by the "Шаблон «О платформе»" button.
 */
export function useSeedAboutPage(schemaList: SchemaList, router: Router) {
	const isSeedingAbout = ref(false)

	async function seedAboutPage() {
		isSeedingAbout.value = true
		try {
			let targetSchema: ContentSchema | undefined = schemaList.schemas.find(
				(s: ContentSchema) => s.slug === 'page_about'
			)
			if (!targetSchema) {
				try {
					const res = await contentApi.getSchemaByIdentifier('page_about')
					if (res.data) targetSchema = res.data
				} catch {
					// not found, proceed to create
				}
			}
			if (!targetSchema) {
				const res = await schemaList.apiFetch<ContentSchema>('', {
					method: 'POST',
					body: {
						name: 'Страница: О платформе',
						slug: 'page_about',
						is_singleton: true,
						fields: [
							{ name: 'city', label: 'Город по умолчанию', field_type: FieldType.Text, required: false },
							{
								name: 'hero_title',
								label: 'Главный заголовок (Hero Title)',
								field_type: FieldType.Text,
								required: true,
							},
							{
								name: 'hero_subtitle',
								label: 'Подзаголовок Hero (многострочный)',
								field_type: FieldType.Text,
								required: false,
							},
							{ name: 'guest_title', label: 'Название карточки 1 (Guest)', field_type: FieldType.Text, required: true },
							{
								name: 'guest_features',
								label: 'Пункты возможностей Guest (через новую строку)',
								field_type: FieldType.Text,
								required: false,
							},
							{ name: 'guest_button_text', label: 'Текст кнопки Guest', field_type: FieldType.Text, required: false },
							{ name: 'place_title', label: 'Название карточки 2 (Place)', field_type: FieldType.Text, required: true },
							{
								name: 'place_features',
								label: 'Пункты возможностей Place (через новую строку)',
								field_type: FieldType.Text,
								required: false,
							},
							{ name: 'place_button_text', label: 'Текст кнопки Place', field_type: FieldType.Text, required: false },
							{
								name: 'quote_title',
								label: 'Заголовок блока цитаты / ценностей',
								field_type: FieldType.Text,
								required: false,
							},
							{
								name: 'quote_description',
								label: 'Текст блока ценностей',
								field_type: FieldType.Text,
								required: false,
							},
							{ name: 'quote_val_1', label: 'Ценность 1 (Технологии)', field_type: FieldType.Text, required: false },
							{ name: 'quote_val_2', label: 'Ценность 2 (Ожидания)', field_type: FieldType.Text, required: false },
							{
								name: 'mission_title_accent',
								label: 'Акцентное слово Миссии (МИССИЯ)',
								field_type: FieldType.Text,
								required: false,
							},
							{
								name: 'mission_text',
								label: 'Текст Миссии (RichText / HTML)',
								field_type: FieldType.RichText,
								required: false,
							},
							{ name: 'mission_image', label: 'URL изображения Миссии', field_type: FieldType.Text, required: false },
							{
								name: 'history_title_accent',
								label: 'Акцентное слово Истории (СОЗДАНИЯ)',
								field_type: FieldType.Text,
								required: false,
							},
							{
								name: 'history_text',
								label: 'Текст Истории создания',
								field_type: FieldType.RichText,
								required: false,
							},
							{ name: 'history_image', label: 'URL изображения Истории', field_type: FieldType.Text, required: false },
						],
					},
				})
				targetSchema = res.data
				ElMessage.success('Схема «page_about» создана!')
				await schemaList.fetchSchemas()
			}

			if (targetSchema) {
				const entriesRes = await contentApi.getEntries(targetSchema.id)
				let entry = entriesRes.data?.[0]
				if (!entry) {
					const createEntryRes = await contentApi.createEntry({
						schema_id: targetSchema.id,
						slug: 'about-main-entry',
						status: 'published',
						data: {
							city: 'Москва',
							hero_title: 'О платформе Guest & Place',
							hero_subtitle:
								'Платформа, позволяющая общаться напрямую!\nПомогаем каждому Гостю найти “свое” место.\nМы за «прозрачные отношения»!',
							guest_title: 'Guest',
							guest_features:
								'Прямая связь с площадкой в режиме реального времени\nАктуальная информация, меню, цены, свободные даты\nПрямое онлайн бронирование и оплата\nЗаказ столика, банкета, доставка еды, аренда помещения под мероприятия — все в одном месте\nОнлайн просмотр\nОбщение в чатах, видео-встречи, консультации менеджеров площадок\nЛичный кабинет и вся информация в одном месте',
							guest_button_text: 'Зарегистрироваться',
							place_title: 'Place',
							place_features:
								'Чаты, видео-встречи\nОнлайн-показ площадки\nПрямые трансляции, новости, лента событий\nПрямое онлайн-бронирование и оплата\nКалендарь бронирования в режиме реального времени\nПростое приложение в системе Учета (все в одном месте)',
							place_button_text: 'Добавить место',
							quote_title: ' - проект от души :)',
							quote_description: 'Лидерство на рынке обеспечивается нашей талантливой командой, экспертами своего дела',
							quote_val_1: 'постоянный поиск новых решений и внедрение новых технологий',
							quote_val_2: 'мы хотим превзойти ожидания пользователей и свои тоже :)',
							mission_title_accent: 'МИССИЯ',
							mission_text:
								'<p>Соединяем гостей (людей) и места, создавая простоту и прозрачность в “отношениях”. Предоставляем самые современные технологии и инструменты для простого и легкого общения.</p><p>Наши эксперты помогают Гостям найти <strong><span style="color:#0066CC">«то самое»</span></strong> место.</p>',
							mission_image:
								'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&auto=format&fit=crop&q=80',
							history_title_accent: 'СОЗДАНИЯ',
							history_text:
								'<p>Соединяем гостей (людей) и места, создавая простоту и прозрачность в “отношениях”. Предоставляем самые современные технологии и инструменты для простого и легкого общения.</p><p>Наши эксперты помогают Гостям найти <strong><span style="color:#0066CC">“то самое”</span></strong> место.</p>',
							history_image:
								'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&auto=format&fit=crop&q=80',
						},
					})
					entry = createEntryRes.data
					ElMessage.success('Начальный контент страницы «О платформе» успешно создан!')
				}

				if (entry?.id) {
					router.push({ name: 'EntryEdit', params: { schemaIdentifier: 'page_about', id: entry.id } })
				} else {
					schemaList.goToEntries('page_about')
				}
			}
		} catch (err: any) {
			console.error('Failed to seed about page:', err)
			ElMessage.error(err.messages?.[0] || 'Не удалось инициализировать страницу')
		} finally {
			isSeedingAbout.value = false
		}
	}

	return reactive({ isSeedingAbout, seedAboutPage })
}

export type SeedAboutPage = ReturnType<typeof useSeedAboutPage>

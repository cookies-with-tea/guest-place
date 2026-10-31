import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import {
	venuesApi,
	type CreateVenueDTO,
	type VenueFaq,
	type VenueFeedItem,
	type VenueHall,
	type VenueReview,
	type VenueRoom,
} from '#entities/venues/api'
import { formatPrice, slugify, splitCommaList, splitLineList } from '../../lib/helpers'

export const DEFAULT_AVATAR =
	'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'

const DEFAULT_FORM: CreateVenueDTO = {
	title: '',
	slug: '',
	subtitle: '',
	description_html: '',
	phone: '',
	address: '',
	city: 'Москва',
	metro_station: '',
	metro_distance_text: '',
	coordinates_lat: 55.7558,
	coordinates_lng: 37.6173,
	average_check: 2500,
	banquet_price_from: 4000,
	rent_price_hour: 3000,
	corkage_fee_has: true,
	corkage_fee_desc: 'есть',
	price_level: '$$$',
	halls_count: 3,
	capacity_banquet: '20/40/60',
	capacity_buffet: '40/80/120',
	capacity_theater: '60/100/140',
	area_sqm: '50/100/120',
	working_hours_weekdays: 'Пн - Чт: с 12:00 до 22:00',
	working_hours_weekends: 'Пт - Вс: с 10:00 до 24:00',
	rating_score: 5.0,
	rating_reviews_count: 4,
	parking: 'на 5 А/М',
	video_tour_url: '',
	has_online_tour: true,
	status: 'published',
	menu_url: 'https://example.com/menu.pdf',
	rider_url: 'https://example.com/rider.pdf',
}

const COORDS_PRESETS = {
	center: { lat: 55.7558, lng: 37.6173 },
	tverskaya: { lat: 55.768, lng: 37.601 },
	city: { lat: 55.749, lng: 37.537 },
	sokolniki: { lat: 55.7898, lng: 37.6798 },
	arbat: { lat: 55.7485, lng: 37.593 },
}

/**
 * Owns the venue being created/edited: the main form, its sub-entities (halls, rooms, FAQ,
 * reviews, feed, menu photos), and saving it. `onChange` is called after every mutation so the
 * caller can keep the live-preview iframe in sync without this composable knowing about it.
 */
export function useVenueForm(onChange: () => void) {
	const saving = ref(false)
	const isEditing = ref(false)
	const editingId = ref<string | null>(null)

	const form = ref<CreateVenueDTO>({ ...DEFAULT_FORM })
	const formHalls = ref<VenueHall[]>([])
	const formRooms = ref<VenueRoom[]>([])
	const formFaq = ref<VenueFaq[]>([])
	const formReviews = ref<VenueReview[]>([])
	const formFeed = ref<VenueFeedItem[]>([])
	const formMenuPhotos = ref<string[]>([])
	const newMenuPhotoUrl = ref('')

	const depositLarge = ref('200 000 р.')
	const depositSmall = ref('120 000 р.')
	const depositAll = ref('300 000 р.')
	const depositIncludes = ref('Еда, часть напитков')
	const alcoholAllowed = ref('да')
	const pricingNotesString = ref(
		'Стоимость аренды может меняться в зависимости от сезона и дня недели.\nВ декабре действуют специальные праздничные тарифы на закрытие зала.\nБронирование даты подтверждается внесением задатка в размере 30%.'
	)

	const typesString = ref('')
	const featuresString = ref('')
	const cuisinesString = ref('')
	const servicesString = ref('')
	const equipmentString = ref('')
	const photosString = ref('')

	function generateSlugFromTitle() {
		if (!form.value.title) return
		form.value.slug = slugify(form.value.title)
		onChange()
	}

	function setCoordsPreset(preset: keyof typeof COORDS_PRESETS) {
		form.value.coordinates_lat = COORDS_PRESETS[preset].lat
		form.value.coordinates_lng = COORDS_PRESETS[preset].lng
		onChange()
	}

	function openCreate() {
		isEditing.value = false
		editingId.value = null
		form.value = { ...DEFAULT_FORM }
		formHalls.value = [
			{ id: '1', name: '1 Атриум', areaSqm: 50, capacityBanquet: 25, capacityBuffet: 40, capacityTheater: 40 },
			{ id: '2', name: '2 Сафари', areaSqm: 100, capacityBanquet: 50, capacityBuffet: 50, capacityTheater: 50 },
			{ id: '3', name: '3 Королевский', areaSqm: 200, capacityBanquet: 50, capacityBuffet: 50, capacityTheater: 50 },
		]
		formRooms.value = [
			{ id: '1', roomType: 'Одноместный', placement: 'Одноместное', priceRub: 2500 },
			{ id: '2', roomType: 'Двухместный', placement: 'Двухместное', priceRub: 5000 },
		]
		formFaq.value = [
			{
				id: '1',
				question: 'Каков процент за обслуживание банкета?',
				answer: 'Сервисный сбор составляет 10% от суммы заказа.',
			},
			{ id: '2', question: 'Можно ли привезти свой алкоголь?', answer: 'Да, действует пробковый сбор.' },
		]
		formReviews.value = [
			{
				id: '1',
				author: 'Юлия',
				date: '20.03.2022',
				rating: 5,
				text: 'Очень красивое и стильное место! Сервис на высшем уровне.',
				avatar: DEFAULT_AVATAR,
			},
		]
		formFeed.value = [
			{
				id: '1',
				author: 'Банкетный зал Форест Холл',
				authorAvatar: DEFAULT_AVATAR,
				publishedAgo: '4 дня',
				text: 'Зимняя свадьба похожа на сказку. Приглашаем на просмотр!',
				imageUrl: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80',
				likesCount: 18,
			},
		]
		formMenuPhotos.value = [
			'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
			'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80',
			'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
		]
		depositLarge.value = '200 000 р.'
		depositSmall.value = '120 000 р.'
		depositAll.value = '300 000 р.'
		depositIncludes.value = 'Еда, часть напитков'
		alcoholAllowed.value = 'да'
		typesString.value = 'Банкетный зал, Загородный ресторан, Ресторан для Банкета, Ресторан при отеле, Бизнес-площадка'
		featuresString.value = 'Летняя веранда, Парковая зона, удобный подъезд'
		cuisinesString.value = 'Европейская, Русская'
		servicesString.value = 'Wi-Fi, Бизнес-ланч, Банкеты, Номерной фонд, Детская комната'
		equipmentString.value = 'Свет, Звук, микрофон, колонки, проектор'
		photosString.value = 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80'
	}

	function openEdit(row: any) {
		isEditing.value = true
		editingId.value = row.id
		form.value = {
			title: row.title || '',
			slug: row.slug || '',
			subtitle: row.subtitle || '',
			description_html: row.description_html || row.descriptionHtml || '',
			phone: row.phone || '',
			address: row.address || '',
			city: row.city || 'Москва',
			metro_station: row.metro_station || row.metroStation || '',
			metro_distance_text: row.metro_distance_text || row.metroDistanceText || '',
			coordinates_lat: row.coordinates_lat ?? row.coordinatesLat ?? 55.7558,
			coordinates_lng: row.coordinates_lng ?? row.coordinatesLng ?? 37.6173,
			average_check: row.average_check ?? row.averageCheck ?? 2500,
			banquet_price_from: row.banquet_price_from ?? row.banquetPriceFrom ?? 4000,
			rent_price_hour: row.rent_price_hour ?? row.rentPriceHour ?? 3000,
			corkage_fee_has: row.corkage_fee_has ?? row.corkageFeeHas ?? true,
			corkage_fee_desc: row.corkage_fee_desc || row.corkageFeeDesc || 'есть',
			price_level: row.price_level || row.priceLevel || '$$$',
			halls_count: row.halls_count ?? row.hallsCount ?? 1,
			capacity_banquet: row.capacity_banquet || row.capacityBanquet || '',
			capacity_buffet: row.capacity_buffet || row.capacityBuffet || '',
			capacity_theater: row.capacity_theater || row.capacityTheater || '',
			area_sqm: row.area_sqm || row.areaSqm || '',
			working_hours_weekdays: row.working_hours_weekdays || row.workingHoursWeekdays || '',
			working_hours_weekends: row.working_hours_weekends || row.workingHoursWeekends || '',
			rating_score: row.rating_score ?? row.ratingScore ?? 5.0,
			rating_reviews_count: row.rating_reviews_count ?? row.ratingReviewsCount ?? 0,
			parking: row.parking || '',
			video_tour_url: row.video_tour_url || row.videoTourUrl || '',
			has_online_tour: row.has_online_tour ?? row.hasOnlineTour ?? true,
			status: row.status || 'published',
			menu_url: row.menu_url || row.menuUrl || 'https://example.com/menu-forest-hall.pdf',
			rider_url: row.rider_url || row.riderUrl || 'https://example.com/rider-forest-hall.pdf',
		}

		formHalls.value = Array.isArray(row.halls) ? [...(row.halls as VenueHall[])] : []
		formRooms.value = Array.isArray(row.rooms) ? [...(row.rooms as VenueRoom[])] : []
		formFaq.value = Array.isArray(row.faq) ? [...(row.faq as VenueFaq[])] : []
		formReviews.value = Array.isArray(row.reviews) ? JSON.parse(JSON.stringify(row.reviews)) : []
		formFeed.value = Array.isArray(row.feed) ? JSON.parse(JSON.stringify(row.feed)) : []
		formMenuPhotos.value = Array.isArray(row.menu_photos || row.menuPhotos)
			? [...(row.menu_photos || row.menuPhotos)]
			: []

		const pt = row.pricing_table || row.pricingTable
		if (pt?.categories && Array.isArray(pt.categories)) {
			const depSplit = pt.categories.find((c: any) => c.type === 'split' || c.largeHall)
			if (depSplit) {
				depositLarge.value = depSplit.largeHall || '200 000 р.'
				depositSmall.value = depSplit.smallHall || '120 000 р.'
				depositAll.value = depSplit.allVenue || '300 000 р.'
			}
			const inc = pt.categories.find((c: any) => c.label?.includes('входит в депозит'))
			if (inc) depositIncludes.value = inc.value || 'Еда, часть напитков'
			const alc = pt.categories.find((c: any) => c.label?.includes('своего алкоголя'))
			if (alc) alcoholAllowed.value = alc.value || 'да'
		}
		if (pt?.notes && Array.isArray(pt.notes)) {
			pricingNotesString.value = pt.notes.join('\n')
		}

		typesString.value = (row.venue_types || row.venueTypes || []).join(', ')
		featuresString.value = (row.features || []).join(', ')
		cuisinesString.value = (row.cuisines || []).join(', ')
		servicesString.value = (row.services || []).join(', ')
		equipmentString.value = (row.equipment || []).join(', ')
		photosString.value = (row.gallery_photos || row.galleryPhotos || []).join('\n')
	}

	function addHall() {
		formHalls.value.push({
			id: Date.now().toString(),
			name: `Зал ${formHalls.value.length + 1}`,
			areaSqm: 60,
			capacityBanquet: 30,
			capacityBuffet: 50,
			capacityTheater: 50,
		})
		onChange()
	}
	function removeHall(index: number) {
		formHalls.value.splice(index, 1)
		onChange()
	}

	function addRoom() {
		formRooms.value.push({ id: Date.now().toString(), roomType: 'Стандарт', placement: 'Двухместное', priceRub: 3500 })
		onChange()
	}
	function removeRoom(index: number) {
		formRooms.value.splice(index, 1)
		onChange()
	}

	function addFaq() {
		formFaq.value.push({ id: Date.now().toString(), question: '', answer: '' })
		onChange()
	}
	function removeFaq(index: number) {
		formFaq.value.splice(index, 1)
		onChange()
	}

	function addReview() {
		formReviews.value.push({
			id: Date.now().toString(),
			author: 'Новый отзыв',
			avatar: DEFAULT_AVATAR,
			date: 'Сегодня',
			rating: 5,
			text: 'Прекрасная площадка, великолепный сервис!',
		})
		onChange()
	}
	function removeReview(index: number) {
		formReviews.value.splice(index, 1)
		onChange()
	}

	function addFeedItem() {
		formFeed.value.push({
			id: Date.now().toString(),
			author: form.value.title || 'Банкетный зал Форест Холл',
			authorAvatar: DEFAULT_AVATAR,
			publishedAgo: 'Только что',
			text: 'Новое специальное предложение для свадеб и юбилеев!',
			imageUrl: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80',
			likesCount: 0,
		})
		onChange()
	}
	function removeFeedItem(index: number) {
		formFeed.value.splice(index, 1)
		onChange()
	}

	function addMenuPhoto() {
		if (!newMenuPhotoUrl.value.trim()) return
		formMenuPhotos.value.push(newMenuPhotoUrl.value.trim())
		newMenuPhotoUrl.value = ''
		onChange()
	}
	function removeMenuPhoto(index: number) {
		formMenuPhotos.value.splice(index, 1)
		onChange()
	}
	function addPresetMenuPhotos() {
		const presets = [
			'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
			'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80',
			'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
			'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80',
			'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=600&q=80',
		]
		presets.forEach((p) => {
			if (!formMenuPhotos.value.includes(p)) formMenuPhotos.value.push(p)
		})
		onChange()
	}

	/** Saves the venue. Returns whether it succeeded, so the caller can refresh the catalog/preview. */
	async function handleSave(): Promise<boolean> {
		if (!form.value.title || !form.value.slug || !form.value.address) {
			ElMessage.warning('Заполните обязательные поля: Название, Слаг и Адрес')
			return false
		}

		const pricingTableData = {
			categories: [
				{ label: 'Средний чек', value: `${formatPrice(form.value.average_check)} р.`, type: 'merged' },
				{
					label: 'Стоимость банкетного меню от:',
					value: `${formatPrice(form.value.banquet_price_from)} р.`,
					type: 'merged',
				},
				{ label: 'Аренда / час. от:', value: `${formatPrice(form.value.rent_price_hour)} р.`, type: 'merged' },
				{
					label: 'Депозит (минимальная стоимость закрытия):',
					largeHall: depositLarge.value || '200 000 р.',
					smallHall: depositSmall.value || '120 000 р.',
					allVenue: depositAll.value || '300 000 р.',
					type: 'split',
				},
				{ label: 'Что входит в депозит:', value: depositIncludes.value || 'Еда, часть напитков', type: 'merged' },
				{ label: 'Возможность своего алкоголя:', value: alcoholAllowed.value || 'да', type: 'merged' },
				{
					label: 'Пробковый сбор:',
					value: form.value.corkage_fee_desc || (form.value.corkage_fee_has ? 'есть' : 'нет'),
					type: 'merged',
				},
			],
			notes: splitLineList(pricingNotesString.value),
		}

		const payload: CreateVenueDTO = {
			...form.value,
			halls: formHalls.value as any,
			rooms: formRooms.value as any,
			faq: formFaq.value as any,
			reviews: formReviews.value as any,
			feed: formFeed.value as any,
			menu_photos: formMenuPhotos.value,
			pricing_table: pricingTableData as any,
			venue_types: splitCommaList(typesString.value),
			features: splitCommaList(featuresString.value),
			cuisines: splitCommaList(cuisinesString.value),
			services: splitCommaList(servicesString.value),
			equipment: splitCommaList(equipmentString.value),
			gallery_photos: splitLineList(photosString.value),
		}

		saving.value = true
		try {
			if (isEditing.value && editingId.value) {
				await venuesApi.updateVenue(editingId.value, payload)
				ElMessage.success('Площадка успешно обновлена')
			} else {
				await venuesApi.createVenue(payload)
				ElMessage.success('Площадка успешно создана')
			}
			return true
		} catch (e: any) {
			ElMessage.error(e.message || 'Ошибка сохранения площадки')
			return false
		} finally {
			saving.value = false
		}
	}

	return reactive({
		saving,
		isEditing,
		editingId,
		form,
		formHalls,
		formRooms,
		formFaq,
		formReviews,
		formFeed,
		formMenuPhotos,
		newMenuPhotoUrl,
		depositLarge,
		depositSmall,
		depositAll,
		depositIncludes,
		alcoholAllowed,
		pricingNotesString,
		typesString,
		featuresString,
		cuisinesString,
		servicesString,
		equipmentString,
		photosString,
		generateSlugFromTitle,
		setCoordsPreset,
		openCreate,
		openEdit,
		addHall,
		removeHall,
		addRoom,
		removeRoom,
		addFaq,
		removeFaq,
		addReview,
		removeReview,
		addFeedItem,
		removeFeedItem,
		addMenuPhoto,
		removeMenuPhoto,
		addPresetMenuPhotos,
		handleSave,
	})
}

export type VenueForm = ReturnType<typeof useVenueForm>

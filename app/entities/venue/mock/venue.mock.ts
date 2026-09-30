import type { VenueType, VenuePreviewType } from '../model/types'

/**
 * Mock data for the Forest Hall venue from Figma:
 * Node: 1199-51992 ("Guest& Place Карточка площадки1")
 */
export const MOCK_VENUE_FOREST_HALL: VenueType = {
  id: 'venue-forest-hall',
  slug: 'loft-forest-hall',
  title: 'Банкетный зал лофт Форест Холл Banquet hall Loft Forest Hall',
  subtitle: 'Загородный клуб на берегу Москва-реки для идеальных свадеб, банкетов и конференций',
  descriptionHtml: `
    <p>У Вас намечается банкет? Отлично! Приглашаем отметить ваше торжество в нашем загородном клубе на берегу Москва-реки. Мы уверены, что Вам понравится.</p>
    <p>Загородный клуб — это особая атмосфера, со своей энергетикой и своим миром. Попадая на территорию комплекса, первое, что бросается в глаза, это единый стиль в котором выдержана вся инфраструктура. Светлые здания, белоснежная ротонда, ухоженная набережная, река и живописные пейзажи вокруг создают визуальное ощущение нарисованной акварелью картины, в которой нет ничего лишнего.</p>
    <p>Для гостей клуба действует ресторанная кухня, бар и караоке. На территории предусмотрена охраняемая парковка и детская площадка. Инфраструктура клуба позволяет проводить различные мероприятия. Наша основная гордость — блюда, приготовленные на настоящем огне. Рады Вам в любое время суток и в любое время года!</p>
  `.trim(),
  rating: {
    score: 5.0,
    reviewsCount: 3,
  },
  isFavorite: false,
  phone: '+7 (495) 125 25 25',
  hallsCount: 3,
  location: {
    address: 'г. Москва Волоколамское шоссе, д.13',
    city: 'Москва',
    metro: {
      station: 'Сокольники',
      walkMinutes: 5,
      distanceText: '5 мин пешком',
      lineColor: '#EF161E',
    },
    coordinates: {
      lat: 55.8083,
      lng: 37.4947,
    },
  },
  workingHours: {
    weekdays: 'Пн - Чт: с 12:00 до 22:00',
    weekends: 'Пт - Вс: с 10:00 до 24:00',
  },
  pricing: {
    averageCheck: 2500,
    banquetMenuPriceFrom: 4000,
    rentPricePerHour: 3000,
    corkageFee: {
      hasFee: true,
      description: 'есть',
    },
    priceLevel: '$$$',
  },
  capacitySummary: {
    banquet: '20/40/60',
    buffet: '40/80/120',
    theater: '60/100/140',
    areaSqm: '50/100/120',
  },
  gallery: {
    mainPhoto: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80',
    photos: [
      'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=600&q=80',
    ],
    videoTourUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    hasOnlineTour: true,
  },
  details: {
    venueTypes: [
      'Банкетный зал',
      'Загородный ресторан',
      'Ресторан для Банкета',
      'Ресторан при отеле',
      'Бизнес-площадка',
    ],
    features: ['Летняя веранда', 'Парковая зона', 'удобный подъезд'],
    cuisines: ['Европейская', 'Русская', 'Авторская'],
    services: [
      'Wi-Fi',
      'Бизнес-ланч',
      'Выездная регистрация',
      'Банкеты',
      'Анимация',
      'Тимбилдинг',
      'Конференции',
      'Презентации',
      'Номерной фонд',
      'Детская комната',
      'Детское меню',
      'Детская площадка',
      'Живая музыка',
    ],
    parking: 'на 5 А/М',
    equipment: ['Свет', 'Звук', 'микрофон', 'колонки', 'проектор'],
    halls: [
      {
        id: 'hall-1',
        name: '1 Атриум',
        areaSqm: 50,
        capacityBanquet: 25,
        capacityBuffet: 40,
        capacityTheater: 40,
        extraDetails: 'Панорамные окна, выход в парк',
      },
      {
        id: 'hall-2',
        name: '2 Сафари',
        areaSqm: 100,
        capacityBanquet: 50,
        capacityBuffet: 50,
        capacityTheater: 50,
        extraDetails: 'Сцена, лаунж-зона, бар',
      },
      {
        id: 'hall-3',
        name: '3 Королевский',
        areaSqm: 200,
        capacityBanquet: 50,
        capacityBuffet: 50,
        capacityTheater: 50,
        extraDetails: 'VIP-зона, гримерка, профессиональный свет',
      },
    ],
    rooms: [
      {
        id: 'room-1',
        roomType: 'Одноместный',
        placement: 'Одноместное',
        priceRub: 2500,
        extraInfo: 'Стоимость доп.места + 1000 р., предоставим детскую кроватку по запросу',
      },
      {
        id: 'room-2',
        roomType: 'Двухместный номер с 2 отдельными кроватями',
        placement: 'Двухместное',
        priceRub: 5000,
      },
      {
        id: 'room-3',
        roomType: 'Двухместный номер с 1 кроватью',
        placement: 'Двухместное',
        priceRub: 5500,
        extraInfo: 'Дополнительно детская кроватка по запросу',
      },
    ],
  },
  faq: [
    {
      id: 'faq-1',
      question: 'Каков процент за обслуживание банкета?',
      answer: 'Сервисный сбор составляет 10% от общей суммы банкетного меню и включает работу официантов, барменов и банкетного менеджера.',
    },
    {
      id: 'faq-2',
      question: 'Можно ли привозить свой алкоголь и торт?',
      answer: 'Да, у нас действует гибкий пробковый сбор. Также вы можете привезти праздничный торт без дополнительных сервисных комиссий.',
    },
    {
      id: 'faq-3',
      question: 'До какого часа можно шуметь и использовать звук на открытой веранде?',
      answer: 'Музыкальное сопровождение на открытой веранде разрешено до 23:00, после чего праздник может продолжиться в закрытых залах без ограничений по времени.',
    },
  ],
  feed: [
    {
      id: 'feed-1',
      author: 'Банкетный зал Форест Холл',
      authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80',
      publishedAgo: '4 дня',
      text: 'Зимняя свадьба похожа на сказку. Пушистый снег на фотографиях, уютно оформленная площадка и романтичная атмосфера вечера при свечах.\n\nДекабрь уже подходит к концу, но впереди нас ждут январь и февраль с изобилием красивых дат!\n\nНапишите нам в Директ, чтобы узнать все детали и записаться на просмотр / Banquet hall Loft Forest Hall',
      imageUrl: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80',
      likesCount: 18,
      isLiked: false,
    },
    {
      id: 'feed-2',
      author: 'Банкетный зал Форест Холл',
      authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80',
      publishedAgo: '4 дня',
      text: 'Зимняя свадьба похожа на сказку. Пушистый снег на фотографиях, уютно оформленная площадка и романтичная атмосфера вечера при свечах.\n\nДекабрь уже подходит к концу, но впереди нас ждут январь и февраль с изобилием красивых дат!\n\nНапишите нам в Директ, чтобы узнать все детали и записаться на просмотр / Banquet hall Loft Forest Hall',
      imageUrl: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=800&q=80',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      likesCount: 18,
      isLiked: false,
    },
    {
      id: 'feed-3',
      author: 'Банкетный зал Форест Холл',
      authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80',
      publishedAgo: '4 дня',
      text: 'Зимняя свадьба похожа на сказку. Пушистый снег на фотографиях, уютно оформленная площадка и романтичная атмосфера вечера при свечах.\n\nДекабрь уже подходит к концу, но впереди нас ждут январь и февраль с изобилием красивых дат!\n\nНапишите нам в Директ, чтобы узнать все детали и записаться на просмотр / Banquet hall Loft Forest Hall',
      imageUrl: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80',
      likesCount: 18,
      isLiked: false,
    },
    {
      id: 'feed-4',
      author: 'Банкетный зал Форест Холл',
      authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80',
      publishedAgo: '4 дня',
      text: 'Зимняя свадьба похожа на сказку. Пушистый снег на фотографиях, уютно оформленная площадка и романтичная атмосфера вечера при свечах.\n\nДекабрь уже подходит к концу, но впереди нас ждут январь и февраль с изобилием красивых дат!\n\nНапишите нам в Директ, чтобы узнать все детали и записаться на просмотр / Banquet hall Loft Forest Hall',
      imageUrl: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=800&q=80',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      likesCount: 18,
      isLiked: false,
    },
  ],
  menuPhotos: [
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=600&q=80',
  ],
  reviews: [
    {
      id: 'rev-1',
      author: 'Юлия',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
      date: '20.03.2022',
      rating: 5,
      text: 'Очень красиво и стильное место! Сервис на высшем уровне. Все прозрачно, никаких непонятных доп. услуг нет, практически все включено в стоимость аренды. Шикарный ламповый звук, очень атмосферно. Пространство большое, бар удобный, бармены профессионалы своего дела! Рекомендую данный лофт. 10 из 10!!',
    },
    {
      id: 'rev-2',
      author: 'Юлия',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
      date: '20.03.2022',
      rating: 5,
      text: 'Очень красиво и стильное место! Сервис на высшем уровне. Все прозрачно, никаких непонятных доп. услуг нет, практически все включено в стоимость аренды. Шикарный ламповый звук, очень атмосферно. Пространство большое, бар удобный, бармены профессионалы своего дела! Рекомендую данный лофт. 10 из 10!!',
    },
    {
      id: 'rev-3',
      author: 'Юлия',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80',
      date: '20.03.2022',
      rating: 5,
      text: 'Очень красиво и стильное место! Сервис на высшем уровне. Все прозрачно, никаких непонятных доп. услуг нет, практически все включено в стоимость аренды. Шикарный ламповый звук, очень атмосферно. Пространство большое, бар удобный, бармены профессионалы своего дела! Рекомендую данный лофт. 10 из 10!!',
    },
    {
      id: 'rev-4',
      author: 'Юлия',
      avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=120&q=80',
      date: '20.03.2022',
      rating: 5,
      text: 'Очень красиво и стильное место! Сервис на высшем уровне. Все прозрачно, никаких непонятных доп. услуг нет, практически все включено в стоимость аренды. Шикарный ламповый звук, очень атмосферно. Пространство большое, бар удобный, бармены профессионалы своего дела! Рекомендую данный лофт. 10 из 10!!',
    },
  ],
  menuUrl: 'https://example.com/menu-forest-hall.pdf',
  riderUrl: 'https://example.com/rider-forest-hall.pdf',
}

/**
 * Mock list for Small Venue Cards from Figma (node: 1199:52015)
 */
export const MOCK_NEARBY_VENUES: VenuePreviewType[] = [
  {
    id: 'venue-the-ice',
    slug: 'the-led',
    title: 'Ресторан с банкетным залом «The Лед»',
    previewImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80',
    rating: {
      score: 3.0,
      reviewsCount: 23,
    },
    metro: {
      station: 'Сокольники',
      walkMinutes: 5,
      distanceText: '5 мин пешком',
    },
    capacityText: '35/100/150',
    priceLevel: '$$$',
    isFavorite: false,
  },
  {
    id: 'venue-forest-hall',
    slug: 'loft-forest-hall',
    title: 'Банкетный зал лофт Форест Холл',
    previewImage: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=600&q=80',
    rating: {
      score: 5.0,
      reviewsCount: 3,
    },
    metro: {
      station: 'Сокольники',
      walkMinutes: 5,
      distanceText: '5 мин пешком',
    },
    capacityText: '20/40/60',
    priceLevel: '$$$',
    isFavorite: true,
  },
  {
    id: 'venue-royal-palace',
    slug: 'royal-palace',
    title: 'Усадьба Роял Палас Резорт',
    previewImage: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=600&q=80',
    rating: {
      score: 4.9,
      reviewsCount: 48,
    },
    metro: {
      station: 'ВДНХ',
      walkMinutes: 12,
      distanceText: '12 мин пешком',
    },
    capacityText: '50/150/300',
    priceLevel: '$$$$',
    isFavorite: false,
  },
  {
    id: 'venue-loft-river',
    slug: 'loft-river',
    title: 'Арт-пространство Loft River',
    previewImage: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=600&q=80',
    rating: {
      score: 4.7,
      reviewsCount: 15,
    },
    metro: {
      station: 'Тушинская',
      walkMinutes: 8,
      distanceText: '8 мин пешком',
    },
    capacityText: '30/80/120',
    priceLevel: '$$',
    isFavorite: false,
  },
]

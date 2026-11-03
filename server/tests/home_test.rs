use guest_place::home::dto::{HomeResponseDTO, HomeCategoryDTO, HomeInteractionItemDTO, UpdateHomeDTO};

#[test]
fn test_update_home_dto_deserialization() {
    let json = serde_json::json!({
        "title": "СОЦИАЛЬНАЯ ИНТЕРАКТИВНАЯ ПЛАТФОРМА",
        "subtitle": "Соединяем гостей и места",
        "hero_map_button_text": "Показать на карте",
        "hero_list_button_text": "Показать списком",
        "categories_title": "Места по категориям",
        "categories": [
            {
                "title": "Отдых",
                "slug": "rest",
                "link": "/venues?venue_types=Загородный клуб",
                "sort_order": 1
            },
            {
                "title": "Бизнес",
                "slug": "business",
                "link": "/venues?venue_types=Бизнес-площадка",
                "sort_order": 2
            }
        ],
        "interactions_title": "Варианты взаимодействия с GP Platform",
        "interactions": [
            {
                "step_number": 1,
                "title": "Самостоятельный поиск",
                "text": "Описание...",
                "button_text": "Каталог",
                "link": "/venues",
                "is_accent": false,
                "sort_order": 1
            }
        ],
        "banner_title": "Для быстрого поиска",
        "banner_text": "GP Платформа"
    });

    let update_dto: UpdateHomeDTO = serde_json::from_value(json).expect("Failed to deserialize UpdateHomeDTO");
    assert_eq!(update_dto.title.as_deref(), Some("СОЦИАЛЬНАЯ ИНТЕРАКТИВНАЯ ПЛАТФОРМА"));
    assert_eq!(update_dto.hero_map_button_text.as_deref(), Some("Показать на карте"));
    let cats = update_dto.categories.expect("Categories present");
    assert_eq!(cats.len(), 2);
    assert_eq!(cats[0].title, "Отдых");
    assert_eq!(cats[1].slug, "business");
    let inters = update_dto.interactions.expect("Interactions present");
    assert_eq!(inters.len(), 1);
    assert_eq!(inters[0].step_number, 1);
}

#[test]
fn test_home_response_serialization() {
    let response = HomeResponseDTO {
        title: "Заголовок".to_string(),
        subtitle: "Подзаголовок".to_string(),
        hero_map_button_text: "Карта".to_string(),
        hero_list_button_text: "Список".to_string(),
        hero_guide_uuid: None,
        hero_guide: None,
        categories_title: "Категории".to_string(),
        categories: vec![
            HomeCategoryDTO {
                id: Some(1),
                title: "Отдых".to_string(),
                slug: "rest".to_string(),
                link: "/venues".to_string(),
                icon_uuid: None,
                icon: None,
                sort_order: 1,
            }
        ],
        latest_section_title: "Последние добавленные".to_string(),
        latest_section_button_text: "Еще".to_string(),
        latest_section_button_link: "/venues".to_string(),
        latest_venues: vec![],
        popular_section_title: "Популярные".to_string(),
        popular_section_button_text: "В каталог".to_string(),
        popular_section_button_link: "/venues".to_string(),
        popular_venues: vec![],
        interactions_title: "Взаимодействие".to_string(),
        interactions: vec![
            HomeInteractionItemDTO {
                id: Some(1),
                step_number: 1,
                title: "Шаг 1".to_string(),
                text: "Текст 1".to_string(),
                button_text: "Кнопка 1".to_string(),
                link: "/link".to_string(),
                is_accent: false,
                sort_order: 1,
            }
        ],
        banner_title: "Баннер".to_string(),
        banner_text: "Текст баннера".to_string(),
        banner_guide_uuid: None,
        banner_guide: None,
    };

    let serialized = serde_json::to_string(&response).expect("Serialize HomeResponseDTO");
    assert!(serialized.contains("Заголовок"));
    assert!(serialized.contains("Отдых"));
    assert!(serialized.contains("Шаг 1"));
}

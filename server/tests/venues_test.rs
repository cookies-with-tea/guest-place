use guest_place::venues::handlers::VenuesQuery;

#[test]
fn test_venues_query_deserialization() {
    let json = serde_json::json!({
        "search": "лофт",
        "venue_types": "Банкетный зал,Лофт",
        "features": "Летняя веранда,Парковая зона",
        "min_price": 2000,
        "max_price": 5000,
        "sort_by": "price_asc",
        "page": 2,
        "limit": 10
    });

    let query: VenuesQuery = serde_json::from_value(json).expect("Failed to deserialize VenuesQuery");
    assert_eq!(query.search.as_deref(), Some("лофт"));
    assert_eq!(query.venue_types.as_deref(), Some("Банкетный зал,Лофт"));
    assert_eq!(query.min_price, Some(2000));
    assert_eq!(query.max_price, Some(5000));
    assert_eq!(query.sort_by.as_deref(), Some("price_asc"));
    assert_eq!(query.page, Some(2));
    assert_eq!(query.limit, Some(10));
}

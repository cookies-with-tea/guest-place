use guest_place::media::dto::MediaFilterQuery;
use sqlx::{Postgres, QueryBuilder};

// Helper mirroring apply_filters logic for testing query builder outputs
fn apply_filters_for_test<'a>(builder: &mut QueryBuilder<'a, Postgres>, filter: &'a MediaFilterQuery, where_clause: &mut bool) {
    if let Some(search) = &filter.search {
        if !*where_clause { builder.push(" WHERE "); *where_clause = true; } else { builder.push(" AND "); }
        builder.push("(name ILIKE ");
        builder.push_bind(format!("%{}%", search));
        builder.push(" OR title ILIKE ");
        builder.push_bind(format!("%{}%", search));
        builder.push(" OR alt ILIKE ");
        builder.push_bind(format!("%{}%", search));
        builder.push(" OR category ILIKE ");
        builder.push_bind(format!("%{}%", search));
        builder.push(" OR extension ILIKE ");
        builder.push_bind(format!("%{}%", search));
        builder.push(" OR array_to_string(tags, ' ') ILIKE ");
        builder.push_bind(format!("%{}%", search));
        builder.push(")");
    }

    if let Some(categories_str) = &filter.category {
        if !categories_str.is_empty() {
            let split_categories: Vec<&str> = categories_str.split(',').collect();
            if !split_categories.is_empty() {
                if !*where_clause { builder.push(" WHERE "); *where_clause = true; } else { builder.push(" AND "); }
                builder.push("category IN (");
                let mut separated = builder.separated(", ");
                for cat in split_categories {
                    separated.push_bind(cat.trim());
                }
                builder.push(")");
            }
        }
    }

    if let Some(types_str) = &filter.media_type {
        if !types_str.is_empty() {
            let split_types: Vec<&str> = types_str.split(',').collect();
            if !split_types.is_empty() {
                if !*where_clause { builder.push(" WHERE "); *where_clause = true; } else { builder.push(" AND "); }
                builder.push("media_type::text IN (");
                let mut separated = builder.separated(", ");
                for t in split_types {
                    separated.push_bind(t.trim());
                }
                builder.push(")");
            }
        }
    }

    if let Some(tags_str) = &filter.tags {
        if !tags_str.is_empty() {
            let split_tags: Vec<&str> = tags_str.split(',').collect();
            if !split_tags.is_empty() {
                if !*where_clause { builder.push(" WHERE "); *where_clause = true; } else { builder.push(" AND "); }
                builder.push("tags && ARRAY[");
                let mut separated = builder.separated(", ");
                for t in split_tags {
                    separated.push_bind(t.trim());
                }
                builder.push("]::text[]");
            }
        }
    }

    if let Some(min_size) = filter.min_size_bytes {
        if !*where_clause { builder.push(" WHERE "); *where_clause = true; } else { builder.push(" AND "); }
        builder.push("size_bytes >= ");
        builder.push_bind(min_size);
    }

    if let Some(max_size) = filter.max_size_bytes {
        if !*where_clause { builder.push(" WHERE "); *where_clause = true; } else { builder.push(" AND "); }
        builder.push("size_bytes <= ");
        builder.push_bind(max_size);
    }

    if let Some(date_from) = &filter.date_from {
        if !date_from.is_empty() {
            if let Ok(parsed_date) = chrono::DateTime::parse_from_rfc3339(date_from) {
                if !*where_clause { builder.push(" WHERE "); *where_clause = true; } else { builder.push(" AND "); }
                builder.push("created_at >= ");
                builder.push_bind(parsed_date.with_timezone(&chrono::Utc));
            } else if let Ok(parsed_naive) = chrono::NaiveDateTime::parse_from_str(date_from, "%Y-%m-%d %H:%M:%S").or_else(|_| chrono::NaiveDate::parse_from_str(date_from, "%Y-%m-%d").map(|d| d.and_hms_opt(0, 0, 0).unwrap())) {
                if !*where_clause { builder.push(" WHERE "); *where_clause = true; } else { builder.push(" AND "); }
                builder.push("created_at >= ");
                builder.push_bind(chrono::DateTime::<chrono::Utc>::from_naive_utc_and_offset(parsed_naive, chrono::Utc));
            }
        }
    }

    if let Some(date_to) = &filter.date_to {
        if !date_to.is_empty() {
            if let Ok(parsed_date) = chrono::DateTime::parse_from_rfc3339(date_to) {
                if !*where_clause { builder.push(" WHERE "); *where_clause = true; } else { builder.push(" AND "); }
                builder.push("created_at <= ");
                builder.push_bind(parsed_date.with_timezone(&chrono::Utc));
            } else if let Ok(parsed_naive) = chrono::NaiveDateTime::parse_from_str(date_to, "%Y-%m-%d %H:%M:%S").or_else(|_| chrono::NaiveDate::parse_from_str(date_to, "%Y-%m-%d").map(|d| d.and_hms_opt(23, 59, 59).unwrap())) {
                if !*where_clause { builder.push(" WHERE "); *where_clause = true; } else { builder.push(" AND "); }
                builder.push("created_at <= ");
                builder.push_bind(chrono::DateTime::<chrono::Utc>::from_naive_utc_and_offset(parsed_naive, chrono::Utc));
            }
        }
    }

    if let Some(source) = &filter.source {
        if !*where_clause { builder.push(" WHERE "); *where_clause = true; } else { builder.push(" AND "); }
        builder.push("source = ");
        builder.push_bind(source);
    }
}

#[test]
fn test_media_filter_query_deserialization() {
    let json_data = serde_json::json!({
        "page": 2,
        "limit": 25,
        "sortBy": "size_bytes",
        "sortOrder": "ASC",
        "search": "landscape",
        "category": "Marketing,UI/UX",
        "source": "site",
        "media_type": "image,video",
        "tags": "hero,homepage",
        "min_size_bytes": 102400,
        "max_size_bytes": 5242880,
        "date_from": "2026-01-01T00:00:00Z",
        "date_to": "2026-12-31T23:59:59Z"
    });

    let query: MediaFilterQuery = serde_json::from_value(json_data).expect("Failed to deserialize MediaFilterQuery");
    assert_eq!(query.page, Some(2));
    assert_eq!(query.limit, Some(25));
    assert_eq!(query.search, Some("landscape".to_string()));
    assert_eq!(query.category, Some("Marketing,UI/UX".to_string()));
    assert_eq!(query.min_size_bytes, Some(102400));
    assert_eq!(query.max_size_bytes, Some(5242880));
    assert_eq!(query.date_from, Some("2026-01-01T00:00:00Z".to_string()));
    assert_eq!(query.date_to, Some("2026-12-31T23:59:59Z".to_string()));
}

#[test]
fn test_smart_search_includes_category_extension_and_tags() {
    let mut builder = QueryBuilder::<Postgres>::new("SELECT * FROM media");
    let mut where_clause = false;

    let filter = MediaFilterQuery {
        page: None,
        limit: None,
        sort_by: None,
        sort_order: None,
        search: Some("banner".to_string()),
        category: None,
        source: None,
        media_type: None,
        tags: None,
        min_size_bytes: None,
        max_size_bytes: None,
        date_from: None,
        date_to: None,
    };

    apply_filters_for_test(&mut builder, &filter, &mut where_clause);
    let sql = builder.sql();

    assert!(sql.contains("WHERE"));
    assert!(sql.contains("name ILIKE"));
    assert!(sql.contains("title ILIKE"));
    assert!(sql.contains("alt ILIKE"));
    assert!(sql.contains("category ILIKE"));
    assert!(sql.contains("extension ILIKE"));
    assert!(sql.contains("array_to_string(tags, ' ') ILIKE"));
}

#[test]
fn test_size_range_query_generation() {
    let mut builder = QueryBuilder::<Postgres>::new("SELECT * FROM media");
    let mut where_clause = false;

    let filter = MediaFilterQuery {
        page: None,
        limit: None,
        sort_by: None,
        sort_order: None,
        search: None,
        category: None,
        source: None,
        media_type: None,
        tags: None,
        min_size_bytes: Some(1048576), // 1MB
        max_size_bytes: Some(10485760), // 10MB
        date_from: None,
        date_to: None,
    };

    apply_filters_for_test(&mut builder, &filter, &mut where_clause);
    let sql = builder.sql();

    assert!(sql.contains("WHERE size_bytes >="));
    assert!(sql.contains("AND size_bytes <="));
}

#[test]
fn test_date_range_query_generation() {
    let mut builder = QueryBuilder::<Postgres>::new("SELECT * FROM media");
    let mut where_clause = false;

    let filter = MediaFilterQuery {
        page: None,
        limit: None,
        sort_by: None,
        sort_order: None,
        search: None,
        category: None,
        source: None,
        media_type: None,
        tags: None,
        min_size_bytes: None,
        max_size_bytes: None,
        date_from: Some("2026-05-01".to_string()),
        date_to: Some("2026-05-31".to_string()),
    };

    apply_filters_for_test(&mut builder, &filter, &mut where_clause);
    let sql = builder.sql();

    assert!(sql.contains("WHERE created_at >="));
    assert!(sql.contains("AND created_at <="));
}

#[test]
fn test_combined_filters_query_generation() {
    let mut builder = QueryBuilder::<Postgres>::new("SELECT * FROM media");
    let mut where_clause = false;

    let filter = MediaFilterQuery {
        page: None,
        limit: None,
        sort_by: None,
        sort_order: None,
        search: Some("room".to_string()),
        category: Some("Suites,Hotels".to_string()),
        source: Some("cms".to_string()),
        media_type: Some("image".to_string()),
        tags: Some("luxury,ocean".to_string()),
        min_size_bytes: Some(500000),
        max_size_bytes: Some(2000000),
        date_from: Some("2026-01-01T00:00:00Z".to_string()),
        date_to: Some("2026-06-01T00:00:00Z".to_string()),
    };

    apply_filters_for_test(&mut builder, &filter, &mut where_clause);
    let sql = builder.sql();

    assert!(sql.contains("WHERE (name ILIKE"));
    assert!(sql.contains("AND category IN ("));
    assert!(sql.contains("AND media_type::text IN ("));
    assert!(sql.contains("AND tags && ARRAY["));
    assert!(sql.contains("AND size_bytes >="));
    assert!(sql.contains("AND size_bytes <="));
    assert!(sql.contains("AND created_at >="));
    assert!(sql.contains("AND created_at <="));
    assert!(sql.contains("AND source ="));
}

use regex::Regex;
use serde_json::Value;
use sqlx::{Pool, Postgres};
use std::collections::HashSet;
use uuid::Uuid;

/// Recursively walks a content entry's `data` JSON and collects (field_path, translation_key)
/// pairs for every translation-key reference found in string field values, in either of the
/// two shapes a field can store it in (see admin-panel/packages/i18n/parser.ts and
/// packages/ui's UiRichTextField):
/// - tag format (Text fields): `{key:namespace.key}fallback{/key:namespace.key}`
/// - raw HTML (RichText fields, from the TranslationKeyMark Tiptap mark):
///   `<span class="gp-i18n-key" data-i18n-key="namespace.key">fallback</span>`
pub fn extract_translation_key_refs(data: &Value) -> Vec<(String, String)> {
    let key_tag = Regex::new(r"\{key:([a-zA-Z0-9_.:\-]+)\}").unwrap();
    let key_html_attr = Regex::new(r#"data-i18n-key="([a-zA-Z0-9_.:\-]+)""#).unwrap();
    let mut refs = Vec::new();

    walk(data, String::new(), &key_tag, &key_html_attr, &mut refs);

    refs
}

fn walk(
    value: &Value,
    path: String,
    key_tag: &Regex,
    key_html_attr: &Regex,
    refs: &mut Vec<(String, String)>,
) {
    match value {
        Value::String(s) => {
            let mut seen = HashSet::new();

            for cap in key_tag
                .captures_iter(s)
                .chain(key_html_attr.captures_iter(s))
            {
                let key = cap[1].to_string();

                if seen.insert(key.clone()) {
                    refs.push((path.clone(), key));
                }
            }
        }
        Value::Array(items) => {
            for (i, item) in items.iter().enumerate() {
                let child_path = format!("{path}[{i}]");

                walk(item, child_path, key_tag, key_html_attr, refs);
            }
        }
        Value::Object(map) => {
            for (k, v) in map {
                let child_path = if path.is_empty() {
                    k.clone()
                } else {
                    format!("{path}.{k}")
                };

                walk(v, child_path, key_tag, key_html_attr, refs);
            }
        }
        _ => {}
    }
}

/// Re-syncs `content_translation_refs` for one entry: wipes its current rows and
/// re-inserts the refs found in `data`. Called after every content entry create/
/// update/rollback so the "where is this key used" lookup stays accurate.
pub async fn sync_refs(
    pool: &Pool<Postgres>,
    entry_id: Uuid,
    data: &Value,
) -> Result<(), sqlx::Error> {
    let refs = extract_translation_key_refs(data);

    let mut tx = pool.begin().await?;

    sqlx::query("DELETE FROM content_translation_refs WHERE content_entry_id = $1")
        .bind(entry_id)
        .execute(&mut *tx)
        .await?;

    for (field_path, translation_key) in refs {
        sqlx::query(
            "INSERT INTO content_translation_refs (content_entry_id, field_path, translation_key)
             VALUES ($1, $2, $3)
             ON CONFLICT (content_entry_id, field_path, translation_key) DO NOTHING",
        )
        .bind(entry_id)
        .bind(&field_path)
        .bind(&translation_key)
        .execute(&mut *tx)
        .await?;
    }

    tx.commit().await?;

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn test_extract_no_refs_in_plain_text() {
        let data = json!({ "title": "Просто текст без тегов" });

        assert_eq!(
            extract_translation_key_refs(&data),
            Vec::<(String, String)>::new()
        );
    }

    #[test]
    fn test_extract_single_ref_in_top_level_field() {
        let data =
            json!({ "title": "{key:catalog.price_label}Стоимость{/key:catalog.price_label}" });

        assert_eq!(
            extract_translation_key_refs(&data),
            vec![("title".to_string(), "catalog.price_label".to_string())]
        );
    }

    #[test]
    fn test_extract_multiple_refs_in_same_field() {
        let data = json!({
            "title": "{key:a.one}One{/key:a.one} and {key:a.two}Two{/key:a.two}"
        });

        assert_eq!(
            extract_translation_key_refs(&data),
            vec![
                ("title".to_string(), "a.one".to_string()),
                ("title".to_string(), "a.two".to_string()),
            ]
        );
    }

    #[test]
    fn test_extract_refs_in_nested_objects_and_arrays() {
        let data = json!({
            "hero": { "subtitle": "{key:hero.subtitle}Fallback{/key:hero.subtitle}" },
            "items": [
                { "label": "{key:items.0.label}Label{/key:items.0.label}" },
                { "label": "no ref here" }
            ]
        });

        let mut refs = extract_translation_key_refs(&data);
        refs.sort();

        assert_eq!(
            refs,
            vec![
                ("hero.subtitle".to_string(), "hero.subtitle".to_string()),
                ("items[0].label".to_string(), "items.0.label".to_string()),
            ]
        );
    }

    #[test]
    fn test_extract_ignores_currency_and_nontranslatable_tags() {
        let data = json!({ "price": "Итого: {currency:1990.5}, {nontranslatable}GuestPlace{/nontranslatable}" });

        assert_eq!(
            extract_translation_key_refs(&data),
            Vec::<(String, String)>::new()
        );
    }

    #[test]
    fn test_extract_ref_from_richtext_html_mark() {
        // RichText fields (UiRichTextField "full" mode) store raw Tiptap HTML, where the
        // TranslationKeyMark renders as a `data-i18n-key` attribute rather than a `{key:...}` tag.
        let data = json!({
            "body": "<p>Цена <span class=\"gp-i18n-key\" data-i18n-key=\"catalog.price_label\">товара</span></p>"
        });

        assert_eq!(
            extract_translation_key_refs(&data),
            vec![("body".to_string(), "catalog.price_label".to_string())]
        );
    }

    #[test]
    fn test_extract_both_tag_format_and_html_refs_in_same_field() {
        let data = json!({
            "body": "{key:a.one}One{/key:a.one} and <span data-i18n-key=\"a.two\">Two</span>"
        });

        let mut refs = extract_translation_key_refs(&data);
        refs.sort();

        assert_eq!(
            refs,
            vec![
                ("body".to_string(), "a.one".to_string()),
                ("body".to_string(), "a.two".to_string()),
            ]
        );
    }
}

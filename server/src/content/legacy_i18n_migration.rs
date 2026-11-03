use regex::Regex;
use serde_json::Value;
use std::collections::HashMap;

/// Matches the three literal-wrapper formats the old `isTranslationKey`/`toggleWrapTranslationKey`
/// hack in ContentFormGenerator.vue used to replace a Text field's value with entirely
/// (see admin-panel/packages/ui's git history, section 4.3 step 4 of ROADMAP.md): `$t('key')`,
/// `$t("key")`, `@t:key`, `i18n:key`. Deliberately narrower than the old JS heuristic (which also
/// guessed at bare dotted strings like "page.title") — a one-time data migration only touches
/// values that are unambiguously in one of these wrapper formats, never a guess.
fn legacy_key_pattern() -> Regex {
    Regex::new(r#"^\s*(?:\$t\(\s*['"]([^'"]+)['"]\s*\)|@t:(\S+)|i18n:(\S+))\s*$"#).unwrap()
}

fn extract_legacy_key(value: &str) -> Option<String> {
    let re = legacy_key_pattern();
    let caps = re.captures(value)?;

    caps.get(1)
        .or_else(|| caps.get(2))
        .or_else(|| caps.get(3))
        .map(|m| m.as_str().to_string())
}

/// Converts one legacy-format string into the current tag format, using `translations`
/// (key -> value, for a single locale) for the fallback text when available, or the bare key
/// otherwise (the same fallback `packages/i18n`'s `t()` uses when a key is missing).
fn migrate_legacy_string(value: &str, translations: &HashMap<String, String>) -> Option<String> {
    let key = extract_legacy_key(value)?;
    let fallback = translations
        .get(&key)
        .cloned()
        .unwrap_or_else(|| key.clone());

    Some(format!("{{key:{key}}}{fallback}{{/key:{key}}}"))
}

/// Recursively walks a content entry's `data` JSON and rewrites every legacy-format string it
/// finds in place. Returns whether anything changed, so the caller knows whether to write the
/// entry back and re-sync `content_translation_refs`.
pub fn migrate_legacy_i18n_strings(
    data: &mut Value,
    translations: &HashMap<String, String>,
) -> bool {
    let mut changed = false;

    walk_mut(data, translations, &mut changed);

    changed
}

fn walk_mut(value: &mut Value, translations: &HashMap<String, String>, changed: &mut bool) {
    match value {
        Value::String(s) => {
            if let Some(migrated) = migrate_legacy_string(s, translations) {
                *s = migrated;
                *changed = true;
            }
        }
        Value::Array(items) => {
            for item in items {
                walk_mut(item, translations, changed);
            }
        }
        Value::Object(map) => {
            for (_, v) in map.iter_mut() {
                walk_mut(v, translations, changed);
            }
        }
        _ => {}
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    fn translations() -> HashMap<String, String> {
        HashMap::from([("page.title".to_string(), "Главная страница".to_string())])
    }

    #[test]
    fn test_extract_dollar_t_single_quotes() {
        assert_eq!(
            extract_legacy_key("$t('page.title')"),
            Some("page.title".to_string())
        );
    }

    #[test]
    fn test_extract_dollar_t_double_quotes() {
        assert_eq!(
            extract_legacy_key("$t(\"page.title\")"),
            Some("page.title".to_string())
        );
    }

    #[test]
    fn test_extract_at_t_prefix() {
        assert_eq!(
            extract_legacy_key("@t:page.title"),
            Some("page.title".to_string())
        );
    }

    #[test]
    fn test_extract_i18n_prefix() {
        assert_eq!(
            extract_legacy_key("i18n:page.title"),
            Some("page.title".to_string())
        );
    }

    #[test]
    fn test_extract_ignores_plain_text() {
        assert_eq!(extract_legacy_key("Просто обычный текст"), None);

        assert_eq!(extract_legacy_key("example.com"), None);

        assert_eq!(extract_legacy_key(""), None);
    }

    #[test]
    fn test_extract_ignores_already_migrated_tag_format() {
        assert_eq!(
            extract_legacy_key("{key:page.title}Главная{/key:page.title}"),
            None
        );
    }

    #[test]
    fn test_migrate_string_uses_translation_as_fallback() {
        assert_eq!(
            migrate_legacy_string("$t('page.title')", &translations()),
            Some("{key:page.title}Главная страница{/key:page.title}".to_string())
        );
    }

    #[test]
    fn test_migrate_string_falls_back_to_bare_key_when_translation_missing() {
        assert_eq!(
            migrate_legacy_string("@t:unknown.key", &translations()),
            Some("{key:unknown.key}unknown.key{/key:unknown.key}".to_string())
        );
    }

    #[test]
    fn test_migrate_string_returns_none_for_non_legacy_value() {
        assert_eq!(
            migrate_legacy_string("Обычный текст поля", &translations()),
            None
        );
    }

    #[test]
    fn test_migrate_entry_data_top_level_field() {
        let mut data = json!({ "title": "$t('page.title')", "address": "ул. Ленина, 1" });

        let changed = migrate_legacy_i18n_strings(&mut data, &translations());

        assert!(changed);
        assert_eq!(
            data["title"],
            "{key:page.title}Главная страница{/key:page.title}"
        );
        assert_eq!(data["address"], "ул. Ленина, 1");
    }

    #[test]
    fn test_migrate_entry_data_nested_objects_and_arrays() {
        let mut data = json!({
            "hero": { "subtitle": "@t:hero.subtitle" },
            "items": [ { "label": "i18n:items.0.label" }, { "label": "no ref here" } ]
        });

        let changed = migrate_legacy_i18n_strings(&mut data, &translations());

        assert!(changed);
        assert_eq!(
            data["hero"]["subtitle"],
            "{key:hero.subtitle}hero.subtitle{/key:hero.subtitle}"
        );
        assert_eq!(
            data["items"][0]["label"],
            "{key:items.0.label}items.0.label{/key:items.0.label}"
        );
        assert_eq!(data["items"][1]["label"], "no ref here");
    }

    #[test]
    fn test_migrate_entry_data_no_legacy_strings_reports_unchanged() {
        let mut data = json!({ "title": "Обычный заголовок", "description": "Текст без тегов" });

        let changed = migrate_legacy_i18n_strings(&mut data, &translations());

        assert!(!changed);
        assert_eq!(data["title"], "Обычный заголовок");
    }
}

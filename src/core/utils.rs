pub fn format_number_with_spaces(input: &str) -> String {
    let digits: Vec<char> = input.chars().filter(|c| c.is_digit(10)).collect();
    let mut result = String::new();
    let mut counter = 0;

    for &c in digits.iter().rev() {
        if counter == 3 {
            result.push(' ');
            counter = 0;
        }
        result.push(c);
        counter += 1;
    }

    result.chars().rev().collect()
}

use serde::de::IntoDeserializer;
use serde::{Deserialize, Deserializer};

pub fn empty_string_as_none<'de, D, T>(deserializer: D) -> Result<Option<T>, D::Error>
where
    D: Deserializer<'de>,
    T: Deserialize<'de>,
{
    let opt = Option::<serde_json::Value>::deserialize(deserializer)?;
    match opt {
        None => Ok(None),
        Some(serde_json::Value::Null) => Ok(None),
        Some(serde_json::Value::String(s)) if s.trim().is_empty() => Ok(None),
        Some(v) => T::deserialize(v.into_deserializer()).map(Some).map_err(serde::de::Error::custom),
    }
}


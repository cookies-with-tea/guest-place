use crate::core::dto::ImageDTO;
use crate::AppState;
use sqlx::Row;
use std::sync::Arc;
use uuid::Uuid;

pub async fn get_media(
  state: &Arc<AppState>,
  table_name: &str,
  entity_uuid_column: &str,
  entity_uuid: &Uuid,
) -> Result<Option<ImageDTO>, sqlx::Error> {
  let query = format!(
    "SELECT m.url, m.alt, m.title
         FROM {} em
         JOIN media m ON em.media_uuid = m.uuid
         WHERE em.{} = $1
         LIMIT 1",
    table_name, entity_uuid_column
  );

  let row = sqlx::query(&query)
    .bind(entity_uuid)
    .fetch_optional(&state.pool)
    .await?
    .map(|row| ImageDTO {
      url: row.get("url"),
      alt: row.get("alt"),
      title: row.get("title"),
    });

  Ok(row)
}

pub async fn get_media_by_uuid(
  state: &Arc<AppState>,
  media_uuid: Option<Uuid>
) -> Result<Option<ImageDTO>, sqlx::Error> {
  // Если UUID не передан (None), сразу возвращаем None
  if let Some(uuid) = media_uuid {
    // Запрос для получения медиа-данных по UUID
    let query = "SELECT url, alt, title FROM media WHERE uuid = $1 LIMIT 1";

    // Выполнение запроса
    let row = sqlx::query(query)
      .bind(uuid)
      .fetch_optional(&state.pool)
      .await?
      .map(|row| ImageDTO {
        url: row.get("url"),
        alt: row.get("alt"),
        title: row.get("title"),
      });

    Ok(row)
  } else {
    // Если UUID отсутствует, возвращаем None
    Ok(None)
  }
}

pub fn format_number_with_spaces(input: &str) -> String {
    // Убираем любые нецифровые символы, если они присутствуют
    let digits: Vec<char> = input.chars().filter(|c| c.is_digit(10)).collect();
    let mut result = String::new();
    let mut counter = 0;

    // Проходим по числам справа налево
    for &c in digits.iter().rev() {
        if counter == 3 {
            result.push(' '); // Добавляем пробел после каждых 3 цифр
            counter = 0;
        }
        result.push(c);
        counter += 1;
    }

    // Переворачиваем строку, чтобы вернуть число в правильном порядке
    result.chars().rev().collect()
}

INSERT INTO i18n_translations (key, locale, value) VALUES
('user.updated', 'en', 'User successfully updated'),
('user.updated', 'ru', 'Данные пользователя обновлены'),
('user.role_updated', 'en', 'User role successfully updated'),
('user.role_updated', 'ru', 'Роль пользователя успешно обновлена'),
('user.status_updated', 'en', 'User status successfully updated'),
('user.status_updated', 'ru', 'Статус пользователя успешно обновлен')
ON CONFLICT (key, locale) DO UPDATE SET value = EXCLUDED.value;

INSERT INTO i18n_translations (key, locale, value) VALUES
-- user.*
('user.created', 'en', 'User successfully created'),
('user.created', 'ru', 'Пользователь успешно создан'),

('user.deleted', 'en', 'User successfully deleted'),
('user.deleted', 'ru', 'Пользователь успешно удалён'),

('user.not_found', 'en', 'User not found'),
('user.not_found', 'ru', 'Пользователь не найден'),

('user.phone_exists', 'en', 'User with this phone number already exists'),
('user.phone_exists', 'ru', 'Пользователь с таким номером телефона уже существует'),

('user.password_hash_error', 'en', 'Password hashing error'),
('user.password_hash_error', 'ru', 'Ошибка хеширования пароля'),

('user.check_exists_error', 'en', 'Failed to check user existence'),
('user.check_exists_error', 'ru', 'Не удалось проверить существование пользователя'),

-- general.*
('general.internal_error', 'en', 'Internal server error'),
('general.internal_error', 'ru', 'Внутренняя ошибка сервера'),

('general.db_error', 'en', 'Database error'),
('general.db_error', 'ru', 'Ошибка базы данных')

ON CONFLICT (key, locale) DO NOTHING;

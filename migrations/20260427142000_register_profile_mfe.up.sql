INSERT INTO microfrontends (name, display_name, url, scope, module, icon, order_index, category)
VALUES 
('profile', 'Profile', 'http://localhost:3010/assets/remoteEntry.js', 'profile', './ProfileRoutes', 'User', 5, 'system')
ON CONFLICT (name) DO NOTHING;

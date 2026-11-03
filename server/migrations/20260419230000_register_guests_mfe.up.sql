-- Register Guests MFE
INSERT INTO microfrontends (name, display_name, url, scope, module, icon, category, order_index)
VALUES 
('guests', 'Guests Page', 'http://localhost:3008/assets/remoteEntry.js', 'guests', './GuestsRoutes', 'UserFilled', 'website', 20)
ON CONFLICT (name) DO UPDATE SET 
    url = EXCLUDED.url,
    display_name = EXCLUDED.display_name,
    module = EXCLUDED.module,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category;

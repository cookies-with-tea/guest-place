-- Seed About MFE
INSERT INTO microfrontends (name, display_name, url, scope, module, icon, category, order_index)
VALUES 
('about', 'About Page', 'http://localhost:3006/assets/remoteEntry.js', 'about', './AboutRoutes', 'EditPen', 'website', 10)
ON CONFLICT (name) DO UPDATE SET category = 'website', display_name = 'About Page', icon = 'EditPen';

-- Seed Content MFE
INSERT INTO microfrontends (name, display_name, url, scope, module, icon, category, order_index)
VALUES 
('content', 'Content Manager', 'http://localhost:3007/assets/remoteEntry.js', 'content', './ContentRoutes', 'Document', 'website', 20)
ON CONFLICT (name) DO UPDATE SET category = 'website', display_name = 'Content Manager', icon = 'Document', url = 'http://localhost:3007/assets/remoteEntry.js';

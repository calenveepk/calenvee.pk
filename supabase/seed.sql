-- =====================================================================
-- CALENVEE.PK — INITIAL INVENTORY SEED
-- Populates public.inventory table with all 25 active Calenvee products
-- Run this in Supabase Dashboard -> SQL Editor after schema.sql
-- =====================================================================

INSERT INTO public.inventory (product_id, product_name, category, price, original_price, stock, is_active)
VALUES
  ('cv-new-perfume', 'Santal 26 — Luxury Eau de Parfum', 'beauty', 2999, 4500, 48, true),
  ('cv-new-sneakers', 'Classic Low-Top Minimalist Sneakers', 'men', 4999, 7499, 35, true),
  ('cv-new-handbag', 'Milano Structured Leather Handbag', 'women', 5999, 8999, 19, true),
  ('cv-new-hoodie', 'Essential Heavyweight Fleece Hoodie', 'women', 3999, 5999, 42, true),
  ('cv-deal-smartwatch', 'Smart Watch Pro — Fitness & Health Edition', 'watches', 4999, 8999, 23, true),
  ('cv-watch-01', 'Calenvee Obsidian Chrono Edition', 'watches', 3899, 5999, 14, true),
  ('cv-watch-02', 'Calenvee Emerald Royal Legacy Watch', 'watches', 3499, 4999, 9, true),
  ('cv-watch-03', 'Calenvee Minimalist Frost Ceramic Watch', 'watches', 2999, 4200, 18, true),
  ('cv-jewel-01', 'Calenvee 8mm Miami Cuban Link Chain', 'jewelry', 1899, 2800, 30, true),
  ('cv-jewel-02', 'Calenvee Celestial Compass Pendant Chain', 'jewelry', 1699, 2400, 16, true),
  ('cv-jewel-03', 'Calenvee Onyx Sovereign Signet Ring', 'jewelry', 1399, 1999, 22, true),
  ('cv-jewel-04', 'Calenvee Cyber Aura Magnetic Couple Bracelets', 'jewelry', 1499, 2200, 25, true),
  ('cv-eye-01', 'Calenvee Matrix Y2K Cyber Shields', 'sunglasses', 1999, 3200, 12, true),
  ('cv-eye-02', 'Calenvee Tokyo Noir Acetate Square Frames', 'sunglasses', 2199, 3500, 15, true),
  ('cv-eye-03', 'Calenvee Lumina Anti-Blue Light Glasses', 'sunglasses', 1799, 2600, 20, true),
  ('cv-scent-01', 'Calenvee Midnight Amber Extract de Parfum (50ml)', 'beauty', 2499, 3800, 11, true),
  ('cv-scent-02', 'Calenvee Vanilla Clouds Eau de Parfum (50ml)', 'beauty', 2299, 3400, 19, true),
  ('cv-bag-01', 'Calenvee Heavyweight Canvas Everyday Tote', 'women', 1999, 2999, 20, true),
  ('cv-bag-02', 'Calenvee Tactical Crossbody Messenger', 'women', 2499, 3800, 14, true),
  ('cv-tech-01', 'Calenvee Carbon Pulse Mag-Cardholder & Kickstand', 'electronics', 1599, 2400, 26, true),
  ('cv-tech-02', 'Calenvee Titanium Modular Key Organizer', 'electronics', 1299, 1999, 18, true),
  ('cv-watch-04', 'Calenvee Monaco Vintage Racing Chronograph', 'watches', 3699, 5200, 12, true),
  ('cv-jewel-05', 'Calenvee Flat Snake Bone Herringbone Chain', 'jewelry', 1899, 2800, 15, true),
  ('cv-eye-04', 'Calenvee Golden Hour Wire Aviator Shades', 'sunglasses', 1999, 2900, 17, true),
  ('cv-tech-03', 'Calenvee Alpine Magnetic Loop Watch Strap', 'watches', 1599, 2300, 22, true)
ON CONFLICT (product_id) DO UPDATE SET
  product_name = EXCLUDED.product_name,
  category = EXCLUDED.category,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  stock = EXCLUDED.stock,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- Verify seed insertion
SELECT product_id, product_name, price, stock, is_active FROM public.inventory ORDER BY product_name ASC;
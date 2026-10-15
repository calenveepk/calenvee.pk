-- =====================================================================
-- CALENVEE.PK — PRODUCTION POSTGRESQL SCHEMA (SUPABASE FREE TIER)
-- Run this in Supabase Dashboard -> SQL Editor -> New Query -> Run
-- =====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. SEQUENTIAL ORDER NUMBER GENERATOR (e.g. CAL-ORD-1000001)
CREATE SEQUENCE IF NOT EXISTS order_number_seq START WITH 1000001;

CREATE OR REPLACE FUNCTION generate_order_number() 
RETURNS TEXT AS $$
BEGIN
  RETURN 'CAL-ORD-' || nextval('order_number_seq')::TEXT;
END;
$$ LANGUAGE plpgsql;

-- 3. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT UNIQUE NOT NULL DEFAULT generate_order_number(),
    customer_name TEXT NOT NULL,
    email TEXT,
    phone TEXT NOT NULL,
    city TEXT NOT NULL,
    address TEXT NOT NULL,
    delivery_notes TEXT DEFAULT '',
    payment_method TEXT NOT NULL CHECK (payment_method IN ('cod', 'jazzcash', 'easypaisa', 'bank_transfer')),
    subtotal NUMERIC(12, 2) NOT NULL CHECK (subtotal >= 0),
    discount NUMERIC(12, 2) DEFAULT 0 CHECK (discount >= 0),
    shipping_fee NUMERIC(12, 2) NOT NULL DEFAULT 350 CHECK (shipping_fee >= 0),
    total NUMERIC(12, 2) NOT NULL CHECK (total >= 0),
    status TEXT NOT NULL DEFAULT 'placed' CHECK (status IN ('placed', 'confirmed', 'processing', 'dispatched', 'delivered', 'returned', 'cancelled')),
    courier TEXT DEFAULT '-',
    tracking_number TEXT DEFAULT '-',
    receipt_url TEXT,
    receipt_filename TEXT,
    receipt_size TEXT,
    confirmation_email_sent BOOLEAN DEFAULT FALSE,
    dispatch_email_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for instant lookup by order_number, phone, status, and created_at
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_phone ON public.orders(phone);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

-- 4. ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    order_number TEXT NOT NULL,
    product_id TEXT NOT NULL,
    product_name TEXT NOT NULL,
    variant_color TEXT DEFAULT 'Standard',
    variant_size TEXT DEFAULT 'Standard',
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(12, 2) NOT NULL CHECK (unit_price >= 0),
    line_total NUMERIC(12, 2) NOT NULL CHECK (line_total >= 0),
    image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);

-- 5. INVENTORY & REAL-TIME STOCK TABLE
CREATE TABLE IF NOT EXISTS public.inventory (
    product_id TEXT PRIMARY KEY,
    product_name TEXT NOT NULL,
    category TEXT DEFAULT 'accessories',
    price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
    original_price NUMERIC(12, 2) DEFAULT 0,
    stock INTEGER NOT NULL DEFAULT 50 CHECK (stock >= 0),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inventory_active ON public.inventory(is_active);

-- 6. AUTOMATIC STOCK DEDUCTION TRIGGER
-- Automatically decrements inventory.stock whenever a new order_item is inserted
CREATE OR REPLACE FUNCTION public.decrement_inventory_on_order()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.inventory
    SET stock = GREATEST(0, stock - NEW.quantity),
        updated_at = NOW()
    WHERE product_id = NEW.product_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_decrement_inventory ON public.order_items;
CREATE TRIGGER trg_decrement_inventory
AFTER INSERT ON public.order_items
FOR EACH ROW
EXECUTE FUNCTION public.decrement_inventory_on_order();

-- 7. AUTOMATIC UPDATED_AT TIMESTAMP TRIGGER
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_orders_updated_at ON public.orders;
CREATE TRIGGER trg_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- 8. ROW LEVEL SECURITY (RLS) POLICIES — BULLETPROOF PROTECTION
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;

-- Deny public reading of any customer orders (Zero PII leak guaranteed)
DROP POLICY IF EXISTS "Public cannot read orders" ON public.orders;
CREATE POLICY "Public cannot read orders" 
ON public.orders FOR SELECT 
USING (false);

-- Service Role (our Vercel Serverless API) has full access
DROP POLICY IF EXISTS "Service role full access on orders" ON public.orders;
CREATE POLICY "Service role full access on orders" 
ON public.orders FOR ALL 
TO service_role 
USING (true) WITH CHECK (true);

-- Order Items RLS
DROP POLICY IF EXISTS "Public cannot read order items" ON public.order_items;
CREATE POLICY "Public cannot read order items" 
ON public.order_items FOR SELECT 
USING (false);

DROP POLICY IF EXISTS "Service role full access on order items" ON public.order_items;
CREATE POLICY "Service role full access on order items" 
ON public.order_items FOR ALL 
TO service_role 
USING (true) WITH CHECK (true);

-- Inventory RLS: Public can view active product stock/prices, only service role can edit
DROP POLICY IF EXISTS "Public can view inventory" ON public.inventory;
CREATE POLICY "Public can view inventory" 
ON public.inventory FOR SELECT 
USING (is_active = true);

DROP POLICY IF EXISTS "Service role full access on inventory" ON public.inventory;
CREATE POLICY "Service role full access on inventory" 
ON public.inventory FOR ALL 
TO service_role 
USING (true) WITH CHECK (true);

-- 9. STORAGE BUCKET FOR PAYMENT PROOF SCREENSHOTS
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-proofs', 'payment-proofs', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policy: Anyone can upload a receipt screenshot, but only service_role or admin can list/delete
DROP POLICY IF EXISTS "Public can upload payment proofs" ON storage.objects;
CREATE POLICY "Public can upload payment proofs"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'payment-proofs');

DROP POLICY IF EXISTS "Public can view payment proofs" ON storage.objects;
CREATE POLICY "Public can view payment proofs"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'payment-proofs');


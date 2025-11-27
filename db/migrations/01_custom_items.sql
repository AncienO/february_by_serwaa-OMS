-- Migration: Allow custom order items

-- 1. Make product_id nullable in order_items table
ALTER TABLE order_items ALTER COLUMN product_id DROP NOT NULL;

-- 2. Add product_name column to order_items table
ALTER TABLE order_items ADD COLUMN product_name TEXT;

-- 3. Populate product_name for existing items (optional but good for consistency)
UPDATE order_items 
SET product_name = products.name 
FROM products 
WHERE order_items.product_id = products.id;

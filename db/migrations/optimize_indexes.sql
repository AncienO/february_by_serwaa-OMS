-- Migration: Optimize indexes for performance

-- 1. Index for sorting orders by date (used in Orders page)
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- 2. Index for joining orders with customers (used in Orders page)
-- Note: We check if it exists first, though we might have added it in a previous fix, explicit is good.
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);

-- 3. Indexes for order items (used when viewing order details)
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- 4. Index for filtering orders by status (common operation)
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

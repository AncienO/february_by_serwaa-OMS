-- Consolidated migration to fix orders schema

DO $$ 
BEGIN 
    -- 1. Check if user_id column exists, add if not
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'user_id') THEN
        ALTER TABLE orders ADD COLUMN user_id uuid;
    END IF;

    -- 2. Drop existing foreign key constraint if it exists (to ensure we point to employees)
    -- We try to drop both potential names to be safe
    BEGIN
        ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_user_id_fkey;
    EXCEPTION
        WHEN undefined_object THEN NULL;
    END;

    -- 3. Add foreign key constraint referencing employees
    ALTER TABLE orders
    ADD CONSTRAINT orders_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES employees(id);

    -- 4. Create index if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'orders' AND indexname = 'idx_orders_user_id') THEN
        CREATE INDEX idx_orders_user_id ON orders(user_id);
    END IF;

END $$;

-- Drop the existing foreign key constraint referencing profiles
ALTER TABLE orders
DROP CONSTRAINT orders_user_id_fkey;

-- Add new foreign key constraint referencing employees
ALTER TABLE orders
ADD CONSTRAINT orders_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES employees(id);

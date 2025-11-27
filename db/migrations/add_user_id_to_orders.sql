-- Add user_id column to orders table
ALTER TABLE orders 
ADD COLUMN user_id uuid REFERENCES profiles(id);

-- Create an index for better performance on joins
CREATE INDEX idx_orders_user_id ON orders(user_id);

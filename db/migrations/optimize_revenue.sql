-- Migration: Optimize revenue calculation
-- Create a function to calculate total revenue on the server side
-- This avoids fetching all orders to the client

CREATE OR REPLACE FUNCTION get_total_revenue()
RETURNS DECIMAL AS $$
BEGIN
  RETURN (
    SELECT COALESCE(SUM(total_amount), 0)
    FROM orders
  );
END;
$$ LANGUAGE plpgsql;

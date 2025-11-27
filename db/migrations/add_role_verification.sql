-- Add columns for role verification
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS pending_role text,
ADD COLUMN IF NOT EXISTS role_change_token text;

-- Add constraint to ensure pending_role is valid if set
ALTER TABLE employees 
ADD CONSTRAINT check_pending_role CHECK (pending_role IN ('Admin', 'Staff'));

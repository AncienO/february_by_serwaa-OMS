-- Add username column to employees table
ALTER TABLE employees ADD COLUMN username TEXT UNIQUE;

-- Create index for faster lookups
CREATE UNIQUE INDEX employees_username_idx ON employees (username);

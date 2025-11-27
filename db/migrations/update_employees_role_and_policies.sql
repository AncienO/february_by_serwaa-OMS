-- Update handle_new_employee function to use role from metadata
CREATE OR REPLACE FUNCTION public.handle_new_employee()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.employees (id, email, first_name, last_name, username, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NEW.raw_user_meta_data->>'username',
    COALESCE(NEW.raw_user_meta_data->>'role', 'Staff') -- Use provided role or default to Staff
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is admin (bypasses RLS)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM employees
    WHERE id = auth.uid()
    AND role = 'Admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update RLS policies for employees table

-- Drop existing policies to avoid conflicts (or we can alter them, but dropping is cleaner here)
DROP POLICY IF EXISTS "Authenticated users can manage employees" ON employees;
DROP POLICY IF EXISTS "Employees are viewable by everyone" ON employees;
DROP POLICY IF EXISTS "Admins can manage all employees" ON employees;
DROP POLICY IF EXISTS "Staff can view all employees" ON employees;
DROP POLICY IF EXISTS "Users can update their own record" ON employees;

-- Policy: Admins can do everything
CREATE POLICY "Admins can manage all employees" ON employees
    FOR ALL
    TO authenticated
    USING (is_admin());

-- Policy: Staff can view all employees (needed for order assignment, etc.)
CREATE POLICY "Staff can view all employees" ON employees
    FOR SELECT
    TO authenticated
    USING (true);

-- Policy: Users can update their own record (optional, but good for profile management)
CREATE POLICY "Users can update their own record" ON employees
    FOR UPDATE
    TO authenticated
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- Function to get email by username (securely)
CREATE OR REPLACE FUNCTION public.get_email_by_username(username_input text)
RETURNS TEXT AS $$
DECLARE
  found_email TEXT;
BEGIN
  SELECT email INTO found_email
  FROM employees
  WHERE username = username_input;
  
  RETURN found_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to everyone (so login page can use it)
GRANT EXECUTE ON FUNCTION public.get_email_by_username(text) TO anon, authenticated;

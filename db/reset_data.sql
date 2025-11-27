-- DANGER: This script deletes ALL user and order data.
-- Use this to reset your database for testing.

-- 1. Delete dependent data first (to avoid Foreign Key violations)
DELETE FROM public.order_items;
DELETE FROM public.orders;

-- 2. Delete employees (Public schema)
DELETE FROM public.employees;

-- 3. Delete profiles (Public schema - if you are using them)
DELETE FROM public.profiles;

-- 4. Delete authenticated users (Supabase Auth schema)
-- This will remove the login credentials.
DELETE FROM auth.users;

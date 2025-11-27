-- Backfill script to insert missing employees from auth.users

insert into public.employees (id, email, first_name, last_name, role)
select
  au.id,
  au.email,
  -- Attempt to split full_name if first_name/last_name are missing in metadata
  coalesce(
    au.raw_user_meta_data->>'first_name',
    split_part(au.raw_user_meta_data->>'full_name', ' ', 1)
  ) as first_name,
  coalesce(
    au.raw_user_meta_data->>'last_name',
    substring(au.raw_user_meta_data->>'full_name' from position(' ' in au.raw_user_meta_data->>'full_name') + 1)
  ) as last_name,
  'Staff' as role
from auth.users au
left join public.employees pe on au.id = pe.id
where pe.id is null;

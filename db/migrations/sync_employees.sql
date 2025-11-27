-- Function to handle new employee creation
create or replace function public.handle_new_employee()
returns trigger as $$
begin
  insert into public.employees (id, email, first_name, last_name, username, role)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    new.raw_user_meta_data->>'username',
    'Staff' -- Default role
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to call the function on new user creation
create trigger on_auth_user_created_employee
  after insert on auth.users
  for each row execute procedure public.handle_new_employee();

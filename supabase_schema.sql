-- Expenses Policies
create policy "Users can view their own expenses" on expenses
  for select using (auth.uid() = user_id);

create policy "Users can manage their own expenses" on expenses
  for all using (auth.uid() = user_id);

-- Trigger for automatic profile creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, username)
  values (new.id, new.email, new.raw_user_meta_data->>'username');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Enable Row Level Security
alter publication supabase_realtime add table user_profile;
alter publication supabase_realtime add table groups;
alter publication supabase_realtime add table transactions;

-- Custom types
create type transaction_type as enum ('income', 'expense');

-- Tables
create table user_profile (
  id uuid references auth.users on delete cascade not null primary key,
  user_id uuid references auth.users on delete cascade not null,
  full_name text,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

create table groups (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  percentage numeric(5, 2) not null,
  can_spend boolean default true not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  constraint "percentage_check" check (percentage >= 0 and percentage <= 100)
);

create table transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  amount numeric(10, 2) not null,
  type transaction_type not null,
  group_id uuid references groups on delete set null,
  concept text,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- Functions
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create or replace function initialize_user_defaults()
returns trigger as $$
begin
  insert into public.user_profile (id, user_id, full_name)
  values (new.id, new.id, new.email);

  insert into public.groups (user_id, name, percentage, can_spend)
  values
    (new.id, 'General', 100.00, true),
      (new.id, 'Entertainment', 0.00, true),
      (new.id, 'Savings', 0.00, false),
      (new.id, 'Education', 0.00, true);
  return new;
end;
$$ language plpgsql security definer;

create or replace function get_user_balances(p_user_id uuid)
returns table (
  group_id uuid,
  group_name text,
  percentage numeric,
  can_spend boolean,
  max_amount numeric,
  available_amount numeric,
  general_max numeric,
  total_available numeric
)
language plpgsql
as $$
declare
  v_total_income numeric := 0;
  v_total_expenses numeric := 0;
  v_general_max numeric := 0;
  v_total_available numeric := 0;
begin
  -- Calculate total income and expenses for the user
  select
    coalesce(sum(case when t.type = 'income' then t.amount else 0 end), 0),
    coalesce(sum(case when t.type = 'expense' then t.amount else 0 end), 0)
  into
    v_total_income,
    v_total_expenses
  from transactions t
  where t.user_id = p_user_id;

  v_general_max := v_total_income;
  v_total_available := v_total_income - v_total_expenses;

  return query
  select
    g.id as group_id,
    g.name as group_name,
    g.percentage,
    g.can_spend,
    (v_total_income * (g.percentage / 100)) as max_amount,
    (v_total_income * (g.percentage / 100)) - coalesce(sum(case when t.type = 'expense' then t.amount else 0 end), 0) as available_amount,
    v_general_max,
    v_total_available
  from groups g
  left join transactions t on g.id = t.group_id and t.user_id = p_user_id
  where g.user_id = p_user_id
  group by g.id, g.name, g.percentage, g.can_spend, v_general_max, v_total_available
  order by g.name;
end;
$$;

create or replace function get_user_summary(p_user_id uuid)
returns table (
  general_max numeric,
  total_available numeric
)
language plpgsql
as $$
declare
  v_total_income numeric := 0;
  v_total_expenses numeric := 0;
  v_general_max numeric := 0;
  v_total_available numeric := 0;
begin
  -- Calculate total income and expenses for the user
  select
    coalesce(sum(case when t.type = 'income' then t.amount else 0 end), 0),
    coalesce(sum(case when t.type = 'expense' then t.amount else 0 end), 0)
  into
    v_total_income,
    v_total_expenses
  from transactions t
  where t.user_id = p_user_id;

  v_general_max := v_total_income;
  v_total_available := v_total_income - v_total_expenses;

  return query
  select
    v_general_max,
    v_total_available;
end;
$$;

-- Triggers
create trigger set_updated_at_user_profile
before update on user_profile
for each row execute function set_updated_at();

create trigger set_updated_at_groups
before update on groups
for each row execute function set_updated_at();

create trigger set_updated_at_transactions
before update on transactions
for each row execute function set_updated_at();

create trigger on_auth_user_created
after insert on auth.users
for each row execute function initialize_user_defaults();

-- RLS Policies
alter table user_profile enable row level security;
create policy "Users can view their own user profiles." on user_profile for select using (auth.uid() = id);
create policy "Users can update their own user profiles." on user_profile for update using (auth.uid() = id);

alter table groups enable row level security;
create policy "Users can view their own groups." on groups for select using (auth.uid() = user_id);
create policy "Users can create groups." on groups for insert with check (auth.uid() = user_id);
create policy "Users can update their own groups." on groups for update using (auth.uid() = user_id);
create policy "Users can delete their own groups." on groups for delete using (auth.uid() = user_id);

alter table transactions enable row level security;
create policy "Users can view their own transactions." on transactions for select using (auth.uid() = user_id);
create policy "Users can create transactions." on transactions for insert with check (auth.uid() = user_id);
create policy "Users can update their own transactions." on transactions for update using (auth.uid() = user_id);
create policy "Users can delete their own transactions." on transactions for delete using (auth.uid() = user_id);

-- Seed Data (Example transactions - replace with actual user_id after signup)
-- You'll need to manually insert these after a user signs up, or modify initialize_user_defaults
-- to include them for a specific test user.
-- For demonstration purposes, assume a user with ID 'YOUR_USER_ID' exists.

-- Expected dashboard result for a user with these transactions:
-- Total Income: 11632
-- Total Expenses: 450
-- General Max: 11632
-- Total Available: 11182

-- Groups (percentages are illustrative, actual max_amount and available_amount depend on total income)
-- General: max_amount = 11632, available_amount = 11632 - 6000 (income) - 5500 (income) = 11632
-- Entertainment: max_amount = 0, available_amount = 0 - 450 (expense) - 132 (income) = -318 (if percentage is 0)

-- To test the seed data, you would first create a user, then get their `auth.uid()`,
-- and then insert the following transactions, replacing 'YOUR_USER_ID' and 'YOUR_GENERAL_GROUP_ID', 'YOUR_ENTERTAINMENT_GROUP_ID'
-- with the actual IDs.

-- Example transactions (after a user is created and default groups are initialized):
-- INSERT INTO transactions (user_id, amount, type, group_id, concept) VALUES
-- ('YOUR_USER_ID', 6000, 'income', 'YOUR_GENERAL_GROUP_ID', 'January Salary'),
-- ('YOUR_USER_ID', 450, 'expense', 'YOUR_ENTERTAINMENT_GROUP_ID', 'Movies and dinner'),
-- ('YOUR_USER_ID', 5500, 'income', 'YOUR_GENERAL_GROUP_ID', 'February Salary'),
-- ('YOUR_USER_ID', 132, 'income', 'YOUR_ENTERTAINMENT_GROUP_ID', 'Friend reimbursement');
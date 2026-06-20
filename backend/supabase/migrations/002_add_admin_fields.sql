alter table public.profiles
add column if not exists store_name text,
add column if not exists phone text;

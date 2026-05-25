-- Esta migración YA ESTÁ APLICADA en el proyecto de demo.
-- No ejecutar en vivo durante la masterclass.
-- La tabla existe para que la exploración de Claude la encuentre.

create table if not exists public.bookmarks (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  post_id     text not null,
  created_at  timestamptz not null default now(),
  unique(user_id, post_id)
);

-- Row Level Security
alter table public.bookmarks enable row level security;

create policy "Users can manage their own bookmarks"
  on public.bookmarks
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Index para queries frecuentes
create index bookmarks_user_id_idx on public.bookmarks(user_id);
create index bookmarks_post_id_idx on public.bookmarks(post_id);

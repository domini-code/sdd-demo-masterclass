create table public.reactions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  post_id     text not null,
  created_at  timestamptz not null default now(),
  unique(user_id, post_id)
);

create index reactions_post_id_idx on public.reactions(post_id);

alter table public.reactions enable row level security;

create policy "Lectura pública" on public.reactions
  for select using (true);

create policy "Solo el dueño inserta" on public.reactions
  for insert with check (auth.uid() = user_id);

create policy "Solo el dueño elimina" on public.reactions
  for delete using (auth.uid() = user_id);

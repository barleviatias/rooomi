create table if not exists error_logs (
  id uuid primary key default gen_random_uuid(),
  message text not null,
  stack text,
  component_stack text,
  url text,
  user_agent text,
  user_id uuid references profiles(id),
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

create index idx_error_logs_created_at on error_logs(created_at desc);
create index idx_error_logs_user_id on error_logs(user_id);

alter table error_logs enable row level security;

create policy "Anyone can insert error logs"
  on error_logs for insert
  with check (true);

create policy "Admins can read error logs"
  on error_logs for select
  using (
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );

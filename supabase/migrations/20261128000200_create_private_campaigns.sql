begin;
create schema if not exists brassen_private;
revoke all on schema brassen_private from public, anon, authenticated;
create table if not exists brassen_private.campaigns (
  user_id uuid primary key references auth.users (id) on delete cascade,
  checkpoint jsonb,
  revision integer not null check (revision > 0)
);
alter table brassen_private.campaigns enable row level security;
revoke all on table brassen_private.campaigns from public, anon, authenticated;
commit;

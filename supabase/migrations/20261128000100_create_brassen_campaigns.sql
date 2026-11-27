create table public.brassen_campaigns (
  user_id uuid primary key references auth.users (id) on delete cascade,
  checkpoint jsonb,
  revision integer not null check (revision > 0)
);

alter table public.brassen_campaigns enable row level security;

revoke all on table public.brassen_campaigns from public, anon, authenticated;
grant select on table public.brassen_campaigns to authenticated;

create policy "Players can read their own campaign"
  on public.brassen_campaigns
  for select to authenticated
  using ((select auth.uid()) = user_id);

create function public.save_brassen_campaign(
  p_checkpoint jsonb,
  p_expected_revision integer,
  p_expected_user_id uuid
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  player_id uuid := auth.uid();
  saved_revision integer;
begin
  if player_id is null or player_id is distinct from p_expected_user_id then
    raise exception 'Sign in to save the campaign' using errcode = '42501';
  end if;

  if p_expected_revision is not null and p_expected_revision < 1 then
    raise exception 'Invalid campaign revision' using errcode = '22023';
  end if;

  if p_checkpoint is not null then
    if octet_length(p_checkpoint::text) > 2097152 then
      raise exception 'Campaign save exceeds 2 MiB' using errcode = '22023';
    end if;

    if jsonb_typeof(p_checkpoint) is distinct from 'object'
      or jsonb_typeof(p_checkpoint -> 'floor') is distinct from 'number'
      or (p_checkpoint ->> 'floor') !~ '^[1-9][0-9]{0,3}$'
      or jsonb_typeof(p_checkpoint #> '{run,progress,build}') is distinct from 'object'
      or jsonb_typeof(p_checkpoint #> '{run,rewards}') is distinct from 'array'
      or jsonb_typeof(p_checkpoint #> '{run,floorSeeds}') is distinct from 'array' then
      raise exception 'Invalid campaign save' using errcode = '22023';
    end if;

    if (p_checkpoint ->> 'floor')::integer > 1332 then
      raise exception 'Invalid campaign floor' using errcode = '22023';
    end if;
  end if;

  -- Clearing a save advances its revision so another device cannot revive it.
  if p_expected_revision is null then
    insert into public.brassen_campaigns (user_id, checkpoint, revision)
    values (player_id, p_checkpoint, 1)
    on conflict (user_id) do nothing
    returning revision into saved_revision;
  else
    update public.brassen_campaigns
    set checkpoint = p_checkpoint, revision = revision + 1
    where user_id = player_id and revision = p_expected_revision
    returning revision into saved_revision;
  end if;

  if saved_revision is null then
    raise exception 'Campaign revision conflict' using errcode = 'PT409';
  end if;

  return saved_revision;
end;
$$;

revoke all on function public.save_brassen_campaign(jsonb, integer, uuid) from public, anon, authenticated;
grant execute on function public.save_brassen_campaign(jsonb, integer, uuid) to authenticated;

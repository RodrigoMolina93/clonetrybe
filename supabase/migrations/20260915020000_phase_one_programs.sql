create type public.program_status as enum ('DRAFT', 'ACTIVE', 'PAUSED', 'ENDED', 'ARCHIVED');
create type public.program_visibility as enum ('PRIVATE', 'PUBLIC');
create type public.compensation_type as enum ('FIXED', 'REVENUE_SHARE');
create type public.program_application_status as enum ('PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN');
create type public.program_invitation_status as enum ('PENDING', 'ACCEPTED', 'DECLINED', 'CANCELLED', 'EXPIRED');
create type public.program_membership_source as enum ('APPLICATION', 'INVITATION', 'MANUAL');
create type public.program_membership_status as enum ('ACTIVE', 'REMOVED');

create table public.programs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  name text not null check (char_length(trim(name)) between 2 and 120),
  description text not null check (char_length(trim(description)) between 2 and 5000),
  cover_image_url text,
  status public.program_status not null default 'DRAFT',
  visibility public.program_visibility not null default 'PRIVATE',
  applications_enabled boolean not null default false,
  start_date date,
  end_date date,
  compensation_type public.compensation_type not null,
  fixed_amount bigint,
  revenue_share_percentage numeric(5,2),
  platform_fee_percentage numeric(5,2) not null default 1.50,
  currency text not null default 'ARS',
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint programs_date_range_valid check (end_date is null or start_date is null or end_date >= start_date),
  constraint programs_currency_ars check (currency = 'ARS'),
  constraint programs_platform_fee_phase_one check (platform_fee_percentage = 1.50),
  constraint programs_compensation_valid check (
    (compensation_type = 'FIXED' and fixed_amount > 0 and fixed_amount <= 9007199254740991 and revenue_share_percentage is null)
    or
    (compensation_type = 'REVENUE_SHARE' and fixed_amount is null and revenue_share_percentage > 0 and revenue_share_percentage <= 100)
  )
);

comment on column public.programs.fixed_amount is
  'Exact ARS amount stored in minor units (centavos).';

create index programs_organization_id_idx on public.programs(organization_id);
create index programs_discovery_idx on public.programs(status, visibility, applications_enabled);

create table public.program_briefs (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.programs(id) on delete restrict,
  title text not null check (char_length(trim(title)) between 2 and 160),
  description text not null check (char_length(trim(description)) between 2 and 5000),
  requirements text not null check (char_length(trim(requirements)) between 2 and 10000),
  dos text,
  donts text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint program_briefs_one_primary_per_program unique (program_id)
);

create table public.program_applications (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.programs(id) on delete restrict,
  creator_id uuid not null references public.creator_profiles(user_id) on delete restrict,
  status public.program_application_status not null default 'PENDING',
  message text check (message is null or char_length(trim(message)) <= 1000),
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint program_applications_review_consistent check (
    (status in ('PENDING', 'WITHDRAWN') and reviewed_by is null and reviewed_at is null)
    or
    (status in ('ACCEPTED', 'REJECTED') and reviewed_by is not null and reviewed_at is not null)
  )
);

create unique index program_applications_one_pending_idx
  on public.program_applications(program_id, creator_id)
  where status = 'PENDING';
create index program_applications_program_id_idx on public.program_applications(program_id);
create index program_applications_creator_id_idx on public.program_applications(creator_id);

create table public.program_invitations (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.programs(id) on delete restrict,
  creator_id uuid not null references public.creator_profiles(user_id) on delete restrict,
  invited_by uuid not null references public.profiles(id) on delete restrict,
  status public.program_invitation_status not null default 'PENDING',
  expires_at timestamptz,
  responded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint program_invitations_response_consistent check (
    (status = 'PENDING' and responded_at is null)
    or (status <> 'PENDING' and responded_at is not null)
  )
);

create unique index program_invitations_one_pending_idx
  on public.program_invitations(program_id, creator_id)
  where status = 'PENDING';
create index program_invitations_program_id_idx on public.program_invitations(program_id);
create index program_invitations_creator_id_idx on public.program_invitations(creator_id);

create table public.program_memberships (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.programs(id) on delete restrict,
  creator_id uuid not null references public.creator_profiles(user_id) on delete restrict,
  source public.program_membership_source not null,
  joined_at timestamptz not null default now(),
  status public.program_membership_status not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint program_memberships_creator_program_unique unique (program_id, creator_id)
);

create index program_memberships_program_id_idx on public.program_memberships(program_id);
create index program_memberships_creator_id_idx on public.program_memberships(creator_id);

create trigger programs_set_updated_at before update on public.programs
for each row execute function private.set_updated_at();
create trigger program_briefs_set_updated_at before update on public.program_briefs
for each row execute function private.set_updated_at();
create trigger program_applications_set_updated_at before update on public.program_applications
for each row execute function private.set_updated_at();
create trigger program_invitations_set_updated_at before update on public.program_invitations
for each row execute function private.set_updated_at();
create trigger program_memberships_set_updated_at before update on public.program_memberships
for each row execute function private.set_updated_at();

create or replace function private.enforce_program_status_transition()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status = old.status then return new; end if;
  if not (
    (old.status = 'DRAFT' and new.status in ('ACTIVE', 'ARCHIVED'))
    or (old.status = 'ACTIVE' and new.status in ('PAUSED', 'ENDED', 'ARCHIVED'))
    or (old.status = 'PAUSED' and new.status in ('ACTIVE', 'ENDED', 'ARCHIVED'))
    or (old.status = 'ENDED' and new.status = 'ARCHIVED')
  ) then
    raise exception 'invalid_program_status_transition' using errcode = '22023';
  end if;
  return new;
end;
$$;

create trigger programs_enforce_status_transition
before update of status on public.programs
for each row execute function private.enforce_program_status_transition();

create or replace function private.is_program_brand_member(target_program_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.programs p
    join public.organization_members om on om.organization_id = p.organization_id
    where p.id = target_program_id and om.user_id = (select auth.uid())
  );
$$;

create or replace function private.is_program_creator_member(target_program_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.program_memberships pm
    where pm.program_id = target_program_id
      and pm.creator_id = (select auth.uid())
      and pm.status = 'ACTIVE'
  );
$$;

create or replace function private.has_program_creator_relationship(target_program_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    (select private.is_program_creator_member(target_program_id))
    or exists (
      select 1 from public.program_applications pa
      where pa.program_id = target_program_id and pa.creator_id = (select auth.uid())
    )
    or exists (
      select 1 from public.program_invitations pi
      where pi.program_id = target_program_id and pi.creator_id = (select auth.uid())
    );
$$;

create or replace function private.is_organization_visible_to_creator(target_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles profile
    where profile.id = (select auth.uid())
      and profile.user_type = 'CREATOR'
      and exists (
        select 1 from public.programs p
        where p.organization_id = target_organization_id
          and (
            (p.status = 'ACTIVE' and p.visibility = 'PUBLIC')
            or (select private.has_program_creator_relationship(p.id))
          )
      )
  );
$$;

revoke all on function private.enforce_program_status_transition() from public;
revoke all on function private.is_program_brand_member(uuid) from public;
revoke all on function private.is_program_creator_member(uuid) from public;
revoke all on function private.has_program_creator_relationship(uuid) from public;
revoke all on function private.is_organization_visible_to_creator(uuid) from public;
grant execute on function private.is_program_brand_member(uuid) to authenticated;
grant execute on function private.is_program_creator_member(uuid) to authenticated;
grant execute on function private.has_program_creator_relationship(uuid) to authenticated;
grant execute on function private.is_organization_visible_to_creator(uuid) to authenticated;

alter table public.programs enable row level security;
alter table public.program_briefs enable row level security;
alter table public.program_applications enable row level security;
alter table public.program_invitations enable row level security;
alter table public.program_memberships enable row level security;

create policy "programs_select_authorized"
on public.programs for select to authenticated
using (
  (select private.is_admin())
  or (select private.is_program_brand_member(id))
  or (status = 'ACTIVE' and visibility = 'PUBLIC')
  or (select private.has_program_creator_relationship(id))
);

create policy "programs_insert_organization_member"
on public.programs for insert to authenticated
with check (
  created_by = (select auth.uid())
  and (select private.is_organization_member(organization_id))
  and status = 'DRAFT'
);

create policy "programs_update_organization_member"
on public.programs for update to authenticated
using ((select private.is_admin()) or (select private.is_program_brand_member(id)))
with check ((select private.is_admin()) or (select private.is_organization_member(organization_id)));

create policy "program_briefs_select_authorized"
on public.program_briefs for select to authenticated
using (
  (select private.is_admin())
  or (select private.is_program_brand_member(program_id))
  or (select private.is_program_creator_member(program_id))
);

create policy "program_briefs_insert_brand"
on public.program_briefs for insert to authenticated
with check (
  (select private.is_program_brand_member(program_id))
  and exists (select 1 from public.programs p where p.id = program_id and p.status in ('DRAFT', 'ACTIVE'))
);

create policy "program_briefs_update_brand"
on public.program_briefs for update to authenticated
using ((select private.is_admin()) or (select private.is_program_brand_member(program_id)))
with check (
  (select private.is_admin())
  or (
    (select private.is_program_brand_member(program_id))
    and exists (select 1 from public.programs p where p.id = program_id and p.status in ('DRAFT', 'ACTIVE'))
  )
);

create policy "program_applications_select_authorized"
on public.program_applications for select to authenticated
using (
  creator_id = (select auth.uid())
  or (select private.is_admin())
  or (select private.is_program_brand_member(program_id))
);

create policy "program_invitations_select_authorized"
on public.program_invitations for select to authenticated
using (
  creator_id = (select auth.uid())
  or (select private.is_admin())
  or (select private.is_program_brand_member(program_id))
);

create policy "program_memberships_select_authorized"
on public.program_memberships for select to authenticated
using (
  creator_id = (select auth.uid())
  or (select private.is_admin())
  or (select private.is_program_brand_member(program_id))
);

create policy "organizations_select_visible_program"
on public.organizations for select to authenticated
using ((select private.is_organization_visible_to_creator(id)));

revoke all on public.programs, public.program_briefs, public.program_applications,
  public.program_invitations, public.program_memberships from anon, authenticated;
grant select on public.programs, public.program_briefs, public.program_applications,
  public.program_invitations, public.program_memberships to authenticated;
grant insert (organization_id, name, description, cover_image_url, visibility,
  applications_enabled, start_date, end_date, compensation_type, fixed_amount,
  revenue_share_percentage, created_by) on public.programs to authenticated;
grant update (name, description, cover_image_url, status, visibility,
  applications_enabled, start_date, end_date, compensation_type, fixed_amount,
  revenue_share_percentage) on public.programs to authenticated;
grant insert (program_id, title, description, requirements, dos, donts)
  on public.program_briefs to authenticated;
grant update (title, description, requirements, dos, donts)
  on public.program_briefs to authenticated;

create or replace function public.apply_to_program(p_program_id uuid, p_message text default null)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
  application_id uuid;
begin
  if current_user_id is null or not exists (
    select 1 from public.profiles p where p.id = current_user_id and p.user_type = 'CREATOR'
  ) then
    raise exception 'not_authorized' using errcode = '42501';
  end if;
  if not exists (
    select 1 from public.programs p
    where p.id = p_program_id and p.status = 'ACTIVE' and p.visibility = 'PUBLIC' and p.applications_enabled
  ) then
    raise exception 'program_not_accepting_applications' using errcode = '22023';
  end if;
  if exists (
    select 1 from public.program_memberships pm
    where pm.program_id = p_program_id and pm.creator_id = current_user_id and pm.status = 'ACTIVE'
  ) then
    raise exception 'already_program_member' using errcode = '23505';
  end if;
  if exists (
    select 1 from public.program_applications pa
    where pa.program_id = p_program_id and pa.creator_id = current_user_id and pa.status = 'PENDING'
  ) then
    raise exception 'pending_application_exists' using errcode = '23505';
  end if;
  insert into public.program_applications (program_id, creator_id, message)
  values (p_program_id, current_user_id, nullif(trim(p_message), ''))
  returning id into application_id;
  return application_id;
end;
$$;

create or replace function public.withdraw_program_application(p_application_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.program_applications
  set status = 'WITHDRAWN'
  where id = p_application_id and creator_id = (select auth.uid()) and status = 'PENDING';
  if not found then raise exception 'application_not_withdrawable' using errcode = '42501'; end if;
end;
$$;

create or replace function public.review_program_application(
  p_application_id uuid,
  p_decision public.program_application_status
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
  application_record public.program_applications%rowtype;
  membership_id uuid;
begin
  select * into application_record from public.program_applications
  where id = p_application_id for update;
  if application_record.id is null
    or not ((select private.is_admin()) or (select private.is_program_brand_member(application_record.program_id))) then
    raise exception 'not_authorized' using errcode = '42501';
  end if;
  if p_decision not in ('ACCEPTED', 'REJECTED') then
    raise exception 'invalid_application_decision' using errcode = '22023';
  end if;
  if application_record.status = 'ACCEPTED' and p_decision = 'ACCEPTED' then
    select pm.id into membership_id from public.program_memberships pm
    where pm.program_id = application_record.program_id and pm.creator_id = application_record.creator_id;
    return membership_id;
  end if;
  if application_record.status <> 'PENDING' then
    raise exception 'application_already_resolved' using errcode = '22023';
  end if;
  if p_decision = 'ACCEPTED' and not exists (
    select 1 from public.programs p
    where p.id = application_record.program_id and p.status in ('ACTIVE', 'PAUSED')
  ) then
    raise exception 'program_not_accepting_members' using errcode = '22023';
  end if;

  update public.program_applications
  set status = p_decision, reviewed_by = current_user_id, reviewed_at = now()
  where id = application_record.id;

  if p_decision = 'ACCEPTED' then
    insert into public.program_memberships (program_id, creator_id, source)
    values (application_record.program_id, application_record.creator_id, 'APPLICATION')
    on conflict (program_id, creator_id) do update
      set source = 'APPLICATION', status = 'ACTIVE', joined_at = now()
    returning id into membership_id;
    update public.program_invitations
    set status = 'CANCELLED', responded_at = now()
    where program_id = application_record.program_id
      and creator_id = application_record.creator_id
      and status = 'PENDING';
  end if;
  return membership_id;
end;
$$;

create or replace function public.invite_creator_to_program(p_program_id uuid, p_creator_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  invitation_id uuid;
begin
  if not ((select private.is_admin()) or (select private.is_program_brand_member(p_program_id))) then
    raise exception 'not_authorized' using errcode = '42501';
  end if;
  if not exists (
    select 1 from public.programs p where p.id = p_program_id and p.status in ('DRAFT', 'ACTIVE', 'PAUSED')
  ) then
    raise exception 'program_not_invitable' using errcode = '22023';
  end if;
  if not exists (
    select 1 from public.profiles p where p.id = p_creator_id and p.user_type = 'CREATOR'
  ) then
    raise exception 'creator_not_found' using errcode = '22023';
  end if;
  if exists (
    select 1 from public.program_memberships pm
    where pm.program_id = p_program_id and pm.creator_id = p_creator_id and pm.status = 'ACTIVE'
  ) then
    raise exception 'already_program_member' using errcode = '23505';
  end if;
  if exists (
    select 1 from public.program_invitations pi
    where pi.program_id = p_program_id and pi.creator_id = p_creator_id and pi.status = 'PENDING'
  ) then
    raise exception 'pending_invitation_exists' using errcode = '23505';
  end if;
  insert into public.program_invitations (program_id, creator_id, invited_by)
  values (p_program_id, p_creator_id, (select auth.uid()))
  returning id into invitation_id;
  return invitation_id;
end;
$$;

create or replace function public.cancel_program_invitation(p_invitation_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_program_id uuid;
begin
  select pi.program_id into target_program_id from public.program_invitations pi
  where pi.id = p_invitation_id for update;
  if target_program_id is null
    or not ((select private.is_admin()) or (select private.is_program_brand_member(target_program_id))) then
    raise exception 'not_authorized' using errcode = '42501';
  end if;
  update public.program_invitations set status = 'CANCELLED', responded_at = now()
  where id = p_invitation_id and status = 'PENDING';
  if not found then raise exception 'invitation_not_cancellable' using errcode = '22023'; end if;
end;
$$;

create or replace function public.respond_to_program_invitation(
  p_invitation_id uuid,
  p_response public.program_invitation_status
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  invitation_record public.program_invitations%rowtype;
  membership_id uuid;
begin
  select * into invitation_record from public.program_invitations
  where id = p_invitation_id for update;
  if invitation_record.id is null or invitation_record.creator_id <> (select auth.uid()) then
    raise exception 'not_authorized' using errcode = '42501';
  end if;
  if p_response not in ('ACCEPTED', 'DECLINED') then
    raise exception 'invalid_invitation_response' using errcode = '22023';
  end if;
  if invitation_record.status = 'ACCEPTED' and p_response = 'ACCEPTED' then
    select pm.id into membership_id from public.program_memberships pm
    where pm.program_id = invitation_record.program_id and pm.creator_id = invitation_record.creator_id;
    return membership_id;
  end if;
  if invitation_record.status <> 'PENDING' then
    raise exception 'invitation_already_resolved' using errcode = '22023';
  end if;
  if p_response = 'ACCEPTED' and not exists (
    select 1 from public.programs p
    where p.id = invitation_record.program_id and p.status in ('DRAFT', 'ACTIVE', 'PAUSED')
  ) then
    raise exception 'program_not_accepting_members' using errcode = '22023';
  end if;
  if invitation_record.expires_at is not null and invitation_record.expires_at <= now() then
    update public.program_invitations set status = 'EXPIRED', responded_at = now()
    where id = invitation_record.id;
    return null;
  end if;

  update public.program_invitations
  set status = p_response, responded_at = now()
  where id = invitation_record.id;

  if p_response = 'ACCEPTED' then
    insert into public.program_memberships (program_id, creator_id, source)
    values (invitation_record.program_id, invitation_record.creator_id, 'INVITATION')
    on conflict (program_id, creator_id) do update
      set source = 'INVITATION', status = 'ACTIVE', joined_at = now()
    returning id into membership_id;
    update public.program_applications
    set status = 'WITHDRAWN'
    where program_id = invitation_record.program_id
      and creator_id = invitation_record.creator_id
      and status = 'PENDING';
  end if;
  return membership_id;
end;
$$;

create or replace function public.get_creator_summaries(p_creator_ids uuid[])
returns table (creator_id uuid, public_name text, first_name text, last_name text)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if cardinality(p_creator_ids) > 100 then
    raise exception 'too_many_creator_ids' using errcode = '22023';
  end if;
  if not exists (
    select 1
    from public.profiles p
    join public.organization_members om on om.user_id = p.id
    where p.id = (select auth.uid()) and p.user_type = 'BRAND'
  ) then
    raise exception 'not_authorized' using errcode = '42501';
  end if;
  return query
    select cp.user_id, cp.public_name, p.first_name, p.last_name
    from public.creator_profiles cp
    join public.profiles p on p.id = cp.user_id
    where cp.user_id = any(p_creator_ids)
    order by cp.public_name, cp.user_id;
end;
$$;

create or replace function public.search_creators(
  p_query text default '',
  p_limit integer default 20,
  p_offset integer default 0
)
returns table (creator_id uuid, public_name text, first_name text, last_name text)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1
    from public.profiles p
    join public.organization_members om on om.user_id = p.id
    where p.id = (select auth.uid()) and p.user_type = 'BRAND'
  ) then
    raise exception 'not_authorized' using errcode = '42501';
  end if;
  return query
    select cp.user_id, cp.public_name, p.first_name, p.last_name
    from public.creator_profiles cp
    join public.profiles p on p.id = cp.user_id
    where trim(p_query) = ''
      or cp.public_name ilike '%' || trim(p_query) || '%'
      or coalesce(p.first_name, '') ilike '%' || trim(p_query) || '%'
      or coalesce(p.last_name, '') ilike '%' || trim(p_query) || '%'
    order by cp.public_name, cp.user_id
    limit greatest(1, least(p_limit, 50))
    offset greatest(0, p_offset);
end;
$$;

revoke all on function public.apply_to_program(uuid, text) from public, anon;
revoke all on function public.withdraw_program_application(uuid) from public, anon;
revoke all on function public.review_program_application(uuid, public.program_application_status) from public, anon;
revoke all on function public.invite_creator_to_program(uuid, uuid) from public, anon;
revoke all on function public.cancel_program_invitation(uuid) from public, anon;
revoke all on function public.respond_to_program_invitation(uuid, public.program_invitation_status) from public, anon;
revoke all on function public.search_creators(text, integer, integer) from public, anon;
revoke all on function public.get_creator_summaries(uuid[]) from public, anon;
grant execute on function public.apply_to_program(uuid, text) to authenticated;
grant execute on function public.withdraw_program_application(uuid) to authenticated;
grant execute on function public.review_program_application(uuid, public.program_application_status) to authenticated;
grant execute on function public.invite_creator_to_program(uuid, uuid) to authenticated;
grant execute on function public.cancel_program_invitation(uuid) to authenticated;
grant execute on function public.respond_to_program_invitation(uuid, public.program_invitation_status) to authenticated;
grant execute on function public.search_creators(text, integer, integer) to authenticated;
grant execute on function public.get_creator_summaries(uuid[]) to authenticated;

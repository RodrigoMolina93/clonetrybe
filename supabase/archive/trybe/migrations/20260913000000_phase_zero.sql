create type public.user_type as enum ('ADMIN', 'BRAND', 'CREATOR');
create type public.organization_role as enum ('OWNER', 'MEMBER');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text check (first_name is null or char_length(first_name) between 2 and 80),
  last_name text check (last_name is null or char_length(last_name) between 2 and 80),
  avatar_url text,
  user_type public.user_type not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 120),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  logo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organization_members (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.organization_role not null default 'MEMBER',
  created_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);

create index organization_members_user_id_idx on public.organization_members(user_id);

create table public.creator_profiles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  public_name text not null check (char_length(public_name) between 2 and 80),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create schema private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to authenticated;

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and user_type = 'ADMIN'
  );
$$;

create or replace function private.is_organization_member(target_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.organization_members
    where organization_id = target_organization_id and user_id = (select auth.uid())
  );
$$;

revoke all on function private.is_admin() from public;
revoke all on function private.is_organization_member(uuid) from public;
grant execute on function private.is_admin() to authenticated;
grant execute on function private.is_organization_member(uuid) to authenticated;

alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.creator_profiles enable row level security;

create policy "profiles_select_own_or_admin"
on public.profiles for select to authenticated
using (id = (select auth.uid()) or (select private.is_admin()));

create policy "profiles_update_own_or_admin"
on public.profiles for update to authenticated
using (id = (select auth.uid()) or (select private.is_admin()))
with check (id = (select auth.uid()) or (select private.is_admin()));

create policy "organizations_select_member_or_admin"
on public.organizations for select to authenticated
using ((select private.is_organization_member(id)) or (select private.is_admin()));

create policy "organization_members_select_same_org_or_admin"
on public.organization_members for select to authenticated
using ((select private.is_organization_member(organization_id)) or (select private.is_admin()));

create policy "creator_profiles_select_own_or_admin"
on public.creator_profiles for select to authenticated
using (user_id = (select auth.uid()) or (select private.is_admin()));

create policy "creator_profiles_update_own_or_admin"
on public.creator_profiles for update to authenticated
using (user_id = (select auth.uid()) or (select private.is_admin()))
with check (user_id = (select auth.uid()) or (select private.is_admin()));

revoke all on public.profiles, public.organizations, public.organization_members, public.creator_profiles from anon, authenticated;
grant select on public.profiles, public.organizations, public.organization_members, public.creator_profiles to authenticated;
grant update (first_name, last_name, avatar_url, updated_at) on public.profiles to authenticated;
grant update (public_name, updated_at) on public.creator_profiles to authenticated;

create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at before update on public.profiles
for each row execute function private.set_updated_at();
create trigger organizations_set_updated_at before update on public.organizations
for each row execute function private.set_updated_at();
create trigger creator_profiles_set_updated_at before update on public.creator_profiles
for each row execute function private.set_updated_at();

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  selected_type public.user_type;
begin
  selected_type := case
    when new.raw_user_meta_data ->> 'user_type' = 'BRAND' then 'BRAND'::public.user_type
    else 'CREATOR'::public.user_type
  end;
  insert into public.profiles (id, user_type) values (new.id, selected_type);
  return new;
end;
$$;

create trigger auth_user_created
after insert on auth.users
for each row execute function private.handle_new_user();

create or replace function public.complete_brand_onboarding(brand_name text, first_name text, last_name text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
  organization_id uuid;
  slug_base text;
begin
  if current_user_id is null or not exists (
    select 1 from public.profiles where id = current_user_id and user_type = 'BRAND'
  ) then
    raise exception 'not_authorized' using errcode = '42501';
  end if;

  if char_length(trim($1)) not between 2 and 120
    or char_length(trim($2)) not between 2 and 80
    or char_length(trim($3)) not between 2 and 80 then
    raise exception 'invalid_input' using errcode = '22023';
  end if;

  select om.organization_id into organization_id
  from public.organization_members om where om.user_id = current_user_id limit 1;
  if organization_id is not null then return organization_id; end if;

  update public.profiles set first_name = trim($2), last_name = trim($3) where id = current_user_id;
  slug_base := trim(both '-' from regexp_replace(lower(trim($1)), '[^a-z0-9]+', '-', 'g'));
  if slug_base = '' then slug_base := 'marca'; end if;
  insert into public.organizations (name, slug)
  values (trim($1), slug_base || '-' || left(replace(gen_random_uuid()::text, '-', ''), 8))
  returning id into organization_id;
  insert into public.organization_members (organization_id, user_id, role)
  values (organization_id, current_user_id, 'OWNER');
  return organization_id;
end;
$$;

create or replace function public.complete_creator_onboarding(first_name text, last_name text, public_name text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
begin
  if current_user_id is null or not exists (
    select 1 from public.profiles where id = current_user_id and user_type = 'CREATOR'
  ) then
    raise exception 'not_authorized' using errcode = '42501';
  end if;
  if char_length(trim($1)) not between 2 and 80
    or char_length(trim($2)) not between 2 and 80
    or char_length(trim($3)) not between 2 and 80 then
    raise exception 'invalid_input' using errcode = '22023';
  end if;
  update public.profiles set first_name = trim($1), last_name = trim($2) where id = current_user_id;
  insert into public.creator_profiles (user_id, public_name)
  values (current_user_id, trim($3))
  on conflict (user_id) do update set public_name = excluded.public_name;
end;
$$;

revoke all on function public.complete_brand_onboarding(text, text, text) from public, anon;
revoke all on function public.complete_creator_onboarding(text, text, text) from public, anon;
grant execute on function public.complete_brand_onboarding(text, text, text) to authenticated;
grant execute on function public.complete_creator_onboarding(text, text, text) to authenticated;

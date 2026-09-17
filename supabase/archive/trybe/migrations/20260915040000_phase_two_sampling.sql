create type public.sample_request_status as enum (
  'REQUESTED', 'APPROVED', 'REJECTED', 'PREPARING',
  'SHIPPED', 'RECEIVED', 'ISSUE', 'CANCELLED'
);
create type public.sample_issue_type as enum (
  'NOT_RECEIVED', 'WRONG_PRODUCT', 'WRONG_VARIANT', 'DAMAGED', 'OTHER'
);
create type public.sample_issue_status as enum ('OPEN', 'RESOLVED');
create type public.sample_tracking_event_type as enum (
  'REQUEST_CREATED', 'REQUEST_APPROVED', 'REQUEST_REJECTED',
  'PREPARING_STARTED', 'SHIPPED', 'RECEIVED_CONFIRMED',
  'ISSUE_REPORTED', 'ISSUE_RESOLVED', 'REQUEST_CANCELLED'
);

alter table public.programs
  add constraint programs_id_organization_id_unique unique (id, organization_id);

create table public.creator_shipping_addresses (
  creator_id uuid primary key references public.creator_profiles(user_id) on delete cascade,
  recipient_name text not null check (char_length(trim(recipient_name)) between 2 and 160),
  street text not null check (char_length(trim(street)) between 2 and 160),
  street_number text not null check (char_length(trim(street_number)) between 1 and 30),
  apartment text check (apartment is null or char_length(trim(apartment)) between 1 and 40),
  city text not null check (char_length(trim(city)) between 2 and 120),
  province text not null check (char_length(trim(province)) between 2 and 120),
  postal_code text not null check (char_length(trim(postal_code)) between 3 and 12),
  country text not null default 'Argentina' check (country = 'Argentina'),
  phone text check (phone is null or char_length(trim(phone)) between 6 and 40),
  additional_info text check (additional_info is null or char_length(trim(additional_info)) <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.sample_products (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  program_id uuid not null,
  name text not null check (char_length(trim(name)) between 2 and 160),
  description text check (description is null or char_length(trim(description)) between 2 and 3000),
  image_url text check (image_url is null or (char_length(image_url) <= 2048 and image_url ~ '^https://')),
  active boolean not null default true,
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint sample_products_program_organization_fkey
    foreign key (program_id, organization_id)
    references public.programs(id, organization_id) on delete restrict,
  constraint sample_products_id_program_id_unique unique (id, program_id)
);

create index sample_products_program_id_idx on public.sample_products(program_id);
create index sample_products_organization_id_idx on public.sample_products(organization_id);

create table public.sample_product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.sample_products(id) on delete restrict,
  label text not null check (char_length(trim(label)) between 1 and 120),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint sample_product_variants_product_label_unique unique (product_id, label),
  constraint sample_product_variants_id_product_id_unique unique (id, product_id)
);

create index sample_product_variants_product_id_idx on public.sample_product_variants(product_id);

create table public.sample_requests (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.programs(id) on delete restrict,
  product_id uuid not null,
  variant_id uuid,
  creator_id uuid not null references public.creator_profiles(user_id) on delete restrict,
  status public.sample_request_status not null default 'REQUESTED',
  shipping_address_snapshot jsonb not null,
  creator_note text check (creator_note is null or char_length(trim(creator_note)) <= 1000),
  brand_note text check (brand_note is null or char_length(trim(brand_note)) <= 1000),
  carrier_name text check (carrier_name is null or char_length(trim(carrier_name)) <= 120),
  tracking_number text check (tracking_number is null or char_length(trim(tracking_number)) <= 160),
  tracking_url text check (tracking_url is null or (char_length(tracking_url) <= 2048 and tracking_url ~ '^https://')),
  requested_at timestamptz not null default now(),
  approved_at timestamptz,
  rejected_at timestamptz,
  preparing_at timestamptz,
  shipped_at timestamptz,
  received_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint sample_requests_product_program_fkey
    foreign key (product_id, program_id)
    references public.sample_products(id, program_id) on delete restrict,
  constraint sample_requests_variant_product_fkey
    foreign key (variant_id, product_id)
    references public.sample_product_variants(id, product_id) on delete restrict,
  constraint sample_requests_address_object check (jsonb_typeof(shipping_address_snapshot) = 'object'),
  constraint sample_requests_id_creator_id_unique unique (id, creator_id)
);

create index sample_requests_program_id_idx on public.sample_requests(program_id);
create index sample_requests_creator_id_idx on public.sample_requests(creator_id);
create index sample_requests_status_idx on public.sample_requests(program_id, status);
create unique index sample_requests_one_active_without_variant_idx
  on public.sample_requests(creator_id, product_id)
  where variant_id is null and status in ('REQUESTED', 'APPROVED', 'PREPARING', 'SHIPPED', 'ISSUE');
create unique index sample_requests_one_active_with_variant_idx
  on public.sample_requests(creator_id, product_id, variant_id)
  where variant_id is not null and status in ('REQUESTED', 'APPROVED', 'PREPARING', 'SHIPPED', 'ISSUE');

create table public.sample_issues (
  id uuid primary key default gen_random_uuid(),
  sample_request_id uuid not null,
  creator_id uuid not null references public.creator_profiles(user_id) on delete restrict,
  issue_type public.sample_issue_type not null,
  description text not null check (char_length(trim(description)) between 2 and 2000),
  status public.sample_issue_status not null default 'OPEN',
  brand_note text check (brand_note is null or char_length(trim(brand_note)) <= 1000),
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  constraint sample_issues_resolution_consistent check (
    (status = 'OPEN' and resolved_at is null)
    or (status = 'RESOLVED' and resolved_at is not null)
  ),
  constraint sample_issues_request_creator_fkey
    foreign key (sample_request_id, creator_id)
    references public.sample_requests(id, creator_id) on delete restrict
);

create unique index sample_issues_one_open_per_request_idx
  on public.sample_issues(sample_request_id) where status = 'OPEN';
create index sample_issues_creator_id_idx on public.sample_issues(creator_id);

create table public.sample_tracking_events (
  id uuid primary key default gen_random_uuid(),
  sample_request_id uuid not null references public.sample_requests(id) on delete restrict,
  event_type public.sample_tracking_event_type not null,
  actor_user_id uuid not null references public.profiles(id) on delete restrict,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index sample_tracking_events_request_id_idx
  on public.sample_tracking_events(sample_request_id, created_at);

create trigger creator_shipping_addresses_set_updated_at
before update on public.creator_shipping_addresses
for each row execute function private.set_updated_at();
create trigger sample_products_set_updated_at
before update on public.sample_products
for each row execute function private.set_updated_at();
create trigger sample_product_variants_set_updated_at
before update on public.sample_product_variants
for each row execute function private.set_updated_at();
create trigger sample_requests_set_updated_at
before update on public.sample_requests
for each row execute function private.set_updated_at();

alter table public.creator_shipping_addresses enable row level security;
alter table public.sample_products enable row level security;
alter table public.sample_product_variants enable row level security;
alter table public.sample_requests enable row level security;
alter table public.sample_issues enable row level security;
alter table public.sample_tracking_events enable row level security;

create policy "creator_shipping_addresses_select_own_or_admin"
on public.creator_shipping_addresses for select to authenticated
using (creator_id = (select auth.uid()) or (select private.is_admin()));

create policy "creator_shipping_addresses_insert_own"
on public.creator_shipping_addresses for insert to authenticated
with check (
  creator_id = (select auth.uid())
  and exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.user_type = 'CREATOR')
);

create policy "creator_shipping_addresses_update_own"
on public.creator_shipping_addresses for update to authenticated
using (creator_id = (select auth.uid()) or (select private.is_admin()))
with check (creator_id = (select auth.uid()) or (select private.is_admin()));

create policy "sample_products_select_authorized"
on public.sample_products for select to authenticated
using (
  (select private.is_admin())
  or (select private.is_program_brand_member(sample_products.program_id))
  or (
    (select private.is_program_creator_member(sample_products.program_id))
    and (
      active
      or exists (
        select 1 from public.sample_requests sr
        where sr.product_id = sample_products.id and sr.creator_id = (select auth.uid())
      )
    )
  )
  or exists (
    select 1 from public.sample_requests sr
    where sr.product_id = sample_products.id and sr.creator_id = (select auth.uid())
  )
);

create policy "sample_products_insert_brand"
on public.sample_products for insert to authenticated
with check (
  created_by = (select auth.uid())
  and (select private.is_program_brand_member(sample_products.program_id))
  and exists (
    select 1 from public.programs p
    where p.id = sample_products.program_id
      and p.organization_id = sample_products.organization_id
  )
);

create policy "sample_products_update_brand"
on public.sample_products for update to authenticated
using ((select private.is_admin()) or (select private.is_program_brand_member(sample_products.program_id)))
with check (
  (select private.is_admin())
  or (
    (select private.is_program_brand_member(sample_products.program_id))
    and exists (
      select 1 from public.programs p
      where p.id = sample_products.program_id
        and p.organization_id = sample_products.organization_id
    )
  )
);

create policy "sample_product_variants_select_authorized"
on public.sample_product_variants for select to authenticated
using (exists (
  select 1 from public.sample_products sp
  where sp.id = sample_product_variants.product_id
    and (
      (select private.is_admin())
      or (select private.is_program_brand_member(sp.program_id))
      or (select private.is_program_creator_member(sp.program_id))
      or exists (
        select 1 from public.sample_requests sr
        where sr.variant_id = sample_product_variants.id
          and sr.creator_id = (select auth.uid())
      )
    )
));

create policy "sample_product_variants_insert_brand"
on public.sample_product_variants for insert to authenticated
with check (exists (
  select 1 from public.sample_products sp
  where sp.id = sample_product_variants.product_id
    and (select private.is_program_brand_member(sp.program_id))
));

create policy "sample_product_variants_update_brand"
on public.sample_product_variants for update to authenticated
using (exists (
  select 1 from public.sample_products sp
  where sp.id = sample_product_variants.product_id
    and ((select private.is_admin()) or (select private.is_program_brand_member(sp.program_id)))
))
with check (exists (
  select 1 from public.sample_products sp
  where sp.id = sample_product_variants.product_id
    and ((select private.is_admin()) or (select private.is_program_brand_member(sp.program_id)))
));

create policy "sample_requests_select_authorized"
on public.sample_requests for select to authenticated
using (
  creator_id = (select auth.uid())
  or (select private.is_admin())
  or (select private.is_program_brand_member(program_id))
);

create policy "sample_issues_select_authorized"
on public.sample_issues for select to authenticated
using (
  creator_id = (select auth.uid())
  or (select private.is_admin())
  or exists (
    select 1 from public.sample_requests sr
    where sr.id = sample_issues.sample_request_id
      and (select private.is_program_brand_member(sr.program_id))
  )
);

create policy "sample_tracking_events_select_authorized"
on public.sample_tracking_events for select to authenticated
using (exists (
  select 1 from public.sample_requests sr
  where sr.id = sample_tracking_events.sample_request_id
    and (
      sr.creator_id = (select auth.uid())
      or (select private.is_admin())
      or (select private.is_program_brand_member(sr.program_id))
    )
));

revoke all on public.creator_shipping_addresses, public.sample_products,
  public.sample_product_variants, public.sample_requests, public.sample_issues,
  public.sample_tracking_events from anon, authenticated;

grant select on public.creator_shipping_addresses to authenticated;
grant insert (
  creator_id, recipient_name, street, street_number, apartment, city,
  province, postal_code, country, phone, additional_info
) on public.creator_shipping_addresses to authenticated;
grant update (
  recipient_name, street, street_number, apartment, city,
  province, postal_code, country, phone, additional_info
) on public.creator_shipping_addresses to authenticated;
grant select, insert (id, organization_id, program_id, name, description, image_url, active, created_by),
  update (name, description, image_url, active) on public.sample_products to authenticated;
grant select, insert (id, product_id, label, active), update (label, active)
  on public.sample_product_variants to authenticated;
grant select (
  id, program_id, product_id, variant_id, creator_id, status,
  creator_note, brand_note, carrier_name, tracking_number, tracking_url,
  requested_at, approved_at, rejected_at, preparing_at, shipped_at,
  received_at, cancelled_at, created_at, updated_at
) on public.sample_requests to authenticated;
grant select on public.sample_issues, public.sample_tracking_events to authenticated;

create or replace function public.request_sample(
  p_product_id uuid,
  p_variant_id uuid default null,
  p_creator_note text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
  target_product public.sample_products%rowtype;
  address_record public.creator_shipping_addresses%rowtype;
  request_id uuid;
  address_snapshot jsonb;
begin
  if current_user_id is null or not exists (
    select 1 from public.profiles p
    where p.id = current_user_id and p.user_type = 'CREATOR'
  ) then
    raise exception 'not_authorized' using errcode = '42501';
  end if;

  select * into target_product from public.sample_products
  where id = p_product_id for share;
  if target_product.id is null
    or not target_product.active
    or not (select private.is_program_creator_member(target_product.program_id)) then
    raise exception 'sample_product_not_available' using errcode = '22023';
  end if;

  if exists (select 1 from public.sample_product_variants v where v.product_id = target_product.id) then
    if p_variant_id is null or not exists (
      select 1 from public.sample_product_variants v
      where v.id = p_variant_id and v.product_id = target_product.id and v.active
    ) then
      raise exception 'sample_variant_not_available' using errcode = '22023';
    end if;
  elsif p_variant_id is not null then
    raise exception 'sample_variant_not_available' using errcode = '22023';
  end if;

  select * into address_record from public.creator_shipping_addresses
  where creator_id = current_user_id;
  if address_record.creator_id is null then
    raise exception 'shipping_address_required' using errcode = '22023';
  end if;

  if p_creator_note is not null and char_length(trim(p_creator_note)) > 1000 then
    raise exception 'invalid_sample_note' using errcode = '22023';
  end if;

  address_snapshot := jsonb_build_object(
    'recipient_name', address_record.recipient_name,
    'street', address_record.street,
    'street_number', address_record.street_number,
    'apartment', address_record.apartment,
    'city', address_record.city,
    'province', address_record.province,
    'postal_code', address_record.postal_code,
    'country', address_record.country,
    'phone', address_record.phone,
    'additional_info', address_record.additional_info
  );

  insert into public.sample_requests (
    program_id, product_id, variant_id, creator_id,
    shipping_address_snapshot, creator_note
  ) values (
    target_product.program_id, target_product.id, p_variant_id, current_user_id,
    address_snapshot, nullif(trim(p_creator_note), '')
  ) returning id into request_id;

  insert into public.sample_tracking_events (
    sample_request_id, event_type, actor_user_id
  ) values (request_id, 'REQUEST_CREATED', current_user_id);

  return request_id;
exception
  when unique_violation then
    raise exception 'duplicate_active_sample_request' using errcode = '23505';
end;
$$;

create or replace function public.transition_sample_request(
  p_request_id uuid,
  p_target_status public.sample_request_status,
  p_brand_note text default null,
  p_carrier_name text default null,
  p_tracking_number text default null,
  p_tracking_url text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  request_record public.sample_requests%rowtype;
  transition_event public.sample_tracking_event_type;
begin
  select * into request_record from public.sample_requests
  where id = p_request_id for update;
  if request_record.id is null
    or not ((select private.is_admin()) or (select private.is_program_brand_member(request_record.program_id))) then
    raise exception 'not_authorized' using errcode = '42501';
  end if;

  if p_brand_note is not null and char_length(trim(p_brand_note)) > 1000 then
    raise exception 'invalid_sample_note' using errcode = '22023';
  end if;
  if p_tracking_url is not null and (char_length(p_tracking_url) > 2048 or p_tracking_url !~ '^https://') then
    raise exception 'invalid_tracking_url' using errcode = '22023';
  end if;

  if request_record.status = 'REQUESTED' and p_target_status = 'APPROVED' then
    transition_event := 'REQUEST_APPROVED';
  elsif request_record.status = 'REQUESTED' and p_target_status = 'REJECTED' then
    transition_event := 'REQUEST_REJECTED';
  elsif request_record.status = 'APPROVED' and p_target_status = 'PREPARING' then
    transition_event := 'PREPARING_STARTED';
  elsif request_record.status in ('APPROVED', 'PREPARING') and p_target_status = 'CANCELLED' then
    transition_event := 'REQUEST_CANCELLED';
  elsif request_record.status = 'PREPARING' and p_target_status = 'SHIPPED' then
    transition_event := 'SHIPPED';
  else
    raise exception 'invalid_sample_status_transition' using errcode = '22023';
  end if;

  update public.sample_requests set
    status = p_target_status,
    brand_note = coalesce(nullif(trim(p_brand_note), ''), brand_note),
    carrier_name = case when p_target_status = 'SHIPPED' then nullif(trim(p_carrier_name), '') else carrier_name end,
    tracking_number = case when p_target_status = 'SHIPPED' then nullif(trim(p_tracking_number), '') else tracking_number end,
    tracking_url = case when p_target_status = 'SHIPPED' then nullif(trim(p_tracking_url), '') else tracking_url end,
    approved_at = case when p_target_status = 'APPROVED' then now() else approved_at end,
    rejected_at = case when p_target_status = 'REJECTED' then now() else rejected_at end,
    preparing_at = case when p_target_status = 'PREPARING' then now() else preparing_at end,
    shipped_at = case when p_target_status = 'SHIPPED' then now() else shipped_at end,
    cancelled_at = case when p_target_status = 'CANCELLED' then now() else cancelled_at end
  where id = request_record.id;

  insert into public.sample_tracking_events (
    sample_request_id, event_type, actor_user_id, metadata
  ) values (
    request_record.id, transition_event, (select auth.uid()),
    case when p_target_status = 'SHIPPED' then jsonb_strip_nulls(jsonb_build_object(
      'carrier_name', nullif(trim(p_carrier_name), ''),
      'tracking_number', nullif(trim(p_tracking_number), ''),
      'tracking_url', nullif(trim(p_tracking_url), '')
    )) else null end
  );
end;
$$;

create or replace function public.confirm_sample_received(p_request_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  request_record public.sample_requests%rowtype;
begin
  select * into request_record from public.sample_requests
  where id = p_request_id for update;
  if request_record.id is null or request_record.creator_id <> (select auth.uid()) then
    raise exception 'not_authorized' using errcode = '42501';
  end if;
  if request_record.status <> 'SHIPPED' then
    raise exception 'invalid_sample_status_transition' using errcode = '22023';
  end if;
  update public.sample_requests
  set status = 'RECEIVED', received_at = now()
  where id = request_record.id;
  insert into public.sample_tracking_events (sample_request_id, event_type, actor_user_id)
  values (request_record.id, 'RECEIVED_CONFIRMED', (select auth.uid()));
end;
$$;

create or replace function public.report_sample_issue(
  p_request_id uuid,
  p_issue_type public.sample_issue_type,
  p_description text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  request_record public.sample_requests%rowtype;
  issue_id uuid;
begin
  select * into request_record from public.sample_requests
  where id = p_request_id for update;
  if request_record.id is null or request_record.creator_id <> (select auth.uid()) then
    raise exception 'not_authorized' using errcode = '42501';
  end if;
  if request_record.status not in ('SHIPPED', 'RECEIVED') then
    raise exception 'sample_issue_not_allowed' using errcode = '22023';
  end if;
  if p_description is null or char_length(trim(p_description)) not between 2 and 2000 then
    raise exception 'invalid_issue_description' using errcode = '22023';
  end if;

  insert into public.sample_issues (sample_request_id, creator_id, issue_type, description)
  values (request_record.id, (select auth.uid()), p_issue_type, trim(p_description))
  returning id into issue_id;
  update public.sample_requests set status = 'ISSUE' where id = request_record.id;
  insert into public.sample_tracking_events (
    sample_request_id, event_type, actor_user_id, metadata
  ) values (
    request_record.id, 'ISSUE_REPORTED', (select auth.uid()),
    jsonb_build_object('issue_id', issue_id, 'issue_type', p_issue_type)
  );
  return issue_id;
exception
  when unique_violation then
    raise exception 'open_sample_issue_exists' using errcode = '23505';
end;
$$;

create or replace function public.resolve_sample_issue(
  p_issue_id uuid,
  p_resolution_status public.sample_request_status,
  p_brand_note text default null,
  p_carrier_name text default null,
  p_tracking_number text default null,
  p_tracking_url text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  issue_record public.sample_issues%rowtype;
  request_record public.sample_requests%rowtype;
begin
  select * into issue_record from public.sample_issues
  where id = p_issue_id for update;
  if issue_record.id is null then
    raise exception 'sample_issue_not_found' using errcode = '22023';
  end if;
  select * into request_record from public.sample_requests
  where id = issue_record.sample_request_id for update;
  if not ((select private.is_admin()) or (select private.is_program_brand_member(request_record.program_id))) then
    raise exception 'not_authorized' using errcode = '42501';
  end if;
  if issue_record.status <> 'OPEN' or request_record.status <> 'ISSUE'
    or p_resolution_status not in ('SHIPPED', 'CANCELLED') then
    raise exception 'sample_issue_not_resolvable' using errcode = '22023';
  end if;
  if p_brand_note is not null and char_length(trim(p_brand_note)) > 1000 then
    raise exception 'invalid_sample_note' using errcode = '22023';
  end if;
  if p_tracking_url is not null and (char_length(p_tracking_url) > 2048 or p_tracking_url !~ '^https://') then
    raise exception 'invalid_tracking_url' using errcode = '22023';
  end if;

  update public.sample_issues
  set status = 'RESOLVED', brand_note = nullif(trim(p_brand_note), ''), resolved_at = now()
  where id = issue_record.id;
  update public.sample_requests set
    status = p_resolution_status,
    brand_note = coalesce(nullif(trim(p_brand_note), ''), brand_note),
    carrier_name = case when p_resolution_status = 'SHIPPED' then nullif(trim(p_carrier_name), '') else carrier_name end,
    tracking_number = case when p_resolution_status = 'SHIPPED' then nullif(trim(p_tracking_number), '') else tracking_number end,
    tracking_url = case when p_resolution_status = 'SHIPPED' then nullif(trim(p_tracking_url), '') else tracking_url end,
    shipped_at = case when p_resolution_status = 'SHIPPED' then now() else shipped_at end,
    received_at = case when p_resolution_status = 'SHIPPED' then null else received_at end,
    cancelled_at = case when p_resolution_status = 'CANCELLED' then now() else cancelled_at end
  where id = request_record.id;
  insert into public.sample_tracking_events (
    sample_request_id, event_type, actor_user_id, metadata
  ) values (
    request_record.id, 'ISSUE_RESOLVED', (select auth.uid()),
    jsonb_strip_nulls(jsonb_build_object(
      'issue_id', issue_record.id,
      'resolution_status', p_resolution_status,
      'carrier_name', nullif(trim(p_carrier_name), ''),
      'tracking_number', nullif(trim(p_tracking_number), ''),
      'tracking_url', nullif(trim(p_tracking_url), '')
    ))
  );
  insert into public.sample_tracking_events (
    sample_request_id, event_type, actor_user_id, metadata
  ) values (
    request_record.id,
    case when p_resolution_status = 'SHIPPED'
      then 'SHIPPED'::public.sample_tracking_event_type
      else 'REQUEST_CANCELLED'::public.sample_tracking_event_type
    end,
    (select auth.uid()),
    case when p_resolution_status = 'SHIPPED' then jsonb_strip_nulls(jsonb_build_object(
      'carrier_name', nullif(trim(p_carrier_name), ''),
      'tracking_number', nullif(trim(p_tracking_number), ''),
      'tracking_url', nullif(trim(p_tracking_url), '')
    )) else null end
  );
end;
$$;

create or replace function public.get_sample_request_shipping_address(p_request_id uuid)
returns table (
  recipient_name text,
  street text,
  street_number text,
  apartment text,
  city text,
  province text,
  postal_code text,
  country text,
  phone text,
  additional_info text
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  request_record public.sample_requests%rowtype;
begin
  select * into request_record from public.sample_requests where id = p_request_id;
  if request_record.id is null
    or request_record.status not in ('REQUESTED', 'APPROVED', 'PREPARING', 'SHIPPED', 'ISSUE')
    or not ((select private.is_admin()) or (select private.is_program_brand_member(request_record.program_id))) then
    raise exception 'not_authorized' using errcode = '42501';
  end if;
  return query select
    request_record.shipping_address_snapshot ->> 'recipient_name',
    request_record.shipping_address_snapshot ->> 'street',
    request_record.shipping_address_snapshot ->> 'street_number',
    request_record.shipping_address_snapshot ->> 'apartment',
    request_record.shipping_address_snapshot ->> 'city',
    request_record.shipping_address_snapshot ->> 'province',
    request_record.shipping_address_snapshot ->> 'postal_code',
    request_record.shipping_address_snapshot ->> 'country',
    request_record.shipping_address_snapshot ->> 'phone',
    request_record.shipping_address_snapshot ->> 'additional_info';
end;
$$;

revoke all on function public.request_sample(uuid, uuid, text) from public, anon;
revoke all on function public.transition_sample_request(uuid, public.sample_request_status, text, text, text, text) from public, anon;
revoke all on function public.confirm_sample_received(uuid) from public, anon;
revoke all on function public.report_sample_issue(uuid, public.sample_issue_type, text) from public, anon;
revoke all on function public.resolve_sample_issue(uuid, public.sample_request_status, text, text, text, text) from public, anon;
revoke all on function public.get_sample_request_shipping_address(uuid) from public, anon;
grant execute on function public.request_sample(uuid, uuid, text) to authenticated;
grant execute on function public.transition_sample_request(uuid, public.sample_request_status, text, text, text, text) to authenticated;
grant execute on function public.confirm_sample_received(uuid) to authenticated;
grant execute on function public.report_sample_issue(uuid, public.sample_issue_type, text) to authenticated;
grant execute on function public.resolve_sample_issue(uuid, public.sample_request_status, text, text, text, text) to authenticated;
grant execute on function public.get_sample_request_shipping_address(uuid) to authenticated;

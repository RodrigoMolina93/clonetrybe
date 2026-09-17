begin;
create extension if not exists pgtap with schema extensions;
select plan(12);

insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values
  ('00000000-0000-0000-0000-000000000000', '10000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'owner-a@test.local', '', now(), '{}', '{}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '10000000-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'member-a@test.local', '', now(), '{}', '{}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '10000000-0000-0000-0000-000000000003', 'authenticated', 'authenticated', 'owner-b@test.local', '', now(), '{}', '{}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '10000000-0000-0000-0000-000000000004', 'authenticated', 'authenticated', 'new-owner@test.local', '', now(), '{}', '{}', now(), now());

insert into public.organizations (id, name, slug)
values
  ('20000000-0000-0000-0000-000000000001', 'Organization A', 'organization-a'),
  ('20000000-0000-0000-0000-000000000002', 'Organization B', 'organization-b');

insert into public.organization_members (organization_id, user_id, role)
values
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'OWNER'),
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 'MEMBER'),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000003', 'OWNER');

set local role anon;
select throws_ok(
  'select count(*) from public.profiles',
  '42501',
  'permission denied for table profiles',
  'anonymous users cannot read profiles'
);

set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000001', true);
select results_eq('select count(*) from public.profiles', array[1::bigint], 'a user reads only their profile');
select results_eq('select count(*) from public.organizations', array[1::bigint], 'an owner reads only their organization');
select results_eq('select count(*) from public.organization_members', array[2::bigint], 'an owner reads memberships in their organization');
select lives_ok($$ update public.organizations set name = 'Organization A Updated' where id = '20000000-0000-0000-0000-000000000001' $$, 'an owner can update their organization');
select results_eq($$ select name from public.organizations where id = '20000000-0000-0000-0000-000000000001' $$, array['Organization A Updated'::text], 'the owner update is persisted');

select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000002', true);
select results_eq($$ update public.organizations set name = 'Forged' where id = '20000000-0000-0000-0000-000000000001' returning name $$, array[]::text[], 'a member cannot update organization settings');
select throws_ok(
  $$ insert into public.organization_members (organization_id, user_id, role) values ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000004', 'OWNER') $$,
  '42501',
  'permission denied for table organization_members',
  'a member cannot forge memberships or roles'
);

select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000003', true);
select results_eq($$ select count(*) from public.organizations where id = '20000000-0000-0000-0000-000000000001' $$, array[0::bigint], 'another tenant cannot read organization A');
select results_eq($$ select count(*) from public.organization_members where organization_id = '20000000-0000-0000-0000-000000000001' $$, array[0::bigint], 'another tenant cannot read organization A memberships');

select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000004', true);
select lives_ok($$ select public.complete_organization_onboarding('New Organization', 'Nora', 'Owner') $$, 'onboarding succeeds for an authenticated user');
select results_eq($$ select role::text from public.organization_members where user_id = '10000000-0000-0000-0000-000000000004' $$, array['OWNER'::text], 'onboarding creates an owner membership');

select * from finish();
rollback;

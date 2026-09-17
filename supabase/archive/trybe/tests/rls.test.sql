begin;
create extension if not exists pgtap with schema extensions;
select plan(10);

insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values
  ('00000000-0000-0000-0000-000000000000', '10000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'brand-b@test.local', '', now(), '{}', '{"user_type":"BRAND"}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '10000000-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'new-brand@test.local', '', now(), '{}', '{"user_type":"BRAND"}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '10000000-0000-0000-0000-000000000003', 'authenticated', 'authenticated', 'new-creator@test.local', '', now(), '{}', '{"user_type":"CREATOR"}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '10000000-0000-0000-0000-000000000004', 'authenticated', 'authenticated', 'creator-b@test.local', '', now(), '{}', '{"user_type":"CREATOR"}', now(), now());

insert into public.organizations (id, name, slug)
values ('10000000-0000-0000-0000-000000000010', 'Marca B', 'marca-b');
insert into public.organization_members (organization_id, user_id, role)
values ('10000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000001', 'OWNER');
insert into public.creator_profiles (user_id, public_name)
values ('10000000-0000-0000-0000-000000000004', 'Creator B');

set local role anon;
select throws_ok(
  'select count(*) from public.profiles',
  '42501',
  'permission denied for table profiles',
  'Unauthenticated users cannot read profiles'
);

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000003', true);
select results_eq('select count(*) from public.profiles', array[1::bigint], 'Creator sees only their own profile');
select results_eq('select count(*) from public.creator_profiles where user_id = ''00000000-0000-0000-0000-000000000003''', array[1::bigint], 'Creator sees their own creator profile');
select results_eq('select count(*) from public.creator_profiles where user_id = ''10000000-0000-0000-0000-000000000004''', array[0::bigint], 'Creator cannot see another creator profile');

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000002', true);
select results_eq('select count(*) from public.organizations where id = ''00000000-0000-0000-0000-000000000010''', array[1::bigint], 'Brand sees its organization');
select results_eq('select count(*) from public.organizations where id = ''10000000-0000-0000-0000-000000000010''', array[0::bigint], 'Brand cannot see another organization');

select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000002', true);
select lives_ok($$ select public.complete_brand_onboarding('Marca Nueva', 'Nueva', 'Marca') $$, 'Brand onboarding succeeds');
select results_eq($$ select role::text from public.organization_members where user_id = '10000000-0000-0000-0000-000000000002' $$, array['OWNER'::text], 'Brand onboarding creates OWNER membership');

select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000003', true);
select lives_ok($$ select public.complete_creator_onboarding('Nuevo', 'Creator', 'Nuevo Crea') $$, 'Creator onboarding succeeds');
select results_eq($$ select count(*) from public.creator_profiles where user_id = '10000000-0000-0000-0000-000000000003' $$, array[1::bigint], 'Creator onboarding creates creator profile');

select * from finish();
rollback;

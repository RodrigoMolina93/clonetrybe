begin;
create extension if not exists pgtap with schema extensions;
select plan(34);

insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values
  ('00000000-0000-0000-0000-000000000000', '30000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'phase2-brand-a@test.local', '', now(), '{}', '{"user_type":"BRAND"}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '30000000-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'phase2-brand-b@test.local', '', now(), '{}', '{"user_type":"BRAND"}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '30000000-0000-0000-0000-000000000003', 'authenticated', 'authenticated', 'phase2-creator-a@test.local', '', now(), '{}', '{"user_type":"CREATOR"}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '30000000-0000-0000-0000-000000000004', 'authenticated', 'authenticated', 'phase2-creator-b@test.local', '', now(), '{}', '{"user_type":"CREATOR"}', now(), now());

insert into public.organizations (id, name, slug) values
  ('30000000-0000-0000-0000-000000000011', 'Phase 2 Brand A', 'phase-2-brand-a'),
  ('30000000-0000-0000-0000-000000000012', 'Phase 2 Brand B', 'phase-2-brand-b');
insert into public.organization_members (organization_id, user_id, role) values
  ('30000000-0000-0000-0000-000000000011', '30000000-0000-0000-0000-000000000001', 'OWNER'),
  ('30000000-0000-0000-0000-000000000012', '30000000-0000-0000-0000-000000000002', 'OWNER');
insert into public.creator_profiles (user_id, public_name) values
  ('30000000-0000-0000-0000-000000000003', 'Sampling Creator A'),
  ('30000000-0000-0000-0000-000000000004', 'Sampling Creator B');
insert into public.programs (id, organization_id, name, description, status, compensation_type, fixed_amount, created_by)
values ('30000000-0000-0000-0000-000000000021', '30000000-0000-0000-0000-000000000011', 'Sampling Program', 'Programa para validar sampling', 'ACTIVE', 'FIXED', 10000, '30000000-0000-0000-0000-000000000001');
insert into public.program_memberships (program_id, creator_id, source)
values ('30000000-0000-0000-0000-000000000021', '30000000-0000-0000-0000-000000000003', 'MANUAL');

set local role anon;
select throws_ok($$select count(*) from public.sample_products$$, '42501', 'permission denied for table sample_products', 'Unauthenticated users cannot access sampling data');

set local role authenticated;
select set_config('request.jwt.claim.sub', '30000000-0000-0000-0000-000000000001', true);
select lives_ok($$insert into public.sample_products (id, organization_id, program_id, name, created_by) values ('30000000-0000-0000-0000-000000000031', '30000000-0000-0000-0000-000000000011', '30000000-0000-0000-0000-000000000021', 'Remera Sampling', '30000000-0000-0000-0000-000000000001')$$, 'Brand creates product in own Program');
select lives_ok($$insert into public.sample_product_variants (id, product_id, label) values ('30000000-0000-0000-0000-000000000041', '30000000-0000-0000-0000-000000000031', 'Negro / M')$$, 'Brand creates product variant');

select set_config('request.jwt.claim.sub', '30000000-0000-0000-0000-000000000002', true);
select results_eq($$update public.sample_products set name = 'Ataque' where id = '30000000-0000-0000-0000-000000000031' returning 1$$, $$values (1) limit 0$$, 'Wrong Brand cannot edit product');

select set_config('request.jwt.claim.sub', '30000000-0000-0000-0000-000000000003', true);
select throws_ok($$insert into public.sample_products (organization_id, program_id, name, created_by) values ('30000000-0000-0000-0000-000000000011', '30000000-0000-0000-0000-000000000021', 'Ataque creator', '30000000-0000-0000-0000-000000000003')$$, '42501', 'new row violates row-level security policy for table "sample_products"', 'Creator cannot create products');
select results_eq($$select count(*) from public.sample_products where id = '30000000-0000-0000-0000-000000000031'$$, array[1::bigint], 'Active member sees sampling product');
select lives_ok($$insert into public.creator_shipping_addresses (creator_id, recipient_name, street, street_number, city, province, postal_code) values ('30000000-0000-0000-0000-000000000003', 'Creator A', 'Corrientes', '1234', 'CABA', 'Buenos Aires', 'C1043AAZ')$$, 'Creator saves own address');
select lives_ok($$select public.request_sample('30000000-0000-0000-0000-000000000031', '30000000-0000-0000-0000-000000000041', 'Timbre 4')$$, 'Active member requests active product');
select throws_ok($$select public.request_sample('30000000-0000-0000-0000-000000000031', '30000000-0000-0000-0000-000000000041', null)$$, '23505', 'duplicate_active_sample_request', 'Duplicate active request is rejected');
update public.creator_shipping_addresses set street = 'Nueva dirección' where creator_id = '30000000-0000-0000-0000-000000000003';

select set_config('request.jwt.claim.sub', '30000000-0000-0000-0000-000000000004', true);
select results_eq($$select count(*) from public.sample_products where id = '30000000-0000-0000-0000-000000000031'$$, array[0::bigint], 'Non-member cannot see sampling product');
select results_eq($$select count(*) from public.creator_shipping_addresses where creator_id = '30000000-0000-0000-0000-000000000003'$$, array[0::bigint], 'Other creator cannot read address');
select throws_ok($$select public.request_sample('30000000-0000-0000-0000-000000000031', '30000000-0000-0000-0000-000000000041', null)$$, '22023', 'sample_product_not_available', 'Non-member cannot request product');
select throws_ok($$insert into public.sample_requests (program_id, product_id, variant_id, creator_id, shipping_address_snapshot) values ('30000000-0000-0000-0000-000000000021', '30000000-0000-0000-0000-000000000031', '30000000-0000-0000-0000-000000000041', '30000000-0000-0000-0000-000000000003', '{}')$$, '42501', 'permission denied for table sample_requests', 'Creator cannot request for another creator');
select throws_ok($$select public.confirm_sample_received((select id from public.sample_requests limit 1))$$, '42501', 'not_authorized', 'Another creator cannot confirm receipt');
select throws_ok($$select public.report_sample_issue((select id from public.sample_requests limit 1), 'OTHER', 'Ataque')$$, '42501', 'not_authorized', 'Another creator cannot report issue');

select set_config('request.jwt.claim.sub', '30000000-0000-0000-0000-000000000002', true);
select results_eq($$select count(*) from public.sample_requests$$, array[0::bigint], 'Wrong Brand cannot read request');
select results_eq($$select count(*) from public.creator_shipping_addresses where creator_id = '30000000-0000-0000-0000-000000000003'$$, array[0::bigint], 'Unrelated Brand cannot read current creator address');
select throws_ok($$select public.get_sample_request_shipping_address((select id from public.sample_requests limit 1))$$, '42501', 'not_authorized', 'Wrong Brand cannot read fulfillment snapshot');
select throws_ok($$select public.transition_sample_request((select id from public.sample_requests limit 1), 'APPROVED')$$, '42501', 'not_authorized', 'Wrong Brand cannot change request state');

select set_config('request.jwt.claim.sub', '30000000-0000-0000-0000-000000000001', true);
select results_eq($$select recipient_name from public.get_sample_request_shipping_address((select id from public.sample_requests limit 1))$$, array['Creator A'::text], 'Correct Brand accesses fulfillment snapshot');
select results_eq($$select street from public.get_sample_request_shipping_address((select id from public.sample_requests limit 1))$$, array['Corrientes'::text], 'Historical snapshot is unchanged after profile address edit');
select throws_ok($$select shipping_address_snapshot from public.sample_requests limit 1$$, '42501', 'permission denied for table sample_requests', 'Snapshot column is not broadly selectable');
select lives_ok($$select public.transition_sample_request((select id from public.sample_requests limit 1), 'APPROVED')$$, 'Brand approves REQUESTED');
select throws_ok($$select public.transition_sample_request((select id from public.sample_requests limit 1), 'SHIPPED')$$, '22023', 'invalid_sample_status_transition', 'Invalid transition is rejected');
select lives_ok($$select public.transition_sample_request((select id from public.sample_requests limit 1), 'PREPARING')$$, 'Brand marks PREPARING');
select lives_ok($$select public.transition_sample_request((select id from public.sample_requests limit 1), 'SHIPPED', null, 'Correo Argentino', 'AR123', 'https://tracking.example.test/AR123')$$, 'Brand marks SHIPPED');

select set_config('request.jwt.claim.sub', '30000000-0000-0000-0000-000000000003', true);
select lives_ok($$select public.confirm_sample_received((select id from public.sample_requests limit 1))$$, 'Creator confirms RECEIVED');
select lives_ok($$select public.report_sample_issue((select id from public.sample_requests limit 1), 'DAMAGED', 'El paquete llegó dañado')$$, 'Creator reports issue on own eligible request');

select set_config('request.jwt.claim.sub', '30000000-0000-0000-0000-000000000002', true);
select throws_ok($$select public.resolve_sample_issue((select id from public.sample_issues limit 1), 'CANCELLED', 'Ataque')$$, '42501', 'not_authorized', 'Wrong Brand cannot resolve issue');

select set_config('request.jwt.claim.sub', '30000000-0000-0000-0000-000000000001', true);
select lives_ok($$select public.resolve_sample_issue((select id from public.sample_issues limit 1), 'CANCELLED', 'Reposición no disponible')$$, 'Brand resolves own Program issue');
select results_eq($$select status::text from public.sample_requests limit 1$$, array['CANCELLED'::text], 'Resolution leaves explicit final request state');
select results_eq($$select count(*) from public.sample_tracking_events where sample_request_id = (select id from public.sample_requests limit 1)$$, array[8::bigint], 'Every lifecycle change has immutable history');
update public.sample_product_variants set active = false where id = '30000000-0000-0000-0000-000000000041';
select set_config('request.jwt.claim.sub', '30000000-0000-0000-0000-000000000003', true);
select throws_ok($$select public.request_sample('30000000-0000-0000-0000-000000000031', '30000000-0000-0000-0000-000000000041', null)$$, '22023', 'sample_variant_not_available', 'Inactive variant cannot be newly requested');
select set_config('request.jwt.claim.sub', '30000000-0000-0000-0000-000000000001', true);
update public.sample_products set active = false where id = '30000000-0000-0000-0000-000000000031';
select set_config('request.jwt.claim.sub', '30000000-0000-0000-0000-000000000003', true);
select throws_ok($$select public.request_sample('30000000-0000-0000-0000-000000000031', '30000000-0000-0000-0000-000000000041', null)$$, '22023', 'sample_product_not_available', 'Inactive product cannot be newly requested');

select * from finish();
rollback;

begin;
create extension if not exists pgtap with schema extensions;
select plan(22);

insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values
  ('00000000-0000-0000-0000-000000000000', '20000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'phase1-brand-a@test.local', '', now(), '{}', '{"user_type":"BRAND"}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '20000000-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'phase1-brand-b@test.local', '', now(), '{}', '{"user_type":"BRAND"}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '20000000-0000-0000-0000-000000000003', 'authenticated', 'authenticated', 'phase1-creator-a@test.local', '', now(), '{}', '{"user_type":"CREATOR"}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '20000000-0000-0000-0000-000000000004', 'authenticated', 'authenticated', 'phase1-creator-b@test.local', '', now(), '{}', '{"user_type":"CREATOR"}', now(), now());

insert into public.organizations (id, name, slug) values
  ('20000000-0000-0000-0000-000000000011', 'Phase 1 Brand A', 'phase-1-brand-a'),
  ('20000000-0000-0000-0000-000000000012', 'Phase 1 Brand B', 'phase-1-brand-b');
insert into public.organization_members (organization_id, user_id, role) values
  ('20000000-0000-0000-0000-000000000011', '20000000-0000-0000-0000-000000000001', 'OWNER'),
  ('20000000-0000-0000-0000-000000000012', '20000000-0000-0000-0000-000000000002', 'OWNER');
insert into public.creator_profiles (user_id, public_name) values
  ('20000000-0000-0000-0000-000000000003', 'Phase Creator A'),
  ('20000000-0000-0000-0000-000000000004', 'Phase Creator B');

set local role authenticated;
select set_config('request.jwt.claim.sub', '20000000-0000-0000-0000-000000000001', true);
select lives_ok($$insert into public.programs (organization_id, name, description, visibility, applications_enabled, compensation_type, fixed_amount, created_by) values ('20000000-0000-0000-0000-000000000011', 'Programa A', 'Programa de prueba', 'PUBLIC', true, 'FIXED', 10000, '20000000-0000-0000-0000-000000000001')$$, 'Brand creates a program');
select results_eq($$select count(*) from public.programs where name = 'Programa A'$$, array[1::bigint], 'Brand reads its program');

select set_config('request.jwt.claim.sub', '20000000-0000-0000-0000-000000000002', true);
select results_eq($$update public.programs set description = 'Ataque' where name = 'Programa A' returning 1$$, $$values (1) limit 0$$, 'Other brand cannot edit the program');

select set_config('request.jwt.claim.sub', '20000000-0000-0000-0000-000000000003', true);
select throws_ok($$insert into public.programs (organization_id, name, description, visibility, applications_enabled, compensation_type, fixed_amount, created_by) values ('20000000-0000-0000-0000-000000000011', 'Ataque', 'Ataque creator', 'PUBLIC', true, 'FIXED', 10000, '20000000-0000-0000-0000-000000000003')$$, '42501', 'new row violates row-level security policy for table "programs"', 'Creator cannot create a program');
select results_eq($$select count(*) from public.programs where name = 'Programa A'$$, array[0::bigint], 'Draft program is not discoverable');

select set_config('request.jwt.claim.sub', '20000000-0000-0000-0000-000000000001', true);
update public.programs set status = 'ACTIVE' where name = 'Programa A';
select set_config('request.jwt.claim.sub', '20000000-0000-0000-0000-000000000003', true);
select results_eq($$select count(*) from public.programs where name = 'Programa A'$$, array[1::bigint], 'Active public program is discoverable');
select lives_ok($$select public.apply_to_program((select id from public.programs where name = 'Programa A'), 'Quiero participar')$$, 'Creator applies');
select throws_ok($$select public.apply_to_program((select id from public.programs where name = 'Programa A'), null)$$, '23505', 'pending_application_exists', 'Duplicate pending application is rejected');
select throws_ok($$insert into public.program_applications (program_id, creator_id) values ((select id from public.programs where name = 'Programa A'), '20000000-0000-0000-0000-000000000004')$$, '42501', 'permission denied for table program_applications', 'Creator cannot apply for another creator');

select set_config('request.jwt.claim.sub', '20000000-0000-0000-0000-000000000002', true);
select throws_ok($$select public.review_program_application((select id from public.program_applications where creator_id = '20000000-0000-0000-0000-000000000003'), 'ACCEPTED')$$, '42501', 'not_authorized', 'Wrong brand cannot review application');
select set_config('request.jwt.claim.sub', '20000000-0000-0000-0000-000000000001', true);
select lives_ok($$select public.review_program_application((select id from public.program_applications where creator_id = '20000000-0000-0000-0000-000000000003'), 'ACCEPTED')$$, 'Brand accepts application');
select results_eq($$select count(*) from public.program_memberships where creator_id = '20000000-0000-0000-0000-000000000003'$$, array[1::bigint], 'Acceptance creates membership');
select lives_ok($$select public.review_program_application((select id from public.program_applications where creator_id = '20000000-0000-0000-0000-000000000003'), 'ACCEPTED')$$, 'Repeated acceptance is idempotent');
select results_eq($$select count(*) from public.program_memberships where creator_id = '20000000-0000-0000-0000-000000000003'$$, array[1::bigint], 'Repeated acceptance does not duplicate membership');
select lives_ok($$select public.invite_creator_to_program((select id from public.programs where name = 'Programa A'), '20000000-0000-0000-0000-000000000004')$$, 'Brand invites creator');
select throws_ok($$select public.invite_creator_to_program((select id from public.programs where name = 'Programa A'), '20000000-0000-0000-0000-000000000004')$$, '23505', 'pending_invitation_exists', 'Duplicate pending invitation is rejected');

select set_config('request.jwt.claim.sub', '20000000-0000-0000-0000-000000000002', true);
select throws_ok($$select public.invite_creator_to_program((select id from public.programs where name = 'Programa A'), '20000000-0000-0000-0000-000000000004')$$, '42501', 'not_authorized', 'Wrong brand cannot invite to another program');
select set_config('request.jwt.claim.sub', '20000000-0000-0000-0000-000000000003', true);
select results_eq($$select count(*) from public.program_invitations where creator_id = '20000000-0000-0000-0000-000000000004'$$, array[0::bigint], 'Other creator cannot see invitation');
select set_config('request.jwt.claim.sub', '20000000-0000-0000-0000-000000000004', true);
select results_eq($$select count(*) from public.program_invitations where creator_id = '20000000-0000-0000-0000-000000000004'$$, array[1::bigint], 'Creator sees own invitation');
select lives_ok($$select public.respond_to_program_invitation((select id from public.program_invitations where creator_id = '20000000-0000-0000-0000-000000000004'), 'ACCEPTED')$$, 'Creator accepts invitation');
select results_eq($$select count(*) from public.program_memberships where creator_id = '20000000-0000-0000-0000-000000000004'$$, array[1::bigint], 'Invitation acceptance creates membership');
select throws_ok($$insert into public.program_memberships (program_id, creator_id, source) values ((select id from public.programs where name = 'Programa A'), '20000000-0000-0000-0000-000000000004', 'MANUAL')$$, '42501', 'permission denied for table program_memberships', 'Direct forged membership is rejected');

select * from finish();
rollback;

-- Local development only. Never apply this seed to a hosted project.
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
)
values
  (
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-0000-0000-000000000101',
    'authenticated', 'authenticated', 'owner@pumm.local',
    crypt('LocalPassword123', gen_salt('bf')), now(), '{}', '{}', now(), now()
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-0000-0000-000000000102',
    'authenticated', 'authenticated', 'member@pumm.local',
    crypt('LocalPassword123', gen_salt('bf')), now(), '{}', '{}', now(), now()
  );

update public.profiles set first_name = 'Olivia', last_name = 'Owner'
where id = '00000000-0000-0000-0000-000000000101';

update public.profiles set first_name = 'Martín', last_name = 'Miembro'
where id = '00000000-0000-0000-0000-000000000102';

insert into public.organizations (id, name, slug)
values ('00000000-0000-0000-0000-000000000110', 'PUMM Demo', 'pumm-demo');

insert into public.organization_members (organization_id, user_id, role)
values
  ('00000000-0000-0000-0000-000000000110', '00000000-0000-0000-0000-000000000101', 'OWNER'),
  ('00000000-0000-0000-0000-000000000110', '00000000-0000-0000-0000-000000000102', 'MEMBER');

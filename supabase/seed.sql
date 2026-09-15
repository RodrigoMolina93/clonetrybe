-- Local development only. These are deterministic fake accounts, never production credentials.
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
)
values
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'admin@nexo.local', extensions.crypt('LocalPass123', extensions.gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"user_type":"CREATOR"}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'marca@nexo.local', extensions.crypt('LocalPass123', extensions.gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"user_type":"BRAND"}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000003', 'authenticated', 'authenticated', 'creator@nexo.local', extensions.crypt('LocalPass123', extensions.gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"user_type":"CREATOR"}', now(), now());

insert into auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
select id::text, id, jsonb_build_object('sub', id::text, 'email', email), 'email', now(), now(), now()
from auth.users
where id in (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000003'
);

update public.profiles set first_name = 'Ada', last_name = 'Admin', user_type = 'ADMIN'
where id = '00000000-0000-0000-0000-000000000001';
update public.profiles set first_name = 'Bruno', last_name = 'Marca'
where id = '00000000-0000-0000-0000-000000000002';
update public.profiles set first_name = 'Carla', last_name = 'Creator'
where id = '00000000-0000-0000-0000-000000000003';

insert into public.organizations (id, name, slug)
values ('00000000-0000-0000-0000-000000000010', 'Marca Demo', 'marca-demo');
insert into public.organization_members (organization_id, user_id, role)
values ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000002', 'OWNER');
insert into public.creator_profiles (user_id, public_name)
values ('00000000-0000-0000-0000-000000000003', 'Carla Crea');

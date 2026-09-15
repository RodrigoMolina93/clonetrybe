-- The authenticated server action generates an unpredictable UUID before insert so it can
-- redirect deterministically without relying on PostgREST INSERT ... RETURNING behavior.
grant insert (id) on public.programs to authenticated;


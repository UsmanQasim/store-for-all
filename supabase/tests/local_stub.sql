-- Local-only stub of Supabase's auth schema + roles so migrations run on plain Postgres+PostGIS.
-- Usage: psql -d test -f supabase/tests/local_stub.sql -f supabase/migrations/20260924000001_init.sql -f supabase/tests/smoke.sql
do $$ begin create role anon nologin; exception when others then null; end $$; do $$ begin create role authenticated nologin; exception when others then null; end $$;
create schema auth; create schema extensions;
grant usage on schema public, extensions, auth to anon, authenticated;
create table auth.users (id uuid primary key default gen_random_uuid(), email text, raw_user_meta_data jsonb default '{}');
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true),'')::uuid $$;
grant execute on function auth.uid() to anon, authenticated;

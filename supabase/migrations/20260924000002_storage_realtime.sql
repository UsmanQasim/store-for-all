-- =============================================================================
-- Storage bucket for shop logos/covers/item photos/avatars + Realtime.
-- Supabase-specific (storage + realtime schemas).
-- Path convention:  media/<auth.uid()>/<anything>.jpg
-- =============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 3145728, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

create policy "media public read" on storage.objects for select
  using (bucket_id = 'media');

create policy "media owner insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "media owner update" on storage.objects for update to authenticated
  using (bucket_id = 'media' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "media owner delete" on storage.objects for delete to authenticated
  using (bucket_id = 'media' and (storage.foldername(name))[1] = auth.uid()::text);

-- Live updates for order/booking queues and the notification bell.
-- Realtime honours RLS, so users only receive their own rows.
alter publication supabase_realtime add table public.bookings, public.orders, public.notifications;

-- pg_net powers Expo push delivery from public.push_notification().
create extension if not exists pg_net;

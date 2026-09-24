-- Smoke test for core rules: capacity, protected columns, state machines, RLS isolation, cascade delete.
-- Expect NOTICE lines starting with 'OK' and none starting with 'BAD'.
\set ON_ERROR_STOP 1
insert into auth.users(id,email,raw_user_meta_data) values
 ('11111111-1111-1111-1111-111111111111','owner@x.com','{"full_name":"Ali Barber"}'),
 ('22222222-2222-2222-2222-222222222222','cust@x.com','{"full_name":"Sara"}'),
 ('33333333-3333-3333-3333-333333333333','c2@x.com','{"full_name":"Bilal"}');
select id, full_name from profiles;
-- OWNER
set role authenticated; set request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';
insert into shops(name, category_slug, accepts_bookings, accepts_orders, offers_delivery, booking_capacity, slot_minutes,
  opening_hours) values ('Ali''s Cuts & Kiryana', 'barber', true, true, true, 2, 30,
  jsonb_build_object('mon','[{"open":"00:00","close":"23:59"}]'::jsonb,'tue','[{"open":"00:00","close":"23:59"}]'::jsonb,'wed','[{"open":"00:00","close":"23:59"}]'::jsonb,'thu','[{"open":"00:00","close":"23:59"}]'::jsonb,'fri','[{"open":"00:00","close":"23:59"}]'::jsonb,'sat','[{"open":"00:00","close":"23:59"}]'::jsonb,'sun','[{"open":"00:00","close":"23:59"}]'::jsonb))
  returning slug;
select set_shop_location((select id from shops), 30.1575, 71.5249);
insert into catalog_items(shop_id, kind, name, price, duration_minutes) select id,'service','Haircut',500,30 from shops;
insert into catalog_items(shop_id, kind, name, price, unit) select id,'product','Atta 10kg',1800,'bag' from shops;
insert into shop_payment_methods(shop_id,type,account_title,account_number) select id,'jazzcash','Ali','03001234567' from shops;
-- try to cheat
do $$ begin begin update shops set rating_avg=5; raise notice 'BAD: rating writable'; exception when insufficient_privilege then raise notice 'OK rating protected'; end; end $$;
-- CUSTOMER
set request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222';
select name, round(distance_m) d from nearby_shops(30.16, 71.52, 5000);
select count(*) as slots_tomorrow from get_available_slots((select id from shops), (now() at time zone 'Asia/Karachi')::date + 1, (select id from catalog_items where kind='service'));
create temp table s as select slot_start from get_available_slots((select id from shops), (now() at time zone 'Asia/Karachi')::date + 1, (select id from catalog_items where kind='service')) limit 1;
select code, status from create_booking((select id from shops), (select id from catalog_items where kind='service'), (select slot_start from s), 'fade pls');
set request.jwt.claim.sub = '33333333-3333-3333-3333-333333333333';
select code, status from create_booking((select id from shops), (select id from catalog_items where kind='service'), (select slot_start from s), null);
select remaining from get_available_slots((select id from shops), (now() at time zone 'Asia/Karachi')::date + 1, (select id from catalog_items where kind='service')) where slot_start=(select slot_start from s);
select code, subtotal, currency from place_order((select id from shops), jsonb_build_array(jsonb_build_object('item_id',(select id from catalog_items where kind='product'),'quantity',2), jsonb_build_object('item_id',(select id from catalog_items where kind='product'),'quantity',1)), 'delivery', 'House 1, Multan', '0300', null);
select count(*) as c2_sees_bookings from bookings;
insert into reviews(shop_id, rating, comment) select id, 4, 'Good' from shops;
set request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222';
insert into reviews(shop_id, rating, comment) select id, 2, 'Slow' from shops;
insert into favorites(shop_id) select id from shops;
insert into content_reports(target_type, target_id, reason) select 'review', id, 'offensive' from reviews where comment='Good';
-- OWNER actions
set request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';
select status from update_booking_status((select id from bookings order by created_at limit 1), 'confirmed');
do $$ begin perform update_booking_status((select id from bookings order by created_at limit 1), 'pending'); raise notice 'BAD transition'; exception when others then raise notice 'OK transition blocked: %', sqlerrm; end $$;
select status from update_order_status((select id from orders), 'accepted');
select full_name from profiles order by 1;
select shop_dashboard((select id from shops));
insert into shop_posts(shop_id,title,body) select id,'Eid offer','20% off' from shops;
do $$ begin begin insert into reviews(shop_id, rating) select id, 5 from shops; raise notice 'BAD self review'; exception when others then raise notice 'OK self review blocked: %', sqlerrm; end; end $$;
select rating_avg, rating_count, favorites_count from shops;
-- CUSTOMER cancels, reads notifs
set request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222';
select status from cancel_booking((select id from bookings where customer_id=auth.uid()));
select type, title, body from notifications order by created_at;
-- ANON
reset role; set role anon; reset request.jwt.claim.sub;
select name, rating_avg from shops;
select count(*) anon_reviews from reviews;
select type, account_number from shop_payment_methods;
do $$ begin begin perform count(*) from bookings; raise notice 'BAD anon bookings'; exception when insufficient_privilege then raise notice 'OK anon blocked from bookings'; end; end $$;
reset role;
select user_id is not null, type from notifications order by created_at;
-- delete account
set role authenticated; set request.jwt.claim.sub = '33333333-3333-3333-3333-333333333333';
select delete_my_account();
reset role; select count(*) users_left from auth.users; select count(*) orders_left from orders;

-- =============================================
-- Open Slot — Supabase Schema
-- Run this in your Supabase SQL Editor
-- =============================================

-- Approved businesses (only these can post slots)
create table businesses (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  category text not null,
  email text not null unique,
  contact_name text,
  website text,
  address text,
  post_token text unique default gen_random_uuid()::text,
  status text default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz default now()
);

-- Open slots posted by businesses
create table slots (
  id uuid default gen_random_uuid() primary key,
  business_id uuid references businesses(id) on delete cascade,
  service_name text not null,
  slot_time timestamptz not null,
  original_price numeric not null check (original_price > 0),
  deal_price numeric not null check (deal_price > 0),
  spots_total int not null default 1 check (spots_total > 0),
  spots_remaining int not null default 1,
  status text default 'active' check (status in ('active','claimed','expired')),
  notes text,
  created_at timestamptz default now(),
  constraint deal_less_than_original check (deal_price < original_price)
);

-- Consumer claims
create table claims (
  id uuid default gen_random_uuid() primary key,
  slot_id uuid references slots(id) on delete cascade,
  consumer_email text not null,
  created_at timestamptz default now()
);

-- Business applications (reviewed by admin)
create table applications (
  id uuid default gen_random_uuid() primary key,
  business_name text not null,
  category text not null,
  contact_name text not null,
  email text not null,
  website text,
  status text default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz default now()
);

-- Consumer price watches
create table watches (
  id uuid default gen_random_uuid() primary key,
  search_term text not null,
  max_price numeric,
  consumer_email text not null,
  active boolean default true,
  created_at timestamptz default now()
);

-- Consumer "I need" requests
create table needs (
  id uuid default gen_random_uuid() primary key,
  service_name text not null,
  category text not null,
  when_needed text not null,
  budget numeric,
  radius_miles int default 5,
  consumer_email text not null,
  created_at timestamptz default now()
);

-- =============================================
-- Row Level Security
-- =============================================

alter table slots enable row level security;
alter table businesses enable row level security;
alter table claims enable row level security;
alter table applications enable row level security;
alter table watches enable row level security;
alter table needs enable row level security;

-- Anyone can read active slots (public board)
create policy "Public can view active slots"
  on slots for select
  using (status = 'active' and slot_time > now());

-- Only service role (your API) can insert/update slots
create policy "Service role manages slots"
  on slots for all
  using (true)
  with check (true);

-- Applications: anyone can insert, only service role reads
create policy "Anyone can apply"
  on applications for insert
  with check (true);

create policy "Service role reads applications"
  on applications for select
  using (true);

-- Anyone can insert needs and watches
create policy "Anyone can post a need"
  on needs for insert with check (true);

create policy "Anyone can add a watch"
  on watches for insert with check (true);

-- =============================================
-- Useful view: slots with business info joined
-- =============================================

create view active_slots as
  select
    s.id,
    s.service_name,
    s.slot_time,
    s.original_price,
    s.deal_price,
    s.spots_remaining,
    s.notes,
    s.created_at,
    b.name as business_name,
    b.category as business_category,
    b.address as business_address,
    round((s.original_price - s.deal_price) / s.original_price * 100) as discount_pct
  from slots s
  join businesses b on b.id = s.business_id
  where s.status = 'active'
    and s.spots_remaining > 0
    and s.slot_time > now()
    and b.status = 'approved'
  order by s.slot_time asc;

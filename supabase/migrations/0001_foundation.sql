create extension if not exists pgcrypto;
create type public.app_role as enum ('owner','admin','manager','operator','viewer');
create type public.membership_status as enum ('invited','active','suspended');

create table public.organizations (id uuid primary key default gen_random_uuid(), name text not null, slug text not null unique, created_at timestamptz not null default now());
create table public.profiles (id uuid primary key references auth.users(id) on delete cascade, full_name text, created_at timestamptz not null default now());
create table public.organization_members (organization_id uuid references public.organizations(id) on delete cascade, user_id uuid references auth.users(id) on delete cascade, role public.app_role not null default 'viewer', status public.membership_status not null default 'active', created_at timestamptz not null default now(), primary key (organization_id,user_id));
create table public.farms (id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade, name text not null, location text, hectares numeric(12,2), active boolean not null default true, created_at timestamptz not null default now());
create table public.farm_members (farm_id uuid references public.farms(id) on delete cascade, user_id uuid references auth.users(id) on delete cascade, primary key (farm_id,user_id));

create or replace function public.is_org_member(org uuid) returns boolean language sql security definer stable set search_path = public as $$ select exists(select 1 from organization_members where organization_id=org and user_id=auth.uid() and status='active'); $$;
create or replace function public.has_org_role(org uuid, allowed public.app_role[]) returns boolean language sql security definer stable set search_path = public as $$ select exists(select 1 from organization_members where organization_id=org and user_id=auth.uid() and status='active' and role=any(allowed)); $$;

alter table public.organizations enable row level security; alter table public.profiles enable row level security; alter table public.organization_members enable row level security; alter table public.farms enable row level security; alter table public.farm_members enable row level security;
create policy "members can read organizations" on public.organizations for select using (public.is_org_member(id));
create policy "members can read profiles" on public.profiles for select using (id=auth.uid() or exists(select 1 from organization_members m where m.user_id=id and public.is_org_member(m.organization_id)));
create policy "members can read memberships" on public.organization_members for select using (public.is_org_member(organization_id));
create policy "admins manage memberships" on public.organization_members for all using (public.has_org_role(organization_id, array['owner','admin']::public.app_role[])) with check (public.has_org_role(organization_id, array['owner','admin']::public.app_role[]));
create policy "members read farms" on public.farms for select using (public.is_org_member(organization_id));
create policy "admins manage farms" on public.farms for all using (public.has_org_role(organization_id, array['owner','admin','manager']::public.app_role[])) with check (public.has_org_role(organization_id, array['owner','admin','manager']::public.app_role[]));
create policy "farm members read access" on public.farm_members for select using (exists(select 1 from farms f where f.id=farm_id and public.is_org_member(f.organization_id)));

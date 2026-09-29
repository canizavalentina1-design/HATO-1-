create type public.animal_sex as enum ('female','male','unknown');
create type public.animal_status as enum ('active','sold','dead','transferred');
create type public.stock_movement_type as enum ('purchase','sale','birth','death','transfer_in','transfer_out','adjustment');

create table public.lots (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  farm_id uuid not null references public.farms(id) on delete cascade,
  name text not null,
  notes text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (farm_id, name)
);

create table public.animals (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  farm_id uuid not null references public.farms(id) on delete cascade,
  lot_id uuid references public.lots(id) on delete set null,
  visual_id text not null,
  electronic_id text,
  sex public.animal_sex not null default 'unknown',
  birth_date date,
  breed text,
  status public.animal_status not null default 'active',
  created_at timestamptz not null default now(),
  unique (organization_id, visual_id)
);

create table public.stock_movements (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  farm_id uuid not null references public.farms(id) on delete cascade,
  lot_id uuid references public.lots(id) on delete set null,
  animal_id uuid references public.animals(id) on delete set null,
  movement_type public.stock_movement_type not null,
  movement_date date not null default current_date,
  quantity integer not null default 1 check (quantity > 0),
  notes text,
  created_by uuid references auth.users(id) default auth.uid(),
  created_at timestamptz not null default now()
);

alter table public.lots enable row level security;
alter table public.animals enable row level security;
alter table public.stock_movements enable row level security;

create policy "members read lots" on public.lots for select using (public.is_org_member(organization_id));
create policy "managers manage lots" on public.lots for all using (public.has_org_role(organization_id, array['owner','admin','manager']::public.app_role[])) with check (public.has_org_role(organization_id, array['owner','admin','manager']::public.app_role[]));
create policy "members read animals" on public.animals for select using (public.is_org_member(organization_id));
create policy "operators manage animals" on public.animals for all using (public.has_org_role(organization_id, array['owner','admin','manager','operator']::public.app_role[])) with check (public.has_org_role(organization_id, array['owner','admin','manager','operator']::public.app_role[]));
create policy "members read movements" on public.stock_movements for select using (public.is_org_member(organization_id));
create policy "operators create movements" on public.stock_movements for insert with check (public.has_org_role(organization_id, array['owner','admin','manager','operator']::public.app_role[]));

create index animals_org_farm_idx on public.animals(organization_id, farm_id);
create index movements_org_date_idx on public.stock_movements(organization_id, movement_date desc);

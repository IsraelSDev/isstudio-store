-- ISStudio Store — pedidos e códigos de resgate
-- Rode este script no SQL Editor do Supabase.

create extension if not exists "pgcrypto";

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_ref text not null unique,
  asaas_payment_id text unique,
  asaas_subscription_id text,
  customer_name text not null,
  customer_email text not null,
  amount numeric(12, 2) not null,
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed')),
  items jsonb not null default '[]'::jsonb,
  -- Nunca guardamos o código em texto puro: apenas o HMAC-SHA256 dele.
  redeem_code_hash text unique,
  redeem_code_last4 text,
  redeem_count integer not null default 0,
  first_redeemed_at timestamptz,
  last_redeemed_at timestamptz,
  paid_at timestamptz,
  email_sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_customer_email_idx on public.orders (customer_email);
create index if not exists orders_redeem_code_hash_idx on public.orders (redeem_code_hash);
create index if not exists orders_created_at_idx on public.orders (created_at desc);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists orders_touch_updated_at on public.orders;
create trigger orders_touch_updated_at
  before update on public.orders
  for each row
  execute function public.touch_updated_at();

-- Registro de auditoria de cada tentativa de resgate (sucesso ou falha).
create table if not exists public.redeem_attempts (
  id bigserial primary key,
  order_id uuid references public.orders (id) on delete set null,
  success boolean not null,
  ip text,
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists redeem_attempts_created_at_idx on public.redeem_attempts (created_at desc);

-- RLS ligado e sem policies: apenas a service_role (usada só no servidor) acessa.
-- O anon key do Supabase, mesmo se vazar, não lê nem escreve nada aqui.
alter table public.orders enable row level security;
alter table public.redeem_attempts enable row level security;

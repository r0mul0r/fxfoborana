-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Clients table
create table public.clients (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  phone text,
  email text,
  notes text,
  created_at timestamptz default now() not null
);

-- Transactions table
create table public.transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  client_id uuid references public.clients(id) on delete cascade not null,
  currency text not null default 'USD',
  amount numeric(12, 2) not null check (amount > 0),
  buy_rate numeric(10, 4) not null check (buy_rate > 0),
  market_rate numeric(10, 4) not null check (market_rate > 0),
  -- Ganancia neta en USD = ((tasa_mercado - tasa_compra) * monto / tasa_mercado) * 0.97
  -- Convierte la ganancia en moneda local a USD usando la tasa de mercado, luego resta 3% de comisión
  profit numeric(12, 6) generated always as (
    ((market_rate - buy_rate) * amount / market_rate) * 0.97
  ) stored,
  status text not null default 'pending' check (status in ('pending', 'delivered')),
  notes text,
  created_at timestamptz default now() not null,
  delivered_at timestamptz
);

-- Row Level Security
alter table public.clients enable row level security;
alter table public.transactions enable row level security;

-- Policies for clients
create policy "Users can view own clients"
  on public.clients for select
  using (auth.uid() = user_id);

create policy "Users can insert own clients"
  on public.clients for insert
  with check (auth.uid() = user_id);

create policy "Users can update own clients"
  on public.clients for update
  using (auth.uid() = user_id);

create policy "Users can delete own clients"
  on public.clients for delete
  using (auth.uid() = user_id);

-- Policies for transactions
create policy "Users can view own transactions"
  on public.transactions for select
  using (auth.uid() = user_id);

create policy "Users can insert own transactions"
  on public.transactions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own transactions"
  on public.transactions for update
  using (auth.uid() = user_id);

create policy "Users can delete own transactions"
  on public.transactions for delete
  using (auth.uid() = user_id);

-- Indexes
create index clients_user_id_idx on public.clients(user_id);
create index transactions_user_id_idx on public.transactions(user_id);
create index transactions_client_id_idx on public.transactions(client_id);
create index transactions_created_at_idx on public.transactions(created_at desc);
create index transactions_status_idx on public.transactions(status);

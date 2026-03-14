-- Payments (abonos) table for tracking partial client payments
create table public.payments (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  transaction_id uuid references public.transactions(id) on delete cascade not null,
  amount numeric(12, 2) not null check (amount > 0),
  notes text,
  created_at timestamptz default now() not null
);

alter table public.payments enable row level security;

create policy "Users can view own payments"
  on public.payments for select
  using (auth.uid() = user_id);

create policy "Users can insert own payments"
  on public.payments for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own payments"
  on public.payments for delete
  using (auth.uid() = user_id);

create index payments_user_id_idx on public.payments(user_id);
create index payments_transaction_id_idx on public.payments(transaction_id);

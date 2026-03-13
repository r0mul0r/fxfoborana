-- Migration: recalculate profit in USD with 3% commission deduction
-- Run this if you already have the table from migration 001

alter table public.transactions
  drop column profit;

alter table public.transactions
  add column profit numeric(12, 6) generated always as (
    ((market_rate - buy_rate) * amount / market_rate) * 0.97
  ) stored;

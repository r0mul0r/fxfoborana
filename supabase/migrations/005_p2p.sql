-- P2P Binance orders
CREATE TABLE p2p_orders (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  base_amount   numeric     NOT NULL CHECK (base_amount > 0),
  sell_rate     numeric     NOT NULL CHECK (sell_rate > 0),
  commission_pct numeric    NOT NULL DEFAULT 0.3,
  created_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE p2p_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users own p2p_orders"
  ON p2p_orders FOR ALL
  USING (user_id = auth.uid());

CREATE INDEX p2p_orders_user_id_idx   ON p2p_orders(user_id);
CREATE INDEX p2p_orders_created_at_idx ON p2p_orders(created_at DESC);

-- Buy operations inside each P2P order
CREATE TABLE p2p_operations (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id      uuid        NOT NULL REFERENCES p2p_orders(id) ON DELETE CASCADE,
  bs_sent       numeric     NOT NULL CHECK (bs_sent >= 0),
  usdt_received numeric     NOT NULL CHECK (usdt_received >= 0),
  created_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE p2p_operations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users own p2p_operations"
  ON p2p_operations FOR ALL
  USING (
    order_id IN (SELECT id FROM p2p_orders WHERE user_id = auth.uid())
  );

CREATE INDEX p2p_operations_order_id_idx ON p2p_operations(order_id);

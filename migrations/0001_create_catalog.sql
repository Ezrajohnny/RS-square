CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  position INTEGER NOT NULL,
  data TEXT NOT NULL CHECK (json_valid(data))
);

CREATE INDEX IF NOT EXISTS products_order_idx ON products(position, id);

CREATE TABLE IF NOT EXISTS login_attempts (
  ip_key TEXT PRIMARY KEY,
  count INTEGER NOT NULL,
  window_started INTEGER NOT NULL
);

-- Keyspace (use NetworkTopologyStrategy + RF=3 in production)
CREATE KEYSPACE IF NOT EXISTS shop
  WITH replication = {'class': 'SimpleStrategy', 'replication_factor': 1};

-- Sessions: looked up only by session_id. Rows expire automatically (sliding TTL
-- is refreshed from the app by re-inserting with USING TTL).
CREATE TABLE IF NOT EXISTS shop.sessions (
  session_id  text PRIMARY KEY,
  user_id     text,
  created_at  timestamp,
  last_access timestamp,
  ip          text,
  user_agent  text
) WITH default_time_to_live = 1800;

-- Cart: one partition per cart (anon:<sessionId> or user:<userId>),
-- one row per product. Query "get my cart" = single-partition read.
CREATE TABLE IF NOT EXISTS shop.cart_items (
  cart_id     text,
  product_id  text,
  name        text,
  price_cents int,
  quantity    int,
  added_at    timestamp,
  PRIMARY KEY ((cart_id), product_id)
) WITH default_time_to_live = 604800;

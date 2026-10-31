const db = require('../config/cassandra');

const CART_TTL = 7 * 24 * 3600;

const rowToItem = (r) => ({
  productId: r.product_id,
  name: r.name,
  price_cents: r.price_cents,
  quantity: r.quantity,
  addedAt: r.added_at,
});

async function list(cartId) {
  const rs = await db.execute('SELECT * FROM cart_items WHERE cart_id = ?', [cartId]);
  const items = rs.rows.map(rowToItem);
  const total_cents = items.reduce((s, i) => s + i.price_cents * i.quantity, 0);
  return { items, total_cents, count: items.reduce((s, i) => s + i.quantity, 0) };
}

async function getItem(cartId, productId) {
  const rs = await db.execute(
    'SELECT * FROM cart_items WHERE cart_id = ? AND product_id = ?', [cartId, productId]
  );
  return rs.rowLength ? rowToItem(rs.first()) : null;
}

// Upsert: INSERT in Cassandra overwrites by primary key.
// Refreshing TTL on every write keeps active carts alive.
async function setItem(cartId, { productId, name, price_cents }, quantity) {
  await db.execute(
    `INSERT INTO cart_items (cart_id, product_id, name, price_cents, quantity, added_at)
     VALUES (?, ?, ?, ?, ?, ?) USING TTL ?`,
    [cartId, productId, name, price_cents, quantity, new Date(), CART_TTL]
  );
}

async function addItem(cartId, product, qty) {
  const existing = await getItem(cartId, product.productId);
  const newQty = (existing ? existing.quantity : 0) + qty;
  await setItem(cartId, product, newQty);
  return newQty;
}

async function removeItem(cartId, productId) {
  await db.execute('DELETE FROM cart_items WHERE cart_id = ? AND product_id = ?', [cartId, productId]);
}

async function clear(cartId) {
  await db.execute('DELETE FROM cart_items WHERE cart_id = ?', [cartId]); // partition delete
}

// Called on login: move anonymous cart into the user's cart.
async function merge(fromCartId, toCartId) {
  const { items } = await list(fromCartId);
  for (const it of items) {
    await addItem(toCartId, it, it.quantity);
  }
  if (items.length) await clear(fromCartId);
}

module.exports = { list, getItem, setItem, addItem, removeItem, clear, merge };

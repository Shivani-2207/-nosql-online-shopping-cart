const Product = require('../models/Product');
const Order = require('../models/Order');
const cart = require('./cartService');
const httpError = require('../utils/httpError');

/**
 * Checkout: Cassandra cart -> validated against MongoDB -> Order.
 * - Prices are re-read from MongoDB (never trust cart prices).
 * - Stock is decremented atomically per product ($gte guard).
 * - If anything fails, already-reserved stock is restored (compensation).
 *   (With a Mongo replica set you could wrap this in a transaction instead.)
 */
async function checkout(userId, cartId, address) {
  const { items } = await cart.list(cartId);
  if (!items.length) throw httpError(400, 'Cart is empty');

  const reserved = [];
  const orderItems = [];
  try {
    for (const it of items) {
      const p = await Product.findOneAndUpdate(
        { _id: it.productId, active: true, stock: { $gte: it.quantity } },
        { $inc: { stock: -it.quantity } },
        { new: true }
      );
      if (!p) throw httpError(409, `Unavailable or insufficient stock: ${it.name}`);
      reserved.push(it);
      orderItems.push({
        productId: p._id, name: p.name, price_cents: p.price_cents, quantity: it.quantity,
      });
    }
    const total_cents = orderItems.reduce((s, i) => s + i.price_cents * i.quantity, 0);
    const order = await Order.create({ userId, items: orderItems, total_cents, address });
    await cart.clear(cartId);
    return order;
  } catch (err) {
    await Promise.all(
      reserved.map((it) => Product.updateOne({ _id: it.productId }, { $inc: { stock: it.quantity } }))
    );
    throw err;
  }
}

module.exports = { checkout };

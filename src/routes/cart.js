const router = require('express').Router();
const Product = require('../models/Product');
const cart = require('../services/cartService');
const httpError = require('../utils/httpError');

const MAX_QTY = 20;

async function loadProduct(id) {
  const p = await Product.findOne({ _id: id, active: true });
  if (!p) throw httpError(404, 'Product not found');
  return p;
}
const toCartProduct = (p) => ({ productId: p.id, name: p.name, price_cents: p.price_cents });
const parseQty = (q) => {
  const n = parseInt(q, 10);
  if (!Number.isInteger(n) || n < 1 || n > MAX_QTY) throw httpError(400, `quantity must be 1-${MAX_QTY}`);
  return n;
};

router.get('/', async (req, res, next) => {
  try { res.json(await cart.list(req.cartId)); } catch (e) { next(e); }
});

router.post('/items', async (req, res, next) => {
  try {
    const qty = parseQty(req.body.quantity ?? 1);
    const p = await loadProduct(req.body.productId);
    const existing = await cart.getItem(req.cartId, p.id);
    if ((existing ? existing.quantity : 0) + qty > p.stock) throw httpError(409, `Only ${p.stock} in stock`);
    await cart.addItem(req.cartId, toCartProduct(p), qty);
    res.status(201).json(await cart.list(req.cartId));
  } catch (e) { next(e); }
});

router.patch('/items/:productId', async (req, res, next) => {
  try {
    const qty = parseQty(req.body.quantity);
    const p = await loadProduct(req.params.productId);
    if (qty > p.stock) throw httpError(409, `Only ${p.stock} in stock`);
    await cart.setItem(req.cartId, toCartProduct(p), qty);
    res.json(await cart.list(req.cartId));
  } catch (e) { next(e); }
});

router.delete('/items/:productId', async (req, res, next) => {
  try {
    await cart.removeItem(req.cartId, req.params.productId);
    res.json(await cart.list(req.cartId));
  } catch (e) { next(e); }
});

router.delete('/', async (req, res, next) => {
  try { await cart.clear(req.cartId); res.json({ ok: true }); } catch (e) { next(e); }
});

module.exports = router;

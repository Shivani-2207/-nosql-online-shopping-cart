const router = require('express').Router();
const Order = require('../models/Order');
const orderService = require('../services/orderService');
const { requireAuth } = require('../middleware/session');

router.use(requireAuth);

router.post('/checkout', async (req, res, next) => {
  try {
    const order = await orderService.checkout(req.session.userId, req.cartId, req.body.address || {});
    res.status(201).json(order);
  } catch (e) { next(e); }
});

router.get('/', async (req, res, next) => {
  try {
    res.json(await Order.find({ userId: req.session.userId }).sort({ createdAt: -1 }));
  } catch (e) { next(e); }
});

module.exports = router;

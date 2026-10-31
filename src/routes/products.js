const router = require('express').Router();
const Product = require('../models/Product');
const httpError = require('../utils/httpError');

router.get('/', async (req, res, next) => {
  try {
    const { q, category, page = 1, limit = 20 } = req.query;
    const filter = { active: true };
    if (category) filter.category = category;
    if (q) filter.$text = { $search: q };
    const lim = Math.min(parseInt(limit, 10) || 20, 100);
    const products = await Product.find(filter).skip((Math.max(page, 1) - 1) * lim).limit(lim);
    res.json(products);
  } catch (e) { next(e); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const p = await Product.findById(req.params.id);
    if (!p) throw httpError(404, 'Product not found');
    res.json(p);
  } catch (e) { next(e); }
});

module.exports = router;

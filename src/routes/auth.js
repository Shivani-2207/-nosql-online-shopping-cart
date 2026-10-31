const router = require('express').Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const sessions = require('../services/sessionService');
const cart = require('../services/cartService');
const httpError = require('../utils/httpError');
const { setSessionCookie, cartIdFor, cookieOptions } = require('../middleware/session');

// Rotate the session on login (prevents session fixation) and merge carts.
async function startUserSession(req, res, user) {
  const oldCartId = req.cartId;
  await sessions.destroy(req.session.id);
  const s = await sessions.create({
    userId: user.id, ip: req.ip, userAgent: req.get('user-agent') || '',
  });
  setSessionCookie(res, s.id);
  await cart.merge(oldCartId, cartIdFor(s));
}

router.post('/register', async (req, res, next) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || password.length < 8) throw httpError(400, 'Email and password (min 8 chars) required');
    if (await User.findOne({ email })) throw httpError(409, 'Email already registered');
    const user = await User.create({ email, name, passwordHash: await bcrypt.hash(password, 12) });
    await startUserSession(req, res, user);
    res.status(201).json({ id: user.id, email: user.email, name: user.name });
  } catch (e) { next(e); }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password || '', user.passwordHash))) {
      throw httpError(401, 'Invalid credentials');
    }
    await startUserSession(req, res, user);
    res.json({ id: user.id, email: user.email, name: user.name });
  } catch (e) { next(e); }
});

router.post('/logout', async (req, res, next) => {
  try {
    await sessions.destroy(req.session.id);
    res.clearCookie('sid', cookieOptions());
    res.json({ ok: true });
  } catch (e) { next(e); }
});

router.get('/me', async (req, res, next) => {
  try {
    if (!req.session.userId) return res.json({ authenticated: false, sessionId: req.session.id });
    const user = await User.findById(req.session.userId).select('email name');
    res.json({ authenticated: true, user });
  } catch (e) { next(e); }
});

module.exports = router;

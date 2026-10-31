const sessions = require('../services/sessionService');

const cookieOptions = () => ({
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  path: '/',
});

function setSessionCookie(res, id) {
  res.cookie('sid', id, cookieOptions());
}

const cartIdFor = (s) => (s.userId ? `user:${s.userId}` : `anon:${s.id}`);

// Loads the session from Cassandra (or creates an anonymous one).
async function sessionMiddleware(req, res, next) {
  try {
    let s = await sessions.get(req.cookies.sid);
    if (!s) {
      s = await sessions.create({ ip: req.ip, userAgent: req.get('user-agent') || '' });
      setSessionCookie(res, s.id);
    } else {
      await sessions.touch(s);
    }
    req.session = s;
    req.cartId = cartIdFor(s);
    next();
  } catch (e) { next(e); }
}

function requireAuth(req, res, next) {
  if (!req.session || !req.session.userId) return res.status(401).json({ error: 'Login required' });
  next();
}

module.exports = { sessionMiddleware, requireAuth, setSessionCookie, cartIdFor, cookieOptions };

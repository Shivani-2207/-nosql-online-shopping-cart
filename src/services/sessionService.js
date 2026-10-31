const crypto = require('crypto');
const db = require('../config/cassandra');

const TTL = parseInt(process.env.SESSION_TTL_SECONDS || '1800', 10);
const TOUCH_INTERVAL_MS = 60 * 1000; // don't write on every request

const INSERT = `INSERT INTO sessions (session_id, user_id, created_at, last_access, ip, user_agent)
                VALUES (?, ?, ?, ?, ?, ?) USING TTL ?`;

function rowToSession(r) {
  return {
    id: r.session_id,
    userId: r.user_id || null,
    createdAt: r.created_at,
    lastAccess: r.last_access,
    ip: r.ip,
    userAgent: r.user_agent,
  };
}

async function create({ userId = null, ip = '', userAgent = '' } = {}) {
  const id = crypto.randomBytes(24).toString('hex'); // unguessable
  const now = new Date();
  await db.execute(INSERT, [id, userId || '', now, now, ip, userAgent, TTL]);
  return { id, userId, createdAt: now, lastAccess: now, ip, userAgent };
}

async function get(id) {
  if (!id) return null;
  const rs = await db.execute('SELECT * FROM sessions WHERE session_id = ?', [id]);
  return rs.rowLength ? rowToSession(rs.first()) : null;
}

// Sliding expiration: re-insert the row with a fresh TTL.
async function touch(session) {
  const now = new Date();
  if (now - new Date(session.lastAccess) < TOUCH_INTERVAL_MS) return;
  await db.execute(INSERT, [
    session.id, session.userId || '', session.createdAt, now, session.ip, session.userAgent, TTL,
  ]);
  session.lastAccess = now;
}

async function destroy(id) {
  await db.execute('DELETE FROM sessions WHERE session_id = ?', [id]);
}

module.exports = { create, get, touch, destroy, TTL };

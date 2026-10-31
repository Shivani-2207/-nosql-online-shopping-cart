const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const { sessionMiddleware } = require('./middleware/session');

const app = express();
app.use(express.json());
app.use(cookieParser());

// Storefront UI: served at http://localhost:3000/
app.use(express.static(path.join(__dirname, '../public')));

app.get('/health', (req, res) => res.json({ ok: true }));

app.use(sessionMiddleware);
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/orders', require('./routes/orders'));

app.use((req, res) => res.status(404).json({ error: 'Not found' }));
app.use((err, req, res, next) => {
  if (err.name === 'CastError') return res.status(400).json({ error: 'Invalid id' });
  const status = err.status || 500;
  if (status === 500) console.error(err);
  res.status(status).json({ error: status === 500 ? 'Internal server error' : err.message });
});

module.exports = app;

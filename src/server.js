require('dotenv').config();
const app = require('./app');
const cassandra = require('./config/cassandra');
const connectMongo = require('./config/mongo');

(async () => {
  await cassandra.connect();
  console.log('Cassandra connected');
  await connectMongo();
  console.log('MongoDB connected');
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`API listening on http://localhost:${port}`));
})().catch((e) => { console.error('Startup failed:', e); process.exit(1); });

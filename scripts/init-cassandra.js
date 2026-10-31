require('dotenv').config();
const fs = require('fs');
const path = require('path');
const cassandra = require('cassandra-driver');

(async () => {
  const client = new cassandra.Client({
    contactPoints: (process.env.CASSANDRA_HOSTS || '127.0.0.1').split(','),
    localDataCenter: process.env.CASSANDRA_DC || 'datacenter1',
  });
  const cql = fs.readFileSync(path.join(__dirname, '../cassandra/schema.cql'), 'utf8');
  const statements = cql.replace(/--.*$/gm, '').split(';').map((s) => s.trim()).filter(Boolean);
  for (const s of statements) {
    await client.execute(s);
    console.log('OK:', s.split('\n')[0]);
  }
  await client.shutdown();
  console.log('Cassandra schema ready.');
})().catch((e) => { console.error(e); process.exit(1); });

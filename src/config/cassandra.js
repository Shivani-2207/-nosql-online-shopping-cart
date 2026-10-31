const cassandra = require('cassandra-driver');

const client = new cassandra.Client({
  contactPoints: (process.env.CASSANDRA_HOSTS || '127.0.0.1').split(','),
  localDataCenter: process.env.CASSANDRA_DC || 'datacenter1',
  keyspace: process.env.CASSANDRA_KEYSPACE || 'shop',
  queryOptions: { prepare: true, consistency: cassandra.types.consistencies.localQuorum },
});

module.exports = client;

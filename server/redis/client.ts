import { createClient } from 'redis';

const client = createClient();

client.on('error', (err: Error) => {
  console.error(' Redis client error:', err);
});

client.on('connect', () => {
  console.log(' Redis connected');
});

export default client;

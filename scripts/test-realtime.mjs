import dotenv from 'dotenv';
import pg from 'pg';
import { createRealtime, rawSql } from '@neon/realtime/server';
import { createRealtimeClient } from '@neon/realtime/client';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const { Pool } = pg;
const databaseUrl = process.env.DATABASE_URL;
const realtimeUrl = process.env.NEON_REALTIME_URL;
const realtimeSecret = process.env.NEON_REALTIME_SECRET;

if (!databaseUrl || !realtimeUrl || !realtimeSecret) {
  console.error('Missing required environment variables (DATABASE_URL, NEON_REALTIME_URL, NEON_REALTIME_SECRET)');
  process.exit(1);
}

async function runTest() {
  console.log('=== Neon Realtime Live Query Verification ===\n');

  // 1. Ensure table exists in Postgres with a primary key
  console.log('Step 1: Setting up table `live_dispatch_alerts` with primary key...');
  const pool = new Pool({
    connectionString: databaseUrl.replace('sslmode=require', 'sslmode=verify-full'),
  });

  await pool.query(`
    CREATE TABLE IF NOT EXISTS live_dispatch_alerts (
      id text PRIMARY KEY,
      title text NOT NULL,
      severity text NOT NULL DEFAULT 'INFO',
      created_at timestamptz NOT NULL DEFAULT now()
    );
  `);
  console.log('✓ Table `live_dispatch_alerts` is ready with PRIMARY KEY (id).\n');

  // 2. Define and seal query on the server
  console.log('Step 2: Defining and sealing live query on the server...');
  const server = createRealtime({
    secret: realtimeSecret,
    db: 'neondb',
  });

  const alertsQuery = rawSql(
    'SELECT id, title, severity, created_at FROM live_dispatch_alerts ORDER BY created_at DESC LIMIT 20'
  );

  const sealedQuery = await server.seal({ query: alertsQuery });
  console.log('✓ Live query sealed successfully using NEON_REALTIME_SECRET.\n');

  // 3. Client subscribes using Neon's Realtime SDK
  console.log('Step 3: Client subscribing to sealed query with Neon Realtime SDK...');
  const client = createRealtimeClient({
    url: realtimeUrl,
  });

  const subscription = client.subscribe(sealedQuery);

  const testId = `alert_${Date.now()}`;
  const testTitle = `Urgent Emergency Gas Refill - Madurai Hub Alert #${Math.floor(Math.random() * 9000 + 1000)}`;

  let isSubscribedLive = false;
  let insertTime = null;

  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Timed out waiting for realtime subscriber to receive row.'));
    }, 25000);

    subscription.onChange(async (snapshot) => {
      console.log(`[Subscription Update] Status: "${snapshot.status}", Current rows in snapshot: ${snapshot.data?.length ?? 0}`);

      if (snapshot.status === 'live' && !isSubscribedLive) {
        isSubscribedLive = true;
        console.log('✓ Subscription is now LIVE and streaming changes via WebSocket.\n');

        // 4. Insert row into database and observe real-time push
        console.log(`Step 4: Inserting row directly into database:`);
        console.log(`  ID: ${testId}`);
        console.log(`  Title: "${testTitle}"`);
        console.log(`  Severity: HIGH`);

        insertTime = Date.now();
        await pool.query(
          'INSERT INTO live_dispatch_alerts (id, title, severity, created_at) VALUES ($1, $2, $3, now())',
          [testId, testTitle, 'HIGH']
        );
        console.log('✓ Row committed in Postgres. Waiting for Realtime push to subscriber...');
      }

      // Check if newly inserted row arrived at subscriber
      if (snapshot.data) {
        const found = snapshot.data.find((row) => row.id === testId);
        if (found) {
          const latency = insertTime ? `${Date.now() - insertTime}ms` : 'instant';
          console.log('\n======================================================');
          console.log('🎉 PROOF VERIFIED: Realtime subscriber received the row!');
          console.log('======================================================');
          console.log('Latency:', latency);
          console.log('Received Row:', {
            id: found.id,
            title: found.title,
            severity: found.severity,
            created_at: found.created_at,
          });
          clearTimeout(timeout);
          resolve();
        }
      }
    });

    subscription.onStateChange((state) => {
      if (state.status === 'error') {
        clearTimeout(timeout);
        reject(new Error(`Subscription error: ${state.error?.message}`));
      }
    });
  });

  // Clean up
  console.log('\nCleaning up subscription and closing client...');
  subscription.unsubscribe();
  client.close();
  await pool.end();
  console.log('✓ All connections cleanly closed.');
}

runTest().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});

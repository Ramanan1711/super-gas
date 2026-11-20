import { createRealtime, rawSql } from '@neon/realtime/server';

// Server-side Realtime instance using NEON_REALTIME_SECRET
export const serverRealtime = createRealtime({
  secret: process.env.NEON_REALTIME_SECRET || '',
  db: 'neondb',
});

export interface LiveDispatchAlert {
  id: string;
  title: string;
  severity: string;
  created_at: string;
}

// Live query: read-only deterministic query over a table with primary key
export const liveAlertsQuery = rawSql<LiveDispatchAlert>(
  'SELECT id, title, severity, created_at FROM live_dispatch_alerts ORDER BY created_at DESC LIMIT 20'
);

/**
 * Seals the live query on the server so client can subscribe
 * without exposing database secrets or allowing query modification.
 */
export async function getSealedLiveAlertsQuery() {
  if (!process.env.NEON_REALTIME_SECRET) {
    throw new Error('NEON_REALTIME_SECRET is not configured.');
  }
  return serverRealtime.seal({ query: liveAlertsQuery });
}

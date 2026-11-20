import { createRealtime, rawSql } from '@neon/realtime/server';

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

let cachedRealtime: ReturnType<typeof createRealtime> | null = null;

/**
 * Lazy factory for Realtime server instance.
 * Avoids executing createRealtime during module load / build time when env vars may not be populated.
 */
export function getServerRealtime() {
  const secret = process.env.NEON_REALTIME_SECRET;
  if (!secret || secret.trim() === '') {
    return null;
  }

  if (!cachedRealtime) {
    cachedRealtime = createRealtime({
      secret,
      db: 'neondb',
    });
  }
  return cachedRealtime;
}

/**
 * Seals the live query on the server so client can subscribe
 * without exposing database secrets or allowing query modification.
 */
export async function getSealedLiveAlertsQuery() {
  const realtime = getServerRealtime();
  if (!realtime) {
    return null;
  }
  return realtime.seal({ query: liveAlertsQuery });
}

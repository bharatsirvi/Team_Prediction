import { createClient } from '@libsql/client';

// Uses env vars in production (Turso), falls back to local file for dev
const client = createClient({
  url: process.env.TURSO_DATABASE_URL ?? 'file:predictions.sqlite',
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Ensure the table exists
let initialized = false;
async function init() {
  if (initialized) return;
  await client.execute(`
    CREATE TABLE IF NOT EXISTS predictions (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      username  TEXT NOT NULL UNIQUE,
      teams     TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  initialized = true;
}

export async function getPredictions() {
  await init();
  const result = await client.execute(
    'SELECT * FROM predictions ORDER BY timestamp DESC'
  );
  return result.rows.map(row => ({
    id: row.id,
    username: row.username,
    teams: JSON.parse(row.teams as string),
    timestamp: row.timestamp,
  }));
}

export async function upsertPrediction(username: string, teams: string[], overrideTimestamp?: string) {
  await init();
  const existing = await client.execute({
    sql: 'SELECT id FROM predictions WHERE username = ?',
    args: [username],
  });

  if (existing.rows.length > 0) {
    if (overrideTimestamp) {
      await client.execute({
        sql: 'UPDATE predictions SET teams = ?, timestamp = ? WHERE username = ?',
        args: [JSON.stringify(teams), overrideTimestamp, username],
      });
    } else {
      await client.execute({
        sql: 'UPDATE predictions SET teams = ?, timestamp = CURRENT_TIMESTAMP WHERE username = ?',
        args: [JSON.stringify(teams), username],
      });
    }
  } else {
    if (overrideTimestamp) {
      await client.execute({
        sql: 'INSERT INTO predictions (username, teams, timestamp) VALUES (?, ?, ?)',
        args: [username, JSON.stringify(teams), overrideTimestamp],
      });
    } else {
      await client.execute({
        sql: 'INSERT INTO predictions (username, teams) VALUES (?, ?)',
        args: [username, JSON.stringify(teams)],
      });
    }
  }
}

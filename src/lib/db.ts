import { createClient } from '@libsql/client';

// Uses env vars in production (Turso), falls back to local file for dev
const client = createClient({
  url: process.env.TURSO_DATABASE_URL ?? 'file:predictions.sqlite',
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Ensure tables exist
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
  await client.execute(`
    CREATE TABLE IF NOT EXISTS otps (
      email      TEXT NOT NULL PRIMARY KEY,
      code       TEXT NOT NULL,
      expires_at INTEGER NOT NULL
    )
  `);
  await client.execute(`
    CREATE TABLE IF NOT EXISTS users (
      email      TEXT NOT NULL PRIMARY KEY,
      name       TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  initialized = true;
}

export async function getUser(email: string) {
  await init();
  const res = await client.execute({
    sql: 'SELECT * FROM users WHERE email = ?',
    args: [email.toLowerCase()],
  });
  return res.rows[0] ? { email: res.rows[0].email as string, name: res.rows[0].name as string } : null;
}

export async function createUser(email: string, name: string) {
  await init();
  await client.execute({
    sql: 'INSERT INTO users (email, name) VALUES (?, ?)',
    args: [email.toLowerCase(), name],
  });
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

export async function saveOtp(email: string, code: string, ttlSeconds = 600) {
  await init();
  const expiresAt = Date.now() + ttlSeconds * 1000;
  await client.execute({
    sql: 'INSERT OR REPLACE INTO otps (email, code, expires_at) VALUES (?, ?, ?)',
    args: [email.toLowerCase(), code, expiresAt],
  });
}

export async function verifyOtp(email: string, code: string): Promise<boolean> {
  await init();
  const result = await client.execute({
    sql: 'SELECT code, expires_at FROM otps WHERE email = ?',
    args: [email.toLowerCase()],
  });
  if (result.rows.length === 0) return false;
  const row = result.rows[0];
  if (Date.now() > Number(row.expires_at)) return false;
  if (row.code !== code) return false;
  await client.execute({ sql: 'DELETE FROM otps WHERE email = ?', args: [email.toLowerCase()] });
  return true;
}

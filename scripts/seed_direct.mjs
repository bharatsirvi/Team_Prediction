// Direct Seed script — inserts existing predictions directly into Turso
// This bypasses the Vercel API to avoid 500 errors.
// Usage: TURSO_DATABASE_URL="..." TURSO_AUTH_TOKEN="..." node scripts/seed_direct.mjs

import { createClient } from '@libsql/client';

if (!process.env.TURSO_DATABASE_URL) {
  console.error("❌ Error: TURSO_DATABASE_URL is missing in your environment.");
  process.exit(1);
}

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const predictions = [
  { username: 'Piyush', teams: ['MI', 'DC', 'PBKS', 'RCB'], timestamp: '2026-04-04 11:43:00' },
  { username: 'Manish', teams: ['RCB', 'PBKS', 'DC', 'MI'], timestamp: '2026-04-04 11:48:00' },
  { username: 'Bharat', teams: ['RR', 'RCB', 'MI', 'DC'], timestamp: '2026-04-04 10:04:00' },
  { username: 'Tarun', teams: ['MI', 'RR', 'RCB', 'PBKS'], timestamp: '2026-04-10 06:21:00' },
];

async function seed() {
  console.log(`\nDirect Seeding to Turso: ${process.env.TURSO_DATABASE_URL}\n`);

  for (const p of predictions) {
    try {
      // Check if user exists
      const existing = await client.execute({
        sql: 'SELECT id FROM predictions WHERE username = ?',
        args: [p.username],
      });

      if (existing.rows.length > 0) {
        await client.execute({
          sql: 'UPDATE predictions SET teams = ?, timestamp = ? WHERE username = ?',
          args: [JSON.stringify(p.teams), p.timestamp, p.username],
        });
        console.log(`Updated: ${p.username}`);
      } else {
        await client.execute({
          sql: 'INSERT INTO predictions (username, teams, timestamp) VALUES (?, ?, ?)',
          args: [p.username, JSON.stringify(p.teams), p.timestamp],
        });
        console.log(`Inserted: ${p.username}`);
      }
    } catch (err) {
      console.error(`❌ Error for ${p.username}:`, err.message);
    }
  }

  console.log('\nDone!\n');
}

seed().catch(console.error);

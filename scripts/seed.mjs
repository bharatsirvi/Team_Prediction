// Seed script — inserts existing predictions into the database
// Run with: node scripts/seed.mjs

const BASE_URL = 'http://localhost:3000'; // Seeding local first

const predictions = [
  {
    username: 'Piyush',
    teams: ['MI', 'DC', 'PBKS', 'RCB'],
    timestamp: '2026-04-04 17:13:00'
  },
  {
    username: 'Manish',
    teams: ['RCB', 'PBKS', 'DC', 'MI'],
    timestamp: '2026-04-04 17:18:00'
  },
  {
    username: 'Bharat',
    teams: ['RR', 'RCB', 'MI', 'DC'],
    timestamp: '2026-04-04 15:34:00'
  },
  {
    username: 'Tarun',
    teams: ['MI', 'RR', 'RCB', 'PBKS'],
    timestamp: '2026-04-10 11:51:00'
  },
];

async function seed() {
  console.log(`\nSeeding ${predictions.length} predictions to ${BASE_URL}\n`);

  for (const p of predictions) {
    const res = await fetch(`${BASE_URL}/api/predictions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(p),
    });

    const json = await res.json();

    if (res.ok) {
      console.log(`✅  ${p.username.padEnd(8)} → ${p.teams.join(', ')} (${p.timestamp})`);
    } else {
      console.error(`❌  ${p.username}: ${JSON.stringify(json)}`);
    }
  }

  console.log('\nDone!\n');
}

seed().catch(console.error);

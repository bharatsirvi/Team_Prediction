import { NextResponse } from 'next/server';

export async function GET() {
  const rapidApiKey = process.env.RAPIDAPI_KEY;

  if (!rapidApiKey) {
    return NextResponse.json({ error: 'RapidAPI Key not found' }, { status: 500 });
  }

  try {
    const url = 'https://cricbuzz-cricket.p.rapidapi.com/stats/v1/series/9241/points-table';

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': rapidApiKey,
        'x-rapidapi-host': 'cricbuzz-cricket.p.rapidapi.com'
      }
    });

    const data = await response.json();

    // The frontend expects { pointsTable: [ { pointsTableInfo: [...] } ] }
    return NextResponse.json(data);
  } catch (error) {
    console.error('Points Table API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch points table' }, { status: 500 });
  }
}

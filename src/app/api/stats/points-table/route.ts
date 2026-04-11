import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

export async function GET() {
  // 🛡️ ROUTE SAFETY: Only allow logged-in users to fetch tournament stats
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized. Please login to view stats.' }, { status: 401 });
  }

  const url = 'https://cricbuzz-cricket.p.rapidapi.com/stats/v1/series/9241/points-table';
  const options = {
    method: 'GET',
    headers: {
      'x-rapidapi-key': process.env.RAPIDAPI_KEY || '',
      'x-rapidapi-host': 'cricbuzz-cricket.p.rapidapi.com'
    }
  };

  try {
    const response = await fetch(url, options);
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Points Table API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch points table' }, { status: 500 });
  }
}

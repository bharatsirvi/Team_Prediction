import { NextResponse } from 'next/server';
import { getPredictions, upsertPrediction } from '@/lib/db';
import { getSession } from '@/lib/session';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    const { teams, timestamp } = await request.json();

    if (!teams || !Array.isArray(teams) || teams.length !== 4) {
      return NextResponse.json({ error: 'Exactly 4 teams are required.' }, { status: 400 });
    }

    await upsertPrediction(session.name, teams, timestamp);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const predictions = await getPredictions();
    return NextResponse.json(predictions);
  } catch (error: unknown) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

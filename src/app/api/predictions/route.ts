import { NextResponse } from 'next/server';
import { getPredictions, upsertPrediction } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { username, teams } = await request.json();

    if (!username || !teams || !Array.isArray(teams) || teams.length !== 4) {
      return NextResponse.json(
        { error: 'Invalid data. Username and exactly 4 teams are required.' },
        { status: 400 }
      );
    }

    await upsertPrediction(username, teams);
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

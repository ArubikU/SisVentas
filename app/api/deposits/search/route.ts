import { NextResponse } from 'next/server';
import { implementation } from '../../../lib/db/implementation';

export async function POST(request: Request) {
  try {
    const { key, query } = await request.json();

    if (!key) {
      return NextResponse.json({ error: 'Unauthorized', status: 401 }, { status: 401 });
    }

    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required', status: 400 }, { status: 400 });
    }

    const deposits = await implementation.searchDeposits(key, query);
    return NextResponse.json(deposits);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: 'Internal Server Error', status: 500 }, { status: 500 });
  }
}


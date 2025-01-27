import { NextResponse } from 'next/server';
import { implementation } from '../../../lib/db/implementation';

export async function POST(request: Request) {
  try {
    const { key, start, end } = await request.json();

    if (!key) {
      return NextResponse.json({ error: 'Unauthorized', status: 401 }, { status: 401 });
    }

    if (!start || !end) {
      return NextResponse.json({ error: 'Start and end parameters are required', status: 400 }, { status: 400 });
    }

    const bills = await implementation.getBillsByDateRange(key, new Date(start), new Date(end));
    return NextResponse.json(bills);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: 'Internal Server Error', status: 500 }, { status: 500 });
  }
}


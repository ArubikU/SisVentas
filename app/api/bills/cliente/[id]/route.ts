import { NextResponse } from 'next/server';
import { implementation } from '../../../../lib/db/implementation';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const { key } = await request.json();
    if (!key) {
      return NextResponse.json({ error: 'Unauthorized', status: 401 }, { status: 401 });
    }

    const bills = await implementation.getBillsByClientId(key, params.id);
    return NextResponse.json(bills);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error', status: 500 }, { status: 500 });
  }
}


import { NextResponse } from 'next/server';
import { implementation } from '../../lib/db/implementation';

export async function POST(request: Request) {
  const body = await request.json();
  const key = body.key;
  const { id, clientid,date, identifier,products } = body;
  const boleta = id && clientid && date && identifier && products ? { id, clientid, date, identifier, products } : null;
  if (!key) {
    return NextResponse.json({ error: 'Unauthorized', status: 401 }, { status: 401 });
  }

  try {
    if (boleta) {
      await implementation.createBill(key, boleta);
      return NextResponse.json({ message: 'Bill created successfully' });
    } else {
      const bills = await implementation.getBills(key);
      return NextResponse.json(bills);
    }
  } catch (error) {
    console.error('Error in bills route:', error);
    return NextResponse.json({ error: 'Internal Server Error', status: 500 }, { status: 500 });
  }
}


import { NextResponse } from 'next/server';
import { implementation } from '../../lib/db/implementation';

export async function POST(request: Request) {
  const body = await request.json();
  const key = body.key;
  const { id, clientid, currency,amount,changueamount,date,operationcode } = body;
  const deposito = id && clientid && currency && amount &&operationcode&& changueamount && date ? { id, clientid, currency, amount, changueamount, date,operationcode } : null;
  console.log(body);
  if (!key) {
    return NextResponse.json({ error: 'Unauthorized', status: 401 }, { status: 401 });
  }

  try {
    if (deposito) {
      await implementation.createDeposit(key, deposito);
      return NextResponse.json({ message: 'Deposit created successfully' });
    } else {
      const deposits = await implementation.getDeposits(key);
      return NextResponse.json(deposits);
    }
  } catch (error) {
    console.error('Error in deposits route:', error);
    return NextResponse.json({ error: 'Internal Server Error', status: 500 }, { status: 500 });
  }
}


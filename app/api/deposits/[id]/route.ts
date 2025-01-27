import { NextResponse } from 'next/server';
import { implementation } from '../../../lib/db/implementation';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { key, ...deposito } = await request.json();
    if (!key) {
      return NextResponse.json({ error: 'Unauthorized', status: 401 }, { status: 401 });
    }

    await implementation.updateDeposit(key, { ...deposito, id: params.id });
    return NextResponse.json({ message: 'Deposit updated successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error', status: 500 }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { key } = await request.json();
    if (!key) {
      return NextResponse.json({ error: 'Unauthorized', status: 401 }, { status: 401 });
    }
    await implementation.deleteDeposit(key, params.id);
    return NextResponse.json({ message: 'Deposit deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error', status: 500 }, { status: 500 });
  }
}


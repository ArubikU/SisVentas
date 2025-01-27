import { NextResponse } from 'next/server';
import { implementation } from '../../../lib/db/implementation';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { key, ...cliente } = await request.json();
    if (!key) {
      return NextResponse.json({ error: 'Unauthorized', status: 401 }, { status: 401 });
    }
    await implementation.updateClient(key, { ...cliente, id: params.id });
    return NextResponse.json({ message: 'Client updated successfully' });
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
    await implementation.deleteClient(key, params.id);
    return NextResponse.json({ message: 'Client deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error', status: 500 }, { status: 500 });
  }
}


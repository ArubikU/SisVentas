import { NextResponse } from 'next/server'
import { implementation } from '../../../lib/db/implementation'

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json();
  const { key, user } = body;

  if (!key) {
    return NextResponse.json({ error: 'Unauthorized', status: 401 }, { status: 401 });
  }

  try {
    await implementation.updateUser(key, { ...user, id: params.id });
    return NextResponse.json({ message: 'User updated successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error', status: 500 }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json();
  const { key } = body;

  if (!key) {
    return NextResponse.json({ error: 'Unauthorized', status: 401 }, { status: 401 });
  }

  try {
    await implementation.deleteUser(key, params.id);
    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error', status: 500 }, { status: 500 });
  }
}


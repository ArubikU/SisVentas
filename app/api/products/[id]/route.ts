import { NextResponse } from 'next/server';
import { implementation } from '../../../lib/db/implementation';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { key, ...producto } = await request.json();
    await implementation.updateProduct(key, { ...producto, id: params.id });
    return NextResponse.json({ message: 'Product updated successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error', status: 500 }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { key } = await request.json();
    await implementation.deleteProduct(key, params.id);
    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error', status: 500 }, { status: 500 });
  }
}


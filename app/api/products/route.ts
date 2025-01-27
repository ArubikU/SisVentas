import { NextResponse } from 'next/server';
import { implementation } from '../../lib/db/implementation';

export async function POST(request: Request) {
  const body = await request.json();
  
  const key = body.key;
  const { id, name, genericprice } = body;
  const producto = id && name && genericprice ? { id, name, genericprice } : null;
  if (!key) {
    return NextResponse.json({ error: 'Unauthorized', status: 401 }, { status: 401 });
  }

  try {
    if (producto) {
      await implementation.createProduct(key, producto);
      return NextResponse.json({ message: 'Product created successfully' });
    } else {
      const products = await implementation.getProducts(key);
      return NextResponse.json(products);
    }
  } catch (error) {
    console.error('Error in products route:', error);
    return NextResponse.json({ error: 'Internal Server Error', status: 500 }, { status: 500 });
  }
}


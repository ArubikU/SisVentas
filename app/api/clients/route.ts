import { NextResponse } from 'next/server';
import { implementation } from '../../lib/db/implementation';

export async function POST(request: Request) {
  const body = await request.json();
  const key = body.key;
  const { id, name, prices } = body;
  const cliente = id && name && prices ? { id, name, prices } : null;
  if (!key) {
    return NextResponse.json({ error: 'Unauthorized', status: 401 });
  }
  try {
    if (cliente) {
      await implementation.createClient(key, cliente);
      console.log("Client created successfully");
      return NextResponse.json({ message: 'Client created successfully' });
    } else {
      const clients = await implementation.getClients(key);
      console.log("Clients fetched successfully");
      return NextResponse.json(clients);
    }
  } catch (error) {
    console.error('Error in clients route:', error);
    return NextResponse.json({ error: 'Internal Server Error', status: 500 });
  }
}


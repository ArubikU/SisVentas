import { NextResponse } from 'next/server';
import { implementation } from '../../lib/db/implementation';

export async function POST(request: Request) {
  const body = await request.json();
  const { key } = body;
  const { id, email, password,tier } = body;
  const newUser = id && email && password && tier ? { id, email, password, tier } : null;

  if(newUser){
    try {
      await implementation.createUser(key, newUser);
      return NextResponse.json({ message: 'User created successfully' });
    } catch (error) {
      console.error('Error in users route:', error);
      return NextResponse.json({ error: 'Internal Server Error', status: 500 }, { status: 500 });
    }
  }

  if (!key) {
    return NextResponse.json({ error: 'Unauthorized', status: 401 }, { status: 401 });
  }

  try {
    const users = await implementation.getUsers(key);
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error in users route:', error);
    return NextResponse.json({ error: 'Internal Server Error', status: 500 }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const body = await request.json();
  const { key, user } = body;

  if (!key) {
    return NextResponse.json({ error: 'Unauthorized', status: 401 }, { status: 401 });
  }

  try {
    await implementation.createUser(key, user);
    return NextResponse.json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Error in users route:', error);
    return NextResponse.json({ error: 'Internal Server Error', status: 500 }, { status: 500 });
  }
}


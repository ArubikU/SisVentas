import { NextResponse } from 'next/server';
import { implementation } from '../../lib/db/implementation';

export async function POST(request: Request) {
  const { email, password } = await request.json()
  const key = await implementation.login(email, password);
  if (key) {
    const userData = await implementation.getData(key);
    console.log(userData)
    if (userData) {
      return NextResponse.json({ data: userData, key: key });
    }
  }

  return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
}


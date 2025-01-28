import { NextResponse } from 'next/server';
import { implementation } from '../../../lib/db/implementation';

export async function POST(request: Request) {
  try {
    // Parsear el cuerpo de la solicitud
    const body = await request.json();
    const { key, newPassword } = body;
    let { targetUser } = body;
    if (targetUser == "self") {
        targetUser = key;
    }
    // Validar que los datos requeridos están presentes
    if (!key || !targetUser || !newPassword) {
      return NextResponse.json(
        { error: 'Missing required fields: key, targetUser, or newPassword', status: 400 },
        { status: 400 }
      );
    }

    // Intentar cambiar la contraseña usando la implementación
    await implementation.changuePassword(key, targetUser, newPassword);

    // Respuesta exitosa
    return NextResponse.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error in changuePassword route:', error);

    // Manejo de errores

    return NextResponse.json(
      { error: 'Internal Server Error', status: 500 },
      { status: 500 }
    );
  }
}

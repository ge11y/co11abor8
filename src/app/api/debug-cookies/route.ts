import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('co11ab_session');
  
  return NextResponse.json({
    hasCookie: !!sessionToken,
    cookieValue: sessionToken?.value ? sessionToken.value.substring(0, 20) + '...' : null,
    allCookies: cookieStore.getAll().map(c => ({ name: c.name, value: c.value.substring(0, 20) + '...' })),
  });
}

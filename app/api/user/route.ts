import { getUser } from '@/lib/db/queries';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const user = await getUser(request);
  if (!user) {
    return new Response(null, { status: 401 });
  }
  return Response.json(user);
}

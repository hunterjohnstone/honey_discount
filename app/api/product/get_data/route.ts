import { getProductData } from '@/lib/db/queries';

export async function GET() {
  const user = await getProductData();
  return Response.json(user);
}

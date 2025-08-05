import { getProductData } from '@/lib/db/queries';

export async function GET() {
  const product = await getProductData();
  return Response.json(product);
}

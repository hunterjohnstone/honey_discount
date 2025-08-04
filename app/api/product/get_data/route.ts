import { getProductData } from '@/lib/db/queries';

export async function GET() {
  const product = await getProductData();
  console.log(product);
  return Response.json(product);
}

import { getAveAndNum } from "@/lib/db/queries";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    if (!productId) {
        return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
      }

    const user = await getAveAndNum(Number(productId));
    return Response.json(user);
};

import { db } from '@/lib/db/drizzle';
import { products } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function DELETE(
  request: Request
) {
  try {
      const { id } = await request.json();
      console.log("request is: ", request)
    // Validate the ID
    const productId = parseInt(id);
    if (isNaN(productId)) {
      return NextResponse.json(
        { error: 'Invalid product ID' },
        { status: 400 }
      );
    }

    // Delete the product
    const result = await db
      .delete(products)
      .where(eq(products.id, productId))
      .returning();

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, deletedProduct: result[0] },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
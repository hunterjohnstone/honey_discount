import { Promotion } from "@/app/(dashboard)/promotionForms/types";
import { db } from "@/lib/db/drizzle";
import { products } from "@/lib/db/schema";
import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function PUT(request: Request) {
    try {
      const result = await request.json() as Promotion;
  
      const updated = await db.update(products)
        .set({
          title: result.title,
          description: result.description,
          price: result.price.toString(),
          imageUrl: result.imageUrl,
          category: result.category,
          startDate: result.startDate,
          endDate: result.endDate,
          location: result.location,
          isActive: result.isActive,
          starAverage: result.starAverage.toString(),
          numReviews: result.numReviews,
          userId: result.userId,
          updatedAt: new Date(),
        })
        .where(sql`${products.id} = ${result.id}`)
        .returning();
  
      return NextResponse.json(updated[0], { status: 200 });
  
    } catch (error) {
      console.error('Error updating product:', error);
      return NextResponse.json(
        { error: 'Failed to update product' },
        { status: 500 }
      );
    }
  }
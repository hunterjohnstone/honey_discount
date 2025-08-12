import { Promotion } from '@/app/(dashboard)/promotionForms/types';
import { db } from '@/lib/db/drizzle';
import { products } from '@/lib/db/schema';
import { NextResponse } from 'next/server';


  export async function POST(request: Request) {
    try {
      const data = await request.json() as Promotion;

      console.log(data.mapLocation);
      await db.insert(products).values({
        title: data.title,
        description: data.description,
        price: data.price,
        oldPrice: data.oldPrice,
        mapLocation: data.mapLocation,
        imageUrl: data.imageUrl,
        category: data.category,
        startDate: data.startDate,
        endDate: data.endDate,
        discount: data.discount,
        longDescription: data.longDescription,
        location: data.location,
        isActive: true,
        userId: data.userId,
        website: data.website,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
  
      console.log("Successfully posted");
      
      // Return a success response
      return NextResponse.json(
        { message: "Product created successfully" },
        { status: 201 }
      );
  
    } catch (error) {
      console.log("Error posting offer to DB:", error);
      
      // Return an error response
      return NextResponse.json(
        { error: "Failed to create product" },
        { status: 500 }
      );
    }
  }
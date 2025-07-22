import { db } from '@/lib/db/drizzle';
import { products } from '@/lib/db/schema';
import { StringChunk } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

type Promotion = {
    id: string;
    title: string;
    description: string;
    price: number;
    imageUrl: string;
    category: string;
    startDate: string;
    endDate: string;
    location: string;
    isActive: boolean;
  };


  export async function POST(request: Request) {
    try {
      const data = await request.json() as Promotion;
      await db.insert(products).values({
        title: data.title,
        description: data.description,
        price: data.price,
        imageUrl: data.imageUrl,
        category: data.category,
        startDate: data.startDate,
        endDate: data.endDate,
        location: data.location,
        isActive: data.isActive,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
  
      console.log("Created successfully");
      
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
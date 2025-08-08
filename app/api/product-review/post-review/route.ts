import { db } from "@/lib/db/drizzle";
import { productReviews, products, User } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import type { NextRequest } from 'next/server'

type RequestType = {
    productId: number;
    rating: number;
    comment: string;
    userId: number;
}

export async function POST(request: NextRequest) {
    try {
        const data: RequestType = await request.json();
        
        // Validate required fields
        if (!data.productId || !data.rating || !data.comment || !data.userId) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        await db.insert(productReviews).values({
            productId: data.productId,
            userId: data.userId,
            rating: data.rating,
            comment: data.comment,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        console.log("Successfully posted to product_reviews table");

        // Get product object
        const productRow = await db.query.products.findFirst({
            where: eq(products.id, data.productId)
        });

        if (!productRow) {
            return NextResponse.json(
                { error: "Product not found" },
                { status: 404 }
            );
        }

        const prevTotal = productRow.numReviews;
        const prevAverage = parseFloat(productRow.starAverage);
        const newRating = data.rating;

        // Calculate new average
        const newAverage = (prevTotal * prevAverage + newRating) / (prevTotal + 1);

        await db.update(products)
            .set({
                numReviews: prevTotal + 1,
                starAverage: newAverage.toFixed(1),
                updatedAt: new Date()
            })
            .where(eq(products.id, data.productId));

        return NextResponse.json(
            { message: "Review created successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error creating product review:", error);
        return NextResponse.json(
            { error: "Failed to create product review" },
            { status: 500 }
        );
    }
}
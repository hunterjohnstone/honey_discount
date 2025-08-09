import { REVIEW_ERROR } from "@/app/(dashboard)/types";
import { db } from "@/lib/db/drizzle";
import { productReviews, products, User } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
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
                { 
                  success: false,
                  error: REVIEW_ERROR.MISSING_FIELD,
                  details: {
                    missingFields: [
                      ...(!data.productId ? ['productId'] : []),
                      ...(!data.rating ? ['rating'] : []),
                      ...(!data.comment ? ['comment'] : []),
                      ...(!data.userId ? ['userId'] : [])
                    ]
                  }
                },
                { status: 400 }
            );
        }

        const existingReview = await db.query.productReviews.findFirst({
            where: and(
                eq(productReviews.productId, data.productId),
                eq(productReviews.userId, data.userId)
            )
        });

        if (existingReview) {
            return NextResponse.json(
                { 
                  success: false, 
                  error: REVIEW_ERROR.COMMENT_ALREADY_LEFT,
                  details: {
                    existingReviewId: existingReview.id
                  }
                },
                { status: 409 }
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
            { 
              success: true,
              message: "Review created successfully" 
            },
            { status: 200 }
        );
    } catch (error) {
        // if (error instanceof PostgresError) {
        //     return NextResponse.json(
        //         { 
        //           success: false,
        //           error: "Database error",
        //           details: {
        //             code: error.code,
        //             message: error.message
        //           }
        //         },
        //         { status: 500 }
        //     );
        // }
        
        return NextResponse.json(
            { 
              success: false,
              error: "Internal server error",
              details: error instanceof Error ? error.message : String(error)
            },
            { status: 500 }
        );
    }
}

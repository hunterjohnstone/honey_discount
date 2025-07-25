import { db } from "@/lib/db/drizzle";
import { productReviews, User } from "@/lib/db/schema";
import { NextResponse } from "next/server";

type RequestType = {
    productId: number;
    rating: number;
    comment: string;
    userId: number;
}

export async function POST(request: Request) {
    try {
        const data : RequestType = await request.json();
        await db.insert(productReviews).values({
            productId: data.productId,
            userId: data.userId,
            rating: data.rating,
            comment: data.comment,
            createdAt: new Date(),
            updatedAt: new Date(),
        })
        console.log("Successfully posted");

        return NextResponse.json(
            { message: "message review created successfully"},
            { status: 201 }
        );
    } catch (error) {
        console.log("error posting at API: ", error);
        return NextResponse.json(
            { error: "Failed to create product review"},
            { status: 500 }
        );
    }
}
import { db } from "@/lib/db/drizzle";
import { productReviews, products, User } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

type RequestType = {
    productId: number;
    rating: number;
    comment: string;
    userId: number;
}

// 1. Post rating and comment information for given users in the productReviews table
// 2. Update the average star rating and the total reviews left
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
        console.log("Successfully posted to product_reviews table");

        //get product object
        const productRow = await db.query.products.findFirst({
            where: eq(products.id, data.productId)
        })

        if (!productRow) {
            return Error;
        } else {

            const prevTotal = productRow.numReviews;
            const prevAverage = parseFloat(productRow.starAverage); //can be string JIC
            const newRating = data.rating;

            // Calculate new average
            const newAverage = (prevTotal * prevAverage + newRating) / (prevTotal + 1);

            console.log("before setting the db update. new average is ", newAverage, " and the new total is is ", (prevTotal + 1));

            await db.update(products)
            .set({
                numReviews: prevTotal + 1,
                starAverage: newAverage.toFixed(1), //1 decimal place 
                updatedAt: new Date()
            })
            .where(eq(products.id, data.productId));

            console.log("after updating db with post request")

            console.log("updated new average column and number of reviews in products table");
        }


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
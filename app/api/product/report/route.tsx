import { db } from "@/lib/db/drizzle";
import { products } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import z from "zod";

export type ReportRequestType = {
    productId: number;
    userId: number;
    message: string;
}

const reportedObjectZod = z.object({
    id: z.number(), //id of the person reporting so we ensure they cant report twise
    report: z.string(),
}).array();
export type ReportedObject = z.infer<typeof reportedObjectZod>;

export async function PUT(request: Request) {
    try {
      const data = await request.json() as ReportRequestType;
  
      // Validate input data
      const inputSchema = z.object({
        productId: z.number(),
        userId: z.number(),
        message: z.string().min(1, "Report message cannot be empty")
      });
      const validatedInput = inputSchema.parse(data);
  
      // Get product with type safety
      const productRow = await db.query.products.findFirst({
        where: eq(products.id, validatedInput.productId),
        columns: {
          reported: true
        }
      });
  
      if (!productRow) {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        );
      }

      // Parse existing reports with validation
      let currentReports: ReportedObject;
      try {
        currentReports = reportedObjectZod.parse(
          productRow.reported ? JSON.parse(productRow.reported) : []
        );
      } catch (e) {
        currentReports = [];
      };
      
    // Check for duplicate reports from same user
      if (currentReports.some(report => report.id === validatedInput.userId)) {
        return NextResponse.json(
          { error: 'You have already reported this product' },
          { status: 400 },
        );
      };
  
      // Add new report
      const updatedReports = [
        ...currentReports,
        {
          id: validatedInput.userId,
          report: validatedInput.message
        }
      ];
      const yoyo = JSON.stringify(updatedReports);
  
      // Update with validated data
      const updated = await db.update(products)
        .set({
          reported: yoyo,
          updatedAt: new Date(),
        })
        .where(eq(products.id, validatedInput.productId))
        .returning();
  
      return NextResponse.json(updated[0], { status: 200 });
  
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Validation failed', details: error.errors },
          { status: 400 }
        );
      }
      console.error('Error updating product:', error);
      return NextResponse.json(
        { error: 'Failed to update product' },
        { status: 500 }
      );
    }
  }
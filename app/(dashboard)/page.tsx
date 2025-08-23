// app/discover/page.tsx

import { db } from '@/lib/db/drizzle';
import { asc } from 'drizzle-orm';
import { products } from '@/lib/db/schema';
import { sql } from 'drizzle-orm';
import DiscoverClient from './discoverClient';

// Remove the PageProps interface and use SearchParams instead
interface SearchParams {
  page?: string;
}

// Server-side data fetching
async function getData(page: number = 1, pageSize: number = 54) {
  const offset = (page - 1) * pageSize;
  
  try {
    // Fetch paginated products directly from database
    const promotions = await db.query.products.findMany({
      orderBy: asc(products.createdAt),
      limit: pageSize,
      offset: offset,
    });
    
    // Get total count for pagination
    const totalCountResult = await db.select({ count: sql<number>`count(*)` }).from(products);
    const totalItems = totalCountResult[0]?.count || 0;
    const totalPages = Math.ceil(totalItems / pageSize);

    // Parse reported field for each product
    const parseReported = (reported: string | null) => {
      try {
        return reported ? JSON.parse(reported) : [];
      } catch {
        return [];
      }
    };

    const parsedPromotions = promotions.map((product) => ({
      ...product,
      reported: parseReported(product.reported || "[]"),
      starAverage: parseFloat(product.starAverage),
    }));

    return {
      data: parsedPromotions,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
      },
    };
  } catch (error) {
    console.error('Error fetching promotions:', error);
    return {
      data: [],
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
      },
    };
  }
}

// Use the correct props structure for App Router
export default async function DiscoverPage({ 
  searchParams 
}: { 
  searchParams: Promise<SearchParams> | SearchParams 
}) {
  // Handle both Promise and non-Promise searchParams
  const params = searchParams instanceof Promise ? await searchParams : searchParams;
  const page = params.page ? parseInt(params.page) : 1;
  
  const promotionsData = await getData(page);
  
  return <DiscoverClient initialData={promotionsData} />;
}

// If you're using dynamic exports for older Next.js versions
export const dynamic = 'force-dynamic'; // Optional: if you need dynamic rendering
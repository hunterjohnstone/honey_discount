import { db } from '@/lib/db/drizzle';
import { asc, sql } from 'drizzle-orm';
import { products } from '@/lib/db/schema';
import { parseReported } from '@/lib/db/queries';
import DiscoverClient from './discoverClient';

interface PageProps {
  searchParams: { [key: string]: string | string[] | undefined };
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
    const parsedPromotions = promotions.map((product) => ({
        ...product,
        reported: parseReported(product.reported || "[]"),
        starAverage: parseFloat(product.starAverage)
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

export default async function DiscoverPage({ searchParams }: PageProps) {
  const page = typeof searchParams.page === 'string' ? parseInt(searchParams.page) : 1;
  const promotionsData = await getData(page);
  
  return <DiscoverClient initialData={promotionsData} />;
}
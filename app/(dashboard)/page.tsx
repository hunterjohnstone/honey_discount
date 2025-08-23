// app/discover/page.tsx
import { db } from '@/lib/db/drizzle';
import { asc } from 'drizzle-orm';
import { products } from '@/lib/db/schema';
import { sql } from 'drizzle-orm';
import DiscoverClient from './discoverClient';

// Server-side data fetching
async function getData(page: number = 1, pageSize: number = 54) {
  const offset = (page - 1) * pageSize;
  
  try {
    // Fetch paginated products directly from database
    const promotions = await db.query.products.findMany({
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

// CORRECT: searchParams is always a Promise in Next.js 14+ App Router
export default async function DiscoverPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  // Await the searchParams promise
  const params = await searchParams;
  const page = params.page ? parseInt(params.page) : 1;
  
  const promotionsData = await getData(page);
  
  return <DiscoverClient initialData={promotionsData} />;
}

// Optional: Generate metadata if needed
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = params.page ? parseInt(params.page) : 1;
  
  return {
    title: `Discover Promotions - Page ${page}`,
    description: 'Encuentra las últimas promociones y ofertas en Granada | Find the latest promotions and deals in Granada',
  };
}
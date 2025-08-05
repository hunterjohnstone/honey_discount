// app/api/product/pagination/route.ts
import { db } from '@/lib/db/drizzle'
import { NextResponse } from 'next/server'
import { count } from 'drizzle-orm'
import { products } from '@/lib/db/schema'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const pageSize = parseInt(searchParams.get('pageSize') || '10')
  const offset = (page - 1) * pageSize

  // Fetch paginated data and total count in parallel
  const [promotions, totalResult] = await Promise.all([
    db.query.products.findMany({
      limit: pageSize,
      offset: offset,
    }),
    db.select({ count: count() }).from(products)
  ])

  const totalCount = totalResult[0].count

  return NextResponse.json({
    data: promotions,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalCount / pageSize),
      totalItems: totalCount,
    }
  })
}
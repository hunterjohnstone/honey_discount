import { db } from '@/lib/db/drizzle';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // 1. Fetch only the necessary data for the sitemap
    const products = await db.query.products.findMany({
      columns: {
        id: true,
        updated_at: true, // Adjust to your actual column name
      }
    });

    // 2. Define your base static pages
    const staticPages = [
      {
        url: '/',
        lastmod: new Date().toISOString().split('T')[0], // Formats to YYYY-MM-DD
        changefreq: 'daily',
        priority: '1.0',
      }
    ];

    // 3. Map the dynamic offers to the sitemap format
    const productPages = products.map((product) => {
      return {
        url: `/${product.id}`, // Adjust this to match your actual URL structure
        lastmod: product.updated_at?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
        changefreq: 'weekly',
        priority: '0.7',
      };
    })

    // 4. Combine all URLs
    const allPages = [...staticPages, ...productPages];

    // 5. Generate the XML string
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        ${allPages
          .map((page) => {
            return `
              <url>
                <loc>https://www.spanishoffers.com${page.url}</loc>
                <lastmod>${page.lastmod}</lastmod>
                <changefreq>${page.changefreq}</changefreq>
                <priority>${page.priority}</priority>
              </url>
            `;
          })
          .join('')}
      </urlset>
    `;

    // 6. Return the XML response with correct headers
    return new NextResponse(sitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate', // Cache for 24 hours
      },
    });
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return new NextResponse('Error generating sitemap', { status: 500 });
  }
};
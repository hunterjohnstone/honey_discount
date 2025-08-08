import { desc, and, eq, isNull, StringChunk } from 'drizzle-orm';
import { db } from './drizzle';
import { activityLogs, products, teamMembers, teams, users } from './schema';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/session';
import { resumePluginState } from 'next/dist/build/build-context';
import { productReviews } from "./schema"; // Import your schema tables
import { number } from 'zod';
import { Promotion } from '@/app/(dashboard)/promotionForms/types';
import { NextRequest } from 'next/server';


export async function getUser(request?: NextRequest) {
  const cookieStore = request ? request.cookies : cookies();
  const sessionCookie = (await cookieStore).get('session');
  if (!sessionCookie || !sessionCookie.value) {
    return null;
  }
  try {
    const sessionData = await verifyToken(sessionCookie.value);
  if (
    !sessionData ||
    !sessionData.user ||
    typeof sessionData.user.id !== 'number'
  ) {
    return null;
  }

  if (new Date(sessionData.expires) < new Date()) {
    return null;
  }

  const user = await db
    .select()
    .from(users)
    .where(and(eq(users.id, sessionData.user.id), isNull(users.deletedAt)))
    .limit(1);

  if (user.length === 0) {
    return null;
  }

  return user[0];
    
  } catch (error) {
    console.error('Session verification failed:', error);
    return null;
  }
}

export async function getTeamByStripeCustomerId(customerId: string) {
  const result = await db
    .select()
    .from(teams)
    .where(eq(teams.stripeCustomerId, customerId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function updateTeamSubscription(
  teamId: number,
  subscriptionData: {
    stripeSubscriptionId: string | null;
    stripeProductId: string | null;
    planName: string | null;
    subscriptionStatus: string;
  }
) {
  await db
    .update(teams)
    .set({
      ...subscriptionData,
      updatedAt: new Date()
    })
    .where(eq(teams.id, teamId));
}

export async function getUserWithTeam(userId: number) {
  const result = await db
    .select({
      user: users,
      teamId: teamMembers.teamId
    })
    .from(users)
    .leftJoin(teamMembers, eq(users.id, teamMembers.userId))
    .where(eq(users.id, userId))
    .limit(1);

  return result[0];
}

export async function getActivityLogs() {
  const user = await getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  return await db
    .select({
      id: activityLogs.id,
      action: activityLogs.action,
      timestamp: activityLogs.timestamp,
      ipAddress: activityLogs.ipAddress,
      userName: users.name
    })
    .from(activityLogs)
    .leftJoin(users, eq(activityLogs.userId, users.id))
    .where(eq(activityLogs.userId, user.id))
    .orderBy(desc(activityLogs.timestamp))
    .limit(10);
}

export async function getTeamForUser() {
  const user = await getUser();
  if (!user) {
    return null;
  }

  const result = await db.query.teamMembers.findFirst({
    where: eq(teamMembers.userId, user.id),
    with: {
      team: {
        with: {
          teamMembers: {
            with: {
              user: {
                columns: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          }
        }
      }
    }
  });

  return result?.team || null;
};

//Need to transform reported string to readable array
interface ProductReport {
  id: number;
  report: string;
}

const parseReported = (reportedString: string) => {
  try {
    // Handle empty or invalid cases
    if (!reportedString || reportedString === '[]') return [];
    
    // Fix common string formatting issues
    const fixedString = reportedString
      .replace(/(\w+):/g, '"$1":')  // Add quotes around keys
      .replace(/'/g, '"')           // Replace single quotes with double
      .replace(/\\"/g, '"')         // Remove escape characters
      .replace(/object Object/g, ''); // Remove "object Object" text
    
    // Parse the JSON string
    const parsed = JSON.parse(`[${fixedString}]`) as ProductReport[];
    
    // Validate and transform the parsed data
    return parsed.map(item => ({
      ...item,
    })) as ProductReport[];
    
  } catch (error) {
    console.error('Failed to parse reported data:', error);
    return [];
  }
}


export async function getProductData() {
  const results = await db.query.products.findMany();
  const data = results.map((product) => {
    return {
      ...product,
      reported: parseReported(product.reported || "[]")
    }
  })
  return data;
}


export async function getProductReviewsWithUsers(productId: number) {

  const reviews = await db
    .select({
      userName: users.name,
      comment: productReviews.comment,
      date: productReviews.createdAt,
      rating: productReviews.rating // Optional: include rating if needed
    })
    .from(productReviews)
    .where(eq(productReviews.productId, productId))
    .leftJoin(users, eq(productReviews.userId, users.id));

  return reviews;
};

// export async function getProductReviewData(productId: number) {
//   const review = await db.({
//     numReviews: products.numReviews,
//     ave: products.starAverage
//   }).from(products).where(eq(products.id, productId));
//   return review;
// };

export async function getAveAndNum(productId: number) {
  const data = await db.query.products.findFirst({ where: eq(products.id, productId)});
  return data;
};
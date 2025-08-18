import { sql } from 'drizzle-orm';
import { stripe } from '../payments/stripe';
import { db } from './drizzle';
import { users, teams, teamMembers, products } from './schema';
import { hashPassword } from '@/lib/auth/session';

async function createStripeProducts() {
  console.log('Creating Stripe products and prices...');

  const baseProduct = await stripe.products.create({
    name: 'Base',
    description: 'Base subscription plan',
  });

  await stripe.prices.create({
    product: baseProduct.id,
    unit_amount: 800, // $8 in cents
    currency: 'usd',
    recurring: {
      interval: 'month',
      trial_period_days: 7,
    },
  });

  const plusProduct = await stripe.products.create({
    name: 'Plus',
    description: 'Plus subscription plan',
  });

  await stripe.prices.create({
    product: plusProduct.id,
    unit_amount: 1200, // $12 in cents
    currency: 'usd',
    recurring: {
      interval: 'month',
      trial_period_days: 7,
    },
  });

  console.log('Stripe products and prices created successfully.');
}

const granadaLocations = [
  { name: "Alhambra", lng: -3.588371, lat: 37.176084 },
  { name: "Cathedral", lng: -3.599711, lat: 37.176487 },
  { name: "Albaicín", lng: -3.592627, lat: 37.180961 }
];

// Convert coordinates to PostgreSQL point format ie., ({"x": "0.1281"}, {"y": "0.1279"})
function toPoint(lng: number, lat: number) {
  return sql`point(${lng}, ${lat})`;
}

async function createOffers() {
  console.log('seeding some offers to db...');

  await db.insert(products).values([
    {
      title: 'Weekend Brunch Special',
      description: '20% off all brunch stuff',
      price: "8",
      imageUrl: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      category: 'food',
      startDate: '2023-06-01',
      endDate: '2026-06-30',
      oldPrice: '10',
      location: 'granada',
      mapLocation: toPoint(-3.588, 37.176),
      isActive: true,
      userId: 1,
      longDescription: "The first light of dawn spills over the horizon, painting the sky in soft hues of pink and gold, as the farmer’s market begins to stir to life. The air is crisp and carries the earthy scent of dew-kissed vegetables, freshly baked bread, and bundles of herbs still damp from the morning harvest. Wooden stalls, weathered by seasons of use, are arranged in neat rows, their canopies fluttering slightly in the gentle breeze. Vendors, their hands calloused from years of labor, meticulously arrange their produce—plump tomatoes gleaming like rubies, leafy greens stacked in vibrant pyramids, and baskets of berries so ripe they seem to glow under the rising sun.",
      discount: "10%"
    },
    {
      title: 'Summer Fitness Package',
      description: '3 months of gym membership half price.',
      price: "45",
      imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      category: 'fitness',
      oldPrice: '55',
      startDate: '2023-06-15',
      endDate: '2026-08-31',
      mapLocation: toPoint(-3.588371, 37.176084),
      location: 'sevilla',
      isActive: true,
      userId: 1,
      discount: "30%",
      longDescription: "At the center of the square, a coffee cart exhales fragrant steam, its proprietor grinding beans with rhythmic precision. The rich, smoky aroma mingles with the sweetness of pastries from the neighboring baker, whose flaky croissants and crusty sourdough loaves are still warm from the oven. Nearby, a flower seller drapes garlands of lavender and sunflowers over her stall, their petals trembling as she adjusts them. Honeybees, drawn by the blossoms, hover lazily in the air, their hum blending with the murmur of early shoppers. \n The market is a symphony of sounds—the crunch of gravel underfoot, the clink of glass jars filled with preserves, the occasional burst of laughter between farmers who’ve known each other for decades. A fiddler tunes his instrument at the far end, his notes tentative but warm, promising lively tunes once the crowd thickens. Children dart between stalls, their fingers sticky from stolen samples of fruit, while elderly couples move slowly, inspecting each peach and cucumber with practiced eyes.",
    },
    {
      title: 'Tech Gadgets Sale',
      description: '30% off electronics.',
      price: "100",
      oldPrice: "133",
      imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      category: 'electronics',
      startDate: '2025-06-10',
      mapLocation: toPoint(-3.591543,	37.182452),
      endDate: '2023-06-20',
      location: 'madrid',
      isActive: true,
      userId: 1,
      discount: "25%",
      longDescription: "As the sun climbs higher, the market swells with energy. A fishmonger shouts prices over the din, his ice-packed counter glistening with silvery mackerel and rosy fillets of salmon. A cheesemonger offers slivers of aged gouda to passersby, its nutty richness lingering on the tongue. The scent of sizzling sausages from a food truck cuts through the sweetness, drawing a line of hungry patrons.",
    }
  ])
}

async function seed() {
  const email = 'test@test.com';
  const password = 'admin123';
  const passwordHash = await hashPassword(password);

  const [user] = await db
    .insert(users)
    .values([
      {
        email: email,
        passwordHash: passwordHash,
        role: "owner",
      },
    ])
    .returning();

  console.log('Initial user created.');

  const [team] = await db
    .insert(teams)
    .values({
      name: 'Test Team',
    })
    .returning();

  await db.insert(teamMembers).values({
    teamId: team.id,
    userId: user.id,
    role: 'owner',
  });

  await createStripeProducts();
  await createOffers()
}

seed()
  .catch((error) => {
    console.error('Seed process failed:', error);
    process.exit(1);
  })
  .finally(() => {
    console.log('Seed process finished. Exiting...');
    process.exit(0);
  });

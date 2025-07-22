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

async function createOffers() {
  console.log('seeding some offers to db...');

  await db.insert(products).values([
    {
      title: 'Weekend Brunch Special',
      description: '20% off all brunch stuff',
      price: 25,
      imageUrl: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      category: 'food',
      startDate: '2023-06-01',
      endDate: '2023-06-30',
      location: 'granada',
      isActive: true,
    },
    {
      title: 'Summer Fitness Package',
      description: '3 months of gym membership half price.',
      price: 120,
      imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      category: 'fitness',
      startDate: '2023-06-15',
      endDate: '2023-08-31',
      location: 'sevilla',
      isActive: true,
    },
    {
      title: 'Tech Gadgets Sale',
      description: '30% off electronics.',
      price: 299,
      imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      category: 'electronics',
      startDate: '2023-06-10',
      endDate: '2023-06-20',
      location: 'madrid',
      isActive: true,
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

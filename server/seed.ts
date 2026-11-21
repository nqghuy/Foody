import 'dotenv/config';
import pg from 'pg';
import { INITIAL_REVIEWS } from '../src/data/hanoiRestaurants';

if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('YOUR_DATABASE_PASSWORD')) {
  throw new Error('Set the real database password in the repository root .env file before running db:seed');
}

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

try {
  for (const review of INITIAL_REVIEWS) {
    await pool.query(
      `INSERT INTO reviews (id, restaurant_id, restaurant_name, author_name, author_title,
        rating, ratings_breakdown, content, photos, visit_date, helpful_count, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       ON CONFLICT (id) DO NOTHING`,
      [review.id, review.restaurantId, review.restaurantName || null, review.authorName,
        review.authorTitle || null, review.rating, JSON.stringify(review.ratingsBreakdown),
        review.content, review.photos, review.visitDate, review.helpfulCount, review.createdAt],
    );
  }
  console.log(`Seeded ${INITIAL_REVIEWS.length} sample reviews (existing rows kept).`);
} finally {
  await pool.end();
}

import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import pg from 'pg';

const { Pool } = pg;
const app = express();
const port = Number(process.env.PORT || 3001);
const connectionString = process.env.DATABASE_URL;
const pool = connectionString
  ? new Pool({ connectionString, ssl: { rejectUnauthorized: false }, max: 5 })
  : null;

function databaseErrorMessage(error: unknown) {
  const code = (error as { code?: string })?.code;
  if (code === '42P01') return 'Database schema is missing';
  if (code === '28P01') return 'Database password is incorrect';
  return 'Database connection or query failed';
}

app.use(express.json({ limit: '1mb' }));

app.get('/api/health', async (_req, res) => {
  if (!pool) return res.status(503).json({ error: 'DATABASE_URL is not configured' });
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true });
  } catch (error) {
    res.status(503).json({ error: databaseErrorMessage(error) });
  }
});

app.get('/api/community', async (req, res) => {
  if (!pool) return res.status(503).json({ error: 'DATABASE_URL is not configured' });
  const visitorId = String(req.query.visitorId || '');
  if (!/^[0-9a-f-]{36}$/i.test(visitorId)) return res.status(400).json({ error: 'Invalid visitorId' });
  try {
    const [reviews, bookmarks] = await Promise.all([
      pool.query(`SELECT id, restaurant_id AS "restaurantId", restaurant_name AS "restaurantName",
        author_name AS "authorName", author_title AS "authorTitle", rating::float8 AS rating,
        ratings_breakdown AS "ratingsBreakdown", content, photos,
        to_char(visit_date, 'YYYY-MM-DD') AS "visitDate", helpful_count AS "helpfulCount",
        to_char(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD') AS "createdAt"
        FROM reviews ORDER BY created_at DESC`),
      pool.query('SELECT restaurant_id FROM bookmarks WHERE visitor_id = $1', [visitorId]),
    ]);
    res.json({ reviews: reviews.rows, bookmarkedIds: bookmarks.rows.map((row) => row.restaurant_id) });
  } catch (error) {
    console.error('Failed to load community data', error);
    res.status(500).json({ error: databaseErrorMessage(error) });
  }
});

app.post('/api/reviews', async (req, res) => {
  if (!pool) return res.status(503).json({ error: 'DATABASE_URL is not configured' });
  const body = req.body;
  if (!body || typeof body.restaurantId !== 'string' || typeof body.authorName !== 'string' ||
      typeof body.content !== 'string' || body.content.length > 5000 ||
      !Number.isFinite(Number(body.rating)) || Number(body.rating) < 1 || Number(body.rating) > 10 ||
      !body.ratingsBreakdown || !Array.isArray(body.photos)) {
    return res.status(400).json({ error: 'Review data is invalid' });
  }
  const id = `rev-${randomUUID()}`;
  try {
    const result = await pool.query(
      `INSERT INTO reviews (id, restaurant_id, restaurant_name, author_name, author_title,
        rating, ratings_breakdown, content, photos, visit_date)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING id, restaurant_id AS "restaurantId", restaurant_name AS "restaurantName",
        author_name AS "authorName", author_title AS "authorTitle", rating::float8 AS rating,
        ratings_breakdown AS "ratingsBreakdown", content, photos,
        to_char(visit_date, 'YYYY-MM-DD') AS "visitDate", helpful_count AS "helpfulCount",
        to_char(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD') AS "createdAt"`,
      [id, body.restaurantId, body.restaurantName || null, body.authorName.trim(), body.authorTitle || null,
        body.rating, JSON.stringify(body.ratingsBreakdown), body.content.trim(), body.photos, body.visitDate],
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Failed to save review', error);
    res.status(500).json({ error: databaseErrorMessage(error) });
  }
});

app.post('/api/reviews/:reviewId/helpful', async (req, res) => {
  if (!pool) return res.status(503).json({ error: 'DATABASE_URL is not configured' });
  try {
    const result = await pool.query(
      'UPDATE reviews SET helpful_count = helpful_count + 1 WHERE id = $1 RETURNING helpful_count AS "helpfulCount"',
      [req.params.reviewId],
    );
    if (!result.rowCount) return res.status(404).json({ error: 'Review not found' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Failed to update helpful count', error);
    res.status(500).json({ error: 'Failed to update helpful count' });
  }
});

app.put('/api/bookmarks/:restaurantId', async (req, res) => {
  if (!pool) return res.status(503).json({ error: 'DATABASE_URL is not configured' });
  const { visitorId, bookmarked } = req.body || {};
  if (!/^[0-9a-f-]{36}$/i.test(String(visitorId || '')) || typeof bookmarked !== 'boolean') {
    return res.status(400).json({ error: 'Bookmark data is invalid' });
  }
  try {
    if (bookmarked) {
      await pool.query(
        'INSERT INTO bookmarks (visitor_id, restaurant_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [visitorId, req.params.restaurantId],
      );
    } else {
      await pool.query('DELETE FROM bookmarks WHERE visitor_id = $1 AND restaurant_id = $2', [visitorId, req.params.restaurantId]);
    }
    res.json({ ok: true });
  } catch (error) {
    console.error('Failed to update bookmark', error);
    res.status(500).json({ error: 'Failed to update bookmark' });
  }
});

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(currentDir, '../dist');
app.use(express.static(distDir));
app.get('*', (_req, res) => res.sendFile(path.join(distDir, 'index.html')));

app.listen(port, () => console.log(`API listening on http://localhost:${port}`));

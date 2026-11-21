CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  restaurant_id TEXT NOT NULL,
  restaurant_name TEXT,
  author_name TEXT NOT NULL,
  author_title TEXT,
  rating NUMERIC(3, 1) NOT NULL CHECK (rating BETWEEN 1 AND 10),
  ratings_breakdown JSONB NOT NULL,
  content TEXT NOT NULL,
  photos TEXT[] NOT NULL DEFAULT '{}',
  visit_date DATE NOT NULL,
  helpful_count INTEGER NOT NULL DEFAULT 0 CHECK (helpful_count >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS reviews_restaurant_created_idx
  ON reviews (restaurant_id, created_at DESC);

CREATE TABLE IF NOT EXISTS bookmarks (
  visitor_id UUID NOT NULL,
  restaurant_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (visitor_id, restaurant_id)
);

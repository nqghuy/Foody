# Hà Nội Vị Ký

React/Vite frontend with an Express API and a shared Supabase PostgreSQL database.

## Connect a Supabase project

1. In the repository root (`KHDV/.env`), put the database password into `DATABASE_URL`. The file is already provided from `.env.example`; `src/.env` is not read by the backend. Use the **Shared pooler, Session mode** connection string for local development. If the password contains reserved characters, percent-encode them in the URI.
2. Install dependencies with `npm install`.
3. Run `npm run db:seed` once. It creates the tables from `server/schema.sql` and adds the sample reviews. You can also run `npm run db:migrate` separately.
4. Start both the API and frontend with `npm run dev`; open `http://localhost:3000`.

Each developer uses their own local `.env` file with the same Supabase connection string. `.env` is ignored by Git. Do not put the database password in frontend variables such as `VITE_*`.

The API stores reviews, helpful counts, and bookmarks. Bookmarks are keyed by a browser-generated visitor ID, so they persist for that browser without requiring user accounts. Restaurant catalog data remains in `src/data/hanoiRestaurants.ts` for now.

The backend is a simple shared development setup. It does not include accounts, moderation, or rate limiting yet; add those before exposing write endpoints publicly.

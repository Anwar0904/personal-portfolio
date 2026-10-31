# My Personal Portfolio

## Requirements

- Node.js `20.19+` or `22.12+`
- npm (included with Node.js)
- A PostgreSQL database
- A Google OAuth 2.0 web client

## Install and run locally

Run these commands from the `app` directory:

```sh
npm ci
cp .env.example .env
```

In Google Cloud Console, create an OAuth 2.0 Client ID with application type
**Web application**. Add
`http://localhost:3000/api/oauth/google/callback` as an authorized redirect URI.
Then set `SESSION_SECRET`, `DATABASE_URL`, `GOOGLE_CLIENT_ID`, and
`GOOGLE_CLIENT_SECRET` in `.env`. Set `GOOGLE_REDIRECT_URI` to that exact
callback URL. `DATABASE_URL` must be a PostgreSQL connection URL. If your
database provider requires TLS, include its required SSL parameters. URL-encode
special characters in the database username and password. Set `OWNER_EMAIL` to
the exact, verified Google account that should own the portfolio. That account
is promoted to `super_admin` at sign-in. Existing admin dashboard permissions
are also granted to `super_admin` accounts. After changing `OWNER_EMAIL`,
restart the app, then sign out and sign in again to apply the role.

Create the database schema and initial portfolio content:

```sh
npm run db:push
npm run db:seed
```

Start the full-stack development server:

```sh
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The frontend is served by
Vite and API requests are handled by the Hono development server. Google sign-in
and database-backed features require the corresponding credentials and a
reachable PostgreSQL database.

## Production

```sh
npm run build
npm start
```

The build writes the frontend to `dist/public` and the API server to
`dist/boot.js`. `npm start` runs the API server in production mode and serves
the built frontend. Configure the production Google OAuth client with your
deployed callback URL (`https://your-domain/api/oauth/google/callback`), set
`GOOGLE_REDIRECT_URI` to exactly that URL, and provide the required environment
variables to the process.

## Deploy to Vercel

The repository includes `vercel.json` for the Vite build output and client-side
route fallback. The Hono API is deployed as a Vercel function; local API source
is kept in `server/` so it is not exposed as individual function routes.

Import the repository into Vercel and deploy with the defaults from
`vercel.json`. Add these environment variables to the Vercel project for
Production (and Preview if those deployments need the API):

- `SESSION_SECRET` — a random secret of at least 32 bytes
- `DATABASE_URL` — a PostgreSQL connection URL
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REDIRECT_URI` — `https://your-domain/api/oauth/google/callback`
- `OWNER_EMAIL` — the verified Google account that owns the portfolio

Add the deployed callback URL to the Google OAuth client's authorized redirect
URIs, then run `npm run db:push` and `npm run db:seed` against the production
database from a trusted environment. Vercel functions are stateless, so session
and application data must be stored in PostgreSQL; do not rely on local files
for persistent state.

## Other npm commands

| Command | Purpose |
| --- | --- |
| `npm run check` | Type-check the TypeScript projects |
| `npm run lint` | Run ESLint |
| `npm test` | Run the Vitest suite |
| `npm run db:push` | Apply the Drizzle schema to the configured PostgreSQL database |
| `npm run db:generate` | Generate Drizzle migrations from schema changes |
| `npm run db:migrate` | Apply generated Drizzle migrations |
| `npm run db:seed` | Add the starter portfolio content to an empty database |

Database commands require `DATABASE_URL`. `db:push` synchronizes the configured
PostgreSQL database with the current schema; use it only with a database you
intend to modify.

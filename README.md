# Auction App – Local run

## Requirements

- **Node.js 20+**
- **pnpm**
- **Docker Desktop**
- **Git**

## Environmental variables (env example)

```dotenv
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/livelicitdb?schema=public"

# NextAuth
AUTH_SECRET="change-me"

# Auth0
AUTH0_CLIENT_ID=""
AUTH0_CLIENT_SECRET=""
AUTH0_ISSUER="" # e.g., https://your-tenant.eu.auth0.com

# Google
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Pusher.com
PUSHER_APP_ID=""
PUSHER_KEY=""
PUSHER_SECRET=""
PUSHER_CLUSTER=""

NEXT_PUBLIC_PUSHER_KEY=""
NEXT_PUBLIC_PUSHER_CLUSTER=""

# Vercel Blob token
BLOB_READ_WRITE_TOKEN=""
```

## Creating database environment in Docker based on docker-compose.yml

```bash
docker compose up -d db
```

## Installing dependencies, Prisma migration

```bash
pnpm i
pnpm prisma migrate dev
```

## Seeding test database

```bash
pnpm seed
```

## Running the app

```bash
pnpm dev
```

## Checks before pushing to remote repository

```bash
pnpm lint
pnpm typecheck
pnpm test
```

## Database Studio - visual database in the browser

```bash
pnpm db:studio
```

## Bundle Analyzer

```bash
pnpm analyze
```

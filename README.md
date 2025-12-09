# Auction App – Helyi futtatás

## Előfeltételek

- **Node.js 20+** (ajánlott: nvm)
- **pnpm**
- **Docker Desktop** (Compose támogatással)
- **Git**

## Környezeti változók (env példa)

```dotenv
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/livelicitdb?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="change-me"


# Auth0
AUTH0_CLIENT_ID=""
AUTH0_CLIENT_SECRET=""
AUTH0_ISSUER="" # e.g., https://your-tenant.eu.auth0.com

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

## Adatbázis indítása Dockerben

```bash
docker compose up -d db
```

> Az adatbázis ezután a `localhost:5433` címen érhető el, alapértelmezett felhasználó/jelszó: `postgres` / `postgres`.

## Függőségek, Prisma migrációk

A DB-nek futnia kell az alábbi parancsok előtt.

```bash
pnpm i
pnpm prisma migrate dev
```

## Projekt indítása

```bash
pnpm dev
```

## Bundle Analyzer futáshoz packages.json fájlban meg kell változtatni build scriptet:

"scripts": {
"build": "next build --webpack"
}

```bash
pnpm build
```

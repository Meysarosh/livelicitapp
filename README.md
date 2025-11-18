# Auction App – Helyi futtatás (rövid)

## Előfeltételek

- **Node.js 20+** (ajánlott: nvm)
- **pnpm**
- **Docker Desktop** (Compose támogatással)
- **Git**

## Környezeti változók (env példa)

Másold az alábbi tartalmat `.env` fájlba (a valódi titkokat ne committold).

```dotenv
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/livelicitdb?schema=public"


# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="change-me"


# Auth0 (enable later)
AUTH0_CLIENT_ID=""
AUTH0_CLIENT_SECRET=""
AUTH0_ISSUER="" # e.g., https://your-tenant.eu.auth0.com
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

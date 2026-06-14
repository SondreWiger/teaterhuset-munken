# Teaterhuset Munken

Barne- og ungdomsteater i Larvik, Norge. Platform for å selge tilgang til vår portefølje av teaterforestillinger.

## Tech Stack

- **Next.js 16** (App Router + Turbopack)
- **Tailwind CSS v4**
- **Supabase** (Auth + Database + RLS)
- **PayPal + Vipps** betaling
- **QR-koder** for rabatt/gratis tilgang

## Kom i gang

```bash
npm install
npm run dev
```

Åpne [http://localhost:3000](http://localhost:3000).

## Miljøvariabler

Kopier `.env.example` til `.env.local` og fyll inn:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_PAYPAL_CLIENT_ID` (valgfritt)

## Database

Kjør migreringene i Supabase SQL Editor:

1. `supabase/migrations/001_init.sql`
2. `supabase/migrations/002_add_show_year.sql`
3. `supabase/migrations/003_add_roles.sql`
4. `supabase/migrations/004_add_favorites.sql`

## Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/din-bruker/teaterhuset-munken)

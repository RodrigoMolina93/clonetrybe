# PUMM — Phase 0

PUMM is a multi-tenant SaaS foundation for data-driven creative strategy. This phase includes authentication, organization onboarding, tenant-safe access, a protected dashboard, and settings. Advertising integrations, analysis, AI reports, billing, and scheduled jobs are intentionally deferred.

## Architecture

- Next.js 16 App Router with TypeScript, Server Components, and Server Actions.
- Supabase Auth with cookie-based SSR through `@supabase/ssr`.
- PostgreSQL migrations and Row Level Security as the authorization boundary.
- Domain logic under `src/features`, reads under `src/repositories`, and access guards under `src/services`.
- Spanish (`es-AR`) user-facing copy centralized in `src/locales/es-AR.json`.
- Tailwind CSS 4 and a small set of owned shadcn/ui components.

The protected product lives under `/app`. Users create one initial organization during onboarding. Organization roles are `OWNER` and `MEMBER`; owners may update organization settings, while members have read-only organization access. Direct membership mutations are not granted to browser users.

## CloneTrybe archive

The complete pre-pivot code is preserved by the `trybe-phase2-archive` Git tag. Its Supabase migrations, pgTAP tests, and local seed are additionally retained under `supabase/archive/trybe/` for audit purposes. They are not loaded by the PUMM migration workflow.

The CloneTrybe Supabase and Vercel projects must remain untouched. This branch is deliberately unlinked from the legacy Supabase project.

## Prerequisites

- Node.js 20.9 or newer
- npm
- Supabase CLI
- Docker only for the optional local database suite

## Environment variables

Copy `.env.example` to `.env.local`. Never commit local environment files.

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | PUMM Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Browser-safe PUMM publishable key |
| `NEXT_PUBLIC_APP_URL` | Canonical application URL used for auth redirects |
| `PLAYWRIGHT_BASE_URL` | Optional deployed URL for Playwright |
| `PUMM_SUPABASE_PROJECT_REF` | Guard value for remote type generation and integration tests |

No service-role key is required by the application or committed tooling.

## Local setup

```bash
npm ci
cp .env.example .env.local
npm run dev
```

For a local Supabase database:

```bash
supabase start
supabase db reset
supabase test db
```

The local seed creates synthetic `owner@pumm.local` and `member@pumm.local` users with the documented local-only password `LocalPassword123`. Never apply `supabase/seed.sql` to a hosted environment.

## Clean PUMM staging project

Create a separate Supabase project before remote validation. Do not link this branch to the CloneTrybe project.

```bash
export PUMM_SUPABASE_PROJECT_REF='<approved-pumm-project-ref>'
supabase link --project-ref "$PUMM_SUPABASE_PROJECT_REF"
supabase migration list --linked
supabase db push --dry-run
supabase db push
npm run db:types:staging
```

Inspect the dry run before applying. Never use `supabase db reset --linked`.

Configure Supabase Auth with the future PUMM Vercel URL as Site URL and `<PUMM_URL>/auth/confirm` as an exact redirect URL. A local `http://localhost:3000/auth/confirm` redirect may be added for development.

## Verification

Always runnable and used by GitHub Actions:

```bash
npm run verify
```

Local database suite:

```bash
npm run test:db
```

Remote tenant isolation after the PUMM project exists:

```bash
PUMM_SUPABASE_PROJECT_REF='<approved-ref>' npm run test:integration:staging
```

Remote browser validation after a dedicated PUMM Vercel deployment exists:

```bash
PLAYWRIGHT_BASE_URL='https://<pumm-staging-url>' npm run test:e2e:staging
```

## Deployment

Create a separate Vercel project connected to the pivot branch during validation. Configure the three public application variables there, validate authentication and organization isolation, and only then decide whether to rename the GitHub repository or promote PUMM to `main`. Do not reuse or rename the existing CloneTrybe deployment before validation.

## Phase 0 scope

Implemented: registration, login, logout, session refresh, organization onboarding, owner/member authorization, protected dashboard, profile settings, organization settings, RLS, CI, and test foundations.

Deferred: Meta Ads, TikTok Ads, Google Ads, AppLovin, GA4, Shopify, Tiendanube, Apify, Cloudflare R2, Gemini, AI reports, weekly scheduling, subscriptions, credits, chat, ad creation, campaign management, creator marketplace, commissions, and payments.

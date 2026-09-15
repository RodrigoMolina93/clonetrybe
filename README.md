# Nexo — Phase 1

Production-oriented creator commerce platform for Argentina. Phase 1 extends the validated identity and multi-tenant foundation with Programs, Briefs, creator applications, invitations, and memberships.

## Development workflow

The primary workflow is remote-staging-first:

```text
main → GitHub → Vercel → Supabase Staging
```

The Vercel production target currently represents the staging application. There is intentionally no final production Supabase project or customer data yet.

Local Supabase configuration remains available under `supabase/`, but Docker is optional and is not required for the always-runnable checks, GitHub CI, remote deployment, or remote E2E.

## Architecture

- Next.js 16 App Router, TypeScript, React Server Components, and Server Actions.
- Supabase Auth with cookie-based SSR through `@supabase/ssr`.
- PostgreSQL migrations and Row Level Security as the authorization boundary.
- Domain code in `src/features`, data reads in `src/repositories`, and authorization in `src/services`.
- User-facing copy centralized in `src/locales/es-AR.json`.
- Tailwind CSS 4 and a minimal set of owned shadcn/ui components.

`/marca`, `/creator`, and `/admin` verify the authenticated role on the server. `src/proxy.ts` refreshes cookies and performs an optimistic unauthenticated redirect; server checks and RLS remain authoritative. The browser receives only the public Supabase URL and publishable key.

The Programs domain lives in `src/features/programs`. Route components coordinate rendering only; Zod schemas validate inputs, repositories encapsulate reads, Server Actions authenticate every mutation, and PostgreSQL functions own transactional membership changes.

## Prerequisites

- Node.js 20.9 or newer
- npm
- Supabase CLI authenticated with `supabase login`
- GitHub CLI authenticated with `gh auth login` when pushing from the terminal
- Vercel CLI or Git integration when deploying

Docker is required only for the optional local database suite.

## Environment variables

Create `.env.local` from `.env.example`. Local files are ignored by Git.

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase staging project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Browser-safe staging publishable key |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` locally; canonical Vercel staging URL online |
| `PLAYWRIGHT_BASE_URL` | Optional deployed URL for remote E2E |

Never use a service-role key in a `NEXT_PUBLIC_` variable. Vercel values belong in Project Settings or `vercel env`, not committed files.

## Supabase staging workflow

Committed migrations are the schema source of truth. Link and inspect before applying:

```bash
supabase login
supabase link --project-ref bwctmomuthziyjaumjep
supabase migration list --linked
supabase db push --dry-run
supabase db push
```

Do not run `supabase db reset --linked`. `supabase db push` does not apply `supabase/seed.sql` unless explicitly requested; never use `--include-seed` for staging.

After the remote migration is applied, generate TypeScript types from the linked schema:

```bash
npm run db:types:staging
npm run typecheck
```

The generation script writes to a temporary file and preserves existing types if generation fails.

## Staging test users

There is deliberately no automatic privileged staging seed. This avoids committing or handling a service-role credential solely for fixture creation.

Use this minimal procedure:

1. Register one Brand and one Creator through the deployed UI and complete both onboarding flows.
2. Create a third test user through Supabase Auth or the application.
3. In the Supabase SQL Editor, promote only that known test identity:

```sql
update public.profiles
set user_type = 'ADMIN'
where id = (select id from auth.users where email = 'YOUR_CONTROLLED_ADMIN_TEST_EMAIL');
```

This modifies staging test data only; it does not create schema drift or expose privileged credentials.

The local-only `supabase/seed.sql` remains available for future Docker-based work and must not be applied remotely.

## Verification

### Always runnable

These checks require no database and run in GitHub Actions on pull requests and pushes to `main`:

```bash
npm run typecheck
npm run lint
npm test
npm run build
# or all together
npm run verify
```

### Local database suite

Optional; requires Docker and local Supabase:

```bash
supabase start
supabase db reset
supabase test db
```

The pgTAP suite keeps the Phase 0 isolation coverage and adds Program creation/discovery, cross-organization denial, application and invitation authorization, atomic/idempotent membership creation, and rejection of direct membership forgery.

### Remote staging E2E

Playwright does not start a local server when `PLAYWRIGHT_BASE_URL` is set:

```bash
PLAYWRIGHT_BASE_URL=https://clonetrybe.vercel.app npm run test:e2e:staging
```

The tests create unique synthetic Brand and Creator accounts. In addition to Phase 0 auth checks, they cover Program creation, Brief editing, activation, discovery, application, Brand acceptance, active membership, member-only Brief access, and a direct invitation flow. Automated registration requires staging email confirmation to be temporarily disabled; otherwise perform registration manually through the confirmation email flow.

For a browser-independent authorization check against the known staging project:

```bash
npm run test:integration:staging
```

This script uses only the publishable key and refuses unknown Supabase project URLs. It creates uniquely named synthetic identities, validates the important RLS/RPC boundaries, and archives its Program; it never uses a service-role key or resets data.

## Supabase Auth staging configuration

After Vercel assigns the canonical URL, configure Supabase Authentication → URL Configuration:

- Site URL: `https://clonetrybe.vercel.app`
- Redirect URL: `https://clonetrybe.vercel.app/auth/confirm`
- Optional local redirect: `http://localhost:3000/auth/confirm`

No wildcard redirect is required. The existing callback accepts the PKCE `code` flow and token-hash confirmation flow. Email confirmation is disabled in this staging project so the automated registration journeys can run; the callback remains ready if confirmation is enabled later. A custom email provider remains deferred.

## Vercel deployment

Connect the GitHub repository and select `main` as the production branch. In this phase, that Vercel production deployment is the staging environment.

1. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` to Vercel.
2. Deploy once so Vercel assigns the canonical URL.
3. Set `NEXT_PUBLIC_APP_URL` to that exact URL.
4. Configure the same URL in Supabase Auth as described above.
5. Redeploy and run remote E2E.

No custom domain or separate production database should be created yet.

## Phase 1 data conventions

- Fixed ARS amounts use `bigint` minor units (centavos). UI values are parsed to minor units and formatting uses `es-AR`; PostgreSQL constraints remain authoritative.
- Percentages use `numeric(5,2)`, never floating-point database types. Platform fee is explicitly stored and constrained to `1.50` during this phase.
- Program lifecycle is enforced by a database trigger. Programs are archived instead of deleted.
- Briefs are visible only to organization members, admins, and active Program members.
- Applications and invitations remain history apart from controlled state changes. Membership is authoritative.
- Accepting an application or invitation creates or reactivates one unique membership in the same database transaction. If both are pending, accepting an application cancels the invitation; accepting an invitation withdraws the application.
- Creator search and relationship summaries expose only public name and optional first/last name—never email.

## Deferred scope

Sampling, Cloudflare Stream, content submissions, Meta APIs and attribution, Shopify/Tiendanube, Mercado Pago, earnings, ledger, settlements, payments, Resend, AI, and chat are intentionally not implemented.

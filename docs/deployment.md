# Deployment and environment configuration

## Vercel frontend

Keep the existing Vercel project rooted at `my-app`, with the Next.js preset, `pnpm install --frozen-lockfile`, and `pnpm build`. No framework or hosting migration is required. The lockfile is part of the release.

Set these server-side environment variables in Vercel:

| Variable | Purpose |
| --- | --- |
| `BETTER_AUTH_SECRET` | Strong randomly generated auth secret; retain the existing production value. |
| `BETTER_AUTH_URL` | Canonical frontend HTTPS origin for Better Auth. |
| `NEXT_PUBLIC_BASE_URL` | Same canonical origin; used as the JWT issuer. This is public configuration. |
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | Existing authentication MySQL connection; port defaults to 3306. |
| `BACKEND_API_URL` | Backend origin, without `/api/v1`; Next rewrites `/api/v1/*` to that host. |
| `INTERNAL_API_KEY` | Private random shared credential for backend user/email lookup. Must match Spring `user.service.api-key`. |
| `GMAIL_USER`, `GMAIL_PASS` | Existing verification-email sender credentials. |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Existing Google OAuth credentials and frontend callback allowlist. |

Never use `NEXT_PUBLIC_` for database credentials, internal keys, mail credentials, or auth secrets. Existing optional `NEXT_PUBLIC_*_SERVICE_URL` variables remain supported for tariff, product, countries, HS code, calculator, FTA, bloc, wishlist, and classification services. If absent, they use same-origin `/api/v1/...` paths. If configured to a separate origin, verify backend CORS accepts your frontend origin.

The application can compile without `BACKEND_API_URL`; missing trade services produce error/retry states. Auth cannot operate without its secret, database and origin configuration. A build without auth configuration may emit Better Auth warnings even when static pages compile.

## Java backend

Deploy the `javaBackend` changes separately from Vercel. Continue using the existing PostgreSQL, email, classifier and Spring OAuth2 resource-server configuration.

- Set `FRONTEND_URL` to the deployed frontend origin. Local `http://localhost:3000` and `http://127.0.0.1:3000` are also allowed by the CORS configuration.
- Set Spring `user.service.url` to the frontend's internal user-lookup endpoint base, following the existing configuration.
- Set Spring `user.service.api-key` to the same strong value as Vercel `INTERNAL_API_KEY`. Use a secret/environment substitution in deployment configuration, not an example hardcoded key. The frontend lookup now fails closed with 401 when the key is absent or wrong.
- Preserve the configured JWT issuer/JWKS endpoint and align its issuer with `NEXT_PUBLIC_BASE_URL`. The JWT `sub` is the Better Auth user ID; backend ownership checks compare that subject with stored user IDs.

Both frontend and backend need the coordinated release. Pushing only the frontend does not install the backend ownership and calculation repairs.

## Auth database and dependency update

The stack remains unchanged. Security updates retain Next.js 16, React 19, Better Auth 1, Axios 1 and MySQL2 3. Nodemailer is updated to 10 for published security fixes; the application's basic Gmail transport and `sendMail` API remain in use. Unused animation, mail-provider and developer packages were removed.

Better Auth was updated from its older 1.x release. Back up the authentication database and compare its existing user/session/account/verification/JWKS tables with the installed package's schema before release. Apply needed migrations through your normal database workflow; no database migration was run locally. In particular, the installed JWT plugin schema includes nullable `jwks.expiresAt` (date), `jwks.alg` (string) and `jwks.crv` (string), in addition to publicKey/privateKey/createdAt. Check these against the existing table before release. Preserve production auth keys and existing sessions as appropriate for your rollout.

## Release smoke checks

Check password and Google sign-in, account verification/resend, importer/supplier role selection, admin management, visible versus private products, watchlist ownership, classification and email notifications against the configured services. Confirm a 0% tariff and a $0 flat fee retain their units, and that a multi-product calculation shows the selected FTA or tariff breakdown. Confirm theme preference survives reload and switching themes retains current draft inputs.

The local revamp verification uses unit/component tests and temporary browser fixtures for service-dependent screens. It does not claim a successful production sign-in, database migration, classifier call, or delivered email.

# DutyNotFree

An educational trade workspace built at Singapore Management University. Browse tariff records and free trade agreements, organize HS classifications and products, follow tariff changes, and estimate duties for a shipment.

The refreshed interface includes responsive workspace navigation, accessible forms and dialogs, and a persistent light/dark toggle. Analytics summarize the available records; they do not represent live market prices, trade volumes, or historical trends.

## Stack

- Frontend: Next.js 16, React 19, TypeScript, Tailwind CSS 4, shadcn/Radix, TanStack Query/Table, Recharts, next-themes.
- Authentication: Better Auth with MySQL, password/email verification and Google sign-in, JWTs signed with RS256.
- Backend: Java Spring Boot with PostgreSQL, Spring Security, JPA, and email/classification integrations.
- Tooling: pnpm, Jest/Testing Library/MSW, Maven, JUnit/Mockito.

## Run locally

From `my-app`, run `pnpm install --frozen-lockfile` and `pnpm dev`. The app runs at `http://localhost:3000`.

Configure `my-app/.env.local` using the values described in [the deployment guide](docs/deployment.md). Public pages render without those services, but account creation, sign-in, trade data, classification, and email delivery require working integrations.

Run `javaBackend/mvnw` (or `mvnw.cmd` on Windows) with a configured PostgreSQL database and the existing Spring configuration. The project targets Java 17; the revamp was tested with JDK 21. Ensure `JAVA_HOME` points to an installed JDK.

## Verify

From `my-app`:

```text
pnpm exec tsc --noEmit
pnpm lint
pnpm test --runInBand
pnpm build
pnpm audit --prod
```

From `javaBackend`:

```text
./mvnw test
```

See [the revamp audit](docs/revamp-audit.md) for fixes, test evidence, source review coverage, and limitations.

## Deployment

The frontend keeps its existing Vercel workflow and `my-app` project root. Pushing the deployment branch can still trigger the configured Vercel deployment. Java changes must be deployed separately to the existing backend host. Follow [the deployment guide](docs/deployment.md) before releasing the security changes.

## Calculation semantics

Each product line submits `quantity × unit value` in USD to the backend. Flat fees apply once per product line under the existing service rules. The backend compares applicable tariff duties with eligible FTA duties and returns the cheaper option. A failed line prevents an incomplete total from being shown. Editing the route, date, products, quantities, or values clears the prior estimate.

Estimates exclude freight, insurance, other taxes, and charges. The dataset and calculations are for educational use.

## Contributors

Bryan Lee, Denzyl Ng, Fermin Lim, Nicholas Seah, and Zhen Yang.

This project was developed for educational purposes.

# DutyNotFree revamp audit

Plan: `docs/superpowers/plans/2026-10-04-duty-not-free-revamp.md`

## Baseline (4 October 2026)

- Clean initial checkout; implementation on `codex/duty-not-free-revamp`, in the existing workspace. Dependencies installed from the frozen pnpm lockfile.
- Next build: fails on an invalid `undefined/api/v1` rewrite when BACKEND_API_URL is absent.
- TypeScript: fails; Jest globals/types missing, older test fixtures do not match current APIs, malformed/duplicated tsconfig includes.
- ESLint: 134 errors, 72 warnings, including conditional hooks in calculator, dashboard, and product pages.
- Jest: 10 failing suites, 5 passing; 35 failing tests, 48 passing. MSW setup silently swallows initialization errors, leaving tests unmocked.
- Maven: default JAVA_HOME invalid; available JDK 21 used for verification. Full baseline in progress.

## Decisions and progress

- Ruling: use the approved native execution in the existing checkout on a dedicated local branch. No push or deployment. Cost if wrong: changes remain visible in this checkout rather than an isolated worktree.
- Ruling: verify the redesigned shared layout directly in the browser rather than create a redundant image-generation concept after design approval. Cost if wrong: visual revisions may be needed after browser inspection.
- Ruling: patch Next/React within their existing release families and align Next's lint package. Next 16.0.0 and React 19.2.0 have published server-component security advisories; retaining those exact patch versions would leave confirmed vulnerabilities. Sources: [Next advisory](https://nextjs.org/blog/CVE-2025-66478), [January follow-up](https://github.com/vercel/next.js/security/advisories/GHSA-h25m-26qc-wcjf). Cost if wrong: patch-version compatibility regressions, checked with the build/tests.

## Review coverage

Frontend shared layout, routes, auth, query hooks, tables, dialogs, charts, and test configuration: in progress.
Java controllers, services, DTOs, repositories, security, integrations, and tests: in progress.
Deployment/readme and data-loading behavior: in progress.

## Deployment notes

Vercel deploys the Next.js frontend. Java repairs require a separate backend release. Service-to-service user lookup must use a configured INTERNAL_API_KEY shared with the Java user-service credential. Never use a hardcoded example credential in production.

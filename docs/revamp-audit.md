# DutyNotFree revamp audit

Completed 4 October 2026. [Approved design](superpowers/specs/2026-10-04-duty-not-free-revamp-design.md), [implementation plan](superpowers/plans/2026-10-04-duty-not-free-revamp.md), and [deployment guide](deployment.md).

## Outcome

The existing Next.js/React/TypeScript/Tailwind/shadcn/TanStack/Recharts/Better Auth frontend and Spring/PostgreSQL backend are retained. Public, auth, calculator, analytics, tariff, agreement, product, admin and API reference routes use the new visual system. Shared navigation, mobile drawer, semantic surfaces, error/retry states and saved light/dark preference replace the older page layouts. Existing CRUD and classification integrations remain connected to the original API families.

Work remains on local branch `codex/duty-not-free-revamp`. No remote push, deployment or database migration was performed.

## Baseline and verification

| Check | Baseline | Final |
| --- | --- | --- |
| TypeScript | Failed: missing Jest types and stale fixtures/configuration | `pnpm exec tsc --noEmit`: exit 0 |
| ESLint | 134 errors, 72 warnings; conditional React hooks | 0 errors, 76 warnings; exit 0 |
| Frontend tests | 10 failing suites / 5 passing; 35 failed / 48 passed | 24 suites, 97 tests passed; no failures |
| Production build | Failed with `undefined/api/v1` rewrite | `pnpm build`: exit 0; all app routes generated |
| Backend tests | 395 passed after fixing local JDK selection | 405 passed; 0 failures/errors/skips; Maven BUILD SUCCESS |
| Production dependency audit | Known vulnerabilities in original dependency tree | `pnpm audit --prod`: no known vulnerabilities |
| Whitespace | Checked on final changes | `git diff --check`: exit 0 |

Runtime: Node 22.19.0, pnpm 10.20.0, JDK 21.0.10; Java source target remains 17. Build verification used a temporary random local-only auth secret and localhost origin in the command environment. The auth database and Google credentials were absent; Better Auth logged missing-provider/database-schema validation messages. This build establishes compilation and route generation, not working auth infrastructure.

Remaining lint warnings are legacy `any`, unused declarations and dialog state-reset effects. They are reported rather than represented as a warning-free codebase. No lint error, type error, failing test or build failure remains.

## Confirmed repairs

| Area | Defect and repair | Evidence |
| --- | --- | --- |
| Tooling | Missing backend URL invalidated builds; rewrite now conditional. Aligned Next ESLint config, TS/Jest types and test providers. | Typecheck, lint and production build |
| Test infrastructure | MSW errors were silently swallowed and hooks lacked stable QueryClient providers. Setup now fails visibly; jsdom uses Axios fetch transport for MSW compatibility. | Full frontend suite |
| React lifecycle | Conditional hooks and auth-loading whole-page replacement could destabilize pages. All hooks execute consistently; public content remains mounted. | Public-content and session-transition tests |
| Auth token lifecycle | Concurrent requests could repeatedly acquire/cache stale credentials. Added shared acquisition, expiry checks, generation invalidation and bounded failure behavior. | Three axios regression tests |
| Internal user lookup | Service endpoint could disclose user email without a caller credential. Require constant-time checked `INTERNAL_API_KEY`, parameterized query and no-store responses. | Missing, absent configuration and valid credential tests |
| Product ownership | Lists exposed others’ private products and writes trusted supplied user IDs. Filter visible reads; require authenticated subject ownership or admin for private operations. | Java anonymous-list/private-ID and cross-user creation/update/delete regressions |
| Watchlist ownership | Caller-selected user IDs allowed cross-user reads/writes. Guard user-scoped access and deletion ownership. | Java cross-user read/deletion regressions and controller suite |
| Backend authorization/CORS | Duplicate CORS configuration and missing composite FTA mutation role matchers. Consolidated origins and enforced admin rules. | Backend suite and source review |
| Calculation breakdown | Backend returned the wrong selected tariff/FTA breakdown. Correct the branch semantics. Unknown HS codes, invalid dates and invalid values receive controlled rejection. | Calculator service tests |
| Agreement matching | Two countries belonging to the same side of a bloc agreement could match an external agreement. Require opposite-party matching, in either direction. | New regression failed before repair and passed after |
| Date boundaries | Same-day expiration/effective transitions permitted overlapping inclusive periods. Compare boundaries directly in tariff and FTA validation. | Two new boundary regressions failed before repair and passed after |
| Numeric validation | Negative/non-finite tariffs could be persisted; create dialog checked display names against the wrong kind. Validate finite, non-negative backend values and mapped form kind. | Negative-rate regression failed before repair and passed after |
| Zero flat fees | Editing a fee to zero changed tariff kind and displayed `null%`. Preserve original nullable-rate kind; render dollar units for zero fees. | Helper and rendered-table regressions; table regression failed before repair |
| Calculator UX | Old totals could remain after edits or late responses; partial failure could understate a manifest. Manual validated multi-line calculation, revision checks and all-or-nothing totals. | Manifest and rendered calculator tests |
| Product schema | Frontend read `user_id`/old privacy fields instead of backend `userId`/`private`. Correct mappings and identity-scoped query keys. | Hook tests and source review |
| Calendar dates | UTC parsing of date-only API values could shift the displayed/saved day in other timezones. Parse local calendar days. | Calendar round-trip regression |
| Verification | Better Auth resolved API errors were treated as sent mail. Check result.error; show retryable failure without cooldown. | Verification component regression |
| Analytics | Random/live-looking charts and invented coverage/market claims. Deterministic real-record counts, percentage averages, filters and explicit flat-fee handling. Removed hardcoded 11,418 HS coverage. | Analytics tests and browser fixtures |
| Cleanup | Removed unused simulated chart/product-card components and unused animation/mail/developer packages. Await clipboard success in classification/reference flows; remove record debug logs. | Import inventory, typecheck and build |

The security/calculation regression tests were exercised against the original behavior before implementation where noted. Older table/calculator expectations for nonexistent bulk/export controls or automatic simulated charts were replaced with tests against the actual redesigned application. The former synthetic change-history suite now tests the production manifest helper. Other meaningful existing suites remain.

## Source inventory and review disposition

The inventory contains 128 production frontend source/type/style files and 71 Java production files, excluding tests, mocks and binary assets. Review uses source inspection, focused regression reproduction, full suites, rendering, and an independent read-only review of consequential paths. This is a review of authored source families, not a guarantee that all possible defects or external data inaccuracies are eliminated.

| Source family | Reviewed disposition |
| --- | --- |
| `my-app/src/app` public/auth/tool/admin routes, layouts, loading components, local tables/columns | Redesigned; hooks/order and role gates checked; services remain real; no shipped fixture route |
| `my-app/src/app/api`, `proxy`, `utils/auth`, `lib/auth-client`, `lib/checkRole`, email templates/sender | Auth/callback/role flow and internal lookup reviewed; credential boundary repaired; live DB/OAuth/email pending |
| `my-app/src/components` shell/providers/theme, forms, CRUD dialogs, classification, news, shared tables and skeletons | Semantic theming and accessibility improved; dialog drafts, portal styling, keyboard dismissal and retry behavior checked |
| `my-app/src/components/ui` Radix/shadcn primitives | Retained stack; shared CSS tokens and portal inheritance checked |
| `my-app/src/hooks`, `lib`, `utils`, `types` | Query identity, API mapping, mutation shape, invalidation, numeric/date semantics and derived analytics reviewed |
| Java calculator/tariff/FTA services, controllers, repositories, requests/entities/concessions | Selection, opposing trade parties, inclusive dates, validation and returned rules repaired; existing contracts retained |
| Java product/wishlist/security/user families | Role and ownership boundary review; private reads and cross-user mutations guarded |
| Java country/bloc/HS/trade-party/data-loading families | Existing contracts and unit coverage retained; no changes to supplied workbook data |
| Java email/RAG/Cohere/Pinecone families | Integration callers and boundaries reviewed; no external service invocation or delivered mail claimed |
| Frontend Jest/MSW/test utilities and Java JUnit/Mockito tests | Setup repaired; full suites pass; meaningful regressions added |
| Package/build/deployment/docs/assets | Lockfile updated; Vercel workflow retained; current docs replace misleading analytics/setup claims; older test reports marked historical |

The independent review identified the FTA same-side, date-boundary, negative-rate, zero-fee and resend defects. A follow-up verified their source repairs and caught the remaining zero-fee table display, which was also repaired and regression-tested.

## Browser verification

Tested at 1440×900 and 375×812 using the in-app browser. Verified light/dark contrast, saved theme on reload, input retention on theme changes, public navigation, tariff search, deterministic analytics layout, agreement modal, product table scrolling, calculator line entry/totals, mobile drawer sizing, theme change inside the drawer and keyboard dismissal. Calculator document width matched the 375px viewport; wide data tables scroll inside their own container. Reduced-motion support is present in CSS.

Public pages used the actual app. Tool screens used temporary isolated fixture data because no auth DB/backend was configured. The fixture preview temporarily occupied the public about page, with seeded query data and a calculator adapter. Original about/shell files were restored before final typecheck/tests/build. No fixture adapter, preview code or auth bypass is shipped. Browser fixture totals and agreement names are illustrative verification values, not production observations.

Representative inspected screenshots are saved locally under ignored `my-app/verification/`: `landing-desktop-light.png`, `landing-desktop-dark.png`, `landing-mobile-dark.png`, `calculator-light.png`, `calculator-dark.png`, `calculator-mobile-dark.png`, `navigation-mobile-dark.png`, and `login-mobile-dark.png`. Fixture screenshots include their temporary preview toolbar.

## Decisions and release limits

- Keep approved native implementation in the existing checkout on a dedicated local branch. Implementation commits group related work instead of committing every checklist step separately.
- Use the existing port photograph and direct rendered QA after design approval, rather than another generated concept image.
- Apply security updates within the retained stack. Next remains 16, React 19, Better Auth 1, Axios 1 and MySQL2 3; Nodemailer is updated to 10. Production audit is clean at verification time. MSW stays pinned at the working 2.11.6 release because its newer ESM-only dependency breaks this Jest/CommonJS harness. It is test-only.
- No live sign-in, account creation, role mutation, DB migration, private-data CRUD, classifier response or delivered notification was verified without the configured external services. Unit/component tests cover their local boundaries. News failure displays a useful fallback.
- Vercel deploys only the frontend. Java changes need a separate coordinated backend release. Configure matching `INTERNAL_API_KEY` / Spring `user.service.api-key`, the canonical auth/JWT origin, and review the updated Better Auth schema before pushing a release. Follow [deployment.md](deployment.md).

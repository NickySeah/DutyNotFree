# DutyNotFree Revamp Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task if the user chooses native execution; use superpowers:subagent-driven-development if the user explicitly chooses delegated execution. Steps use checkbox syntax for tracking.

**Goal:** Modernize every existing frontend route in both light and dark themes, repair confirmed codebase defects, and preserve the existing deployment stack.

**Architecture:** Compose a common provider layer, public layout, and authenticated workspace shell around existing App Router pages. Retain existing hooks, shadcn components, and API contracts; add small pure helpers or security boundaries where consequential repairs need independent testing. Keep Spring Boot changes compatible with existing authenticated callers and document their separate deployment.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, shadcn/Radix, next-themes, TanStack Query/Table, Recharts, Better Auth/MySQL, Spring Boot/PostgreSQL, Jest, JUnit/Mockito, pnpm, Maven.

**Spec:** [Approved design](../specs/2026-10-04-duty-not-free-revamp-design.md)

## Global Constraints

- Keep the existing stack, routes, role model, environment variable names, pnpm lockfile workflow, and Vercel frontend deployment.
- Use Geist typography and semantic tokens with the light/dark palette specified in the design.
- The explicit theme preference persists; otherwise follow the operating system. Theme changes retain draft inputs and filters.
- Do not use simulated production data to mask unavailable services or represent random values as live observations.
- Work remains local until the user requests a push or release. Java changes require separate backend deployment.
- Never include server secrets in public configuration, bundles, screenshots, or logs.
- Consequential behavior fixes require reproducible regression coverage. Reversible styling changes use visual/browser verification rather than implementation-mirroring tests.

## Review Focus

- A session appears or disappears while a page is mounted: hook order remains stable, user queries wait for an identity, and cached private results disappear on sign-out.
- Concurrent requests encounter token expiry or a changed account: share token acquisition, reject stale token work, and never retry indefinitely.
- Product/watchlist requests supply another user's ID: private reads and writes are denied while admin and public-product access remain legitimate.
- Calculator inputs include zero-rate rules, flat fees, multiple quantities, invalid HS codes, or changed drafts after calculation: retain zero, report the selected rule correctly, reject invalid values, and prevent stale summaries.
- A mobile user changes theme with a menu/dialog open: focus stays usable, portal content receives the theme, and the page does not overflow or lose inputs.

## File boundaries

- `my-app/src/components/providers.tsx`: theme/query providers and development-only query tools.
- `my-app/src/components/theme-toggle.tsx`: accessible persistent light/dark control.
- `my-app/src/components/workspace-shell.tsx`: route-aware public/workspace chrome and mobile navigation.
- `my-app/src/components/page-header.tsx`: shared title, description, and action layout.
- `my-app/src/components/navbar.tsx`, `footer.tsx`, and `mainContentWrapper.tsx`: adapt existing components to the common shell; remove duplicated provider or routing responsibilities.
- `my-app/src/app/globals.css`: light/dark semantic tokens and limited common surface styling.
- `my-app/src/lib/axios.ts`, `auth-client.ts`, and `utils/auth.ts`: authenticated service lifecycle and verification callbacks.
- `my-app/src/lib/analytics.ts`: deterministic typed summaries of `TradeRate[]`.
- Existing route pages and local tables/dialogs: compose the shared system while retaining real feature operations.
- Existing Java controllers/services/security classes: enforce ownership and correct calculation behavior; retain HTTP paths and payload shapes where possible.
- `docs/revamp-audit.md`: source review inventory, finding disposition, test evidence, and deployment notes.

## Task 1: Establish baseline and audit inventory

**Files:** `my-app/package.json`, `my-app/pnpm-lock.yaml`, `my-app/eslint.config.mjs`, `my-app/jest.config.js`, `my-app/jest.setup.js`, `javaBackend/pom.xml`, `docs/revamp-audit.md`.

**Interfaces:** Consumes existing build/test scripts and deployment files; produces a documented baseline and categorized inventory of every authored source area.

- [ ] Inspect Git state and workspace isolation; preserve existing user changes. If working in the current checkout, use a local `codex/duty-not-free-revamp` branch rather than push changes to main.
- [ ] Install frontend dependencies with `pnpm install --frozen-lockfile` from `my-app`; record runtime versions and inspect deployment configuration without printing environment secrets.
- [ ] Run `pnpm exec tsc --noEmit`, `pnpm lint`, `pnpm test --runInBand`, and `pnpm build` from `my-app`; retain output and identify pre-existing failures.
- [ ] Run `.\mvnw.cmd test` from `javaBackend`; distinguish unit failures from database/service or Java runtime limitations.
- [ ] Review authored source using a file inventory grouped into frontend routes/components/hooks, auth/API, Java controllers/services/repositories/DTOs, tests, and configuration. Record findings by severity and assign each confirmed repair to the owning task.
- [ ] Repair only tooling defects that block trustworthy checks, such as Next/ESLint configuration mismatch or broken test setup. Re-run the affected command and preserve meaningful assertions.
- [ ] Commit baseline/tooling repairs and audit notes separately from feature changes.

## Task 2: Introduce theme, provider layer, and shared shell

**Files:** Create the provider, theme-toggle, workspace-shell, and page-header files listed above. Modify `my-app/src/app/layout.tsx`, `globals.css`, `components/navbar.tsx`, `footer.tsx`, `mainContentWrapper.tsx`, and `components/ui/sonner.tsx` as required.

**Interfaces:** `Providers({ children }: { children: React.ReactNode })`; `ThemeToggle()`; `WorkspaceShell({ children }: { children: React.ReactNode })`; `PageHeader({ title, description?, actions? }: { title: string; description?: string; actions?: React.ReactNode })`. The shell consumes existing pathname and `useUserRole()` values; providers wrap every query consumer.

- [ ] Write a focused provider/session-transition regression using an actual query consumer: public content remains mounted during session discovery and a later authenticated identity does not change hook order.
- [ ] Run the new Jest test and observe its initial failure before implementing the lifecycle repair.
- [ ] Implement the shared providers using the installed next-themes and stable QueryClient construction. Restrict query devtools to development.
- [ ] Implement public and authenticated chrome, role-aware navigation, active route state, and an accessible mobile drawer. Theme selection uses next-themes persistence/system behavior and a hydration-safe icon.
- [ ] Apply exact palette tokens from the spec, including error/focus states; replace fixed-color shared primitive styles where required for dark mode. Keep existing Geist fonts.
- [ ] Run the provider regression and typecheck. Verify first-render readability, theme persistence after reload, both portal themes, keyboard drawer operation, and no page overflow at 375px in the browser.
- [ ] Commit the shared shell/theme work.

## Task 3: Repair authentication, API boundaries, and ownership

**Files:** `my-app/src/lib/axios.ts`, `auth-client.ts`, `utils/auth.ts`, `proxy.ts`, `app/api/users/[userId]/route.ts`, `app/api/set-role/route.ts`, `hooks/useProducts.ts`, `components/navbar.tsx`; Java `security/SecurityConfig.java`, `config/CorsConfig.java`, `product/ProductV1Controller.java`, `product/ProductServiceImpl.java`, `wishlist/WishlistController.java`, `wishlist/WishlistServiceImpl.java`, `wishlist/WishlistService.java`, and `tariff/TariffV1Controller.java`/`TariffServiceImpl.java`; regression tests beside the corresponding existing suites.

**Interfaces:** Preserve exported service instances. Add `clearAuthToken(): void` to the Axios module and invoke it on successful sign-out and session identity transitions. Change `useProducts(userId: string | undefined)` to keep its existing return type while setting `enabled: Boolean(userId)`. Use the existing Java user-service API-key configuration and `x-internal-api-key` contract for email lookup.

- [ ] Add failing frontend regressions for parallel token acquisition, expiry, account changes during in-flight acquisition, and bounded handling of 401/403. Assert one token fetch for concurrent requests and no stale Authorization header after cache clearing.
- [ ] Add user-email route tests asserting unauthenticated/missing-credential requests are rejected, a matching configured service credential permits the lookup, and database results are not logged. Use async route params supported by Next.js 16.
- [ ] Add ownership regressions to product, wishlist, and tariff-watchlist tests: a supplier cannot alter another owner's product; a private product is not returned anonymously; watchlist lookup/deletion cannot use another user's identity; legitimate owner/admin actions succeed.
- [ ] Run the new focused Jest and Maven suites and confirm failures correspond to the defects.
- [ ] Implement token lifecycle repair and stable user-dependent hooks, remove sensitive logging, enforce service credential authorization, and correct verification callback handling without corrupting URL parameters.
- [ ] Derive Java caller identity from the verified JWT subject rather than trust request IDs. Enforce ownership for all ID and composite-key mutations, private reads, and watchlist operations. Retain public-product reads and legitimate admin privileges. Extend service interfaces/tests explicitly where needed.
- [ ] Reconcile CORS through a single consistent policy using the existing frontend origin configuration plus supported local origins; reject wildcard credentialed origins.
- [ ] Run focused frontend and Java tests, typecheck, and authentication smoke checks where services are available. Document exact configuration/deployment needs without inventing credentials.
- [ ] Commit auth and security repairs.

## Task 4: Correct calculator behavior and redesign the calculator

**Files:** `my-app/src/app/calculator/page.tsx`, `productCard.tsx`, `__tests__/TariffCalculator.test.tsx`, `types/calculator.ts`, `utils/dateUtils.ts`; Java `calculator/CalculatorServiceImpl.java`, `CalculatorV1Controller.java`, and `src/test/java/com/example/CSD/test/calculator/CalculatorServiceTest.java`/`CalculatorControllerTest.java`.

**Interfaces:** Retain `/api/v1/calculator` parameter names and response fields `appliedFTA`, `appliedTariffs`, `tariffTotal`, `finalValue`. A chosen FTA returns its details and no applied tariffs; a chosen tariff returns the tariff list and null FTA; a tie retains the existing preference for FTA.

- [ ] Extend failing Java tests with a 1,000 declared value: FTA 5% versus tariff 7.5% yields total 1,050 with empty applied tariffs; FTA 5% versus tariff 2% yields total 1,020 with the 2% tariff; a tie selects FTA. Cover no rule, zero-rate rule, unsupported HS code, negative/nonfinite value, and malformed date.
- [ ] Add frontend regressions for session-loading-to-user transition, quantity/flat-fee behavior under the existing per-unit calculation contract, invalid inputs, and clearing or marking results stale when inputs change. Confirm current behavior fails the relevant assertions.
- [ ] Correct rule selection details and validate inputs with meaningful 4xx responses rather than incidental exceptions. Preserve existing rate units and per-unit calculation semantics; do not introduce new economic assumptions.
- [ ] Keep all hooks unconditional and use the enabled user query from Task 3. Extract focused calculation helpers only if needed for behavior testing.
- [ ] Rebuild route/date/product controls and adjacent result summary using shared tokens. Preserve multiple products, quantity editing, country swap, calculation progress, and expandable per-product details; stack on mobile.
- [ ] Run focused frontend/Java calculator suites and typecheck; verify both themes, changing inputs, loading failures, and the displayed breakdown in the browser.
- [ ] Commit calculator repair/redesign.

## Task 5: Modernize all data and management screens

**Files:** Existing `my-app/src/app/tariff`, `fta`, `product`, and `admin-dashboard` page/table/column files; create/update/delete/detail modals in `my-app/src/components`; relevant hooks and existing component/hook tests.

**Interfaces:** Consume `PageHeader` and the shared shell from Task 2; preserve TanStack table sorting/filtering/pagination and the existing role-aware mutation hooks. Mutations refresh their exact query keys, including per-user product and watchlist keys.

- [ ] Add focused failing regressions only for confirmed mutation/filter/cache defects discovered in Task 1, with assertions on visible updated data and permissions rather than CSS internals.
- [ ] Modernize every table, filter toolbar, pagination control, empty/loading/error state, and management dialog. Retain watchlist add/delete, agreement concessions, product privacy, and admin management.
- [ ] Use semantic tokens throughout these screens and dialogs; preserve zero rates and date-only values when mapping/displaying records.
- [ ] Fix confirmed stale-query, filter-reset, invalid-date, form-validation, or duplicate-submission behavior. Run relevant existing and new hook/table/dialog tests.
- [ ] Verify searching, filtering, pagination, valid/invalid submissions, confirmation dialogs, and both themes at desktop and mobile sizes. Mark service-dependent mutations unverified if no configured backend is reachable.
- [ ] Commit the data-screen redesign and related repairs.

## Task 6: Make analytics truthful and readable

**Files:** Create `my-app/src/lib/analytics.ts` and its Jest test; modify `app/dashboard/page.tsx`, `components/LiveTariffChart.tsx`, and related types.

**Interfaces:** `summarizeTariffs(tariffs: TradeRate[]): { country: string; count: number; averageRate: number | null; flatFeeCount: number }[]`; percentages average only non-null percentage rates, including zero. Flat fees remain separately counted and are not averaged with percentages.

- [ ] Write failing pure-helper tests: two percentage rates of 0 and 10 average to 5; a flat-fee-only group has null percentage average and flatFeeCount 1; empty data returns an empty array; repeated input produces identical results.
- [ ] Run the tests to confirm failure, then implement deterministic grouping using the existing tariff mapping.
- [ ] Remove fabricated trend/market-share observations. Retain a simulation only if clearly labelled and separated from available-data summaries; otherwise replace it with accurate existing-data views.
- [ ] Make dashboard hooks unconditional, filters meaningful, chart units/tooltips/legends clear, and chart colors readable in both themes. Preserve working embedded assistance where present.
- [ ] Run analytics and session-transition regressions, then verify empty/error/filtered chart states and responsive chart sizing in the browser.
- [ ] Commit analytics fixes and redesign.

## Task 7: Redesign public, authentication, and documentation pages

**Files:** `app/page.tsx`, `about/page.tsx`, `login/page.tsx`, `register/page.tsx`, `choose-role/page.tsx`, `verify-your-email/page.tsx`, `api-docs/page.tsx`, their existing layouts, `components/feature.tsx`, `NewsFeed.tsx`, `footer.tsx`, and existing supported public assets.

**Interfaces:** Use the public/shared shell and theme control from Task 2; retain Better Auth sign-in/signup/verification actions and existing role-selection API. Documentation examples use configured public API origins or relative same-origin paths, never server secrets.

- [ ] Add failing regressions for any confirmed broken verification/role-selection/auth-form behavior. Assert role selection does not trap browser history and required fields surface errors without duplicate submissions.
- [ ] Rebuild the landing page around tariff estimation and actual supported features. Use a purposeful trade-route visual or suitable existing asset; do not add unrequested features or fabricated customer claims.
- [ ] Modernize all authentication, verification, role selection, about, and API documentation pages. Keep contributor attribution, supported Google/password flows, copy actions, and role-based continuation.
- [ ] Replace dead or irrelevant footer links and improve news readability, date/image failure handling, and refresh/error states. Make motion optional through reduced-motion support.
- [ ] Run affected tests/typecheck and browser checks in both themes. Verify public content remains useful while auth/news requests are loading or fail, and copied examples match the configured API location.
- [ ] Commit the public-page redesign.

## Task 8: Complete code review, verification, and handoff

**Files:** `docs/revamp-audit.md`, relevant deployment/readme documentation, final repaired source/tests, and this plan's completion checkboxes.

**Interfaces:** Consumes all previous deliverables; produces complete verification evidence and explicit backend/environment deployment notes.

- [ ] Revisit the Task 1 inventory and ensure every authored source area has a recorded review disposition. Resolve confirmed consequential findings with failing-then-passing behavior tests; explain any unresolved external-service limitation.
- [ ] Run `pnpm exec tsc --noEmit`, `pnpm lint`, `pnpm test --runInBand`, `pnpm build`, `.\mvnw.cmd test`, and `git diff --check`; inspect every result and report residual baseline/service failures accurately.
- [ ] Start the app and verify navigation, search/filter/pagination, supported auth flows, calculator breakdowns, ownership restrictions, chart filters, and dialogs. Check light/dark/system preference, reload persistence, keyboard navigation, reduced motion, desktop, and 375px mobile.
- [ ] Capture and inspect representative landing/data/calculator/auth screenshots in both themes. Repair clipping, contrast, overflow, inconsistent typography, inert controls, and console/runtime errors before handoff.
- [ ] Review the whole branch as a separate pass; use an independent reviewer only if the chosen execution method authorizes delegation. Focus on session transitions, stale JWT work, cross-user access, numeric/date semantics, and mobile theme/dialog behavior.
- [ ] Update the audit with commands/results, reviewed source areas, corrected defects, screenshots, and exact frontend/backend release configuration. Explain that a Vercel frontend deployment does not deploy Java changes.
- [ ] Commit verified final repairs and documentation. Leave changes local and provide the user with the outcome, meaningful verification, and any remaining limitations.

## Execution review

Spec coverage includes every existing route, all CRUD dialogs, theme persistence and portal styling, backend security/calculation repairs, the full authored-source audit, and deployment compatibility. The five review-focus cases belong to Tasks 2–4 and final browser verification. Plan self-review found no unresolved interface-name or route conflicts.

Recommended execution: native, in this session. The common shell and providers are shared by most subsequent tasks, so keeping one implementation context reduces repeated setup and coordination. The user must review this plan and select native or delegated execution before product implementation starts.

# DutyNotFree redesign and code review

Date: 4 October 2026
Status: Visual direction approved; written specification awaiting review.

## Purpose and agreed constraints

Modernize an existing school project into a cohesive, usable trade-analysis application and review the entire codebase for defects. The user approved a clean trade-analysis workspace and requested a light/dark toggle.

Keep Next.js 16, React 19, TypeScript, Tailwind CSS 4, shadcn/Radix components, TanStack Query/Table, Recharts, Better Auth, MySQL authentication storage, and the Spring Boot/PostgreSQL backend. Preserve the existing routes, role model, API contracts where practical, environment variable names, and Vercel frontend deployment workflow. Work remains local until the user requests a push or release.

The design assumes this remains an educational project for importers and suppliers. Preserve useful existing functionality; do not claim the data constitutes authoritative, current customs guidance or invent live market data.

## Chosen approach

Revamp the existing frontend around shared design tokens and application layouts, then improve each existing page and flow. Audit frontend and backend code, repair confirmed defects, and add focused regression coverage for consequential behavior changes.

A stylesheet-only refresh would leave inconsistent page structures and interaction problems. A framework migration would introduce deployment risk and conflict with the user's constraint. Shared components and targeted refactoring give the existing application a consistent identity without either limitation.

## Visual system

Use a light default workspace with white surfaces, slate backgrounds, navy text, restrained teal actions, and clear tabular data. Keep the existing Geist font family; use weight, hierarchy, spacing, and tabular numerals deliberately rather than adding a font dependency. Headings and form labels are left-aligned. Avoid decorative gradients and repeated marketing badges in data screens.

| Token | Light | Dark |
| --- | --- | --- |
| Background | #F5F7FA | #101923 |
| Surface | #FFFFFF | #172330 |
| Primary text | #15283B | #EAF1F7 |
| Secondary text | #526579 | #A9B9C8 |
| Border | #DEE6ED | #304254 |
| Primary action | #087F83 | #55CCC5 |

Use semantic tokens for errors, warnings, selection, focus, and chart series, with accessible text contrast in both themes. Buttons, inputs, tables, dialogs, empty states, charts, and notifications use those tokens rather than fixed white/gray utilities. Compact controls have roughly 8px corner radii; larger grouped panels can use 12px. Prefer dividers and open spacing for data, with panels used for actual grouped tasks.

## Theme behavior

Use the already installed next-themes package with Tailwind's existing class-based dark variant. Place an accessible light/dark toggle in the public header and application header. With no saved preference, use the operating system preference; an explicit toggle selection persists across visits. Avoid rendering an incorrect theme icon during hydration and prevent a full-page theme flash. The server-generated content remains readable before hydration. Respect reduced-motion preferences.

The toggle applies to every route and all portal content, including dropdowns, calendars, dialogs, tooltips, charts, and toast notifications. Theme changes retain the user's page, filters, draft inputs, and calculations.

## Layout and navigation

Public pages use a compact branded header and an honest footer linking only to existing pages or relevant resources. The landing page has a clear headline about estimating tariff costs, a primary action into the existing registration/application flow, and a purposeful trade-route illustration or existing suitable asset. Secondary content explains the calculator, tariff browser, and agreements. Retain the news feature with a readable static layout and useful failure state; avoid compulsory motion and distracting marquees.

Authenticated tool pages use a shared sidebar and compact header. Navigation includes tariffs, agreements, products, calculator, analytics, and API documentation. Admin user management appears only for admins. Preserve supplier/importer differences in actions and product visibility. Navigation highlights the active route and supports a collapsible mobile drawer with keyboard access, focus management, and a clearly labelled close control.

Desktop content sits beside an approximately 240px sidebar. Mobile content occupies the full viewport below a compact header. Tables scroll within their own containers instead of widening the whole page. The public footer is not repeated as a large marketing block underneath every tool page.

## Page scope

| Route | Resulting experience |
| --- | --- |
| / | Modern landing page with clear entry actions, product explanation, and readable news |
| /login and /register | Consistent focused authentication forms, working existing sign-in methods, field validation, and progress/error feedback |
| /verify-your-email | Clear verification instructions and existing supported next steps |
| /choose-role | Accessible importer/supplier selection with a clear continuation action and no browser-history trap |
| /tariff | Searchable tariff table, consistent filters, pagination, role-based management actions, and watchlist access |
| /fta | Searchable agreements, readable agreement details/concessions, and role-based CRUD dialogs |
| /product | Product library/table with supplier ownership respected and existing management flows preserved |
| /calculator | Route/date controls and product inputs beside a cost summary; stacked layout on mobile; clear applied tariff/FTA breakdown |
| /dashboard | Readable charts derived from available data, meaningful filters, explicit units and data limitations |
| /admin-dashboard | Role-restricted user management using the common table and dialog system |
| /api-docs | Consistent documentation layout with environment-aware examples and copy actions |
| /about | Modern project information and existing contributor attribution |

All create/update/delete dialogs receive consistent field layouts and theme support. Preserve confirmation before destructive actions. Loading, empty, retryable error, permission, and success states form part of each page redesign. Remove dead placeholder links rather than fabricate pages or services.

## Functional and security review

Review all authored frontend and Java source, hooks, route handlers, DTOs, services, repository queries, configuration, documentation, and tests. Group generated data/assets and dependencies appropriately; reviewing installed third-party source is not a requirement. Track findings and repairs in a concise audit document, distinguishing confirmed defects from risks requiring a configured runtime.

Initial source inspection identified these repair candidates:

1. The user-email lookup route has its authorization guard commented out and logs returned database information. Define and enforce service-to-service authorization, use supported asynchronous route parameters, and limit response data. Review its Java caller at the same time. If a service credential is needed, document matching frontend/backend environment settings and fail closed when it is absent.
2. The route proxy logs a session-token prefix, and role selection logs session information. Remove sensitive and unnecessary debug logging. Cookie presence alone must not authorize privileged API operations.
3. The Axios JWT cache does not handle expiry or authentication changes. Ensure parallel requests share token acquisition, stale credentials are invalidated, sign-out/account changes clear cached credentials, and any retry is bounded. Authorization failures should remain visible rather than loop.
4. Calculator and analytics pages return before later hooks when no user ID exists. Move auth-dependent fetching behind enabled conditions while keeping hook order stable across session loading and login.
5. The calculator backend's FTA-versus-tariff branch returns tariffs when the FTA wins and an empty tariff list when regular tariffs win. Correct the returned breakdown and cover both choices, ties, and routes with no applicable rule. Validate unsupported HS codes and malformed/invalid values without accidental server errors.
6. Email verification appends choose-role directly to an existing URL. Use supported callback handling so token/query information remains intact.
7. Two Java CORS configurations disagree about the production origin. Reconcile them against the existing deployment configuration; do not introduce wildcard credentialed origins.
8. Analytics and the live chart include randomly generated values. Prefer reproducible summaries of available tariff data; if a simulation remains useful, label it explicitly and keep it separate from observed data. Do not imply historical trends or market shares where the API provides no such records.
9. Check quantity, flat-fee and percentage handling, rounding/display consistency, stale calculator results, date boundaries, filtering, mutation cache invalidation, and loading/error states throughout the existing flows.
10. Verify endpoint role restrictions and resource ownership server-side, including product and watchlist operations. Preserve legitimate roles while preventing client-submitted identifiers from bypassing authorization.
11. Review deployment rewrites, public service URL handling, environment validation, and framework/lint configuration compatibility. Keep server secrets out of browser bundles.

These are source findings, not claims that exploit tests or runtime verification have already passed. Prioritize demonstrable security and correctness defects, then deployment issues, accessibility, and maintainability. Avoid unrelated rewrites or speculative features.

## Component and data boundaries

The root layout composes the theme and query providers, shared navigation/layout, and notifications. Route-specific pages own feature composition. Extract a small shared page-header, theme toggle, workspace navigation, loading/empty/error presentation, and dialog/form conventions where repetition warrants it. Keep the existing shadcn primitives and hooks; extract calculator or analytics transformations into focused modules when regression tests require independent behavior.

Use the existing backend and real query results. Do not substitute seeded mock results in production when the backend is unavailable. Loading and backend errors must offer meaningful recovery. Keep public landing content visible during session discovery instead of gating the whole site on a spinner. Query devtools should be limited to development.

## Deployment compatibility

Preserve Vercel's existing my-app root directory, pnpm lockfile workflow, Next.js build, and backend integration. Retain existing environment names; explicitly document any additional configuration required by a confirmed security fix. Do not require a new database, hosting provider, or major framework migration.

Java changes require deployment to the backend host independently of Vercel's frontend deployment. Record this in the handoff so a frontend push is not mistaken for a full-stack release. Inspect the existing deployment files before altering any configuration. Any narrowly necessary security patch version change must be documented and validated; dependencies are not upgraded wholesale as part of the redesign.

## Validation and acceptance

Establish the current frontend typecheck, lint, Jest, production-build, and Java-test baseline before fixes. Frontend dependencies are not installed in the workspace at spec-writing time. Report pre-existing failures separately from failures introduced by the changes.

Run TypeScript checking, lint, relevant frontend regression tests, a production Next.js build, and relevant Java tests after changes. Add behavioral tests for security boundaries, calculation choices, JWT lifecycle, and other consequential fixes; do not add tests merely duplicating styling. Inspect desktop and mobile layouts in a browser, exercise core workflows, and check browser-console errors.

Required UI checks cover both themes, saved-theme behavior, no horizontal page overflow at 375px, readable charts/tables/dialogs, active navigation, keyboard focus, mobile drawer behavior, field validation, loading/error recovery, and reduced motion. Capture representative screenshots of the landing page, a data screen, calculator, and authentication page in both themes. Check real authentication and backend flows when configured services are accessible. Clearly mark any service-dependent checks that cannot be executed locally.

Completion means every existing page has received the shared visual system and a deliberate page review; confirmed prioritized defects are repaired or specifically documented with a reason; the supported checks have run and their results are reported; and Vercel deployment remains compatible. The handoff lists changed behavior, verification evidence, remaining limitations, and any backend/environment deployment steps. It does not claim that customs data is current or that a production deployment occurred.

## Review and next step

The user has approved the visual direction and optional dark theme. This written specification needs review before the implementation plan is prepared. The implementation plan will order baseline checks, shared layout/theme work, functional/security repairs, page overhauls, and final verification. No product code is changed by this specification.

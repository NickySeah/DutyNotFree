# API documentation

The current in-app reference lives at `/api-docs`. Requests use same-origin `/api/v1/...`, forwarded by Next.js to `BACKEND_API_URL`, unless service URL overrides are configured.

| Resource | Read endpoint |
| --- | --- |
| Tariffs | `GET /api/v1/tariffs/all` |
| Agreements | `GET /api/v1/ftas/all` |
| Countries | `GET /api/v1/countries/all` |
| HS classifications | `GET /api/v1/hscodes/all` |
| Visible products | `GET /api/v1/products/all` |
| Cost estimate | `GET /api/v1/calculator?value=1000&origin=702&dest=840&hsCode=847130&date=2026-10-04` |

Use country/HS codes from your actual dataset. Protected operations require `Authorization: Bearer <token>`; the signed-in frontend obtains tokens from `/api/auth/token`. Private products and watchlists enforce user ownership; administrative writes require admin privileges. Suppliers may manage their own products. Public product listing excludes private records belonging to other users.

The backend Swagger UI at `/swagger-ui/index.html` on the backend host supplies full request/response schemas and mutation endpoints. The internal frontend `/api/users/:userId` endpoint is a service-to-service email lookup protected by `x-internal-api-key`; it is not a public user directory.

Analytics are computed by the frontend from tariff records. There are no invented analytics endpoints. See the [deployment guide](../docs/deployment.md) for configuration and the [audit](../docs/revamp-audit.md) for verification limits.

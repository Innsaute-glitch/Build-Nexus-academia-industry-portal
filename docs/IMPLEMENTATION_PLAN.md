# Implementation plan

## Architecture

A single deployable Next.js 16 application uses React Server Components for reads, Server Actions and route handlers for validated writes, PostgreSQL 18 for durable state, Prisma 7 for typed queries, and opaque public identifiers at every browser-facing boundary. Authentication is a first-party database session stored in a Secure/HttpOnly/SameSite cookie. Authorisation is repeated in service functions and never inferred from navigation state.

## Phases

1. Model tenants, users, skills, assessments, opportunities, applications, portfolio verification, placements, notifications and audit events with database constraints.
2. Add authentication, generic failure responses, rate limiting, session rotation/invalidation and role/tenant guards.
3. Build the compact responsive shell and role-specific dashboards.
4. Complete assessment, opportunity discovery, application tracking, industry pipeline and portfolio verification workflows.
5. Add API, unit, integration, security and browser tests; then run migrate, seed, lint, typecheck, build and visual checks.

## Principal risks

- Tenant leakage: all institution and organisation queries are scoped from the authenticated session, not request data.
- Workflow replay: transitions validate current status and use a version in transactional updates.
- Documents: metadata and access control are implemented; binary uploads remain behind a scanner interface and are not publicly served.
- Demo access: one-click role login is development-only and requires an explicit environment flag.
- Analytics: every metric is computed from stored fictional seed records and labelled demo data.

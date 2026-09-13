# Nexus

**Portal for Academia-Industry Collaboration for Skill Mapping, Internships and Placement**

Nexus is a full-stack workspace connecting students, academicians, educational institutions and industry organisations. It focuses on explainable skill signals, scoped opportunity workflows, auditable applications and verified portfolio evidence.

The repository is a production-oriented vertical slice rather than a claim that every module in the wider product brief is finished. Implemented workflows are real and database-backed; staged modules are listed under Known limitations.

## Features

### Roles and access

- Student, academician, industry user, institution administrator and platform administrator roles.
- Server-side role checks on every protected page and mutation.
- Institution and organisation scope derived from the authenticated session, never trusted from form input.
- Dedicated permission-denied route and role-specific navigation.

### Authentication and sessions

- Argon2id password hashing through `@node-rs/argon2`.
- Opaque random browser sessions stored as SHA-256 hashes in PostgreSQL.
- HttpOnly, SameSite=Lax cookies; Secure cookies in production.
- Login throttling and generic invalid-credential responses.
- Logout invalidates the current database session.
- Development-only role demo access behind `ENABLE_DEMO_LOGIN=true`.

### Skills and assessment

- Versioned assessments and questions stored in PostgreSQL.
- Multiple-choice, Likert and self-report questions.
- Server-side answer validation and scoring.
- Category scores, strengths and gaps persisted per attempt.
- Separate self-reported, assessment-derived and verified skill evidence.
- Results are presented as directional signals, not absolute judgements.

### Opportunities and recommendations

- Internships, live projects, apprenticeships, entry-level jobs, faculty internships, industrial training, consultancy and research collaborations.
- Server-backed search across title, description, organisation and skills.
- Allow-listed type and work-mode filters using URL query parameters.
- Industry opportunity creation with boundary validation and pending-review status.
- Published-only participant access; industry users can view only their organisation's non-public opportunities.
- Recommendation scores computed from stored skill evidence, desired roles, requirements and work mode, with visible matching factors.

### Applications

- Server-validated participant eligibility and deadlines.
- Duplicate prevention through a database uniqueness constraint.
- Capacity checks inside serialisable transactions.
- Versioned optimistic concurrency for status changes.
- Organisation-scoped industry pipeline.
- Timestamped status history and audit events.

### Portfolio and verification

- Projects, certifications, internships, achievements, publications and workshops.
- Private-by-default records with explicit public visibility.
- Unverified, pending, verified, rejected and expired states.
- Institution-scoped verification queue.
- Replay-safe verification decisions with audit logging.
- External links restricted to HTTP and HTTPS.

### Dashboards and notifications

- Role-specific student, academician, industry and institution views.
- Metrics read from stored, scoped records; no decorative fallback figures.
- Institution analytics for assessment completion, applications, placements and skill demand.
- User-owned notification feed and read state.
- Responsive shell tested at 1440, 1024, 768 and 390 pixels.

## Technology

- Next.js 16.3.5 App Router and React 19
- TypeScript
- PostgreSQL 18
- Prisma ORM 7 with the PostgreSQL driver adapter
- Zod 4
- Tailwind CSS 4 and focused application CSS
- Vitest 5
- Playwright 1.63 with Chromium

## Project structure

```text
src/app/                 App Router pages and role-specific workflows
src/components/          Shared shell, forms and assessment runner
src/lib/                 Authentication, actions, validation, domain rules and database client
prisma/schema.prisma     Relational data model
prisma/migrations/       Committed migration history
prisma/seed.mjs          Guarded fictional demo seed
e2e/                     Playwright browser tests
docs/                    Architecture and implementation notes
```

## Prerequisites

- Node.js 20.9 or newer (tested with Node.js 22)
- npm 10 or newer
- PostgreSQL 18 (recent supported PostgreSQL releases should also work)

## Environment variables

Copy `.env.example` to `.env` and configure:

| Name | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Yes | PostgreSQL connection string for a dedicated application role |
| `SESSION_SECRET` | Yes | At least 32 random bytes reserved for server security operations |
| `DEMO_PASSWORD` | Demo only | Local password hashed for every fictional demo user |
| `ENABLE_DEMO_LOGIN` | No | Set to `true` only for development role buttons |
| `ALLOW_DESTRUCTIVE_SEED` | Seed only | Must be `true` to run the destructive demo seed |
| `APP_URL` | No | Public application base URL |

Never enable demo login or destructive seeding in production.

## Install and initialise

```bash
npm install
npx prisma generate
npx prisma migrate deploy
```

For a local fictional dataset, set a local-only `DEMO_PASSWORD`, then run:

```bash
ALLOW_DESTRUCTIVE_SEED=true npm run db:seed
```

The seed deletes application tables before inserting fictional data. It refuses to run without the explicit guard and when `NODE_ENV=production`.

## Demo accounts

All identities are fictional and use the password supplied through `DEMO_PASSWORD` during seeding.

| Role | Email |
| --- | --- |
| Student | `student@demo.academia` |
| Academician | `faculty@demo.academia` |
| Industry | `industry@demo.academia` |
| Institution administrator | `admin@demo.academia` |
| Platform administrator | `platform@demo.academia` |

Enable one-click role buttons locally with `ENABLE_DEMO_LOGIN=true`. Standard email/password login works independently.

## User guide

For a role-by-role walkthrough of the implemented workflows, see [docs/USER_GUIDE.md](docs/USER_GUIDE.md). It covers local setup, demo accounts, student, academician, industry and administrator workflows, navigation and current product boundaries.

## Run

Development:

```bash
npm run dev
```

Open http://localhost:3000.

Production:

```bash
npm run build
npm start
```

## Main routes

| Route | Purpose |
| --- | --- |
| `/login` | Email/password and development-only demo access |
| `/dashboard` | Role-specific workspace overview |
| `/assessment` | Assessment history and entry point |
| `/assessment/start` | Database-loaded, server-scored assessment |
| `/opportunities` | Search and filter opportunities |
| `/opportunities/[publicId]` | Opportunity details and application |
| `/opportunities/new` | Industry opportunity creation |
| `/applications` | Participant tracking or organisation pipeline |
| `/portfolio` | Portfolio records and verification requests |
| `/verification` | Institution/platform verification queue |
| `/analytics` | Institution-scoped aggregate reporting |
| `/notifications` | User-owned activity feed |
| `/profile` | Account scope and privacy summary |

## Security controls

- Parameterised Prisma queries and Zod boundary validation.
- Opaque CUID public identifiers; internal UUIDs remain server-side.
- Role, ownership and tenant checks in Server Actions and server pages.
- Database constraints for duplicate applications and verification requests.
- Serializable capacity checks and optimistic workflow concurrency.
- Audit logs for login, assessment, application, opportunity and verification actions.
- CSP, frame denial, MIME protection, referrer policy, permissions policy and production HSTS.
- Next.js Server Action Origin/Host comparison for CSRF protection.
- No browser tokens in local storage and no committed credentials.
- Document metadata includes access classification, checksum and malware-scan state; binaries are not publicly served.

## Tests and checks

```bash
npm test
npm run test:e2e
npm run lint
npm run typecheck
npm run build
npx prisma validate
npm audit --omit=dev
```

Automated coverage includes scoring, recommendations, permissions, transitions, validation, unsafe URLs, anonymous redirects, security headers, role routing, responsive overflow, console errors and persistent assessment completion.

## Data and privacy

- Seed content is fictional and labelled as demo data.
- Public portfolio visibility is opt-in.
- Platform administrators do not receive a document browser or automatic file access.
- Analytics do not expose individual documents.
- Passwords, session tokens and secrets are excluded from audit metadata.

## Known limitations

- Self-service registration, email verification, password reset and MFA enrolment are not yet implemented.
- Binary upload/download, object storage and a live malware scanner are not active. The metadata and scan-state model exists; no upload UI pretends otherwise.
- Saved opportunities, programme enrolment, mentorship assignment, milestones, attendance, disputes and certificates do not yet have workflow UI.
- Institution invitations/deactivation and platform taxonomy/moderation screens are not built.
- Candidate acceptance/withdrawal UI after industry selection is not built.
- Large-list pagination and notification preferences are not built.
- Database integration tests need an isolated fixture harness and a complete cross-tenant matrix before production release.
- Email delivery and external provider integrations are not configured.

These capabilities are schema-supported or architecture-ready where practical, but intentionally have no inert buttons or fake success states.

## Operations

- Use a least-privilege PostgreSQL role.
- Run `prisma migrate deploy`, not `prisma migrate dev`, in CI and production.
- Back up the database before migrations.
- Keep future uploaded binaries outside executable web roots.
- Development audit findings in Prisma CLI transitive packages do not affect the production dependency set; `npm audit --omit=dev` is the release-facing check.

## Licence

No licence has been selected. Do not assume redistribution rights until one is added.

## Publish to GitHub

The project directory is ready to be uploaded, but this local checkout has no GitHub remote configured. Create an empty repository on GitHub first (do not add a second README, licence or `.gitignore`), then run from this directory:

```bash
git add .
git commit -m "Build Nexus academia-industry portal"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
git push -u origin main
```

Review `git status` and `git diff --cached` before committing. `.env` and `.env.local` are ignored; only `.env.example` is intended to be published. GitHub authentication may prompt for a personal access token or use an already configured SSH key.

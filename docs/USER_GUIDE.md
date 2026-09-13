# Nexus User Guide

Nexus is a role-aware workspace for connecting academic communities with industry opportunities. The screens and actions you can see depend on your account role and its institution or organisation scope.

This guide covers the workflows implemented in the current vertical slice. It does not describe staged features such as self-service registration, file uploads, password reset or MFA enrolment.

## Start the app locally

1. Install Node.js 20.9 or newer and npm 10 or newer.
2. Install PostgreSQL and create a database plus a least-privilege application role.
3. From the project directory, install dependencies:

   ```bash
   npm install
   npx prisma generate
   npx prisma migrate deploy
   ```

4. Copy `.env.example` to `.env` and set at least `DATABASE_URL` and a random `SESSION_SECRET` containing 32 or more bytes.
5. For a fictional local walkthrough, also set `DEMO_PASSWORD` and enable demo access:

   ```dotenv
   DEMO_PASSWORD=choose-a-local-demo-password
   ENABLE_DEMO_LOGIN=true
   ```

6. Load the fictional dataset. This replaces the application data in the configured database, so use a local database only:

   ```bash
   ALLOW_DESTRUCTIVE_SEED=true npm run db:seed
   ```

7. Start the development server:

   ```bash
   npm run dev
   ```

8. Open <http://localhost:3000/login>.

The seed command creates fictional people, organisations, opportunities, assessment results, portfolio records, notifications and an application. It refuses to run in production or without the explicit guard.

## Demo accounts

Use the password entered as `DEMO_PASSWORD` when the seed ran. The one-click buttons appear only when `ENABLE_DEMO_LOGIN=true` in a non-production environment.

| Role | Email | Best starting point |
| --- | --- | --- |
| Student | `student@demo.academia` | Dashboard, assessment, opportunities and portfolio |
| Academician | `faculty@demo.academia` | Opportunities, applications and portfolio |
| Industry | `industry@demo.academia` | Opportunities and candidate pipeline |
| Institution administrator | `admin@demo.academia` | Verification queue and institution insights |
| Platform administrator | `platform@demo.academia` | Verification queue and institution insights; use normal email/password login |

These are fictional accounts. Do not use real personal data in the demo database.

## Student workflow

1. Sign in as the student and open **Overview**.
2. Review the recommended opportunities. The fit score is a directional explanation based on stored skills, desired roles and work mode; it is not a hiring decision.
3. Open **Skill assessment** and complete the *Career readiness baseline*. Results are scored on the server and saved as category signals.
4. Open **Opportunities** to search by role, skill or organisation. Use the type and work-mode filters, then open a result for its deadline, requirements, skills and openings.
5. Apply from the opportunity detail page. The server checks your role, the deadline and duplicate applications.
6. Track the result in **Applications**. Status changes and their timestamps are shown there.
7. Open **My portfolio** to review the seeded records and their visibility or verification state. Public visibility is opt-in.
8. Use **Notifications** for activity updates and **Profile** for account scope and privacy information.

Students can apply to participant opportunities such as internships and apprenticeships, but not faculty-only opportunities.

## Academician workflow

1. Sign in as the academician and open **Opportunities**.
2. Search for research collaborations, faculty internships and other relevant opportunities.
3. Open a detail page and apply where the opportunity type is suitable for an academician.
4. Track submitted applications in **Applications**.
5. Review seeded publications or other evidence in **My portfolio**.

Academicians cannot use the industry candidate pipeline or institution verification queue.

## Industry workflow

1. Sign in as the industry user and open **Overview**.
2. Open **Opportunities** to inspect opportunities belonging to your organisation.
3. Select **Post opportunity**, complete the brief, add required and preferred skills, and submit it. New postings use a review step before publication.
4. Open **Applications** to inspect candidates for your organisation’s opportunities only.
5. Use the status control to move an application through the allowed workflow, for example from submitted to under review, shortlisted or interview.
6. Review the activity shown on the dashboard and in **Notifications**.

Industry users cannot browse another organisation’s private opportunity records.

## Institution administrator workflow

1. Sign in as the institution administrator and open **Overview**.
2. Open **Verification queue** to review pending portfolio evidence from people in your institution.
3. Choose **Verify** or **Reject** for each request. Decisions are scoped to your institution and recorded in the audit trail.
4. Open **Institution insights** to view aggregate student, assessment, application, placement and requested-skill metrics.
5. Use **Notifications** for queue updates.

The analytics view is aggregate reporting. It does not expose individual documents.

## Platform administrator workflow

The platform administrator has the same current verification and analytics entry points as an institution administrator, but without an institution-specific navigation scope in the seeded account. Use the normal email/password form because there is no platform-admin demo button.

Platform administration screens for taxonomy, moderation, invitations and account deactivation are not implemented in this version.

## Common navigation

- **Overview**: role-specific summary and next actions.
- **Opportunities**: search, filter and inspect opportunities; industry users can create postings.
- **Applications**: participant application tracking or the industry candidate pipeline.
- **Skill assessment**: student assessment history and the assessment runner.
- **My portfolio**: student or academician portfolio records.
- **Verification queue**: institution or platform review of pending evidence.
- **Institution insights**: aggregate institution reporting.
- **Notifications**: account-owned activity feed.
- **Profile**: account details, role scope and privacy notes.

## Current boundaries

The current build intentionally does not provide self-service registration, email verification, password reset, MFA enrolment, binary document upload/download, saved opportunities, programme enrolment, mentorship, milestones, disputes, certificates, large-list pagination, notification preferences or email delivery. The interface does not present those staged capabilities as working actions.

## Resetting the demo

To restore the fictional walkthrough data, run the seed command again against the local database:

```bash
ALLOW_DESTRUCTIVE_SEED=true npm run db:seed
```

This is destructive to the configured application tables. Never point it at production or a database containing data you need to keep.

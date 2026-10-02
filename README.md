# OCNKS GLOBAL LTD Platform

## Overview
This platform provides the digital foundation for OCNKS GLOBAL LTD (OGL), a Nigerian-owned technical services company operating across energy, utilities, and built environment sectors. It powers the public brand presence as well as an internal operations console for RFQ intake, tracking, and customer communications.

## Stack
- **Framework:** Next.js App Router (TypeScript strict)
- **Styling:** Tailwind CSS
- **ORM & Database:** Prisma ORM with PostgreSQL (Vercel Postgres / Neon)
- **Deployment Target:** Vercel

## Local Setup
Follow these steps to run the application locally:

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```

3. **Provision PostgreSQL and set connection string:**
   Ensure PostgreSQL is running locally or remotely, then set `DATABASE_URL` in `.env`.

4. **Run database migrations:**
   ```bash
   npx prisma migrate dev
   ```

5. **Start development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment (Vercel)

1. Import repository into Vercel.
2. Build command is `prisma generate && next build` (configured in `package.json` scripts; Vercel should use `npm run build`).
3. Vercel Preview and Production must have these environment variables set before deploy, or page-data collection can still fail:
   - `DATABASE_URL` (Postgres connection string; required)
   - `AUTH_SECRET`
   - `AUTH_URL` (the deployment URL)
   - optional: `EMAIL_FROM`, `RESEND_API_KEY`, `ADMIN_BOOTSTRAP_EMAIL`, `BLOB_READ_WRITE_TOKEN`
4. After the first successful deploy, run migrations against the production database using `prisma migrate deploy` (do not run `migrate dev` on production).

## Scripts Table

| Script | Command | Purpose |
| --- | --- | --- |
| `dev` | `next dev` | Runs local Next.js development server |
| `build` | `next build` | Builds application for production |
| `start` | `next start` | Starts Next.js production server |
| `lint` | `eslint` | Runs ESLint static code analysis |
| `format` | `prettier --write .` | Formats codebase with Prettier |
| `db:generate` | `prisma generate` | Generates Prisma Client types |
| `db:migrate` | `prisma migrate dev` | Applies database migrations in dev |
| `db:studio` | `prisma studio` | Opens Prisma Studio GUI |

## Troubleshooting

### Prisma Connection Errors
- Ensure PostgreSQL service is active and accessible via the specified port in `DATABASE_URL`.
- Verify database user credentials and target database existence.
- If SSL is required (e.g. Neon or Vercel Postgres), append `?sslmode=require` to `DATABASE_URL`.

### AUTH_SECRET Generation
Generate a cryptographically secure 32-byte string using OpenSSL in terminal:
```bash
openssl rand -base64 32
```
Copy the generated string into `AUTH_SECRET` in `.env`.

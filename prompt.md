# User Prompts

1. make a file prompt.md and keep on adding all the prompts given here to that file

2. #  Event Ticketing Platform

## Role & Context

Act as a senior full-stack architect and engineer with 15+ years of experience building production-grade SaaS platforms. Design and build a complete Event Ticketing Platform with two separate dashboards — one for Customers and one for Admins/Organizers. Treat this as a real production build: clean architecture, proper validation, secure auth, and scalable database design — not a prototype.

## Tech Stack (mandatory)

- Frontend: React / Next.js (App Router), TypeScript, Tailwind CSS
- Backend: Node.js + Express, TypeScript
- Database: PostgreSQL (preferred for relational integrity of tickets/bookings/payments) with Prisma ORM — use MongoDB + Mongoose only if I explicitly say so
- Auth: JWT-based auth with refresh tokens, bcrypt password hashing, role-based access control (customer, admin)
- Payments: Stripe (test mode) integration for checkout
- File/Ticket generation: PDF ticket generation with QR code for check-in validation
- State management (frontend): React Query / TanStack Query for server state, Zustand or Context for UI state
- Deployment target: Vercel (frontend) + Render/Railway (backend) + managed Postgres (Neon/Supabase)

## High-Level Architecture

Frontend (Next.js)
   ↓ REST API (JSON, JWT auth)
Backend (Node.js + Express)
   ↓ Prisma ORM
Database (PostgreSQL)
   ↓ Webhooks
Stripe Payment Gateway

Build this as a monorepo with two workspaces: /apps/web (Next.js frontend, includes both customer and admin routes under role-protected layouts) and /apps/api (Express backend). Shared types go in /packages/types.

## Database Schema (design first, then generate Prisma schema)

Core entities:

- User — id, name, email, password_hash, role (customer | admin), created_at
- Event — id, organizer_id (FK → User), title, description, venue, date, start_time, end_time, banner_image, status (draft | published | cancelled), created_at
- TicketCategory — id, event_id (FK), name (VIP / Premium / General), price, total_capacity, tickets_sold, created_at
- Booking — id, user_id (FK), event_id (FK), status (pending | confirmed | cancelled), total_amount, payment_id, created_at
- BookingItem — id, booking_id (FK), ticket_category_id (FK), quantity, unit_price
- Ticket — id, booking_item_id (FK), qr_code, ticket_code (unique), is_checked_in, created_at
- Payment — id, booking_id (FK), stripe_payment_intent_id, amount, status, created_at

Enforce: ticket capacity can never be oversold (use a transaction with row-level locking or a check constraint when confirming a booking). Cascade deletes appropriately (e.g., deleting an event should not silently delete historical bookings — soft-delete/cancel instead).

## Feature Requirements

### 1. Customer Side

- Auth: Sign up, login, logout, forgot/reset password, JWT stored in httpOnly cookie
- Browse events: Paginated event listing, search by name, filter by date/venue, only show published events
- Event details page: Full description, venue, date/time, banner image, list of ticket categories with live availability (capacity − sold)
- Ticket selection: Choose category (VIP / Premium / General), select quantity per category, show running subtotal, prevent selecting more than available capacity
- Checkout: Order summary → Stripe Checkout/Payment Element → handle success/failure/cancel states
- Booking confirmation: On successful payment (via Stripe webhook), mark booking confirmed, generate tickets with unique QR codes, send confirmation email (mock or real via SendGrid/Resend)
- Ticket download: Generate a downloadable PDF ticket (event details + QR code + ticket code) per ticket purchased
- Booking history: List past & upcoming bookings with status, downloadable tickets, and cancellation option (if within cancellation window)

### 2. Admin / Organizer Side

- Admin login: Separate protected route (/admin/*), role-gated via middleware
- Event management: Create, edit, delete (soft-delete/cancel) events; upload banner image; set status (draft/published/cancelled)
- Ticket category management: Add/edit/delete categories per event, set price and total capacity
- Sales dashboard per event: Tickets sold vs. capacity per category (progress bars), total revenue per event, total revenue across all events, chart of sales over time (use Recharts or similar)
- Booking management: View all bookings (filter by event/status/date), view customer details per booking, manually cancel/refund a booking (triggers Stripe refund + capacity release)
- Customer view: Searchable table of customers with their booking history and total spend
- Check-in tool (bonus but recommended): Scan/enter ticket code to mark a ticket as checked in at the venue

## Non-Functional Requirements

- Input validation on both frontend (Zod/React Hook Form) and backend (Zod/Joi middleware)
- Proper error handling with consistent API error shape: { success, message, errors? }
- Rate limiting on auth endpoints
- Environment-based config (.env for DB URL, JWT secret, Stripe keys)
- Seed script with sample events, categories, and users (1 admin, 2 customers) for local testing
- Basic test coverage: unit tests for booking/capacity logic (this is the highest-risk area — no overselling), integration tests for auth and checkout flow
- Responsive UI, accessible components, loading/empty/error states everywhere

## Build Order (please follow this sequence)

1. Scaffold monorepo, set up Prisma schema + migrations, seed data
2. Build auth (signup/login/JWT/role middleware) end-to-end
3. Build Event + TicketCategory CRUD APIs, then Admin event management UI
4. Build public event listing/detail APIs and Customer browse/detail UI
5. Build booking + capacity-locking logic, then Stripe checkout integration + webhook handler
6. Build ticket/QR/PDF generation and booking confirmation flow
7. Build Customer booking history + ticket download
8. Build Admin sales dashboard, booking management, and customer view
9. Add tests for booking/capacity logic and checkout flow
10. Polish: loading states, error boundaries, responsive design, deployment config

## Deliverables

- Full working monorepo (/apps/web, /apps/api, /packages/types)
- Prisma schema + migration files + seed script
- .env.example for both apps
- README with setup steps, architecture overview, and API route list
3. start building. make different file like frontend (include all frontend file), api (all api files), backend(include all backend files)

4. there are errors when tried to deploy on the vercel clear them

5. there is npm error

6. push all changes to github

7. npm warn allow-scripts ... Error: No Next.js version detected. Make sure your package.json has "next" in either "dependencies" or "devDependencies". Also check your Root Directory setting matches the directory of your package.json file. these are the errors i get while deploying in vercel

8. npm run dev ... Error: listen EADDRINUSE: address already in use :::5001

9. npm warn deprecated jpeg-exif@1.1.4 ... crypto-js@4.2.0 ... in vercel when deployed. clear these errors

10. what should i do now

11. server cant be found

12. one more small changes. segregate the file. frontend(html,css,javaScript,react,next.js if any of thesepresent they sould come umder the frontend), Backend(react, next.js if present then those should be under backend), database (MySql, PostgreSql, MongoDB if any on these present it should come under database) rest ill tell you later

13. where index.html??



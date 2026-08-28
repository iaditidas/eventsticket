# EventHub — Event Ticketing Platform

A production-grade Event Ticketing Platform monorepo featuring Customer and Admin dashboards, atomic ticket capacity management, Stripe payments, PDF ticket generation, and QR code check-ins.

---

## 📁 Segregated Project Architecture

The project is structured into three clear logical pillars:

### 1. 🎨 Frontend (`/frontend` → `apps/web`)
Contains all user interface components, pages, styling, and client-side logic.
- **Framework**: Next.js 14 (App Router) & React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS, Vanilla CSS (`globals.css`)
- **State Management**: TanStack Query (React Query) for server state, Zustand for UI state
- **Components & Icons**: Lucide React, HTML5 Semantic Elements

### 2. ⚡ Backend (`/backend` → `apps/api`)
Contains REST API endpoints, business logic, authentication, and server-side utilities.
- **Runtime & Server**: Node.js + Express.js
- **Language**: TypeScript
- **Auth & Security**: JWT tokens (cookie/bearer), bcrypt password hashing, RBAC middleware, Rate Limiting
- **Integrations**: Stripe API (Checkout & Webhooks), PDFKit (PDF Ticket generation), QRCode generator
- **Shared Types**: `@eventhub/types` in `/packages/types`

### 3. 🗄️ Database (`/database` → `apps/api/prisma`)
Contains relational schema definitions, migrations, and database seed scripts.
- **Database Engine**: PostgreSQL (Production) / SQLite (`dev.db` for zero-setup local dev)
- **ORM**: Prisma ORM v5
- **Entities**: User, Event, TicketCategory, Booking, BookingItem, Ticket, Payment
- **Features**: Atomic transaction locking for zero-overselling safety, seed scripts (`seed.ts`)

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Database
```bash
# Push database schema & seed sample data
npm run db:push
npm run db:seed
```

### 3. Start Development Servers
```bash
# Run both Frontend & Backend concurrently
npm run dev

# Or run individual modules:
npm run dev:frontend
npm run dev:backend
```

---

## 📊 Default Test Credentials
- **Admin / Organizer**: `admin@eventhub.com` / `password123`
- **Customer 1**: `john@example.com` / `password123`
- **Customer 2**: `emma@example.com` / `password123`

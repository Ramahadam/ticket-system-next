# Ticket System — Junior Developer Guide

A complete walkthrough of every concept, pattern, and decision in this codebase. Read top to bottom once, then use it as a reference.

---

## Table of Contents

1. [What This App Does](#1-what-this-app-does)
2. [The Tech Stack — What Each Tool Is and Why](#2-the-tech-stack)
3. [Project Structure](#3-project-structure)
4. [How the App Boots](#4-how-the-app-boots)
5. [Routing — How URLs Map to Files](#5-routing)
6. [Authentication — How Login Works](#6-authentication)
7. [The Database Layer — Prisma](#7-the-database-layer)
8. [Server Actions — How Data Gets Written](#8-server-actions)
9. [Data Fetching — How Data Gets Read](#9-data-fetching)
10. [Forms — React Hook Form + Zod](#10-forms)
11. [Permission System](#11-permission-system)
12. [UI Components — shadcn/ui](#12-ui-components)
13. [File Uploads](#13-file-uploads)
14. [Constants and Enums](#14-constants-and-enums)
15. [How to Add a New Feature End-to-End](#15-how-to-add-a-new-feature)
16. [Local Setup](#16-local-setup)
17. [Mental Model — The Big Picture](#17-mental-model)

---

## 1. What This App Does

This is an **internal IT ticketing system** for a company. It has three types of tickets:

| Type | Table | Who uses it |
|------|-------|-------------|
| **Incident** | `incidents` | Something is broken — report it |
| **Service Request** | `serviceRequest` | Ask for something new (access, equipment) |
| **Change Request** | `changeRequest` | Propose a controlled IT change |

There are three user roles:

| Role | Access |
|------|--------|
| `standard` | Can only see and create their own tickets (`/my-tickets`) |
| `analyst` | Can see all tickets, assign engineers, change status |
| `admin` | Everything an analyst can do, plus manage users |

---

## 2. The Tech Stack

### Next.js 16 (App Router)
**What:** The main framework. Handles routing, server-side rendering, API routes, and the build system.  
**Why:** The App Router model lets you write **React Server Components** — components that run only on the server. This means you can query the database directly inside a page component without needing a separate API. Less code, faster page loads.  
**Key concept:** Files in `src/app/` become URL routes automatically. A folder with a `page.tsx` becomes a page.

### React 19
**What:** The UI library. You build interfaces by composing components.  
**Why:** Industry standard. The new concurrent features (like `useOptimistic`) make UI updates feel instant.

### TypeScript
**What:** JavaScript with types. Every variable, function parameter, and return value has a declared type.  
**Why:** Catches bugs before runtime. When you refactor, TypeScript tells you every place that breaks. In a codebase this size, it's essential.

### Prisma 7
**What:** The ORM (Object-Relational Mapper). It translates TypeScript function calls into SQL queries.  
**Why:** Instead of writing `SELECT * FROM incidents WHERE id = $1`, you write `prisma.incident.findUnique({ where: { id } })`. Prisma also generates TypeScript types from your schema, so the database and your code stay in sync.  
**Key files:** `prisma/schema.prisma` (the schema), `src/lib/prisma.ts` (the singleton client).

### PostgreSQL (via Neon)
**What:** The database. Stores all users, tickets, sessions.  
**Why:** Reliable, relational, excellent support for JSON columns (used for ticket `notes`).  
**Neon:** A serverless Postgres provider. You get a connection string in `.env.local`.

### NextAuth v5 (Auth.js)
**What:** Handles login, sessions, and route protection.  
**Why:** Manages the full auth lifecycle — password hashing comparison, JWT creation, session cookies, and redirects — so you don't have to build it yourself.  
**Key files:** `src/auth.ts` (credentials provider), `src/auth.config.ts` (route guards + JWT/session callbacks).

### Tailwind CSS 4
**What:** A utility-first CSS framework. Instead of writing `.button { padding: 8px; }`, you write `className="p-2"` directly in JSX.  
**Why:** Fast to style, no context switching between files. Tailwind v4 uses CSS variables and `@import "tailwindcss"` — no `tailwind.config.js` needed for basic use.

### shadcn/ui
**What:** A collection of accessible, unstyled UI components (Button, Table, Card, Input, etc.) that you copy into `src/components/ui/`.  
**Why:** You own the code — you can modify any component freely. Each component is built on Radix UI primitives which handle accessibility (keyboard nav, ARIA attributes) for you.  
**Key point:** shadcn is not an npm package you import. It's a CLI that copies component source into your repo. Look at `src/components/ui/` to see all available primitives.

### React Hook Form + Zod
**What:** React Hook Form manages form state. Zod validates the data.  
**Why:** Forms have a lot of moving parts — field registration, validation, error messages, submission state. RHF handles all of that without re-rendering the whole form on every keystroke. Zod gives you a schema (a set of rules) that validates data both in the browser and on the server, using the same definition.  
**Key files:** `src/lib/validation/` contains all schemas.

### Vercel Blob
**What:** File storage. When a user attaches a file to a ticket, it gets stored in Vercel's blob storage.  
**Why:** Simple API, integrates with Vercel deployments, gives you public URLs for stored files.

### Recharts
**What:** A chart library built on React and SVG.  
**Why:** Used on the dashboard to visualise ticket status distributions.

### TanStack Table
**What:** A headless table library — it gives you sorting, filtering, and pagination logic, but no HTML. You provide the markup.  
**Why:** Decouples table behaviour from table appearance.

---

## 3. Project Structure

```
src/
├── app/                        # All routes (Next.js App Router)
│   ├── (staff)/                # Route group: analyst/admin only
│   │   ├── dashboard/
│   │   ├── incidents/
│   │   │   ├── page.tsx        # List page
│   │   │   ├── [id]/page.tsx   # Detail page
│   │   │   ├── new/page.tsx    # Create page
│   │   │   ├── actions.ts      # Server Actions (write operations)
│   │   │   └── data.ts         # Data fetchers (read operations)
│   │   ├── requests/           # Service requests (same shape)
│   │   ├── change/             # Change requests (same shape)
│   │   ├── users/
│   │   ├── layout.tsx          # Auth gate + sidebar wrapper
│   │   └── error.tsx           # Error boundary for staff pages
│   │
│   ├── (user)/                 # Route group: all logged-in users
│   │   ├── my-tickets/
│   │   └── profile/
│   │
│   ├── api/
│   │   ├── auth/[...nextauth]/ # NextAuth internal endpoint
│   │   └── files/              # File upload/download endpoints
│   │
│   ├── login/
│   ├── layout.tsx              # Root layout (fonts, providers)
│   ├── page.tsx                # Root redirect
│   └── globals.css
│
├── components/
│   ├── ui/                     # shadcn primitives (Button, Input, etc.)
│   ├── app-sidebar.tsx         # Main nav sidebar
│   ├── incident-create-form.tsx
│   ├── incident-edit-form.tsx
│   └── ...                     # One form component per ticket type × action
│
├── hooks/
│   ├── use-mobile.ts
│   └── use-session-user.ts     # Client-side session access
│
├── lib/
│   ├── auth-helpers.ts         # requireUser() / requireStaff() / requireAdmin()
│   ├── constants.ts            # All enums, labels, options in one place
│   ├── env.ts                  # Typed env var access
│   ├── helpers.ts              # mergeNotes(), calculateDeadline()
│   ├── permissions.ts          # isStaff(), isAdmin(), canUser*()
│   ├── prisma.ts               # Prisma singleton
│   ├── ticket-helpers.ts       # Shared ticket query utilities
│   ├── upload-client.ts        # Browser-side file upload
│   └── validation/             # Zod schemas
│
├── auth.ts                     # NextAuth configuration (credentials)
├── auth.config.ts              # NextAuth middleware config (route guards)
└── types/
    └── next-auth.d.ts          # Extends NextAuth types with role/firstname/etc.

prisma/
├── schema.prisma               # Database schema (single source of truth)
├── migrations/                 # SQL migration history
└── seed.ts                     # Creates initial admin user
```

### Why are there two `(staff)` and `(user)` folders with parentheses?

The parentheses create a **Route Group** — a folder that groups routes together without adding to the URL. So `(staff)/incidents/page.tsx` maps to `/incidents`, not `/staff/incidents`. The grouping lets each group have its own `layout.tsx` (its own auth check and sidebar).

---

## 4. How the App Boots

When a user opens the app for the first time:

1. `src/app/layout.tsx` renders — this is the root of every page. It wraps everything in `ThemeProvider`, `AuthSessionProvider`, and `TooltipProvider`.
2. `src/app/page.tsx` (the root route `/`) immediately redirects based on session — staff go to `/dashboard`, users go to `/my-tickets`, guests go to `/login`.
3. Every protected route's `layout.tsx` calls `requireUser()` or `requireStaff()` **on the server**. If the check fails, Next.js redirects before any page content is rendered.

---

## 5. Routing

Next.js App Router maps the **file system** to URLs:

| File path | URL | Notes |
|-----------|-----|-------|
| `app/(staff)/incidents/page.tsx` | `/incidents` | List |
| `app/(staff)/incidents/[id]/page.tsx` | `/incidents/42` | `id` is a dynamic param |
| `app/(staff)/incidents/new/page.tsx` | `/incidents/new` | Create form |
| `app/(user)/my-tickets/page.tsx` | `/my-tickets` | User's own tickets |
| `app/login/page.tsx` | `/login` | — |

### Dynamic segments

When a URL has a variable part (like an ID), the folder is named `[id]`. The page receives it as a prop:

```tsx
// app/(staff)/incidents/[id]/page.tsx
export default async function IncidentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const incident = await getIncident(Number(id), ctx);
  // ...
}
```

### Layouts

`layout.tsx` files wrap all routes inside that folder. The staff layout (`(staff)/layout.tsx`) calls `requireStaff()` which redirects non-staff users before the page even renders. It also renders the sidebar.

---

## 6. Authentication

Authentication is split across two files intentionally — this is a Next.js requirement to avoid importing heavy server dependencies into the Edge middleware.

### `src/auth.config.ts` — Edge-safe config (route guards)

This runs in **Next.js Middleware** on every request, before any page code runs. It decides:

- Is this user logged in?
- Are they trying to access a staff route without staff role? → redirect to `/my-tickets`
- Are they trying to access `/login` while already logged in? → redirect to `/dashboard` or `/my-tickets`

The `jwt` callback puts `role`, `firstname`, `lastname` into the JWT token when the user logs in. The `session` callback copies those from the token into the session object so your components can access them.

### `src/auth.ts` — Full server config (credentials + Prisma)

This handles the actual login logic:

```
User submits email + password
    → Zod validates the input format
    → Prisma looks up the user by email
    → bcrypt compares the password against the stored hash
    → If OK, return the user object → NextAuth creates a JWT
    → If not OK, return null → NextAuth shows an error
```

### `src/lib/auth-helpers.ts` — Page-level guards

These three functions are called at the top of Server Component pages:

```ts
requireUser()   // any logged-in user — redirects to /login if not
requireStaff()  // analyst or admin — redirects to /my-tickets if standard
requireAdmin()  // admin only — redirects to /dashboard if analyst
```

Usage in a page:
```tsx
export default async function UsersPage() {
  const session = await requireAdmin(); // throws redirect if not admin
  // session.user.role, session.user.email, etc. are now available
}
```

### Accessing the session client-side

For `'use client'` components, use the `useSession()` hook (from `next-auth/react`, wrapped in `src/hooks/use-session-user.ts`). For server components, call `auth()` directly.

---

## 7. The Database Layer

### The schema (`prisma/schema.prisma`)

This file is the single source of truth for your database. Every table, column, enum, and relationship is defined here.

Key models:

```prisma
model Incident {
  id        Int          @id @default(autoincrement())
  requester String       // the email of the user who created it
  summary   String
  priority  Int          // 1=High, 2=Medium, 3=Normal, 4=Low
  status    TicketStatus @default(loged)
  notes     Json?        // array of { noteId, noteValue, createBy, createdAt }
  owner     String?      // assigned engineer's email, nullable
}
```

The `notes` field is a **JSON column**. It stores an array of note objects directly in the database row. This avoids needing a separate `notes` table for a feature that's simple enough not to warrant one.

### The Prisma client (`src/lib/prisma.ts`)

```ts
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

**Why this pattern?** In development, Next.js hot-reloads your code on every save. Without this, each reload would create a new database connection until you run out. Storing the client on `globalThis` means hot reloads reuse the existing connection.

In production, each serverless function invocation gets one client. No issue there.

### Running migrations

When you change `schema.prisma`, you create a migration:

```bash
npx prisma migrate dev --name describe_your_change
```

This generates a SQL file in `prisma/migrations/`, applies it to your local database, and regenerates the Prisma client types.

The `build` script in `package.json` runs `prisma migrate deploy` before every production build, so migrations are always applied before the app starts.

---

## 8. Server Actions

Server Actions are **async functions marked with `'use server'`** that run on the server and can be called directly from client components. They replace traditional API routes for mutations (create, update, delete).

### How they work

```
User clicks "Create incident"
    → Client component calls createIncidentAction(formData)
    → Next.js sends a POST request to an internal endpoint automatically
    → The action runs on the server (has access to DB, session, env vars)
    → Calls revalidatePath() to clear the page cache
    → Calls redirect() to send the user to the new ticket
```

### Example walkthrough (`src/app/(staff)/incidents/actions.ts`)

```ts
'use server';

export async function createIncidentAction(formData: FormData) {
  // 1. Verify the user is logged in
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');

  // 2. Validate + parse the form data
  const parsed = incidentCreateSchema.parse(formDataToObject(formData));

  // 3. Write to the database
  const created = await prisma.incident.create({ data: { ... } });

  // 4. Tell Next.js to re-fetch the incidents list (clears cache)
  revalidatePath('/incidents');

  // 5. Redirect the user to the new incident detail page
  redirect(`/incidents/${created.id}`);
}
```

### Why FormData instead of a plain object?

Server Actions receive `FormData` (the native browser form format). The `formDataToObject` helper converts it to a plain object so Zod can validate it. The `priority` field is a number, so it needs `Number(value)` — everything in FormData is a string by default.

### The NEXT_REDIRECT "error"

When `redirect()` is called inside a Server Action, Next.js throws an internal error with message `"NEXT_REDIRECT"`. In client components, you need to let this through:

```ts
// In the client component's onSubmit:
} catch (err) {
  if (err instanceof Error && err.message.includes('NEXT_REDIRECT')) return; // ← this is success
  toast.error('Create failed');
}
```

---

## 9. Data Fetching

Read operations live in `data.ts` files alongside their routes. These are plain async functions — no special annotation needed because they only run on the server (they're imported into Server Components).

### Example (`src/app/(staff)/incidents/data.ts`)

```ts
export async function getIncidentsList(
  raw: Record<string, string | string[] | undefined>,
  ctx: OwnershipContext,  // { role, email }
) {
  const parsed = parseTicketListParams(raw, PAGE_SIZE, { sortable: SORTABLE });

  const where: Prisma.IncidentWhereInput = {};
  if (parsed.status) where.status = parsed.status as TicketStatus;

  // Ownership filter: standard users only see their own tickets
  const scoped = withOwnershipFilter(where, ctx);

  const [data, count] = await prisma.$transaction([
    prisma.incident.findMany({ where: scoped, skip: parsed.skip, take: parsed.take }),
    prisma.incident.count({ where: scoped }),
  ]);

  return { data, count, page: parsed.page, pageSize: parsed.take };
}
```

**`$transaction`** runs both queries in one round-trip to the database, ensuring the count and the data are consistent.

**`withOwnershipFilter`** adds `{ requester: ctx.email }` to the `where` clause when the user is `standard`. Staff users see everything.

### How filtering and sorting work

URL search params like `?status=progress&sort=priority-asc&page=2` are passed to `parseTicketListParams()`. It returns:
- `skip` / `take` for pagination
- `status` for filtering
- `orderBy` for sorting (validated against an allowlist so users can't inject arbitrary column names)

The page component passes `searchParams` (Next.js gives this to every page) directly into the data function. No client-side state needed.

---

## 10. Forms

Every create/edit form in `src/components/` follows this pattern:

```
'use client' component
    ├── useForm() from React Hook Form
    │     └── zodResolver(schema) — validates on submit
    ├── register() — connects each input to the form
    ├── handleSubmit() — runs validation, then calls your onSubmit
    └── onSubmit
          ├── builds a FormData object
          ├── calls the Server Action
          └── handles errors / NEXT_REDIRECT
```

### Why build FormData manually instead of using a `<form action={...}>`?

Next.js supports progressive enhancement — `<form action={serverAction}>` works without JavaScript. But when you need to:
- Upload a file first, then attach its URL to the form
- Show a toast on error
- Disable the submit button during submission

…you need the JavaScript-driven approach (`handleSubmit` → build FormData → call action).

### Zod schema reuse

The same Zod schema validates data in two places:
1. **Browser** — `zodResolver` runs the schema when the user submits, showing inline error messages before anything hits the server.
2. **Server Action** — `schema.parse()` runs again inside the action. The server never trusts what the client sends.

---

## 11. Permission System

### Two layers

**Layer 1 — Middleware / layout guards** (`auth.config.ts`, `auth-helpers.ts`)  
Block unauthenticated or wrong-role users from reaching pages at all.

**Layer 2 — Action-level checks** (inside each Server Action)  
Even if someone bypasses the UI, the action re-checks:

```ts
// In updateIncidentAction:
if (!isStaff(session.user.role) && !isOwner) throw new Error('Forbidden');
// Only staff can change status/owner/priority:
if (parsed.status !== undefined && isStaff(session.user.role)) {
  data.status = parsed.status;
}
```

Standard users can only add notes and update attachments on their own tickets. They cannot change status, owner, priority, or impact — those fields are silently ignored even if sent.

### The helper functions (`src/lib/permissions.ts`)

```ts
isStaff(role)           // true for 'analyst' or 'admin'
isAdmin(role)           // true only for 'admin'
canUserAssign(role)     // wraps isStaff
canUserChangeStatus(role)
canUserCreate(role)     // always true — any logged-in user can create
```

Use these instead of inline string comparisons so the logic is centralised.

---

## 12. UI Components

### shadcn/ui components (`src/components/ui/`)

These are in your repo — you can edit them freely. Common ones used throughout:

| Component | What it renders |
|-----------|----------------|
| `Button` | Styled button with variants (default, outline, ghost) |
| `Card` / `CardHeader` / `CardContent` | Bordered container with header |
| `Table` / `TableRow` / `TableCell` | Accessible HTML table |
| `Badge` | Small inline label (used for ticket status) |
| `Input` / `Textarea` | Styled form fields |
| `Field` / `FieldLabel` / `FieldDescription` | Form field wrapper with label + error |
| `Sonner` (toast) | Notification toasts (via the `sonner` library) |

### The `render` prop on Button

shadcn's `Button` uses a `render` prop to swap its internal element:

```tsx
// Renders as an <a> tag (via Next.js Link) but with Button styles
<Button render={<Link href="/incidents/new">New incident</Link>} />
```

This is the correct way to make a styled button that navigates — never nest `<a>` inside `<button>`.

### The sidebar (`src/components/app-sidebar.tsx`)

The sidebar is rendered in `(staff)/layout.tsx` as a Server Component. It receives the user's name and role as props (from the session) and renders different nav items based on role. The `SidebarProvider` → `AppSidebar` + `SidebarInset` structure is the shadcn sidebar pattern.

---

## 13. File Uploads

File uploads use a two-step pattern to avoid sending large files through the server action:

```
Step 1 (browser → Vercel Blob, directly):
  User selects file
  → onFileChange() in the form component
  → calls uploadFile() from src/lib/upload-client.ts
  → fetch POST /api/files/upload-token → get a signed upload URL
  → PUT file directly to Vercel Blob using the signed URL
  → get back a public URL → store in component state

Step 2 (on form submit):
  The public URL is included in the FormData as the `file` field
  → Server Action stores the URL string in the database row
```

**Why the token endpoint?** The Vercel Blob token (secret) must never reach the browser. The `/api/files/upload-token` route runs on the server, verifies the user is logged in, and returns a short-lived signed URL. The browser uses that URL to upload directly — the file bytes never go through your Next.js server.

---

## 14. Constants and Enums

`src/lib/constants.ts` is the single source of truth for all magic strings and numbers.

**Never hardcode status strings or priority numbers in components.** Always import:

```ts
import { TICKET_STATUS, PRIORITY_LABELS, IMPACT_OPTIONS } from '@/lib/constants';

// Good:
where.status = TICKET_STATUS.LOGGED;

// Bad:
where.status = 'loged'; // ← typo-prone, not refactorable
```

Note: `TICKET_STATUS.LOGGED = 'loged'` — this is a deliberate legacy spelling from the original database. The constant hides the ugliness from the rest of the code.

---

## 15. How to Add a New Feature

Let's say you want to add a **Comments** section to incidents (separate from notes). Here is the exact sequence to follow:

### Step 1 — Update the schema

```prisma
// prisma/schema.prisma
model IncidentComment {
  id         Int      @id @default(autoincrement())
  incidentId Int
  authorEmail String
  body       String
  createdAt  DateTime @default(now())

  incident Incident @relation(fields: [incidentId], references: [id], onDelete: Cascade)
}

// Add the relation to Incident:
model Incident {
  // ... existing fields
  comments IncidentComment[]
}
```

Then run: `npx prisma migrate dev --name add_incident_comments`

### Step 2 — Add a Zod schema

```ts
// src/lib/validation/tickets.ts
export const commentCreateSchema = z.object({
  body: z.string().trim().min(1, 'Comment cannot be empty'),
});
```

### Step 3 — Write the Server Action

```ts
// src/app/(staff)/incidents/actions.ts
export async function createCommentAction(incidentId: number, formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');

  const { body } = commentCreateSchema.parse({ body: formData.get('body') });

  await prisma.incidentComment.create({
    data: { incidentId, authorEmail: session.user.email, body },
  });

  revalidatePath(`/incidents/${incidentId}`);
}
```

### Step 4 — Fetch it in the data layer

```ts
// src/app/(staff)/incidents/data.ts
export async function getIncident(id: number, ctx: OwnershipContext) {
  return prisma.incident.findUnique({
    where: { id },
    include: { comments: { orderBy: { createdAt: 'asc' } } }, // ← add this
  });
}
```

### Step 5 — Build the UI component

Create `src/components/incident-comment-form.tsx` as a `'use client'` component. Use `useForm` with `zodResolver(commentCreateSchema)`. On submit, build a `FormData` and call `createCommentAction(incidentId, fd)`.

### Step 6 — Render it on the detail page

In `src/app/(staff)/incidents/[id]/page.tsx`, the incident data now includes `comments`. Render them in a list and add the `<IncidentCommentForm>` below.

That's the full vertical slice — schema → validation → action → data → component → page.

---

## 16. Local Setup

```bash
# 1. Clone and install
git clone https://github.com/Ramahadam/ticket-system-next
cd ticket-system-next
npm install

# 2. Create your .env.local
cp .env.example .env.local
# Fill in:
# DATABASE_URL=          ← pooled Neon connection string
# DATABASE_URL_UNPOOLED= ← direct Neon connection string (for migrations)
# AUTH_SECRET=           ← run: openssl rand -base64 32
# BLOB_READ_WRITE_TOKEN= ← from Vercel Blob dashboard

# 3. Run migrations and seed
npx prisma migrate dev
npm run seed   # creates an admin user

# 4. Start
npm run dev
```

The seed creates an admin user — check `prisma/seed.ts` for the credentials.

### Key npm scripts

| Script | What it does |
|--------|--------------|
| `npm run dev` | Start dev server on localhost:3000 |
| `npm run build` | Runs `prisma generate + migrate deploy + next build` |
| `npm run lint` | ESLint — fix all warnings before committing |
| `npm run seed` | Seed the database with initial data |
| `npx prisma studio` | Open a browser GUI to browse/edit the database |
| `npx prisma migrate dev` | Create + apply a new migration after schema changes |

---

## 17. Mental Model — The Big Picture

```
Browser
  │
  ├── Server Component (page.tsx)
  │     ├── calls requireStaff() → checks session, redirects if not allowed
  │     ├── calls getIncidentsList() → queries Prisma → returns data
  │     └── renders HTML with the data — NO client-side fetch needed
  │
  └── Client Component (form.tsx)
        ├── manages local UI state (uploading, submitting)
        ├── validates input with Zod in the browser
        └── calls Server Action (actions.ts)
              ├── re-validates with Zod on the server
              ├── checks auth session again
              ├── writes to Prisma (PostgreSQL)
              ├── calls revalidatePath() → Next.js clears its cache
              └── calls redirect() → browser navigates to new page
```

### The two rules that explain 90% of the architecture

1. **Read = Server Component + data.ts**  
   Pages are async server components. They call data functions directly. No useEffect, no fetch, no loading spinners for initial data.

2. **Write = Client Component + Server Action**  
   Forms are client components (they need JS for validation UX). Mutations go through Server Actions (they run on the server, have DB access, can redirect).

When something feels complicated, ask: is this a read or a write? That tells you exactly where the code should go.

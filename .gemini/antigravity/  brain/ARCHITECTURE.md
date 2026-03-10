
**LINDY.AI — ARCHITECTURE CONSOLIDATION**

**Master Reference for AI Coding Agents**

This document is the **single source of truth** for all cross-cutting architectural concerns. It resolves conflicts between the three screen-level PRDs (Onboarding, Chat, Home/Templates) and provides the missing specifications that prevent hallucination in autonomous agents.

**Read this file FIRST before any screen-level PRD.**

Next.js 14 · TypeScript · Tailwind · Shadcn/UI · PostgreSQL · Prisma · NextAuth · Stripe

---

# 1. CANONICAL ROUTE STRUCTURE

**CRITICAL: The main post-onboarding dashboard route is `/home` (NOT `/dashboard`).** Any reference to `/dashboard` in other documents is a legacy error. Always use `/home`.

```
app/
├── (marketing)/              # Public pages — no auth required
│   ├── layout.tsx            # MarketingLayout
│   ├── page.tsx              # / — Marketing Homepage
│   ├── login/page.tsx        # /login
│   ├── privacy/page.tsx      # /privacy
│   └── terms/page.tsx        # /terms
│
├── (onboarding)/             # Auth + onboarding flow — partial auth
│   ├── layout.tsx            # OnboardingLayout (50/50 split)
│   ├── signup/
│   │   ├── page.tsx          # /signup — Auth Gate (Google OAuth, SSO)
│   │   ├── email/page.tsx    # /signup/email — Email signup form
│   │   └── verify/page.tsx   # /signup/verify — OTP verification
│   ├── profile/page.tsx      # /onboarding/profile — Profile survey (NOTE: route is /onboarding/profile but file is under (onboarding))
│   ├── intent/page.tsx       # /onboarding/intent — Team vs Solo
│   ├── workspace/page.tsx    # /onboarding/workspace — Workspace creation
│   └── pricing/page.tsx      # /onboarding/pricing — Stripe trial activation
│
├── (app)/                    # Authenticated app — full auth required
│   ├── layout.tsx            # DashboardLayout (sidebar + main)
│   ├── home/page.tsx         # /home — Agent Builder Dashboard (primary landing)
│   ├── chat/
│   │   ├── page.tsx          # /chat — Empty chat / new task auto-create
│   │   └── [taskId]/page.tsx # /chat/{taskId} — Active conversation
│   ├── agents/
│   │   ├── page.tsx          # /agents — My agents list
│   │   ├── new/page.tsx      # /agents/new — New agent wizard
│   │   └── [agentId]/
│   │       └── configure/page.tsx # /agents/{agentId}/configure
│   └── templates/
│       ├── page.tsx          # /templates — Full template gallery
│       └── [slug]/page.tsx   # /templates/{slug} — Template detail
│
├── api/                      # API routes (no route groups needed)
│   ├── auth/
│   │   ├── signup/route.ts
│   │   ├── verify-email/route.ts
│   │   ├── resend-verification/route.ts
│   │   └── [...nextauth]/route.ts
│   ├── users/me/
│   │   ├── profile/route.ts
│   │   ├── intent/route.ts
│   │   └── favorites/route.ts
│   ├── workspaces/
│   │   ├── route.ts          # POST create workspace
│   │   ├── me/route.ts       # GET current workspace
│   │   └── [id]/upload-logo/route.ts
│   ├── agents/
│   │   ├── route.ts          # POST create blank agent
│   │   └── from-prompt/route.ts # POST create agent from prompt
│   ├── tasks/
│   │   ├── route.ts          # GET list, POST create
│   │   └── [taskId]/
│   │       ├── messages/route.ts # GET messages, POST send (SSE response)
│   │       └── share/route.ts
│   ├── templates/route.ts    # GET with search, filter, grouped
│   ├── subscriptions/
│   │   ├── create-trial/route.ts
│   │   └── me/route.ts
│   ├── promos/active/route.ts
│   └── webhooks/stripe/route.ts
│
└── layout.tsx                # Root layout (html, body, font, providers)
```

---

# 2. MIDDLEWARE.TS — AUTH GUARD SPECIFICATION

**File:** `middleware.ts` (project root)

```typescript
import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Route classification
const PUBLIC_ROUTES = ['/', '/login', '/privacy', '/terms'];
const ONBOARDING_ROUTES = ['/signup', '/signup/email', '/signup/verify',
  '/onboarding/profile', '/onboarding/intent', '/onboarding/workspace', '/onboarding/pricing'];
const APP_ROUTES_PREFIX = ['/home', '/chat', '/agents', '/templates'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  const isPublic = PUBLIC_ROUTES.includes(pathname);
  const isOnboarding = ONBOARDING_ROUTES.some(r => pathname.startsWith(r));
  const isApp = APP_ROUTES_PREFIX.some(r => pathname.startsWith(r));
  const isApi = pathname.startsWith('/api');

  // 1. API routes — skip middleware (auth handled in route handlers)
  if (isApi) return NextResponse.next();

  // 2. Public routes — redirect authenticated users to /home
  if (isPublic) {
    if (token && token.onboardingComplete) {
      return NextResponse.redirect(new URL('/home', request.url));
    }
    return NextResponse.next();
  }

  // 3. No token at all — redirect to /signup
  if (!token) {
    const loginUrl = new URL('/signup', request.url);
    loginUrl.searchParams.set('returnUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 4. Onboarding routes — enforce step order
  if (isOnboarding) {
    const step = (token.onboardingStep as string) || 'profile';
    const stepOrder = ['verify', 'profile', 'intent', 'workspace', 'pricing', 'complete'];
    const stepRouteMap: Record<string, string> = {
      verify: '/signup/verify',
      profile: '/onboarding/profile',
      intent: '/onboarding/intent',
      workspace: '/onboarding/workspace',
      pricing: '/onboarding/pricing',
      complete: '/home',
    };

    // If onboarding complete, redirect to app
    if (step === 'complete') {
      return NextResponse.redirect(new URL('/home', request.url));
    }

    // If trying to access a future step, redirect to current step
    const currentStepRoute = stepRouteMap[step];
    if (currentStepRoute && pathname !== currentStepRoute && !pathname.startsWith(currentStepRoute)) {
      return NextResponse.redirect(new URL(currentStepRoute, request.url));
    }

    return NextResponse.next();
  }

  // 5. App routes — require completed onboarding
  if (isApp) {
    const step = (token.onboardingStep as string) || 'profile';
    if (step !== 'complete') {
      const stepRouteMap: Record<string, string> = {
        verify: '/signup/verify',
        profile: '/onboarding/profile',
        intent: '/onboarding/intent',
        workspace: '/onboarding/workspace',
        pricing: '/onboarding/pricing',
      };
      return NextResponse.redirect(new URL(stepRouteMap[step] || '/onboarding/profile', request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
```

**Auth guard behavior summary:**

| User State | Visits Public (/) | Visits Onboarding | Visits App (/home, /chat) |
|---|---|---|---|
| No session | ✅ Show page | → /signup | → /signup?returnUrl={path} |
| Session, onboarding incomplete | → /home (if complete) | ✅ Enforce step order | → Current onboarding step |
| Session, onboarding complete | → /home | → /home | ✅ Show page |

---

# 3. LAYOUT COMPONENT SPECIFICATIONS

## 3A. Root Layout — `app/layout.tsx`

```tsx
// app/layout.tsx
import { Inter } from 'next/font/google';
import { Providers } from '@/components/Providers'; // NextAuth SessionProvider + Toaster

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
```

## 3B. MarketingLayout — `app/(marketing)/layout.tsx`

```tsx
// app/(marketing)/layout.tsx
// Full-width page with sticky glassmorphism nav. No sidebar.
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      {/* Sticky Nav */}
      <nav className="flex items-center justify-between px-8 py-4 bg-white/80 backdrop-blur-sm sticky top-0 z-50 border-b border-gray-100">
        {/* Left: Logo */}
        <a href="/" className="flex items-center gap-2 font-semibold text-lg text-gray-900">
          <span className="text-blue-600">◇</span> Lindy
        </a>

        {/* Center: Nav Links */}
        <div className="flex items-center gap-6">
          {/* NavigationMenu: Product ▾ | Solutions | Enterprise | Pricing | Resources */}
        </div>

        {/* Right: CTAs */}
        <div className="flex items-center gap-3">
          <a href="/login" className="text-sm font-medium text-gray-700 hover:text-gray-900">Log in</a>
          <a href="#" className="border border-gray-300 rounded-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Talk to sales</a>
          <a href="/signup" className="bg-blue-600 text-white rounded-full px-4 py-2 text-sm hover:bg-blue-700">Try for free</a>
        </div>
      </nav>

      {/* Page Content */}
      <main>{children}</main>
    </div>
  );
}
```

## 3C. OnboardingLayout — `app/(onboarding)/layout.tsx`

```tsx
// app/(onboarding)/layout.tsx
// 50/50 split: form content left, animated preview right with amber gradient.
export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Left Panel — Form Content (50%) */}
      <div className="w-1/2 relative flex flex-col px-12 py-8">
        {/* Logo — absolute positioned, same on all onboarding screens */}
        <a href="/" className="absolute top-8 left-8 flex items-center gap-2 font-semibold text-lg text-gray-900">
          <span className="text-blue-600">◇</span> Lindy
        </a>

        {/* Form content injected here */}
        <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
          {children}
        </div>
      </div>

      {/* Right Panel — Animated Preview (50%) */}
      <div className="w-1/2 bg-gradient-to-br from-amber-50 via-yellow-100 to-amber-400 relative overflow-hidden">
        {/* Product preview illustrations — varies per screen but is purely decorative */}
        {/* pointer-events-none on all content */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Screen-specific preview component injected via React context or conditional */}
        </div>
      </div>
    </div>
  );
}
```

**Key dimensions:**
- Left panel: `w-1/2` (50vw), `px-12 py-8`, form content max-w-md centered
- Right panel: `w-1/2`, gradient `from-amber-50 via-yellow-100 to-amber-400`
- Logo: `absolute top-8 left-8`
- Back button (when present): `absolute bottom-8 left-8`
- Continue button (when present): `absolute bottom-8 right-8`

## 3D. DashboardLayout — `app/(app)/layout.tsx`

```tsx
// app/(app)/layout.tsx
// Three-panel layout: Global Sidebar + Content Area (which may contain ChatLayout)
'use client';

import { useState, useEffect } from 'react';
import { GlobalSidebar } from '@/components/shared/GlobalSidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  // Restore sidebar state from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('sidebar_expanded');
    if (stored !== null) setSidebarExpanded(stored === 'true');
  }, []);

  const toggleSidebar = () => {
    const next = !sidebarExpanded;
    setSidebarExpanded(next);
    localStorage.setItem('sidebar_expanded', String(next));
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-amber-50/40 via-yellow-50/30 to-white">
      {/* Global Left Sidebar */}
      <GlobalSidebar
        isExpanded={sidebarExpanded}
        onToggle={toggleSidebar}
      />

      {/* Main Content Area — flex-1, receives page content */}
      <main className="flex-1 flex flex-col min-h-screen">
        {children}
      </main>
    </div>
  );
}
```

**Key dimensions:**

| Panel | Width (expanded) | Width (collapsed) | Background | Z-index |
|---|---|---|---|---|
| GlobalSidebar | 220px | 48px | bg-white border-r border-gray-100 | 10 |
| ChatListPanel (on /chat/* only) | 240px fixed | 240px fixed | bg-white border-r border-gray-100 | 5 |
| Main Content | flex-1 (remaining) | flex-1 (remaining) | bg-white (chat) or transparent (home) | 1 |
| Message Input Bar | full width of main content | same | bg-white border-t border-gray-100 | 20 |
| Filter Dropdown | 192px (w-48) | same | bg-white border shadow-lg rounded-xl | 50 |

---

# 4. SHARED COMPONENT REGISTRY

**CRITICAL: These components are used across multiple screens. Build ONCE in `/src/components/shared/`. Do NOT duplicate.**

| Component | File Path | Used By | Props Interface |
|---|---|---|---|
| GlobalSidebar | /src/components/shared/GlobalSidebar.tsx | DashboardLayout (all app screens) | `{ isExpanded: boolean; onToggle: () => void }` |
| WorkspaceHeader | /src/components/shared/WorkspaceHeader.tsx | GlobalSidebar | `{ workspace: WorkspaceInfo; isExpanded: boolean }` |
| NavItems | /src/components/shared/NavItems.tsx | GlobalSidebar | `{ items: NavItem[]; isExpanded: boolean }` |
| PromoCard | /src/components/shared/PromoCard.tsx | GlobalSidebar (sidebar bottom) | `{ promo: PromoCard; onDismiss: (id: string) => void }` |
| TemplateCard | /src/components/shared/TemplateCard.tsx | Home Dashboard, Template Gallery, Search Results | `{ template: Template; onClick: (id: string) => void }` |
| CategoryTabs | /src/components/shared/CategoryTabs.tsx | Home Dashboard, Marketing Homepage | `{ categories: TemplateCategory[]; active: string; onChange: (id: string) => void }` |
| MessageInput | /src/components/shared/MessageInput.tsx | Chat screens (/chat, /chat/{taskId}) | `{ onSend: (content: string, attachments?: File[]) => void; disabled?: boolean; placeholder?: string }` |
| ChatListEmptyState | /src/components/shared/ChatListEmptyState.tsx | Filter no-results, Search no-results, No tasks | `{ reason: 'no_tasks' \| 'no_search_results' \| 'filter_no_results'; filterActive?: ChatFilter; searchQuery?: string }` |
| AgentBuilderInput | /src/components/shared/AgentBuilderInput.tsx | Marketing Homepage hero, /home Dashboard hero | `{ onSubmit: (prompt: string, mode?: 'agent' \| 'app') => void; chips?: TemplateChip[]; isAuthenticated: boolean }` |
| EmptyState | /src/components/shared/EmptyState.tsx | Template search no-results, general empty states | `{ icon?: ReactNode; title: string; subtitle?: string; action?: { label: string; onClick: () => void } }` |
| Toast | /src/components/shared/Toast.tsx | All screens (error/success notifications) | Uses Shadcn Toaster — global provider in Providers.tsx |

**Screen-specific components (NOT shared):**

| Component | File Path | Screen |
|---|---|---|
| AuthGate | /src/components/onboarding/AuthGate.tsx | /signup |
| EmailSignupForm | /src/components/onboarding/EmailSignupForm.tsx | /signup/email |
| EmailVerification | /src/components/onboarding/EmailVerification.tsx | /signup/verify |
| ProfileSurvey | /src/components/onboarding/ProfileSurvey.tsx | /onboarding/profile |
| UsageIntent | /src/components/onboarding/UsageIntent.tsx | /onboarding/intent |
| WorkspaceSetup | /src/components/onboarding/WorkspaceSetup.tsx | /onboarding/workspace |
| PricingTrial | /src/components/onboarding/PricingTrial.tsx | /onboarding/pricing |
| AgentBuilderHome | /src/components/app/AgentBuilderHome.tsx | /home |
| ChatLayout | /src/components/chat/ChatLayout.tsx | /chat/* (wraps ChatListPanel + ChatContent) |
| ChatListPanel | /src/components/chat/ChatListPanel.tsx | /chat/* |
| ChatThread | /src/components/chat/ChatThread.tsx | /chat/{taskId} |
| ChatFilterDropdown | /src/components/chat/ChatFilterDropdown.tsx | /chat (filter overlay) |
| ChatSearch | /src/components/chat/ChatSearch.tsx | /chat (search state) |
| TemplateGallery | /src/components/templates/TemplateGallery.tsx | /templates |

---

# 5. CONSOLIDATED PRISMA SCHEMA

**File:** `prisma/schema.prisma`

**This is the COMPLETE schema. Do NOT use fragments from individual PRDs — they are excerpts of this file.**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ========================
// AUTH & USER
// ========================

model User {
  id                  String    @id @default(cuid())
  fullName            String
  email               String    @unique
  passwordHash        String?   // bcrypt hash; null for OAuth users
  avatarUrl           String?
  authMethod          AuthMethod @default(EMAIL_PASSWORD)
  emailVerified       Boolean   @default(false)
  onboardingStep      String    @default("verify")   // verify | profile | intent | workspace | pricing | complete
  role                String?   // product | engineering | design | marketing | sales | operations | founder | other
  useCase             String?   // looking_around | automate_emails | customer_support | sales | meetings | lead_gen | other
  discoverySource     String?   // google | twitter | linkedin | friend | product_hunt | youtube | tiktok | newsletter | other
  workspaceIntent     String?   // team | solo
  tosAcceptedAt       DateTime? // timestamp of Terms acceptance
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt

  // Relations
  emailVerifications  EmailVerification[]
  ownedWorkspaces     Workspace[]        @relation("WorkspaceOwner")
  workspaceMemberships WorkspaceMember[]
  subscription        Subscription?
  createdAgents       Agent[]
  createdTasks        Task[]
  favoriteAgents      FavoriteAgent[]
}

enum AuthMethod {
  GOOGLE
  SSO
  EMAIL_PASSWORD
}

model EmailVerification {
  id        String    @id @default(cuid())
  userId    String
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  code      String    // 6-char alphanumeric OTP (uppercase)
  expiresAt DateTime  // now() + 15 minutes
  usedAt    DateTime?
  createdAt DateTime  @default(now())

  @@index([userId])
  @@index([code])
}

// ========================
// WORKSPACE & TEAM
// ========================

model Workspace {
  id          String   @id @default(cuid())
  name        String
  logoUrl     String?
  ownerId     String
  owner       User     @relation("WorkspaceOwner", fields: [ownerId], references: [id])
  plan        SubscriptionPlan @default(FREE)
  members     WorkspaceMember[]
  invitations PendingInvitation[]
  agents      Agent[]
  tasks       Task[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model WorkspaceMember {
  id          String   @id @default(cuid())
  workspaceId String
  workspace   Workspace @relation(fields: [workspaceId], references: [id])
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  role        WorkspaceRole @default(MEMBER)
  createdAt   DateTime @default(now())

  @@unique([workspaceId, userId])
}

enum WorkspaceRole { OWNER ADMIN MEMBER }

model PendingInvitation {
  id          String    @id @default(cuid())
  workspaceId String
  workspace   Workspace @relation(fields: [workspaceId], references: [id])
  email       String
  token       String    @unique @default(cuid())
  expiresAt   DateTime  // now() + 7 days
  acceptedAt  DateTime?
  createdAt   DateTime  @default(now())
}

// ========================
// SUBSCRIPTION & BILLING
// ========================

model Subscription {
  id                   String   @id @default(cuid())
  userId               String   @unique
  user                 User     @relation(fields: [userId], references: [id])
  stripeCustomerId     String   @unique
  stripeSubscriptionId String   @unique
  stripePriceId        String
  plan                 SubscriptionPlan @default(FREE)
  status               String   // trialing | active | past_due | canceled
  trialEndsAt          DateTime?
  currentPeriodEnd     DateTime?
  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt
}

enum SubscriptionPlan { FREE PRO ENTERPRISE }

// ========================
// TEMPLATES
// ========================

model Template {
  id          String   @id @default(cuid())
  name        String
  description String
  icon        String   // emoji or image URL
  iconBgColor String   @default("#3B82F6")
  slug        String   @unique
  prompt      String?  // default prompt injected when chip/card is clicked
  isFeatured  Boolean  @default(false)
  isPublic    Boolean  @default(true)
  popularity  Int      @default(0)
  accentColor String?  // for featured card background tint
  createdAt   DateTime @default(now())

  categories  TemplateCategoryMap[]
  roles       TemplateRoleMap[]
  useCases    TemplateUseCaseMap[]
}

model TemplateCategoryMap {
  id         String   @id @default(cuid())
  templateId String
  category   TemplateCategory
  template   Template @relation(fields: [templateId], references: [id])

  @@unique([templateId, category])
}

model TemplateRoleMap {
  id         String @id @default(cuid())
  templateId String
  role       TemplateRole
  template   Template @relation(fields: [templateId], references: [id])

  @@unique([templateId, role])
}

model TemplateUseCaseMap {
  id         String  @id @default(cuid())
  templateId String
  useCase    TemplateUseCase
  template   Template @relation(fields: [templateId], references: [id])

  @@unique([templateId, useCase])
}

enum TemplateCategory { PRODUCT MEETINGS MOST_POPULAR PRODUCTIVITY SALES }
enum TemplateRole { ENGINEERING HUMAN_RESOURCES MARKETING OPERATIONS PRODUCT SALES SUPPORT }
enum TemplateUseCase { AI_ASSISTANT CHATBOT COACHING CONTENT_CREATION DOCUMENT_PROCESSING EMAILS MEETINGS OUTREACH PHONE PRODUCTIVITY RESEARCH TEAMS WEB_SCRAPER }

// ========================
// AGENTS
// ========================

model Agent {
  id            String   @id @default(cuid())
  name          String   @default("Untitled Agent")
  description   String?
  prompt        String?  // natural language description used to create agent
  workspaceId   String
  workspace     Workspace @relation(fields: [workspaceId], references: [id])
  createdById   String
  createdBy     User     @relation(fields: [createdById], references: [id])
  status        AgentStatus @default(DRAFT)
  templateId    String?  // if created from template
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  tasks         Task[]
  favoritedBy   FavoriteAgent[]
}

enum AgentStatus { DRAFT ACTIVE PAUSED ARCHIVED }

// ========================
// TASKS & MESSAGES (Chat)
// ========================

model Task {
  id            String    @id @default(cuid())
  title         String    @default("New Task")
  workspaceId   String
  workspace     Workspace @relation(fields: [workspaceId], references: [id])
  agentId       String?
  agent         Agent?    @relation(fields: [agentId], references: [id])
  createdById   String
  createdBy     User      @relation(fields: [createdById], references: [id])
  status        TaskStatus @default(ACTIVE)
  isUnread      Boolean   @default(false)
  isFavorite    Boolean   @default(false)
  shareToken    String?   @unique  // generated on first share
  messages      Message[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@index([workspaceId, createdAt(sort: Desc)])
  @@index([title])  // For search performance
}

model Message {
  id        String      @id @default(cuid())
  taskId    String
  task      Task        @relation(fields: [taskId], references: [id], onDelete: Cascade)
  role      MessageRole
  content   String      @db.Text   // markdown formatted
  createdAt DateTime    @default(now())
}

enum TaskStatus { ACTIVE RUNNING ERROR COMPLETED ARCHIVED }
enum MessageRole { USER ASSISTANT SYSTEM }

model FavoriteAgent {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  agentId   String
  agent     Agent    @relation(fields: [agentId], references: [id])
  createdAt DateTime @default(now())

  @@unique([userId, agentId])
}
```

---

# 6. SSE STREAMING IMPLEMENTATION SPECIFICATION

**CRITICAL: This is the exact implementation pattern for agent response streaming in the Chat module.**

**Runtime:** Next.js App Router on Node.js runtime (NOT Edge). Vercel supports streaming responses on Node.js runtime.

**Implementation pattern:** `ReadableStream` with `new Response()`.

```typescript
// app/api/tasks/[taskId]/messages/route.ts

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs'; // CRITICAL: Do NOT use 'edge' — Prisma requires Node.js

export async function POST(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return new Response('Unauthorized', { status: 401 });

  const { content, attachmentUrls } = await request.json();

  if (!content?.trim()) {
    return Response.json({ error: 'empty_message' }, { status: 400 });
  }

  // Save user message
  const userMessage = await prisma.message.create({
    data: {
      taskId: params.taskId,
      role: 'USER',
      content: content.trim(),
    },
  });

  // Auto-update task title from first user message
  const task = await prisma.task.findUnique({ where: { id: params.taskId } });
  if (task?.title === 'New Task') {
    await prisma.task.update({
      where: { id: params.taskId },
      data: { title: content.trim().slice(0, 60) },
    });
  }

  // Create SSE stream
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      const send = (eventData: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(eventData)}\n\n`));
      };

      try {
        // === YOUR LLM/AGENT CALL HERE ===
        // Replace with actual agent execution logic.
        // Example using a streaming LLM API:
        //
        // const agentStream = await callAgent({ taskId: params.taskId, message: content });
        // for await (const chunk of agentStream) {
        //   send({ type: 'chunk', text: chunk.text });
        // }

        // Placeholder: simulate streaming response
        const responseText = 'Agent response placeholder';
        for (const word of responseText.split(' ')) {
          send({ type: 'chunk', text: word + ' ' });
          await new Promise(r => setTimeout(r, 50));
        }

        // If agent performed an action (build/update), send action event
        // send({ type: 'action', action: { type: 'build_agent', label: 'Build agent', status: 'completed', targetId: agentId } });

        // Save complete assistant message
        const assistantMessage = await prisma.message.create({
          data: {
            taskId: params.taskId,
            role: 'ASSISTANT',
            content: responseText, // Full accumulated response
          },
        });

        send({ type: 'done', messageId: assistantMessage.id });
      } catch (error) {
        send({ type: 'error', message: 'Agent encountered an error.' });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable Nginx buffering (for Vercel)
    },
  });
}
```

**Client-side consumption:**

```typescript
// src/hooks/useStreamingMessage.ts

export function useStreamingMessage() {
  const sendMessage = async (
    taskId: string,
    content: string,
    onChunk: (text: string) => void,
    onAction?: (action: AgentAction) => void,
    onDone?: (messageId: string) => void,
    onError?: (error: string) => void
  ) => {
    const response = await fetch(`/api/tasks/${taskId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      const err = await response.json();
      onError?.(err.message || 'Failed to send message');
      return;
    }

    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        try {
          const data = JSON.parse(line.slice(6));
          switch (data.type) {
            case 'chunk': onChunk(data.text); break;
            case 'action': onAction?.(data.action); break;
            case 'done': onDone?.(data.messageId); break;
            case 'error': onError?.(data.message); break;
          }
        } catch { /* skip malformed events */ }
      }
    }
  };

  return { sendMessage };
}
```

**SSE Event Schema:**

| Event Type | Payload | When |
|---|---|---|
| `chunk` | `{ type: 'chunk', text: string }` | Each token/word of agent response |
| `action` | `{ type: 'action', action: AgentAction }` | Agent performs build/update/tool_call |
| `done` | `{ type: 'done', messageId: string }` | Stream complete, message saved |
| `error` | `{ type: 'error', message: string }` | Agent execution failed |

---

# 7. ENVIRONMENT VARIABLE → FEATURE MAPPING

**CRITICAL: Defines which screens fail gracefully vs. hard-fail when a variable is missing.**

| Variable | Required By | Missing Behavior | Severity |
|---|---|---|---|
| `NEXTAUTH_SECRET` | ALL authenticated routes | **Hard fail.** App cannot start. NextAuth throws at init. | P0 — Blocker |
| `NEXTAUTH_URL` | ALL authenticated routes | **Hard fail.** OAuth callbacks break. | P0 — Blocker |
| `DATABASE_URL` | ALL routes with data | **Hard fail.** Prisma cannot connect. | P0 — Blocker |
| `GOOGLE_CLIENT_ID` | /signup (Google OAuth button) | **Graceful.** Hide Google OAuth button; show only SSO + email path. Log warning. | P1 — Degraded |
| `GOOGLE_CLIENT_SECRET` | /signup (Google OAuth callback) | **Graceful.** Same as above — disable Google OAuth path. | P1 — Degraded |
| `STRIPE_SECRET_KEY` | /onboarding/pricing, /api/subscriptions/* | **Graceful.** Show pricing table but disable "Start free trial" CTA. Display banner: "Payment processing unavailable. Please try again later." | P1 — Degraded |
| `STRIPE_WEBHOOK_SECRET` | /api/webhooks/stripe | **Graceful.** Webhook endpoint returns 500. Subscription status won't update automatically. Log critical warning. | P1 — Degraded |
| `STRIPE_PRO_PRICE_ID` | /onboarding/pricing | **Graceful.** Cannot create trial. Same treatment as missing STRIPE_SECRET_KEY. | P1 — Degraded |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | /onboarding/pricing (Stripe Elements client) | **Graceful.** Stripe Link panel won't render. Show fallback: "Unable to load payment form." | P1 — Degraded |
| `RESEND_API_KEY` | /signup/email (verification email), workspace invites | **Graceful.** User creation succeeds but no verification email sent. Show: "Verification email could not be sent. Please try again." with retry. | P1 — Degraded |
| `AWS_S3_BUCKET` | /onboarding/workspace (logo upload) | **Graceful.** Disable logo upload button. Show tooltip: "Logo upload unavailable." Workspace creation still works without logo. | P2 — Minor |
| `AWS_ACCESS_KEY_ID` | /onboarding/workspace (logo upload) | **Graceful.** Same as above. | P2 — Minor |
| `AWS_SECRET_ACCESS_KEY` | /onboarding/workspace (logo upload) | **Graceful.** Same as above. | P2 — Minor |

**Dev environment shortcut:** For local development without Stripe/AWS, set `NEXT_PUBLIC_DEV_MODE=true` to:
- Skip Stripe Link panel, auto-complete trial activation with mock subscription
- Skip S3 upload, store logo as base64 in database (logoUrl field)
- Skip Resend, log verification code to console

---

# 8. DESIGN SYSTEM TOKENS (CANONICAL)

These override any estimated values in individual PRDs.

| Token | Value | Usage |
|---|---|---|
| **Onboarding gradient (right panel)** | `bg-gradient-to-br from-amber-50 via-yellow-100 to-amber-400` | All onboarding right panels |
| **Dashboard background** | `bg-gradient-to-br from-amber-50/40 via-yellow-50/30 to-white` | /home main content area |
| **Chat background** | `bg-white` | /chat main content + chat list panel |
| **Primary CTA** | `bg-blue-600 hover:bg-blue-700 text-white rounded-lg` | All primary buttons |
| **Primary CTA (pill)** | `bg-blue-600 hover:bg-blue-700 text-white rounded-full` | Nav CTAs, submit circles |
| **Outline button** | `border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg` | Secondary actions, Back |
| **Input base** | `border border-gray-200 rounded-lg px-4 py-3 text-sm bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500` | All form inputs |
| **Card base** | `border border-gray-200 rounded-xl p-5 hover:border-gray-400 hover:shadow-sm` | Option cards, template cards |
| **Pro accent** | `bg-amber-400 text-white` | Pro tier highlights |
| **Error** | `text-red-500` | Error messages |
| **Disabled** | `bg-gray-100 text-gray-400 cursor-not-allowed` | Disabled buttons |
| **Active nav item** | `bg-gray-100 rounded-lg text-gray-900 font-medium` | Sidebar nav selected |
| **Inactive nav item** | `text-gray-600 hover:bg-gray-50 rounded-lg` | Sidebar nav unselected |
| **Sidebar border** | `border-r border-gray-100` | All sidebar/panel right edges |

---

# 9. CROSS-DOCUMENT CONFLICT RESOLUTIONS

| Conflict | Resolution |
|---|---|
| Home PRD says route is `/dashboard` | **Use `/home`.** All references to `/dashboard` are incorrect. The engineering spec and chat spec both use `/home`. |
| Home PRD references `app/(app)/dashboard/page.tsx` | **Use `app/(app)/home/page.tsx`.** |
| Chat spec Screen 9 uses `/home`, Engineering spec Screen 9 uses `/home` | ✅ Consistent. No conflict. |
| Template Gallery route | `/templates` — accessed from "See all >" on /home. Gallery is a separate route, NOT a sub-state of /home. |
| `AgentTemplate` vs `Template` model name | **Use `Template`** as the canonical Prisma model name. The `AgentTemplate` interface in the marketing homepage spec is a view-layer type that maps from the `Template` model. |
| User model defined differently across 3 docs | **Use the consolidated schema above (Section 5).** All fragments are merged. |
| `Workspace.plan` type | `SubscriptionPlan` enum on Workspace model. Subscription model tracks Stripe details. Workspace.plan is derived from the owner's subscription. |
| Chat spec `BR-801` numbering conflicts with Engineering spec `BR-801` | Business rules are scoped per-document. In case of conflict, the screen-specific PRD wins for that screen's behavior. |

---

**END OF ARCHITECTURE CONSOLIDATION**

**Feed this file to the AI coding agent BEFORE the three screen-level PRDs. The agent should treat this as the authoritative reference for all architectural decisions.**

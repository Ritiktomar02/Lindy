


**LINDY.AI**

**Complete Engineering Specification**

Onboarding Flow — Full 9-Section PRD

Next.js 14 · TypeScript · Tailwind · Shadcn/UI · PostgreSQL · Prisma · NextAuth · Stripe

Prepared for: AI Coding Agent (Claude Code / Google Antigravity)

March 2026 | McKinsey-Style Competitive Intelligence

**⚠️ PREREQUISITE: Read ARCHITECTURE.md FIRST. It contains the consolidated Prisma schema, middleware.ts, layout specs, shared component registry, SSE streaming implementation, and env variable → feature mapping that this spec references.**


# **Table of Contents**

**Screen 1:** Marketing Homepage  —  lindy.com/

**Screen 2:** Auth Gate — OAuth Entry  —  /signup

**Screen 3:** Email Signup Form  —  /signup/email

**Screen 4:** Email Verification (OTP)  —  /signup/verify

**Screen 5:** Profile Survey  —  /onboarding/profile

**Screen 6:** Usage Intent Selection  —  /onboarding/intent

**Screen 7:** Workspace Creation  —  /onboarding/workspace

**Screen 8:** Pricing & Trial Activation  —  /onboarding/pricing

**Screen 9:** Main Dashboard (Post-Onboarding)  —  /home


## **Global Architecture Notes**
Layout: All onboarding screens use a 50/50 split layout (OnboardingLayout — see ARCHITECTURE.md §3C for exact markup). Left side = form content, right side = animated product preview panel with warm amber/gold gradient background (`bg-gradient-to-br from-amber-50 via-yellow-100 to-amber-400`). Main app uses DashboardLayout (see ARCHITECTURE.md §3D) with sidebar.

Tech Stack: Next.js 14 App Router | TypeScript | Tailwind CSS | Shadcn/UI | PostgreSQL + Prisma | NextAuth.js | Stripe Checkout + Link | Resend (transactional email)

Auth Strategy: Google OAuth as primary path. SSO via SAML for enterprise. Email+password as fallback (exposed via 'I don't use Gmail' link). All paths converge at email verification before onboarding survey. **Auth guard middleware is defined in ARCHITECTURE.md §2 — do NOT implement per-page auth checks.**

Pricing: Free tier (40 tasks, 100+ integrations) and Pro tier ($49.99/mo, 500 tasks, 6,000+ integrations). 7-day free trial on Pro auto-collected via Stripe Link.

Consolidated Prisma Schema: **See ARCHITECTURE.md §5.** Schema fragments in each screen section below are excerpts for context only. Generate `schema.prisma` from ARCHITECTURE.md §5, not from fragments.

Environment Variables: **See ARCHITECTURE.md §7** for the complete env variable → feature mapping, including which screens fail gracefully vs. hard-fail when variables are missing.

Shared Components: **See ARCHITECTURE.md §4** for the shared component registry. Components used across multiple screens (AgentBuilderInput, TemplateCard, CategoryTabs, EmptyState, Toast) must be built once in `/src/components/shared/`.



**SCREEN 1: MARKETING HOMEPAGE**

Route: lindy.com/

`  `**SECTION 1**  

**SECTION 1 — Screen Identity**

|**Field**|**Value**|
| :- | :- |
|Screen name|Marketing Homepage|
|Route path|/|
|Page file|app/(marketing)/page.tsx|
|Component file|src/components/marketing/HomePage.tsx|
|Layout|MarketingLayout (full-width nav, no sidebar)|
|Auth requirement|Public — unauthenticated users only; redirect to /home if session exists|
|Entry conditions|Any unauthenticated visit to root|
|Flow position|Entry point → /signup (CTA) or /login|

`  `**SECTION 2**  

**SECTION 2 — UI Element Inventory**

|**Element**|**HTML Tag**|**Shadcn**|**Content/Label**|**Tailwind (est.)**|**Interactive?**|**State**|
| :- | :- | :- | :- | :- | :- | :- |
|Top nav bar|nav|—|Product | Solutions | Enterprise | Pricing | Resources|flex items-center justify-between px-8 py-4 bg-white/80 backdrop-blur sticky top-0 z-50|Yes|Always|
|Logo|a|—|◇ Lindy (diamond icon + wordmark)|flex items-center gap-2 font-semibold text-lg|Yes — href=/|Always|
|Nav dropdown: Product|button|NavigationMenu|Product ▾|text-sm text-gray-700 hover:text-gray-900|Yes|Always|
|Nav: Log in|a|Button variant=ghost|Log in|text-sm font-medium|Yes — href=/login|Always|
|Nav: Talk to sales|a|Button variant=outline|Talk to sales|border border-gray-300 rounded-full px-4 py-2 text-sm|Yes|Always|
|Nav: Try for free|a|Button variant=default|Try for free|bg-blue-600 text-white rounded-full px-4 py-2 text-sm|Yes — href=/signup|Always|
|Announcement banner|div|—|Announcing Lindy Assistant: Put your inbox and meetings on autopilot|bg-gray-900 text-white rounded-full px-4 py-2 text-sm flex items-center gap-2|Yes — CTA button|Always|
|Hero headline|h1|—|Meet your first AI employee|text-5xl font-bold text-gray-900 text-center mt-16|No|Always|
|Hero subheadline|p|—|Lindy is the simplest way for businesses to create, manage, and share agents. Now with just a prompt.|text-lg text-gray-600 text-center max-w-xl mx-auto mt-4|No|Always|
|Hero search input|textarea|—|How can I help? Describe your agent and I'll build it.|w-full max-w-2xl mx-auto rounded-2xl border border-gray-200 p-4 text-base shadow-sm resize-none|Yes — typing|Always|
|Hero submit button|button|Button|↑ (arrow icon)|bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center absolute right-3 bottom-3|Yes — submits prompt|Always|
|Quick-action chips|button[]|Badge variant=outline|Personal website | Customer Support | Outbound Sales Calls | Lead gen | Meeting Recorder | LinkedIn outreach | Support Chatbot|rounded-full border px-3 py-1 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-1|Yes — fills textarea|Always|
|Category filter tabs|div|Tabs|Product | Meetings | Most popular | Productivity | Sales | See all ›|flex gap-2 mt-12 border-b border-gray-200|Yes|Always|
|Template card grid|div|Card|Product cards with title, description, icon|grid grid-cols-2 gap-4 mt-4|Yes — click navigates|Always|
|Agents section header|div|—|◻ Agents / Build, scale, and manage your entire AI workforce with one platform.|mt-16 px-8|No|Always|
|Feature category tabs|div|—|Support | Sales | Marketing | Operations|flex gap-8 border-b border-gray-200 mt-6|Yes|Always|

`  `**SECTION 3**  

**SECTION 3 — TypeScript Interfaces**

interface HeroFormState {

`  `prompt: string;

}

interface TemplateCategory {

`  `id: string;

`  `label: string;

`  `icon: string; // lucide-react icon name

}

interface AgentTemplate {

`  `id: string;

`  `title: string;

`  `description: string;

`  `category: string;

`  `iconUrl: string;

`  `slug: string;

}

`  `**SECTION 4**  

**SECTION 4 — State Machine**

|**State**|**Trigger**|**UI Changes**|**Side Effects**|**Next State**|
| :- | :- | :- | :- | :- |
|IDLE|Page load|Hero textarea empty, submit button visible but inactive visually|None|TYPING|
|TYPING|User keystroke in textarea|Textarea shows user text, submit button highlights|None|READY|
|READY|Prompt length > 10 chars|Submit arrow button turns active blue|None|SUBMITTING|
|SUBMITTING|Click submit / Enter|Button shows spinner, textarea disabled|POST /api/agents/create-from-prompt, redirect to /signup if unauth|REDIRECT|
|CHIP\_SELECTED|Click quick-action chip|Chip fills textarea with template text|None|READY|

`  `**SECTION 5**  

**SECTION 5 — API Contract**

// POST /api/agents/create-from-prompt (if authenticated)

// Request: { prompt: string }

// 201: { agentId: string, redirectUrl: string }

// 401: { error: 'unauthenticated' } → redirect to /signup with prompt as query param

// GET /api/templates?category=product&limit=10

// 200: { templates: AgentTemplate[], categories: TemplateCategory[] }

`  `**SECTION 6**  

**SECTION 6 — Prisma Schema Fragment**

model AgentTemplate {

`  `id          String   @id @default(cuid())

`  `title       String

`  `description String

`  `category    String

`  `iconUrl     String

`  `slug        String   @unique

`  `prompt      String   // default prompt injected when chip is clicked

`  `isPublic    Boolean  @default(true)

`  `createdAt   DateTime @default(now())

}

`  `**SECTION 7**  

**SECTION 7 — Business Rules**

- BR-001: Unauthenticated users who submit a prompt are redirected to /signup with prompt stored in sessionStorage. Evidence: submit button visible to all visitors. Implementation: Check NextAuth session before API call; if null, redirect.
- BR-002: Quick-action chips auto-populate the textarea without submitting. Evidence: chips visible below textarea. Implementation: onClick sets textarea value, focuses textarea.
- BR-003: Nav persists with glassmorphism (backdrop-blur) on scroll. Evidence: sticky positioning visible. Implementation: sticky top-0 z-50 bg-white/80 backdrop-blur-sm.
- BR-004: Authenticated users visiting / are redirected to /home. Evidence: inferred from product patterns. Implementation: middleware.ts redirect.

`  `**SECTION 8**  

**SECTION 8 — Edge Cases & Error Handling**

**A) Observed**

- None on this screen — no error states visible in screenshots.

**B) Inferred**

- P0 — Prompt too short: If user submits < 3 chars, show inline toast: 'Please describe your agent in more detail.' Treatment: inline below textarea.
- P1 — API failure on agent creation: Toast 'Something went wrong. Please try again.' with retry button.
- P2 — Mobile breakpoint: Chips wrap to 2 rows; hero input reduces padding.

`  `**SECTION 9**  

**SECTION 9 — Acceptance Criteria**

1. GIVEN I visit lindy.com WHEN I am unauthenticated THEN I see the marketing homepage with hero section
1. GIVEN I type 'Build me a customer support chatbot' in the hero input WHEN I click the submit button THEN I am redirected to /signup with prompt stored in sessionStorage
1. GIVEN I click the 'Customer Support' chip WHEN chip is clicked THEN the textarea is populated with a pre-written prompt
1. GIVEN I am already logged in WHEN I visit / THEN I am redirected to /home
1. GIVEN the template API fails WHEN the page loads THEN the template section shows a skeleton loader for 3 seconds then an empty state



**SCREEN 2: AUTH GATE — OAUTH ENTRY**

Route: /signup

`  `**SECTION 1**  

**SECTION 1 — Screen Identity**

|**Field**|**Value**|
| :- | :- |
|Screen name|Auth Gate — Get Started|
|Route path|/signup|
|Page file|app/(onboarding)/signup/page.tsx|
|Component file|src/components/onboarding/AuthGate.tsx|
|Layout|OnboardingLayout (50/50: form left, product preview right with amber gradient)|
|Auth requirement|Public — redirect to /home if session active|
|Entry conditions|Unauthenticated user clicks 'Try for free' or submits prompt|
|Before|Marketing Homepage (/) or direct navigation|
|After (Google path)|/onboarding/profile (if new user) or /home (if returning)|
|After (SSO path)|External SSO provider → callback → /onboarding/profile|
|After (email path)|/signup/email|

`  `**SECTION 2**  

**SECTION 2 — UI Element Inventory**

|**Element**|**HTML Tag**|**Shadcn**|**Content**|**Tailwind (est.)**|**Interactive?**|**State**|
| :- | :- | :- | :- | :- | :- | :- |
|Logo|div|—|◇ Lindy|flex items-center gap-2 text-xl font-semibold absolute top-8 left-8|Yes — href=/|Always|
|Heading|h1|—|Get started for free|text-3xl font-bold text-gray-900 mt-12 mb-2|No|Always|
|Subheading|p|—|You're just a few steps away from automating your work and growing your business with AI Agents.|text-gray-500 text-sm mb-8 max-w-sm|No|Always|
|Google OAuth button|button|Button variant=outline|Sign up with Google|w-full flex items-center justify-center gap-3 border border-gray-200 rounded-lg py-3 text-sm font-medium text-gray-800 hover:bg-gray-50|Yes — triggers OAuth|Always|
|Google icon|img|—|Google G logo (colored)|w-5 h-5|No|Always|
|SSO button|button|Button variant=outline|Continue with SSO ↗|w-full flex items-center justify-center gap-2 border border-gray-200 rounded-lg py-3 text-sm font-medium text-gray-800 hover:bg-gray-50 mt-3|Yes — SSO flow|Always|
|Legal disclaimer|p|—|By signing up, you agree to Lindy's Privacy Policy and Terms of Service|text-xs text-gray-400 text-center mt-4|No|Always|
|Privacy Policy link|a|—|Privacy Policy|text-xs text-blue-500 underline|Yes — opens /privacy|Always|
|Terms of Service link|a|—|Terms of Service|text-xs text-blue-500 underline|Yes — opens /terms|Always|
|Divider|hr|Separator|—|my-6 border-gray-200|No|Always|
|No Gmail link|a|—|I don't use Gmail|text-sm text-gray-700 underline text-center block|Yes — navigates to /signup/email|Always|
|Login CTA|p|—|Already have an account? Log in|text-sm text-gray-500 text-center mt-6|No|Always|
|Log in link|a|—|Log in|text-sm text-gray-800 underline|Yes — href=/login|Always|
|Right panel|div|—|Product preview (email agent UI mockup)|w-1/2 bg-gradient-to-br from-amber-100 to-yellow-400 relative overflow-hidden|No|Always|

`  `**SECTION 3**  

**SECTION 3 — TypeScript Interfaces**

interface AuthGateProps {}

// NextAuth OAuth callback

interface OAuthCallbackParams {

`  `provider: 'google' | 'saml';

`  `code: string;

`  `state?: string;

}

interface AuthSession {

`  `userId: string;

`  `email: string;

`  `isNewUser: boolean;

`  `onboardingComplete: boolean;

}

`  `**SECTION 4**  

**SECTION 4 — State Machine**

|**State**|**Trigger**|**UI Changes**|**Side Effects**|**Next State**|
| :- | :- | :- | :- | :- |
|IDLE|Page load|All buttons enabled, normal appearance|None|—|
|GOOGLE\_LOADING|Click 'Sign up with Google'|Google button shows spinner, text changes to 'Connecting…', SSO button disabled|Initiate NextAuth Google OAuth flow|REDIRECTED|
|SSO\_LOADING|Click 'Continue with SSO'|SSO button shows spinner, Google button disabled|Open SSO provider URL in new tab or redirect|REDIRECTED|
|REDIRECTED|OAuth flow completes|—|Callback sets session. If new user → /onboarding/profile. If existing → /home|—|
|ERROR|OAuth error/denial|Toast: 'Authentication failed. Please try again.'|None|IDLE|

`  `**SECTION 5**  

**SECTION 5 — API Contract**

// GET /api/auth/signin/google (NextAuth)

// Initiates Google OAuth flow

// Redirects to Google → callback → /api/auth/callback/google

// POST /api/auth/callback/google (NextAuth)

// Handled by NextAuth: creates/updates User, sets session cookie

// New user: { isNewUser: true } → redirect /onboarding/profile

// Existing user: { isNewUser: false } → redirect /home

// GET /api/auth/sso (SAML)

// Initiates SAML SSO flow for enterprise users

// 302: redirect to IdP with SAMLRequest

`  `**SECTION 6**  

**SECTION 6 — Prisma Schema Fragment**

model User {

`  `id                String    @id @default(cuid())

`  `email             String    @unique

`  `fullName          String?

`  `avatarUrl         String?

`  `authMethod        AuthMethod

`  `emailVerified     Boolean   @default(false)

`  `onboardingStep    String    @default('profile') // profile|intent|workspace|pricing|complete

`  `createdAt         DateTime  @default(now())

`  `updatedAt         DateTime  @updatedAt

`  `workspaces        WorkspaceMember[]

}

enum AuthMethod {

`  `GOOGLE

`  `SSO

`  `EMAIL\_PASSWORD

}

`  `**SECTION 7**  

**SECTION 7 — Business Rules**

- BR-101: Google OAuth is the primary auth path — displayed first and most prominently. Evidence: Google button is top-positioned, full-width, with official Google branding. Implementation: signIn('google') from next-auth/react.
- BR-102: SSO is for enterprise users — displayed second with external link arrow (↗) indicating it opens a separate flow. Implementation: SAML provider via NextAuth enterprise plugin.
- BR-103: Email/password is deliberately hidden behind 'I don't use Gmail' link, reducing friction for the majority OAuth path. Implementation: Navigation link to /signup/email.
- BR-104: Accepting ToS is implicit on signup (no explicit checkbox). Evidence: Legal text is informational only. Implementation: Record timestamp of ToS acceptance on user creation.
- BR-105: Returning users who attempt /signup are silently redirected to /home. Implementation: getServerSession in page.tsx; if session exists, redirect()/home).

`  `**SECTION 8**  

**SECTION 8 — Edge Cases & Error Handling**

**A) Observed**

- No visible error states in screenshots for this screen.

**B) Inferred**

- P0 — User denies Google permissions: Toast 'Sign-in was cancelled. Please try again.' Return to IDLE.
- P0 — OAuth provider down: Toast 'Unable to connect to Google. Please try again or use email.' with 'Use email' link.
- P1 — Existing account with different auth method: Toast 'An account with this email already exists. Please log in with [original method].'
- P2 — Pop-up blocked (some browsers): Fallback to redirect flow instead of popup.

`  `**SECTION 9**  

**SECTION 9 — Acceptance Criteria**

1. GIVEN I visit /signup WHEN unauthenticated THEN I see the Auth Gate with Google button, SSO button, and legal text
1. GIVEN I click 'Sign up with Google' WHEN OAuth succeeds and I am a NEW user THEN I am redirected to /onboarding/profile
1. GIVEN I click 'Sign up with Google' WHEN OAuth succeeds and I am an EXISTING user THEN I am redirected to /home
1. GIVEN I click 'I don't use Gmail' WHEN clicked THEN I navigate to /signup/email
1. GIVEN I am already logged in WHEN I visit /signup THEN I am redirected to /home
1. GIVEN the Google OAuth fails WHEN the error callback fires THEN I see a toast error and remain on /signup



**SCREEN 3: EMAIL SIGNUP FORM**

Route: /signup/email

`  `**SECTION 1**  

**SECTION 1 — Screen Identity**

|**Field**|**Value**|
| :- | :- |
|Screen name|Email Signup Form|
|Route path|/signup/email|
|Page file|app/(onboarding)/signup/email/page.tsx|
|Component file|src/components/onboarding/EmailSignupForm.tsx|
|Layout|OnboardingLayout (50/50 split — form left, amber preview right)|
|Auth requirement|Public|
|States captured|Empty (Image 9), Partial fill name+email (Image 10), All filled + password hidden (Image 17), Password revealed (Image 18)|
|Entry conditions|User clicked 'I don't use Gmail' on Auth Gate|
|Before|/signup (Auth Gate)|
|After|/signup/verify (email verification OTP)|

`  `**SECTION 2**  

**SECTION 2 — UI Element Inventory**

|**Element**|**Tag**|**Shadcn**|**Content**|**Tailwind**|**Interactive?**|**State**|
| :- | :- | :- | :- | :- | :- | :- |
|Logo|a|—|◇ Lindy|absolute top-8 left-8 flex items-center gap-2 font-semibold text-lg|Yes|Always|
|Heading|h1|—|Let's get you signed up|text-3xl font-bold text-gray-900 mt-12 mb-8|No|Always|
|Full Name label|label|—|Full Name|block text-sm font-medium text-gray-700 mb-1|No|Always|
|Full Name input|input|Input|Empty / 'Alex Smith'|w-full border border-gray-200 rounded-lg px-4 py-3 text-sm bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500|Yes|Always|
|Email Address label|label|—|Email Address|block text-sm font-medium text-gray-700 mb-1 mt-4|No|Always|
|Email input|input|Input|Empty / 'alexsmith.mobbin@gmail.com'|w-full border border-gray-200 rounded-lg px-4 py-3 text-sm bg-gray-50 focus:bg-white|Yes|Always|
|Password label|label|—|Password|block text-sm font-medium text-gray-700 mb-1 mt-4|No|Always|
|Password input|input|Input|Empty / '••••••••••' / 'Mobbin12&3'|w-full border border-gray-200 rounded-lg px-4 py-3 text-sm bg-gray-50 pr-12|Yes|Always|
|Show/Hide password toggle|button|—|Eye icon (open=show, slashed=hide)|absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600|Yes — toggles type|Always|
|Sign up button|button|Button|Sign up|w-full bg-blue-600 text-white rounded-lg py-3 font-medium mt-6 hover:bg-blue-700|Yes|IDLE/READY|
|Sign up button (loading)|button|Button|Signing up… (spinner)|w-full bg-blue-500 text-white rounded-lg py-3 opacity-80 cursor-not-allowed|No|SUBMITTING|
|Legal text|p|—|By signing up, you agree to Lindy's Privacy Policy and Terms of Service|text-xs text-gray-400 text-center mt-3|No|Always|
|Privacy Policy link|a|—|Privacy Policy|text-xs text-blue-500 underline|Yes|Always|
|Terms of Service link|a|—|Terms of Service|text-xs text-blue-500 underline|Yes|Always|
|Right preview panel|div|—|Animated email agent mockup on amber gradient|w-1/2 bg-gradient-to-br from-yellow-50 to-amber-400|No|Always|

**Form Field Specification**

|**Field Name**|**Type**|**Placeholder**|**Validation Rules**|**Error Message**|**Default**|
| :- | :- | :- | :- | :- | :- |
|fullName|text|(empty)|required, min 2 chars, max 100 chars|Please enter your full name|—|
|email|email|(empty)|required, valid email format (RFC 5322)|Please enter a valid email address|—|
|password|password|(empty)|required, min 8 chars, must contain uppercase, lowercase, number or special char|Password must be at least 8 characters|—|

`  `**SECTION 3**  

**SECTION 3 — TypeScript Interfaces**

interface EmailSignupFormData {

`  `fullName: string;

`  `email: string;

`  `password: string;

}

interface EmailSignupFormState extends EmailSignupFormData {

`  `showPassword: boolean;

`  `isSubmitting: boolean;

`  `errors: Partial<Record<keyof EmailSignupFormData, string>>;

}

// POST /api/auth/signup — Request body

interface SignupRequest {

`  `fullName: string;

`  `email: string;

`  `password: string; // plain text; server hashes with bcrypt cost 12

}

// POST /api/auth/signup — Response

interface SignupResponse {

`  `userId: string;

`  `email: string;

`  `verificationRequired: boolean; // always true for email/password

}

interface SignupErrorResponse {

`  `error: 'email\_taken' | 'weak\_password' | 'invalid\_email' | 'server\_error';

`  `message: string;

}

`  `**SECTION 4**  

**SECTION 4 — State Machine**

|**State**|**Trigger**|**UI Changes**|**Side Effects**|**Next State**|
| :- | :- | :- | :- | :- |
|IDLE|Page load (Image 9)|All fields empty, Sign up button enabled (no validation yet)|None|FILLING|
|FILLING|User types in any field|Typed content appears in fields, real-time validation on blur|None|PARTIAL/READY|
|PARTIAL\_FILL|Name+email filled, no password (Image 10)|Sign up button still enabled (client-side submit will validate)|None|READY|
|READY|All 3 fields valid (Image 17 — password hidden)|Sign up button fully active, eye icon visible in password field|None|SUBMITTING|
|PASSWORD\_REVEALED|Click eye icon (Image 18)|Password field type changes to text, eye icon changes to eye-off, actual password text visible|None|READY|
|SUBMITTING|Click Sign up with valid data|Button shows spinner + 'Signing up…' text, all inputs disabled|POST /api/auth/signup|SUCCESS/ERROR|
|SUCCESS|API returns 201|Brief success flash|Send verification email, navigate to /signup/verify|—|
|ERROR\_EMAIL\_TAKEN|API returns 400 email\_taken|Inline error below email input: 'An account with this email already exists.'|None|IDLE|
|ERROR\_WEAK\_PASSWORD|API returns 400 weak\_password|Inline error below password input|None|IDLE|
|ERROR\_SERVER|API returns 500|Toast: 'Something went wrong. Please try again.'|None|IDLE|

`  `**SECTION 5**  

**SECTION 5 — API Contract**

// POST /api/auth/signup

// Content-Type: application/json

// Request: { fullName: string, email: string, password: string }

//

// 201: { userId: string, email: string, verificationRequired: true }

//   Side effects: create User record (passwordHash with bcrypt 12),

//   create EmailVerification record with 6-char code (expiry 15min),

//   send verification email via Resend

//

// 400: { error: 'email\_taken', message: 'An account with this email already exists.' }

// 400: { error: 'weak\_password', message: 'Password must be at least 8 characters.' }

// 400: { error: 'invalid\_email', message: 'Please enter a valid email address.' }

// 500: { error: 'server\_error', message: 'Something went wrong. Please try again.' }

`  `**SECTION 6**  

**SECTION 6 — Prisma Schema Fragment**

model User {

`  `id                String    @id @default(cuid())

`  `fullName          String    // from form input

`  `email             String    @unique // from form input

`  `passwordHash      String?   // bcrypt hash, null for OAuth users

`  `authMethod        AuthMethod @default(EMAIL\_PASSWORD)

`  `emailVerified     Boolean   @default(false)

`  `onboardingStep    String    @default('verify')

`  `createdAt         DateTime  @default(now())

`  `emailVerifications EmailVerification[]

}

model EmailVerification {

`  `id        String   @id @default(cuid())

`  `userId    String

`  `user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

`  `code      String   // 6-char alphanumeric OTP

`  `expiresAt DateTime // now() + 15 minutes

`  `usedAt    DateTime?

`  `createdAt DateTime @default(now())

`  `@@index([userId])

}

`  `**SECTION 7**  

**SECTION 7 — Business Rules**

- BR-201: All three fields (name, email, password) are required before Sign up submission. Evidence: All fields labeled without optional indicator; Sign up button present regardless of fill state (client validates on submit). Implementation: Zod schema validation on submit, inline errors per field.
- BR-202: Password has a show/hide toggle with eye icon. Evidence: Eye icon visible in password field in all states (Images 9, 10, 17). Eye-off icon when password is revealed (Image 18). Implementation: useState(showPassword) toggling input type.
- BR-203: Email/password signup ALWAYS requires email verification. Evidence: Check your inbox screen follows. Implementation: verificationRequired always true; no way to skip.
- BR-204: The right preview panel is purely decorative — an animated product UI mockup. Evidence: No interactive elements in right panel. Implementation: Static positioned image or CSS animation, pointer-events-none.
- BR-205: Terms acceptance is implicit on form submission. Evidence: Legal text below button without checkbox. Implementation: Record tosAcceptedAt timestamp on user creation.

`  `**SECTION 8**  

**SECTION 8 — Edge Cases**

**A) Observed**

- Password reveal: Password text 'Mobbin12&3' visible in Image 18 — implementation confirmed.

**B) Inferred**

- P0 — Email already registered (email\_taken): Inline error below email field: 'An account with this email already exists. Log in instead?' with link.
- P0 — Network failure during submit: Toast 'Connection failed. Check your internet and try again.'
- P1 — Password too short (<8 chars): Inline error below password: 'Password must be at least 8 characters.'
- P1 — Invalid email format: Inline error: 'Please enter a valid email address.'
- P2 — Copy-paste into password field: Should work normally; do not strip characters.
- P2 — Autofill from browser: Allow browser autofill; ensure autocomplete='email' and autocomplete='new-password' attributes set correctly.

`  `**SECTION 9**  

**SECTION 9 — Acceptance Criteria**

1. GIVEN I land on /signup/email WHEN the page loads THEN all 3 fields are empty and the Sign up button is visible
1. GIVEN I fill all fields with valid data WHEN I click Sign up THEN a spinner shows and POST /api/auth/signup fires
1. GIVEN the signup API returns 201 WHEN the response arrives THEN I am navigated to /signup/verify with my email address displayed
1. GIVEN I enter an already-registered email WHEN I click Sign up THEN I see inline error 'An account with this email already exists.'
1. GIVEN my password is 7 characters WHEN I click Sign up THEN I see inline error 'Password must be at least 8 characters.'
1. GIVEN I click the eye icon on the password field WHEN toggled THEN the password text becomes visible and the icon changes to eye-off
1. GIVEN I am filling in the form WHEN the API call is in flight THEN all inputs and the Sign up button are disabled



**SCREEN 4: EMAIL VERIFICATION (OTP)**

Route: /signup/verify

`  `**SECTION 1**  

**SECTION 1 — Screen Identity**

|**Field**|**Value**|
| :- | :- |
|Screen name|Email Verification — Check Your Inbox|
|Route path|/signup/verify|
|Page file|app/(onboarding)/signup/verify/page.tsx|
|Component file|src/components/onboarding/EmailVerification.tsx|
|Layout|OnboardingLayout (50/50)|
|Auth requirement|Partially authenticated (userId in session, emailVerified: false)|
|States captured|Empty OTP (Image 14 — 000000 placeholder), Filled OTP (Image 13 — IGIEP code), Continue disabled in both|
|Entry conditions|User completed email signup, verification email sent|
|Before|/signup/email|
|After|/onboarding/profile|

`  `**SECTION 2**  

**SECTION 2 — UI Element Inventory**

|**Element**|**Tag**|**Shadcn**|**Content**|**Tailwind**|**Interactive?**|**State**|
| :- | :- | :- | :- | :- | :- | :- |
|Logo|a|—|◇ Lindy|absolute top-8 left-8|Yes|Always|
|Heading|h1|—|Check your inbox|text-3xl font-bold text-gray-900 mt-12|No|Always|
|Verification sent text|p|—|A verification email has been sent to {email}|text-sm text-gray-500 mt-2|No|Always|
|Email display (dynamic)|span|—|alexsmith.mobbin@gmail.com (user's actual email)|font-medium text-gray-700|No|Always|
|CTA subtext|p|—|Confirm your email and start using Lindy.|text-sm text-gray-500 mt-4|No|Always|
|Open email app link|a|—|Open email app ↗|text-sm text-gray-800 underline|Yes — opens mailto: or mail client|Always|
|Code label|label|—|Code|block text-sm font-medium text-gray-700 mt-6 mb-1|No|Always|
|OTP input|input|Input|000000 (placeholder) / IGIEP (filled example)|w-full border border-gray-200 rounded-lg px-4 py-3 text-center text-xl tracking-[0.5em] font-mono bg-gray-50|Yes|Always|
|Continue button (disabled)|button|Button|Continue|w-full bg-gray-100 text-gray-400 rounded-lg py-3 cursor-not-allowed mt-3|No|IDLE (code empty or < 5 chars)|
|Continue button (active)|button|Button|Continue|w-full bg-blue-600 text-white rounded-lg py-3 hover:bg-blue-700 mt-3|Yes|READY (code valid length)|
|Back button|button|Button variant=outline|Back|border border-gray-200 rounded-lg px-6 py-3 text-sm text-gray-700 absolute bottom-8 left-8|Yes — navigates to /signup/email|Always|

**OTP Input Field Specification**

|**Field Name**|**Type**|**Placeholder**|**Validation Rules**|**Error Message**|**Notes**|
| :- | :- | :- | :- | :- | :- |
|verificationCode|text|000000|required, 5-6 alphanumeric chars (uppercase), no spaces|Invalid code. Please check your email and try again.|Image 13 shows 5-char 'IGIEP'; placeholder shows 6 zeros — support both 5 and 6 char codes|

`  `**SECTION 3**  

**SECTION 3 — TypeScript Interfaces**

interface VerifyEmailFormState {

`  `code: string;

`  `isSubmitting: boolean;

`  `error: string | null;

}

interface VerifyEmailRequest {

`  `userId: string; // from session

`  `code: string;

}

interface VerifyEmailResponse {

`  `success: boolean;

`  `redirectTo: string; // '/onboarding/profile'

}

interface VerifyEmailPageProps {

`  `searchParams: { email?: string }; // pre-fill displayed email

}

`  `**SECTION 4**  

**SECTION 4 — State Machine**

|**State**|**Trigger**|**UI Changes**|**Side Effects**|**Next State**|
| :- | :- | :- | :- | :- |
|IDLE|Page load (Image 14)|OTP field shows '000000' placeholder, Continue button gray/disabled|None|—|
|TYPING|User types in OTP field|Characters appear uppercase, tracking-widest for readability|None|PARTIAL|
|READY|Code length >= 5 chars|Continue button turns blue/active|None|SUBMITTING|
|SUBMITTING|Click Continue|Continue button shows spinner, input disabled|POST /api/auth/verify-email|SUCCESS/ERROR|
|SUCCESS|API 200|Brief visual confirmation|Set emailVerified=true, set session, navigate to /onboarding/profile|—|
|ERROR\_INVALID|API 400 invalid\_code|Inline error below input: 'Invalid code. Please check your email.'|None|IDLE|
|ERROR\_EXPIRED|API 400 code\_expired|Inline error + 'Resend code' link shown|None|IDLE|
|RESEND\_LOADING|Click 'Resend code'|Link shows spinner|POST /api/auth/resend-verification|IDLE|

`  `**SECTION 5**  

**SECTION 5 — API Contract**

// POST /api/auth/verify-email

// Request: { userId: string, code: string }

// 200: { success: true, redirectTo: '/onboarding/profile' }

//   Side effects: set User.emailVerified = true,

//   set User.onboardingStep = 'profile',

//   mark EmailVerification.usedAt = now()

// 400: { error: 'invalid\_code', message: 'Invalid code. Please check your email.' }

// 400: { error: 'code\_expired', message: 'Your code has expired. Please request a new one.' }

// 429: { error: 'too\_many\_attempts', message: 'Too many attempts. Please request a new code.' }

// POST /api/auth/resend-verification

// Request: { userId: string }

// 200: { message: 'Verification email sent.' }

// 429: { error: 'rate\_limited', message: 'Please wait 60 seconds before requesting a new code.' }

`  `**SECTION 6**  

**SECTION 6 — Prisma Schema Fragment**

model EmailVerification {

`  `id        String    @id @default(cuid())

`  `userId    String

`  `user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)

`  `code      String    // 5-6 char uppercase alphanumeric

`  `expiresAt DateTime  // createdAt + 15 minutes

`  `usedAt    DateTime? // null = unused; set on successful verification

`  `attempts  Int       @default(0) // max 5 before lockout

`  `createdAt DateTime  @default(now())

`  `@@index([userId, code])

}

`  `**SECTION 7**  

**SECTION 7 — Business Rules**

- BR-301: Continue button is DISABLED until the OTP field has at least 5 characters. Evidence: Images 13 and 14 both show 'Continue' button in gray/disabled appearance. Implementation: disabled={code.length < 5}.
- BR-302: OTP appears to be 5-6 alphanumeric uppercase characters. Evidence: Image 13 shows 'IGIEP' (5 chars); placeholder shows '000000' (6 chars). Implementation: Accept 5-6 char codes, uppercase auto-transform.
- BR-303: The email address displayed is the exact address used during signup. Evidence: 'alexsmith.mobbin@gmail.com' shown inline in body text. Implementation: Pass email via URL param or session.
- BR-304: 'Open email app' is a convenience shortcut. Evidence: Link with external arrow icon. Implementation: mailto: link or platform-specific deep link.
- BR-305: Back button returns to /signup/email (not /signup). Evidence: Back button present. Implementation: router.push('/signup/email').

`  `**SECTION 8**  

**SECTION 8 — Edge Cases**

**A) Observed**

- OTP field in filled state (Image 13): 'IGIEP' entered, Continue still gray — suggests minimum length not yet met (5-char code but Continue still disabled) OR code must be verified server-side first.

**B) Inferred**

- P0 — Expired code (15 min timeout): Error 'Your code has expired. Please request a new one.' + 'Resend code' link.
- P0 — Wrong code (>5 attempts): Lock account temporarily. Error 'Too many failed attempts. Please request a new code.'
- P1 — Email not received: 'Open email app' link + 'Resend code' option after 60 seconds.
- P1 — User navigates back and returns: OTP field clears; previous code still valid until expiry.
- P2 — Paste from clipboard: User pastes 6-digit code; should auto-submit or enable Continue button.

`  `**SECTION 9**  

**SECTION 9 — Acceptance Criteria**

1. GIVEN I arrive at /signup/verify WHEN the page loads THEN I see my email address in the body text and '000000' placeholder in the code field
1. GIVEN I type a 5-character code WHEN 5+ chars entered THEN the Continue button becomes blue and active
1. GIVEN I click Continue with a valid code WHEN the API returns 200 THEN I am navigated to /onboarding/profile
1. GIVEN I enter an invalid code WHEN the API returns 400 THEN I see error 'Invalid code. Please check your email.'
1. GIVEN my code has expired WHEN I try to verify THEN I see 'Your code has expired' and a resend option
1. GIVEN I click 'Back' WHEN clicked THEN I return to /signup/email
1. GIVEN I click 'Open email app' WHEN clicked THEN my email client opens or I am redirected to webmail



**SCREEN 5: PROFILE SURVEY — TELL US ABOUT YOU**

Route: /onboarding/profile

`  `**SECTION 1**  

**SECTION 1 — Screen Identity**

|**Field**|**Value**|
| :- | :- |
|Screen name|Profile Survey — Tell Us More About You|
|Route path|/onboarding/profile|
|Page file|app/(onboarding)/profile/page.tsx|
|Component file|src/components/onboarding/ProfileSurvey.tsx|
|Layout|OnboardingLayout (50/50 — form left, amber email-workflow preview right)|
|Auth requirement|Authenticated + emailVerified: true|
|States captured|Empty dropdowns (Image 1), All dropdowns filled (Image 2 — Product / I'm just looking around / Other)|
|Entry conditions|Email verified (OAuth or email+password path)|
|Before|/signup/verify or OAuth callback|
|After|/onboarding/intent|

`  `**SECTION 2**  

**SECTION 2 — UI Element Inventory**

|**Element**|**Tag**|**Shadcn**|**Content**|**Tailwind**|**Interactive?**|**State**|
| :- | :- | :- | :- | :- | :- | :- |
|Logo|a|—|◇ Lindy|absolute top-8 left-8|Yes|Always|
|Heading|h1|—|Tell us more about you|text-3xl font-bold text-gray-900 mt-12 mb-2|No|Always|
|Subheading|p|—|We just need a few more details to complete your profile.|text-sm text-gray-500 mb-8|No|Always|
|Role question label|label|—|What is your role?|block text-sm font-medium text-gray-800 mb-1|No|Always|
|Role dropdown|select|Select|Select an option / Product|w-full border border-gray-200 rounded-lg px-4 py-3 text-sm bg-white|Yes|Always|
|Use-case question label|label|—|What is your main use-case with Lindy?|block text-sm font-medium text-gray-800 mt-4 mb-1|No|Always|
|Use-case dropdown|select|Select|Select an option / I'm just looking around|w-full border border-gray-200 rounded-lg px-4 py-3 text-sm bg-white|Yes|Always|
|Discovery question label|label|—|How did you hear about us?|block text-sm font-medium text-gray-800 mt-4 mb-1|No|Always|
|Discovery dropdown|select|Select|Select an option / Other|w-full border border-gray-200 rounded-lg px-4 py-3 text-sm bg-white|Yes|Always|
|Continue button|button|Button|Continue →|bg-blue-600 text-white rounded-lg px-6 py-3 text-sm font-medium absolute bottom-8 right-8 hover:bg-blue-700 flex items-center gap-2|Yes|Always (no blocking)|

**Dropdown Options Specification**

|**Dropdown**|**Known Options**|**Source**|
| :- | :- | :- |
|Role|Product, Engineering, Design, Marketing, Sales, Operations, Founder/CEO, Other|From filled state Image 2: 'Product' visible|
|Use-case|I'm just looking around, Automate emails, Customer support, Sales automation, Meeting management, Lead generation, Other|From filled state Image 2: 'I'm just looking around' visible|
|How did you hear|Other, Google/Search, Twitter/X, LinkedIn, Friend/Colleague, Product Hunt, YouTube, TikTok, Newsletter|From filled state Image 2: 'Other' visible|

`  `**SECTION 3**  

**SECTION 3 — TypeScript Interfaces**

type UserRole = 'product' | 'engineering' | 'design' | 'marketing' | 'sales' | 'operations' | 'founder' | 'other';

type UseCase = 'looking\_around' | 'automate\_emails' | 'customer\_support' | 'sales' | 'meetings' | 'lead\_gen' | 'other';

type DiscoverySource = 'google' | 'twitter' | 'linkedin' | 'friend' | 'product\_hunt' | 'youtube' | 'tiktok' | 'newsletter' | 'other';

interface ProfileSurveyFormState {

`  `role: UserRole | '';

`  `useCase: UseCase | '';

`  `discoverySource: DiscoverySource | '';

}

interface ProfileSurveyRequest {

`  `role: UserRole;

`  `useCase: UseCase;

`  `discoverySource: DiscoverySource;

}

interface ProfileSurveyResponse {

`  `success: boolean;

`  `nextStep: string; // '/onboarding/intent'

}

`  `**SECTION 4**  

**SECTION 4 — State Machine**

|**State**|**Trigger**|**UI Changes**|**Side Effects**|**Next State**|
| :- | :- | :- | :- | :- |
|IDLE|Page load (Image 1)|All 3 dropdowns show 'Select an option', Continue button visible but skip-able|None|—|
|FILLING|User selects dropdown options|Selected options display in dropdowns (Image 2)|None|PARTIAL/READY|
|READY|All 3 dropdowns have a selection|Continue button fully active (it was always active — no blocking)|None|SUBMITTING|
|SUBMITTING|Click Continue|Button shows spinner|PATCH /api/users/me/profile|SUCCESS|
|SUCCESS|API 200|—|Navigate to /onboarding/intent|—|

`  `**SECTION 5**  

**SECTION 5 — API Contract**

// PATCH /api/users/me/profile

// Authorization: Bearer {sessionToken}

// Request: { role: UserRole, useCase: UseCase, discoverySource: DiscoverySource }

// 200: { success: true, nextStep: '/onboarding/intent' }

//   Side effects: update User.role, User.useCase, User.discoverySource,

//   set User.onboardingStep = 'intent'

// 400: { error: 'invalid\_fields', message: 'Please select all options.' }

// 401: { error: 'unauthenticated' } → redirect /login

`  `**SECTION 6**  

**SECTION 6 — Prisma Schema Fragment**

model User {

`  `// ... (existing fields)

`  `role             String?  // product | engineering | design | marketing | sales | operations | founder | other

`  `useCase          String?  // looking\_around | automate\_emails | customer\_support | ...

`  `discoverySource  String?  // google | twitter | linkedin | friend | ...

`  `onboardingStep   String   @default('verify') // verify|profile|intent|workspace|pricing|complete

}

`  `**SECTION 7**  

**SECTION 7 — Business Rules**

- BR-401: All 3 dropdowns are presented but Continue button is NOT gated by completion. Evidence: Continue button visible and styled blue even in empty state (Image 1). Implementation: Dropdowns are optional; submit with empty strings if not selected; server stores null.
- BR-402: Survey responses are used for product analytics and personalization (not visible in screenshots but inferred). Implementation: Also fire analytics event with responses.
- BR-403: The right preview panel changes to show an email workflow mockup (inbox + configure panel). Evidence: Visible in Images 1 and 2 — matches earlier onboarding screens. Implementation: Same amber gradient panel with email agent illustration.
- BR-404: No back button on this screen. Evidence: No back button visible. Implementation: Back navigation disabled or goes to home.

`  `**SECTION 8**  

**SECTION 8 — Edge Cases**

**B) Inferred**

- P1 — User skips all dropdowns: Allow continue with empty values. Store null in database.
- P1 — Dropdown fails to load options: Show skeleton loader; fallback to plain text input if API fails.
- P2 — User refreshes mid-onboarding: Resume from onboardingStep stored in User record.

`  `**SECTION 9**  

**SECTION 9 — Acceptance Criteria**

1. GIVEN I arrive at /onboarding/profile WHEN the page loads THEN all 3 dropdowns show 'Select an option'
1. GIVEN I select 'Product' for role WHEN selected THEN 'Product' displays in the role dropdown
1. GIVEN I click Continue without selecting any options WHEN clicked THEN I navigate to /onboarding/intent (fields are optional)
1. GIVEN I select all 3 dropdowns WHEN I click Continue THEN my selections are saved via PATCH /api/users/me/profile
1. GIVEN the API returns 200 WHEN navigation fires THEN I arrive at /onboarding/intent



**SCREEN 6: USAGE INTENT SELECTION**

Route: /onboarding/intent

`  `**SECTION 1**  

**SECTION 1 — Screen Identity**

|**Field**|**Value**|
| :- | :- |
|Screen name|Usage Intent — How Do You Plan to Use Lindy?|
|Route path|/onboarding/intent|
|Page file|app/(onboarding)/intent/page.tsx|
|Component file|src/components/onboarding/UsageIntent.tsx|
|Layout|OnboardingLayout (50/50 — form left, workspace preview right with amber gradient)|
|Auth requirement|Authenticated + profile survey complete|
|Entry conditions|After profile survey|
|Before|/onboarding/profile|
|After (team)|/onboarding/workspace|
|After (solo)|/onboarding/pricing|

`  `**SECTION 2**  

**SECTION 2 — UI Element Inventory**

|**Element**|**Tag**|**Shadcn**|**Content**|**Tailwind**|**Interactive?**|**State**|
| :- | :- | :- | :- | :- | :- | :- |
|Logo|a|—|◇ Lindy|absolute top-8 left-8|Yes|Always|
|Heading|h1|—|How do you plan to use Lindy?|text-3xl font-bold text-gray-900 mt-12 mb-8|No|Always|
|Team option card|button|Card|With my team — Share agents with your team, manage billing and oversee tasks and credit consumption.|w-full border border-gray-200 rounded-xl p-5 flex items-center gap-4 hover:border-gray-400 hover:shadow-sm text-left|Yes — selects team path|Always|
|Team icon|div|—|👥 (two people icon in amber square)|w-12 h-12 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600|No|Always|
|Team option title|span|—|With my team|font-semibold text-gray-900 block|No|Always|
|Team option desc|p|—|Share agents with your team, manage billing and oversee tasks and credit consumption.|text-sm text-gray-500 mt-1|No|Always|
|Team arrow|span|—|→|text-gray-400 ml-auto text-lg|No|Always|
|Solo option card|button|Card|On my own — It's just me casually automating stuff.|w-full border border-gray-200 rounded-xl p-5 flex items-center gap-4 hover:border-gray-400 hover:shadow-sm text-left mt-4|Yes — selects solo path|Always|
|Solo icon|div|—|👤 (single person icon)|w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center text-gray-600|No|Always|
|Solo option title|span|—|On my own|font-semibold text-gray-900 block|No|Always|
|Solo option desc|p|—|It's just me casually automating stuff.|text-sm text-gray-500 mt-1|No|Always|
|Solo arrow|span|—|→|text-gray-400 ml-auto text-lg|No|Always|
|Right panel|div|—|Workspace UI preview (agent list mockup)|w-1/2 bg-gradient-to-br from-amber-50 to-yellow-300|No|Always|

`  `**SECTION 3**  

**SECTION 3 — TypeScript Interfaces**

type UsageIntent = 'team' | 'solo';

interface UsageIntentRequest {

`  `intent: UsageIntent;

}

interface UsageIntentResponse {

`  `nextStep: '/onboarding/workspace' | '/onboarding/pricing';

}

`  `**SECTION 4**  

**SECTION 4 — State Machine**

|**State**|**Trigger**|**UI Changes**|**Side Effects**|**Next State**|
| :- | :- | :- | :- | :- |
|IDLE|Page load|Both option cards visible, neutral border|None|—|
|SELECTING\_TEAM|Click 'With my team'|Team card gets active border (border-blue-500)|PATCH /api/users/me/intent {intent: 'team'}, navigate to /onboarding/workspace|—|
|SELECTING\_SOLO|Click 'On my own'|Solo card gets active border|PATCH /api/users/me/intent {intent: 'solo'}, navigate to /onboarding/pricing|—|

`  `**SECTION 5**  

**SECTION 5 — API Contract**

// PATCH /api/users/me/intent

// Request: { intent: 'team' | 'solo' }

// 200: { nextStep: '/onboarding/workspace' | '/onboarding/pricing' }

//   Side effects: set User.workspaceIntent = intent,

//   set User.onboardingStep = 'workspace' OR 'pricing'

`  `**SECTION 6**  

**SECTION 6 — Prisma Schema Fragment**

model User {

`  `// ...

`  `workspaceIntent  String? // 'team' | 'solo'

}

model Workspace {

`  `id          String   @id @default(cuid())

`  `name        String

`  `logoUrl     String?

`  `ownerId     String

`  `owner       User     @relation('WorkspaceOwner', fields: [ownerId], references: [id])

`  `members     WorkspaceMember[]

`  `createdAt   DateTime @default(now())

}

model WorkspaceMember {

`  `id          String   @id @default(cuid())

`  `workspaceId String

`  `workspace   Workspace @relation(fields: [workspaceId], references: [id])

`  `userId      String

`  `user        User     @relation(fields: [userId], references: [id])

`  `role        WorkspaceRole @default(MEMBER)

`  `@@unique([workspaceId, userId])

}

enum WorkspaceRole { OWNER ADMIN MEMBER }

`  `**SECTION 7**  

**SECTION 7 — Business Rules**

- BR-501: Clicking a card IS the confirmation — no separate Continue button. Evidence: Arrow icons on cards + no submit button. Implementation: onClick fires API call immediately.
- BR-502: Team path leads to workspace creation (/onboarding/workspace); solo path skips workspace creation and goes directly to pricing (/onboarding/pricing). Evidence: Descriptive text on cards and flow inference.
- BR-503: Even 'solo' users get a default personal workspace created automatically. Evidence: Inferred — product needs workspace context. Implementation: Create default workspace named '{firstName}'s Workspace' when solo is selected.
- BR-504: Right panel shows a workspace/agent list mockup — matches the team use case visual. Implementation: Different image than earlier screens.

`  `**SECTION 8**  

**SECTION 8 — Edge Cases**

**B) Inferred**

- P0 — API fails on card click: Show toast 'Something went wrong. Please try again.' Card hover state resets.
- P1 — Double-click: Debounce card click handler (300ms) to prevent duplicate API calls.

`  `**SECTION 9**  

**SECTION 9 — Acceptance Criteria**

1. GIVEN I am on /onboarding/intent WHEN I click 'With my team' THEN I navigate to /onboarding/workspace
1. GIVEN I am on /onboarding/intent WHEN I click 'On my own' THEN I navigate to /onboarding/pricing
1. GIVEN the API fails WHEN a card is clicked THEN a toast error appears and I remain on the page



**SCREEN 7: WORKSPACE CREATION**

Route: /onboarding/workspace

`  `**SECTION 1**  

**SECTION 1 — Screen Identity**

|**Field**|**Value**|
| :- | :- |
|Screen name|Workspace Creation — Create Your Workspace|
|Route path|/onboarding/workspace|
|Page file|app/(onboarding)/workspace/page.tsx|
|Component file|src/components/onboarding/WorkspaceSetup.tsx|
|Layout|OnboardingLayout (50/50)|
|Auth requirement|Authenticated + intent = 'team'|
|States captured|Empty/default state (Image 7 — 'Alex Smith's Workspace', no logo), Filled state (Image 11 — 'AS Mobbin' workspace, logo uploaded, 2 email invites)|
|Entry conditions|User selected 'With my team' on intent screen|
|Before|/onboarding/intent|
|After|/onboarding/pricing|

`  `**SECTION 2**  

**SECTION 2 — UI Element Inventory**

|**Element**|**Tag**|**Shadcn**|**Content**|**Tailwind**|**Interactive?**|**State**|
| :- | :- | :- | :- | :- | :- | :- |
|Logo|a|—|◇ Lindy|absolute top-8 left-8|Yes|Always|
|Heading|h1|—|Create your workspace and invite others to join.|text-3xl font-bold text-gray-900 mt-12 mb-8 leading-tight max-w-xs|No|Always|
|Avatar/Logo preview|div|Avatar|'A' letter in amber bg (default) / uploaded image|w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600 font-bold text-xl|No|Always|
|Upload logo button|button|—|Upload your logo (Image 7) / Change logo (Image 11)|text-sm text-gray-500 underline cursor-pointer ml-3|Yes — opens file picker|EMPTY|
|Remove logo button|button|—|Remove (in red/destructive color)|text-sm text-red-500 underline cursor-pointer ml-2|Yes — removes logo|HAS\_LOGO (Image 11)|
|Workspace name label|label|—|Workspace name|block text-sm font-medium text-gray-700 mb-1|No|Always|
|Workspace name input|input|Input|Alex Smith's Workspace (default) / AS Mobbin (filled)|w-full border border-gray-200 rounded-lg px-4 py-3 text-sm bg-white|Yes|Always|
|Invite label|label|—|Invite members to join|block text-sm font-medium text-gray-700 mt-4 mb-1|No|Always|
|Invite textarea (empty)|div|—|Separate emails by comma (placeholder)|w-full min-h-[120px] border border-gray-200 rounded-lg p-3 text-sm text-gray-400|Yes — type emails|EMPTY|
|Email chip tags (filled)|div|Badge|jsmith.mobbin@gmail.com × | jdoe.mobbin@gmail.com ×|flex flex-wrap gap-2 p-3 border border-gray-200 rounded-lg min-h-[120px]|Yes — click × to remove|HAS\_INVITES (Image 11)|
|Back button|button|Button variant=outline|Back|border border-gray-200 rounded-lg px-5 py-3 text-sm absolute bottom-8 left-8|Yes — back to /onboarding/intent|Always|
|Continue button|button|Button|Continue →|bg-blue-600 text-white rounded-lg px-6 py-3 text-sm absolute bottom-8 right-8|Yes|Always (workspace name required)|

**Form Field Specifications**

|**Field Name**|**Type**|**Default / Placeholder**|**Validation**|**Error Message**|
| :- | :- | :- | :- | :- |
|workspaceName|text|'{FirstName}'s Workspace' (auto-generated from user's fullName)|required, min 2, max 50 chars|Workspace name is required|
|logoFile|file|None (shows initials avatar)|optional, image/\*, max 5MB|File must be an image under 5MB|
|inviteEmails|tag-input|Separate emails by comma|optional, each entry must be valid email|Invalid email address: {email}|

`  `**SECTION 3**  

**SECTION 3 — TypeScript Interfaces**

interface WorkspaceSetupFormState {

`  `workspaceName: string;

`  `logoFile: File | null;

`  `logoPreviewUrl: string | null;

`  `inviteEmails: string[]; // array of validated email strings

`  `currentEmailInput: string; // the text being typed before Enter/comma

`  `errors: { workspaceName?: string; inviteEmails?: string };

}

interface CreateWorkspaceRequest {

`  `name: string;

`  `logoBase64?: string; // base64 encoded image

`  `inviteEmails: string[];

}

interface CreateWorkspaceResponse {

`  `workspaceId: string;

`  `invitesSent: number;

`  `nextStep: '/onboarding/pricing';

}

`  `**SECTION 4**  

**SECTION 4 — State Machine**

|**State**|**Trigger**|**UI Changes**|**Side Effects**|**Next State**|
| :- | :- | :- | :- | :- |
|IDLE|Page load (Image 7)|Default workspace name auto-filled, avatar shows first initial in amber|None|FILLING|
|HAS\_LOGO|Logo uploaded (Image 11)|'Upload logo' → 'Change logo', 'Remove' button appears in red, avatar shows uploaded image|Upload to S3/CDN, update logoPreviewUrl|FILLING|
|FILLING\_INVITES|Type email + Enter/comma (Image 11)|Email appears as chip tag with × dismiss button, textarea clears for next entry|None|FILLING\_INVITES|
|SUBMITTING|Click Continue|Continue button shows spinner|POST /api/workspaces|SUCCESS|
|SUCCESS|API 201|—|Create workspace, send invite emails, navigate to /onboarding/pricing|—|

`  `**SECTION 5**  

**SECTION 5 — API Contract**

// POST /api/workspaces

// Authorization: Bearer {sessionToken}

// Content-Type: multipart/form-data

// Request: { name: string, logo?: File, inviteEmails: string[] }

// 201: { workspaceId: string, invitesSent: number, nextStep: '/onboarding/pricing' }

//   Side effects: create Workspace record, create WorkspaceMember (owner),

//   upload logo to S3 if provided, send invitation emails to all inviteEmails,

//   create PendingInvitation records, set User.onboardingStep = 'pricing'

// 400: { error: 'name\_required', message: 'Workspace name is required.' }

// 400: { error: 'invalid\_logo', message: 'File must be an image under 5MB.' }

// 409: { error: 'workspace\_exists', message: 'You already have a workspace.' }

// POST /api/workspaces/{id}/upload-logo

// Content-Type: multipart/form-data

// Request: { file: File }

// 200: { logoUrl: string }

`  `**SECTION 6**  

**SECTION 6 — Prisma Schema Fragment**

model Workspace {

`  `id          String   @id @default(cuid())

`  `name        String   // from workspace name input

`  `logoUrl     String?  // uploaded to S3/CDN

`  `ownerId     String

`  `owner       User     @relation('WorkspaceOwner', fields: [ownerId], references: [id])

`  `members     WorkspaceMember[]

`  `invitations PendingInvitation[]

`  `createdAt   DateTime @default(now())

}

model PendingInvitation {

`  `id          String    @id @default(cuid())

`  `workspaceId String

`  `workspace   Workspace @relation(fields: [workspaceId], references: [id])

`  `email       String    // invited email

`  `token       String    @unique @default(cuid())

`  `expiresAt   DateTime  // now() + 7 days

`  `acceptedAt  DateTime?

`  `createdAt   DateTime  @default(now())

}

`  `**SECTION 7**  

**SECTION 7 — Business Rules**

- BR-601: Workspace name is auto-populated with '{FirstName}'s Workspace' from user's fullName. Evidence: Image 7 shows 'Alex Smith's Workspace' pre-filled. Implementation: Set default from session.user.fullName.split(' ')[0] + "'s Workspace".
- BR-602: Invite email input uses chip-tag pattern — Enter or comma confirms each email. Evidence: Image 11 shows email chips with × remove buttons. Implementation: Tag input component with comma/Enter splitting.
- BR-603: Logo upload shows avatar with initials when no logo (amber background, first letter). Evidence: Image 7 shows 'A' in amber square. Implementation: Initials from workspace name first char.
- BR-604: After logo upload: 'Upload your logo' becomes 'Change logo', and 'Remove' appears in red. Evidence: Image 11 visible. Implementation: Conditional render based on logoPreviewUrl !== null.
- BR-605: Invites are optional — workspace can be created without them. Evidence: Continue button in Image 7 shows no invites required. Implementation: inviteEmails defaults to [].
- BR-606: Invalid email chips should be prevented or shown with error styling. Evidence: Inferred from chip-based input. Implementation: Validate on Enter/comma; reject invalid emails with tooltip.

`  `**SECTION 8**  

**SECTION 8 — Edge Cases**

**A) Observed**

- Logo change: 'Change logo' + 'Remove' appear after upload (Image 11).
- Email chips: Valid emails shown as dismissible chips (Image 11).

**B) Inferred**

- P0 — Workspace name empty on submit: Inline error 'Workspace name is required.'
- P1 — Invalid email in invite field: Show chip in red/error state with tooltip 'Invalid email address.'
- P1 — Duplicate email invite: Prevent adding same email twice. Show toast 'This email has already been added.'
- P1 — Logo file too large (>5MB): Toast 'File must be under 5MB.'
- P1 — Non-image file: Toast 'Please upload an image file.'
- P2 — 50+ invite emails: Warn 'You can invite up to 50 members at once.'

`  `**SECTION 9**  

**SECTION 9 — Acceptance Criteria**

1. GIVEN I arrive at /onboarding/workspace WHEN the page loads THEN workspace name is pre-filled with 'Alex Smith's Workspace' and avatar shows 'A'
1. GIVEN I upload a logo WHEN file is valid image < 5MB THEN the avatar shows the uploaded image, 'Change logo' and 'Remove' appear
1. GIVEN I type 'jsmith@gmail.com' and press Enter WHEN valid email THEN a chip tag appears with × button
1. GIVEN I type an invalid email and press Enter WHEN invalid THEN the chip appears in red with an error indicator
1. GIVEN workspace name is empty WHEN I click Continue THEN inline error appears
1. GIVEN all data is valid WHEN I click Continue THEN workspace is created, invites are sent, I navigate to /onboarding/pricing
1. GIVEN I click Back WHEN clicked THEN I return to /onboarding/intent



**SCREEN 8: PRICING & TRIAL ACTIVATION**

Route: /onboarding/pricing

`  `**SECTION 1**  

**SECTION 1 — Screen Identity**

|**Field**|**Value**|
| :- | :- |
|Screen name|Pricing — Get Lindy for Free for 7 Days|
|Route path|/onboarding/pricing|
|Page file|app/(onboarding)/pricing/page.tsx|
|Component file|src/components/onboarding/PricingTrial.tsx|
|Layout|Split: pricing table left, Stripe Link panel right|
|Auth requirement|Authenticated + onboarding steps complete|
|States captured|No payment panel (Image 8), Link OTP/2FA (Image 19), Payment error (Image 12), Billing details (Image 16), Processing (Image 15)|
|Entry conditions|After workspace setup (team path) or intent (solo path)|
|Before|/onboarding/workspace OR /onboarding/intent|
|After|/home (post-trial activation)|

`  `**SECTION 2**  

**SECTION 2 — UI Element Inventory — Left Panel (Pricing Table)**

|**Element**|**Tag**|**Shadcn**|**Content**|**Tailwind**|**Interactive?**|**State**|
| :- | :- | :- | :- | :- | :- | :- |
|Page heading|h1|—|Get Lindy for free for 7 days.|text-3xl font-bold text-gray-900|No|Always|
|Subheading|p|—|$0 due today. Cancel any time.|text-gray-500 text-sm mt-1|No|Always|
|Comparison table wrapper|div|—|Free vs Pro comparison|border border-gray-100 rounded-xl overflow-hidden max-w-md mt-6|No|Always|
|Free column header|div|—|Free|text-sm text-gray-500 text-center py-3|No|Always|
|Pro column header|div|—|🟡 Pro|bg-amber-400 text-white font-bold text-center py-3 rounded-t-xl text-sm|No|Always|
|Tasks row|tr|—|Tasks ⓘ | 40 | 500|text-sm py-3 px-4|No|Always|
|Integrations row|tr|—|Integrations | 100+ | 6,000+|text-sm py-3 px-4 bg-gray-50|No|Always|
|Email Agents row|tr|—|Email Agents | ✓ | ✓|text-sm py-3 px-4|No|Always|
|Sales Agents row|tr|—|Sales Agents | ✓ | ✓|text-sm py-3 px-4 bg-gray-50|No|Always|
|Meeting Agents row|tr|—|Meeting Agents | ✗ | ✓|text-sm py-3 px-4|No|Always|
|Phone Agents row|tr|—|Phone Agents | ✗ | ✓|text-sm py-3 px-4 bg-gray-50|No|Always|
|Customer Support Agents row|tr|—|Customer Support Agents | ✗ | ✓|text-sm py-3 px-4|No|Always|
|Start free trial CTA|button|Button|Start free trial — $0 due today|w-full bg-blue-600 text-white rounded-lg py-3 font-medium mt-6 hover:bg-blue-700|Yes — triggers Stripe Link|NO\_PAYMENT\_PANEL (Image 8)|
|Start free trial (disabled)|button|Button|Start free trial — $0 due today|w-full bg-gray-200 text-gray-400 rounded-lg py-3 cursor-not-allowed mt-6|No|PAYMENT\_PANEL\_OPEN (Images 12,15,16,19)|
|Post-trial notice|p|—|After the trial period, you will be charged $49.99 per month unless you cancel before the trial expires.|text-xs text-gray-400 mt-3 max-w-sm|No|Always|

**Right Panel — Stripe Link States**

|**State**|**Image**|**Panel Content Description**|
| :- | :- | :- |
|NO\_PANEL|Image 8|No right panel visible. Only the left pricing table shows. CTA button is blue/active.|
|LINK\_2FA|Image 19|Stripe Link 'Confirm it's you' — 6-box OTP input, 'Send code to email instead' link, 'Logging in as {email}', 'Pay without Link' option.|
|LINK\_PAYMENT\_ERROR|Image 12|Stripe Link 'Select saved payment method' — Error banner 'We are unable to authenticate your payment method. Please choose a different payment method and try again.' in red. Visa Debit ····0561 shown with green border. 'Add a new payment method' button. 'Save' green CTA.|
|LINK\_BILLING\_DETAILS|Image 16|Stripe Link 'Enter billing details' — Visa Debit ····0561 in Pay With row (collapsed). 'Pay by bank to get $5 back / Switch' promo. Name field, Country dropdown (United States), ZIP/postal field. 'Save' green CTA.|
|LINK\_PROCESSING|Image 15|Stripe Link processing — 'Pay with Visa Debit ····0561', 'Pay by bank to get $5 back / Switch'. 'Processing…' button with spinner (green bg). 'Pay without Link' link grayed out.|

`  `**SECTION 3**  

**SECTION 3 — TypeScript Interfaces**

interface PricingPlan {

`  `id: 'free' | 'pro';

`  `name: string;

`  `monthlyPrice: number; // 0 for free, 49.99 for pro

`  `tasks: number | string; // 40 or 500

`  `integrations: string; // '100+' or '6,000+'

`  `features: PricingFeature[];

}

interface PricingFeature {

`  `name: string;

`  `freeIncluded: boolean;

`  `proIncluded: boolean;

}

// Stripe trial setup

interface CreateTrialRequest {

`  `priceId: string; // Stripe Price ID for Pro monthly

`  `trialDays: 7;

}

interface CreateTrialResponse {

`  `clientSecret: string; // Stripe SetupIntent client secret

`  `customerId: string;

}

interface BillingDetails {

`  `name: string;

`  `country: string;

`  `postalCode: string;

}

`  `**SECTION 4**  

**SECTION 4 — State Machine (Stripe Payment Flow)**

|**State**|**Trigger**|**UI Changes**|**Side Effects**|**Next State**|
| :- | :- | :- | :- | :- |
|IDLE (Image 8)|Page load|Left: pricing table with active blue CTA. No right panel.|None|—|
|LINK\_INIT|Click 'Start free trial'|CTA becomes gray/disabled. Right panel renders Stripe Link iframe/component|POST /api/subscriptions/create-trial → returns clientSecret. Initialize Stripe Elements|LINK\_LOADING|
|LINK\_2FA (Image 19)|Stripe Link detects returning user|6-box OTP input for phone verification. 'Logging in as {email}'|Stripe handles 2FA internally|LINK\_AUTHENTICATED|
|LINK\_AUTHENTICATED|OTP verified by Stripe|Billing details or saved method shown|—|LINK\_BILLING or LINK\_SAVED\_METHOD|
|LINK\_SAVED\_METHOD (Image 16)|Stripe shows saved Visa card|Visa Debit ····0561 shown. Billing name+country+ZIP fields. 'Save' button green.|None|LINK\_BILLING\_SUBMIT|
|LINK\_PAYMENT\_ERROR (Image 12)|Payment authentication failure|Red error: 'We are unable to authenticate…'. Card still shown with green border. 'Add new payment method' option.|None|LINK\_SAVED\_METHOD|
|LINK\_PROCESSING (Image 15)|Click Save/Confirm|Green button shows 'Processing…' with spinner. All other links grayed.|Stripe creates SetupIntent, confirms payment method|SUCCESS or PAYMENT\_ERROR|
|SUCCESS|Stripe webhook confirms subscription|—|Create Subscription record, set User.subscriptionTier = 'pro', set onboardingStep = 'complete', navigate to /home|—|

`  `**SECTION 5**  

**SECTION 5 — API Contract**

// POST /api/subscriptions/create-trial

// Authorization: Bearer {sessionToken}

// Request: { priceId: string, trialDays: 7 }

// 200: { clientSecret: string, subscriptionId: string, customerId: string }

//   Side effects: create Stripe Customer, create Stripe Subscription with

//   trial\_period\_days: 7, status: trialing; store in Subscription table

// POST /api/webhooks/stripe

// Stripe signature verified via webhook secret

// Events handled:

//   customer.subscription.trial\_will\_end → send reminder email

//   customer.subscription.updated → update Subscription.status

//   invoice.payment\_succeeded → set plan = 'pro'

//   invoice.payment\_failed → notify user, update status = 'past\_due'

// GET /api/subscriptions/me

// 200: { plan: 'free' | 'pro', status: string, trialEndsAt: Date | null }

`  `**SECTION 6**  

**SECTION 6 — Prisma Schema Fragment**

model Subscription {

`  `id                   String   @id @default(cuid())

`  `userId               String   @unique

`  `user                 User     @relation(fields: [userId], references: [id])

`  `stripeCustomerId     String   @unique

`  `stripeSubscriptionId String   @unique

`  `stripePriceId        String

`  `plan                 SubscriptionPlan @default(FREE)

`  `status               String   // trialing | active | past\_due | canceled

`  `trialEndsAt          DateTime?

`  `currentPeriodEnd     DateTime?

`  `createdAt            DateTime @default(now())

`  `updatedAt            DateTime @updatedAt

}

enum SubscriptionPlan { FREE PRO ENTERPRISE }

`  `**SECTION 7**  

**SECTION 7 — Business Rules**

- BR-701: Pro plan is visually highlighted with amber/gold background in the comparison table. Evidence: Pro column has amber-400 background, 'Free' column is plain. Implementation: Tailwind bg-amber-400 on Pro column header, gold shading on Pro cells.
- BR-702: Trial is 7 days at $0. Post-trial auto-charges $49.99/month. Evidence: 'Get Lindy for free for 7 days', '$0 due today', 'you will be charged $49.99 per month'. Implementation: Stripe trial\_period\_days: 7, require payment method upfront.
- BR-703: Payment is collected via Stripe Link (not standard Stripe Elements). Evidence: Stripe 'link' branding visible in all payment panel screenshots. Implementation: Use Stripe Link with saved payment methods.
- BR-704: Meeting Agents, Phone Agents, Customer Support Agents are NOT available on Free tier. Evidence: ✗ checkmarks in Free column for these rows. Implementation: Feature gate in API middleware.
- BR-705: Tasks tooltip on the 'Tasks ⓘ' label provides definition. Evidence: ⓘ icon visible next to 'Tasks'. Implementation: Tooltip component.
- BR-706: The 'Start free trial' button disables once Stripe panel is active. Evidence: Images 12, 15, 16, 19 all show disabled gray CTA on left. Implementation: isStripeOpen state disables button.
- BR-707: User can choose 'Pay without Link' to use standard card entry. Evidence: 'Pay without Link' text link visible in Images 12, 15, 19. Implementation: Stripe fallback payment element.

`  `**SECTION 8**  

**SECTION 8 — Edge Cases**

**A) Observed**

- Payment auth failure (Image 12): Red error banner 'We are unable to authenticate your payment method. Please choose a different payment method and try again.' Implementation: catch Stripe authentication\_required error.
- Processing state (Image 15): Green 'Processing…' spinner button. Other actions grayed. Implementation: setIsProcessing(true) on confirm.

**B) Inferred**

- P0 — Stripe fails to load: Show fallback 'Unable to load payment form. Please refresh.' with retry.
- P0 — Card declined: Show Stripe error message inline.
- P1 — User closes tab during payment: Stripe webhook handles completion; user lands on /home on next login if subscription created.
- P1 — Duplicate trial attempt: Check existing subscription on page load; if trial exists, skip to /home.

`  `**SECTION 9**  

**SECTION 9 — Acceptance Criteria**

1. GIVEN I arrive at /onboarding/pricing WHEN page loads THEN I see pricing table with Pro highlighted in amber and blue 'Start free trial' CTA
1. GIVEN I click 'Start free trial' WHEN clicked THEN Stripe Link panel appears on the right and the CTA button becomes disabled
1. GIVEN Stripe Link prompts for 2FA WHEN the OTP screen appears (Image 19) THEN I see 6 input boxes and 'Send code to email instead' option
1. GIVEN payment authentication fails WHEN Stripe returns error THEN red error banner shows 'We are unable to authenticate your payment method'
1. GIVEN I enter billing details and click Save WHEN processing THEN button shows 'Processing…' with spinner
1. GIVEN payment succeeds WHEN webhook confirms THEN I am navigated to /home with Pro trial active
1. GIVEN I click 'Pay without Link' WHEN clicked THEN standard Stripe card entry appears



**SCREEN 9: MAIN DASHBOARD — HOW CAN I HELP?**

Route: /home

`  `**SECTION 1**  

**SECTION 1 — Screen Identity**

|**Field**|**Value**|
| :- | :- |
|Screen name|Main Dashboard — Agent Builder Home|
|Route path|/home|
|Page file|app/(app)/home/page.tsx|
|Component file|src/components/app/AgentBuilderHome.tsx|
|Layout|DashboardLayout (sidebar nav + main content area)|
|Auth requirement|Authenticated + onboardingComplete: true|
|Entry conditions|Completed full onboarding flow (or returning user)|
|Before|/onboarding/pricing (new users) or direct navigation (returning)|
|After|/agents/{id} (new agent) or /templates/{slug} (template)|

`  `**SECTION 2**  

**SECTION 2 — UI Element Inventory**

|**Element**|**Tag**|**Shadcn**|**Content**|**Tailwind**|**Interactive?**|**State**|
| :- | :- | :- | :- | :- | :- | :- |
|Hamburger menu|button|—|≡ (three horizontal lines)|absolute top-4 left-4 p-2 text-gray-600 hover:text-gray-900|Yes — toggles sidebar|Always|
|New Agent button|button|Button variant=outline|+ New Agent|absolute top-4 right-4 border border-gray-200 rounded-lg px-4 py-2 text-sm font-medium|Yes — creates agent|Always|
|Main hero heading|h1|—|How can I help?|text-3xl font-bold text-gray-900 text-center mt-16|No|Always|
|Agent builder input|div|—|Build an agent or perform a task (textarea with action chips)|w-full max-w-2xl mx-auto mt-4 bg-white rounded-2xl border border-gray-200 shadow-sm p-4|Yes|Always|
|Input placeholder|textarea|—|Build an agent or perform a task|w-full text-sm text-gray-400 resize-none outline-none bg-transparent min-h-[60px]|Yes|Always|
|Attachment button|button|—|📎 icon|w-8 h-8 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 flex items-center justify-center|Yes — file attach|Always|
|Voice button|button|—|🎤 microphone icon|w-8 h-8 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 flex items-center justify-center|Yes — voice input|Always|
|Submit button|button|Button|↑ (arrow up icon)|w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700|Yes — submit prompt|READY|
|'Build apps' chip|button|Badge|🖥 Build apps|rounded-full border border-gray-200 px-3 py-1 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-1 bg-white|Yes — fills input|Always|
|Template chips row 1|div|—|Personal website | Customer support email | Outbound sales calls | Lead gen|flex gap-2 justify-center flex-wrap mt-4|Yes|Always|
|Template chips row 2|div|—|Meeting recorder | LinkedIn outreach | Support chatbot|flex gap-2 justify-center mt-2|Yes|Always|
|Category filter bar|div|Tabs|🔍 | Product (active) | Meetings | Most popular | Productivity | Sales | See all >|flex gap-2 items-center border-b border-gray-100 pb-2 mt-12|Yes — filters templates|Always|
|Category: Product (active)|button|—|Product|bg-gray-900 text-white rounded-full px-4 py-1.5 text-sm font-medium|Yes|PRODUCT\_SELECTED|
|Other category tabs|button[]|—|Meetings | Most popular | Productivity | Sales|text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-full|Yes|INACTIVE|
|See all button|button|—|See all >|text-sm text-gray-600 flex items-center gap-1|Yes — opens full gallery|Always|
|Template section heading|h2|—|Product|font-semibold text-gray-900 text-lg mt-6|No|Always|
|Template section 'See all'|a|—|See all >|text-sm text-blue-500 hover:underline|Yes|Always|
|Template card 1 (featured)|div|Card|From specs to shipping, (large feature card with blue bg)|rounded-xl bg-blue-50 p-6 relative overflow-hidden|Yes — clicks to template|Always|
|Template card 2|div|Card|🖥 Voice of the Customer (smaller card)|rounded-xl border border-gray-100 p-4|Yes|Always|
|Help button|button|—|? (question mark)|fixed bottom-4 right-4 w-10 h-10 rounded-full bg-white border border-gray-200 shadow flex items-center justify-center text-gray-500|Yes — opens help|Always|

`  `**SECTION 3**  

**SECTION 3 — TypeScript Interfaces**

interface AgentBuilderState {

`  `prompt: string;

`  `attachments: File[];

`  `isVoiceActive: boolean;

`  `isSubmitting: boolean;

}

interface TemplateCategory {

`  `id: string;

`  `label: string;

`  `isActive: boolean;

}

interface AgentTemplate {

`  `id: string;

`  `slug: string;

`  `title: string;

`  `description: string;

`  `category: string;

`  `iconUrl: string;

`  `isFeatured: boolean;

`  `accentColor?: string;

}

// POST /api/agents/create-from-prompt

interface CreateAgentRequest {

`  `prompt: string;

`  `attachments?: string[]; // presigned URLs

}

interface CreateAgentResponse {

`  `agentId: string;

`  `redirectUrl: string; // '/agents/{agentId}'

}

`  `**SECTION 4**  

**SECTION 4 — State Machine**

|**State**|**Trigger**|**UI Changes**|**Side Effects**|**Next State**|
| :- | :- | :- | :- | :- |
|IDLE|Page load|Warm amber/cream gradient background, centered search UI, template grid below|GET /api/templates?category=product|—|
|TYPING|Keystroke in textarea|Text appears, submit button activates (turns blue)|None|READY|
|CHIP\_FILL|Click quick-action chip|Textarea filled with chip's template text|None|READY|
|READY|Prompt > 0 chars|Submit button blue and clickable|None|SUBMITTING|
|SUBMITTING|Click ↑|Submit button spinner, textarea disabled|POST /api/agents/create-from-prompt|SUCCESS|
|SUCCESS|Agent created|—|Navigate to /agents/{agentId}|—|
|CATEGORY\_SELECTED|Click category tab|Active tab darkens, template grid re-renders with filtered results|GET /api/templates?category={id}|IDLE|

`  `**SECTION 5**  

**SECTION 5 — API Contract**

// GET /api/templates?category=product&limit=10

// 200: { templates: AgentTemplate[], total: number }

// POST /api/agents/create-from-prompt

// Authorization: Bearer {sessionToken}

// Request: { prompt: string, attachments?: string[] }

// 201: { agentId: string, redirectUrl: '/agents/{agentId}' }

// 400: { error: 'empty\_prompt' }

// 402: { error: 'usage\_limit', message: 'You have reached your task limit. Upgrade to Pro.' }

// POST /api/agents (from + New Agent button)

// Request: { name?: string } // blank agent

// 201: { agentId: string, redirectUrl: '/agents/{agentId}/configure' }

`  `**SECTION 6**  

**SECTION 6 — Prisma Schema Fragment**

model Agent {

`  `id            String   @id @default(cuid())

`  `name          String   @default('Untitled Agent')

`  `description   String?

`  `prompt        String?  // natural language description

`  `workspaceId   String

`  `workspace     Workspace @relation(fields: [workspaceId], references: [id])

`  `createdById   String

`  `createdBy     User     @relation(fields: [createdById], references: [id])

`  `status        AgentStatus @default(DRAFT)

`  `templateId    String?  // if created from template

`  `createdAt     DateTime @default(now())

`  `updatedAt     DateTime @updatedAt

}

enum AgentStatus { DRAFT ACTIVE PAUSED ARCHIVED }

`  `**SECTION 7**  

**SECTION 7 — Business Rules**

- BR-801: Dashboard has a warm cream/amber noise-textured gradient background — distinct from the white onboarding screens. Evidence: Image 3 shows the warm gradient. Implementation: bg-gradient-to-br from-amber-50/40 via-yellow-50/30 to-cream background with subtle noise texture.
- BR-802: The main input is a multi-purpose command box supporting text, file attachments, and voice. Evidence: 📎 attachment icon and 🎤 mic icon visible in input. Implementation: Three-mode input component.
- BR-803: Quick-action chips appear INSIDE the main input box. Evidence: 'Build apps' chip appears inside the input container in Image 3. Implementation: Chips render inside the input card above the action buttons.
- BR-804: Template categories default to 'Product' selected (matching user's profile survey role). Evidence: Image 3 shows 'Product' as the active tab. Implementation: Default category from user.role.
- BR-805: '+ New Agent' creates a blank agent vs the prompt input creates an AI-configured agent. Evidence: Two distinct entry points visible. Implementation: Different API calls with different redirect targets.
- BR-806: Usage limit enforcement: Free tier has 40 tasks. If limit reached, show upgrade prompt. Evidence: Pricing screen shows 40 tasks for free. Implementation: Check task count before agent creation.

`  `**SECTION 8**  

**SECTION 8 — Edge Cases**

**B) Inferred**

- P0 — Task usage limit hit: Banner or modal 'You've used all 40 tasks this month. Upgrade to Pro for 500 tasks.' with upgrade CTA.
- P1 — No templates in category: Empty state 'No templates found for this category.' with 'Browse all templates' link.
- P1 — Voice input not supported (non-HTTPS or no mic permission): Mic button disabled with tooltip 'Microphone not available.'
- P2 — Large file attachment: Toast 'Files must be under 10MB.'
- P3 — Very long prompt (>5000 chars): Truncate with warning 'Your prompt has been trimmed to 5,000 characters.'

`  `**SECTION 9**  

**SECTION 9 — Acceptance Criteria**

1. GIVEN I complete onboarding WHEN I first arrive at /home THEN I see the agent builder with 'How can I help?' heading and template grid defaulted to 'Product' category
1. GIVEN I type 'Build a customer support chatbot' WHEN I click the submit button THEN POST /api/agents/create-from-prompt fires and I navigate to /agents/{id}
1. GIVEN I click the 'Build apps' quick-action chip WHEN clicked THEN the textarea fills with a pre-written agent description
1. GIVEN I click '+ New Agent' WHEN clicked THEN a blank agent is created and I navigate to /agents/{id}/configure
1. GIVEN I click 'Meetings' in the category filter WHEN clicked THEN the template grid refreshes with meeting-related templates
1. GIVEN I am on the Free tier with 40/40 tasks used WHEN I try to create an agent THEN I see an upgrade prompt


# **APPENDIX A — Complete Onboarding Flow Map**


|**Step**|**Screen**|**Route**|**Decision**|**Next Route**|
| :- | :- | :- | :- | :- |
|0|Marketing Homepage|/|Unauthenticated → CTA click|/signup|
|1|Auth Gate|/signup|Google OAuth selected|/api/auth/callback/google → /onboarding/profile (new) or /home (existing)|
|1a|Auth Gate|/signup|SSO selected|/api/auth/sso → /onboarding/profile|
|1b|Auth Gate|/signup|'I don't use Gmail' clicked|/signup/email|
|2 (email path)|Email Signup|/signup/email|Form submitted|/signup/verify|
|3 (email path)|Email Verify|/signup/verify|OTP verified|/onboarding/profile|
|4|Profile Survey|/onboarding/profile|Continue clicked|/onboarding/intent|
|5a|Usage Intent|/onboarding/intent|With my team|/onboarding/workspace|
|5b|Usage Intent|/onboarding/intent|On my own|/onboarding/pricing|
|6 (team)|Workspace Setup|/onboarding/workspace|Continue clicked|/onboarding/pricing|
|7|Pricing / Trial|/onboarding/pricing|Trial activated|/home|
|8|Main Dashboard|/home|Ongoing use|—|

# **APPENDIX B — Design System Tokens**

|**Token**|**Value**|**Usage**|
| :- | :- | :- |
|Background: Onboarding gradient (right panel)|from-amber-50 via-yellow-100 to-amber-400|All onboarding right panels|
|Background: Dashboard|from-amber-50/40 via-yellow-50/30 to-white|Main app background|
|Primary CTA button|bg-blue-600 hover:bg-blue-700 text-white|All primary actions|
|Outline button|border border-gray-200 text-gray-700 hover:bg-gray-50|Secondary actions, Back|
|Input base|border border-gray-200 rounded-lg px-4 py-3 bg-gray-50 focus:bg-white focus:border-blue-500|All form inputs|
|Card base|border border-gray-200 rounded-xl p-5 hover:border-gray-400 hover:shadow-sm|Option cards, template cards|
|Pro accent|bg-amber-400 text-white|Pro tier highlights|
|Error color|text-red-500|Error messages, destructive actions|
|Disabled state|bg-gray-100 text-gray-400 cursor-not-allowed|Disabled buttons|
|Font: Headings|font-bold text-gray-900|Page headings|
|Font: Body|text-sm text-gray-500|Subheadings, descriptions|
|Font: Labels|text-sm font-medium text-gray-700|Form labels|
|Border radius: Buttons|rounded-lg|Standard buttons|
|Border radius: Cards|rounded-xl|Cards, panels|
|Border radius: CTA|rounded-full|Pill-style CTAs (Nav, submit)|

# **APPENDIX C — Environment Variables Required**

**⚠️ See ARCHITECTURE.md §7 for the complete env variable → feature mapping, which defines exactly which screens fail gracefully vs. hard-fail when each variable is missing. The table below lists the variables; ARCHITECTURE.md §7 defines the degradation behavior.**

|**Variable**|**Description**|**Example**|
| :- | :- | :- |
|NEXTAUTH\_SECRET|NextAuth session encryption key|openssl rand -base64 32|
|NEXTAUTH\_URL|App canonical URL|https://app.yourdomain.com|
|GOOGLE\_CLIENT\_ID|Google OAuth App Client ID|xxx.apps.googleusercontent.com|
|GOOGLE\_CLIENT\_SECRET|Google OAuth App Secret|GOCSPX-xxx|
|DATABASE\_URL|PostgreSQL connection string|postgresql://user:pass@host/db|
|STRIPE\_SECRET\_KEY|Stripe server-side key|sk\_live\_xxx|
|STRIPE\_WEBHOOK\_SECRET|Stripe webhook signing secret|whsec\_xxx|
|STRIPE\_PRO\_PRICE\_ID|Stripe Price ID for Pro monthly|price\_xxx|
|RESEND\_API\_KEY|Resend transactional email key|re\_xxx|
|NEXT\_PUBLIC\_STRIPE\_PUBLISHABLE\_KEY|Stripe client-side key|pk\_live\_xxx|
|AWS\_S3\_BUCKET|S3 bucket for logo uploads|lindy-uploads-prod|
|AWS\_ACCESS\_KEY\_ID|AWS access key|AKIAxxx|
|AWS\_SECRET\_ACCESS\_KEY|AWS secret|xxx|


# **APPENDIX D — CROSS-REFERENCES TO ARCHITECTURE.MD**

This spec is one of three screen-level PRDs. The following cross-cutting concerns are defined in **ARCHITECTURE.md** and MUST be read before implementation:

| Concern | ARCHITECTURE.md Section |
| :- | :- |
| Consolidated Prisma schema (User, EmailVerification, Workspace, WorkspaceMember, PendingInvitation, Subscription, Template, Agent, Task, Message, FavoriteAgent) | §5 |
| OnboardingLayout component spec (50/50 split, exact markup) | §3C |
| DashboardLayout component spec (wraps /home post-onboarding) | §3D |
| MarketingLayout component spec (marketing homepage) | §3B |
| Middleware.ts auth guard (redirect logic, onboarding step enforcement) | §2 |
| Canonical route structure (all routes, all route groups) | §1 |
| Shared component registry (AgentBuilderInput, TemplateCard, CategoryTabs, EmptyState, Toast) | §4 |
| SSE streaming implementation (agent response streaming pattern) | §6 |
| Env variable → feature mapping (graceful degradation for missing STRIPE_SECRET_KEY, RESEND_API_KEY, etc.) | §7 |
| Design system tokens (canonical gradient values, button styles) | §8 |
| Cross-document conflict resolutions (route names, model names) | §9 |

**PRISMA NOTE:** All 9 schema fragments in this document are EXCERPTS of the consolidated schema in ARCHITECTURE.md §5. Generate `prisma/schema.prisma` from ARCHITECTURE.md §5 only. Do NOT merge fragments — they contain `// ... (existing fields)` placeholders that will cause conflicts.

**LAYOUT NOTE:** This spec references OnboardingLayout, DashboardLayout, and MarketingLayout but does not define their exact markup. See ARCHITECTURE.md §3A–§3D for the complete layout.tsx implementations.

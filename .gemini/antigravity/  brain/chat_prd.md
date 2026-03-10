


**LINDY.AI**

**Chat Interface — Engineering Specification**

Screens: Dashboard · Chat · Filter · Search

Next.js 14 · TypeScript · Tailwind · Shadcn/UI · PostgreSQL · Prisma · NextAuth

12 Screenshots → 5 Screens → 9 Sections Each | McKinsey-Grade PRD

**⚠️ PREREQUISITE: Read ARCHITECTURE.md FIRST. It contains the consolidated Prisma schema, middleware.ts, layout specs, SSE streaming implementation, and shared component registry that this spec references.**


# **Table of Contents**

**Screen 1:** Dashboard Home (Sidebar Expanded)  —  /home

**Screen 2:** Dashboard Home (Sidebar Collapsed)  —  /home

**Screen 3:** Chat — Empty New Task  —  /chat

**Screen 4:** Chat — Active Conversation  —  /chat/{taskId}

**Screen 5:** Chat — Filter Dropdown Open  —  /chat (filter)

**Screen 6:** Chat — Filter Applied (No Results)  —  /chat (filtered)

**Screen 7:** Chat — Search Active with Results  —  /chat (search)

**Screen 8:** Chat — Search No Results  —  /chat (search empty)

## **Global Layout Architecture**
The app uses a three-panel layout: (1) Global Left Sidebar — workspace branding, nav links, favorites/recents, promo card; (2) Chat List Panel — 240px wide secondary sidebar showing task/chat history with search, filter, and new chat controls; (3) Main Content Area — the active conversation thread or empty state.

The global sidebar is collapsible via a '|←' toggle button. When collapsed (Image 2), only a hamburger '≡' icon is shown at the top left. The chat list panel and main content area remain visible.

Tech: DashboardLayout (see ARCHITECTURE.md §3D for exact markup) wraps all app screens. Uses CSS Grid or Flexbox for three-panel structure. Sidebar state stored in localStorage. Chat list panel is fixed 240px. Main content is flex-1.

**Layout Specs:** See ARCHITECTURE.md §3D for DashboardLayout implementation. The ChatLayout sub-component (nested inside DashboardLayout's main area) manages the ChatListPanel + ChatContent split.

**SSE Streaming:** See ARCHITECTURE.md §6 for the complete server-side and client-side SSE streaming implementation. Uses `ReadableStream` with `new Response()` on Node.js runtime (NOT Edge).

**Shared Components:** See ARCHITECTURE.md §4. Components shared across chat screens: MessageInput, ChatListEmptyState, GlobalSidebar, WorkspaceHeader, NavItems, PromoCard. Build each ONCE in `/src/components/shared/`.

**Consolidated Schema:** See ARCHITECTURE.md §5. Schema fragments in this spec are excerpts only.



**SCREEN 1: DASHBOARD HOME — SIDEBAR EXPANDED**

Route: /home

`  `**SECTION 1**  

**SECTION 1 — Screen Identity**

|**Field**|**Value**|
| :- | :- |
|Screen name|Dashboard Home — Sidebar Expanded|
|Route path|/home|
|Page file|app/(app)/home/page.tsx|
|Component file|src/components/app/DashboardHome.tsx|
|Layout|DashboardLayout: left sidebar (expanded) + main content. No chat list panel on this route.|
|Auth requirement|Authenticated. Redirect to /login if no session.|
|Entry conditions|Completed onboarding OR returning user landing here after login.|
|Screenshots|Image 1 (Chat\_0) — sidebar expanded, promo card visible, Home nav active|
|Before|/onboarding/pricing (new users) or login redirect|
|After|/chat (click Chat nav), /agents (click My agents), /chat/new (click New agent)|

`  `**SECTION 2**  

**SECTION 2 — UI Element Inventory**

|**Element**|**Tag**|**Shadcn**|**Content**|**Tailwind (est.)**|**Interactive?**|**State**|
| :- | :- | :- | :- | :- | :- | :- |
|Workspace avatar|div|Avatar|'AS' initials (dark gray bg, white text)|w-8 h-8 rounded bg-gray-800 text-white text-xs font-bold flex items-center justify-center|No|Always|
|Workspace name|span|—|AS Mobbin|text-sm font-semibold text-gray-900 ml-2|No|Always|
|Sidebar collapse button|button|—||← (bar + left-arrow icon)|ml-auto text-gray-400 hover:text-gray-600 p-1 rounded|Yes — collapses sidebar|Expanded|
|Home nav item|a|—|🏠 Home|flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-900 bg-gray-100 rounded-lg|Yes — href=/home|Always|
|Chat nav item|a|—|💬 Chat|flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg|Yes — href=/chat|Always|
|My agents nav item|a|—|📁 My agents|flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg|Yes — href=/agents|Always|
|New agent nav item|a|—|+ New agent|flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg|Yes — href=/agents/new|Always|
|Promo card container|div|Card|Make Money with Lindy promo|absolute bottom-16 left-2 right-2 bg-white border border-gray-100 rounded-xl p-3 shadow-sm|No|When promoVisible|
|Promo close button|button|—|× (X icon)|absolute top-2 right-2 text-gray-400 hover:text-gray-600 w-5 h-5|Yes — dismisses promo|When promoVisible|
|Promo title|h3|—|Make Money with Lindy|text-sm font-semibold text-gray-900|No|When promoVisible|
|Promo image|img|—|Treasure chest illustration|w-full rounded-lg mb-2 h-20 object-cover|No|When promoVisible|
|Promo body text|p|—|Our partners share how they built 6-figure agent businesses — live|text-xs text-gray-500 leading-relaxed|No|When promoVisible|
|Promo CTA button|button|Button|Register Now|w-full bg-gray-900 text-white text-xs rounded-lg py-2 hover:bg-gray-800 mt-2|Yes — external link|When promoVisible|
|Main content area|main|—|How can I help? — agent builder UI|flex-1 bg-gradient-to-br from-amber-50/40 via-yellow-50/20 to-white|—|Always|
|New Agent button (top right)|button|Button variant=outline|+ New Agent|border border-gray-200 rounded-lg px-4 py-2 text-sm absolute top-4 right-4|Yes|Always|

`  `**SECTION 3**  

**SECTION 3 — TypeScript Interfaces**

interface SidebarState {

`  `isExpanded: boolean;

`  `isPromoVisible: boolean;

}

interface WorkspaceInfo {

`  `id: string;

`  `name: string;

`  `logoUrl: string | null;

`  `initials: string; // derived: first 2 chars of name

}

interface NavItem {

`  `label: string;

`  `href: string;

`  `icon: string; // lucide-react icon name

`  `isActive: boolean;

}

interface PromoCard {

`  `id: string;

`  `title: string;

`  `body: string;

`  `imageUrl: string;

`  `ctaLabel: string;

`  `ctaUrl: string;

`  `dismissedAt?: string; // ISO string stored in localStorage

}

`  `**SECTION 4**  

**SECTION 4 — State Machine**

|**State**|**Trigger**|**UI Changes**|**Side Effects**|**Next State**|
| :- | :- | :- | :- | :- |
|SIDEBAR\_EXPANDED (Image 1)|Default / localStorage restore|Full sidebar: logo, nav labels, promo card|Load workspace info from session|—|
|SIDEBAR\_COLLAPSED (Image 2)|Click |← collapse button|Sidebar shrinks to ~48px wide; only icons visible; nav labels hidden|Write isExpanded=false to localStorage|—|
|PROMO\_VISIBLE|No dismissal record in localStorage|Promo card renders at sidebar bottom|None|—|
|PROMO\_DISMISSED|Click × on promo card|Promo card fades out and removes from DOM|Write promoDismissed:{id}: true to localStorage|—|
|NAV\_HOME\_ACTIVE|Route = /home|Home item has bg-gray-100 and font-medium|None|—|
|NAV\_CHAT\_ACTIVE|Route starts with /chat|Chat item has active styling|None|—|

`  `**SECTION 5**  

**SECTION 5 — API Contract**

// GET /api/workspaces/me

// Authorization: Bearer {sessionToken}

// 200: { id: string, name: string, logoUrl: string | null, plan: 'free' | 'pro' }

// GET /api/promos/active

// 200: { promo: PromoCard | null }

// Used to determine which promo to show in the sidebar

`  `**SECTION 6**  

**SECTION 6 — Prisma Schema Fragment**

model Workspace {

`  `id        String @id @default(cuid())

`  `name      String

`  `logoUrl   String?

`  `ownerId   String

`  `plan      SubscriptionPlan @default(FREE)

}

// Promo cards are CMS-driven (static JSON or CMS API)

// No Prisma model needed — fetched from /api/promos/active

`  `**SECTION 7**  

**SECTION 7 — Business Rules**

- BR-101: The sidebar is collapsible. Expanded state is persisted in localStorage. Evidence: |← button visible in Image 1; hamburger ≡ in Image 2. Implementation: Read/write localStorage key 'sidebar\_expanded'.
- BR-102: Active nav item has a filled background pill (bg-gray-100). Evidence: 'Home' has bg-gray-100 in Image 1. Implementation: Compare pathname with item href using usePathname().
- BR-103: Promo card is dismissible with × and does not reappear after dismissal. Evidence: × button visible top-right of promo. Implementation: localStorage key per promo ID.
- BR-104: Workspace initials appear in a dark square avatar (not a circle). Evidence: 'AS' in dark square. Implementation: Avatar component with rounded-md, not rounded-full.
- BR-105: 'New agent' in sidebar nav is different from '+ New Agent' button in main content header. Evidence: Both visible. The sidebar link goes to /agents/new; the top-right button creates a blank agent immediately.

`  `**SECTION 8**  

**SECTION 8 — Edge Cases**

**B) Inferred**

- P0 — Session expired: Redirect to /login with returnUrl=/home.
- P1 — Workspace logo fails to load: Fallback to initials avatar.
- P1 — Promo image fails to load: Show placeholder with brand color background.
- P2 — Very long workspace name: Truncate with ellipsis after 15 chars in expanded sidebar; hide entirely when collapsed.

`  `**SECTION 9**  

**SECTION 9 — Acceptance Criteria**

1. GIVEN I am authenticated and navigate to /home WHEN the page loads THEN the sidebar is expanded and 'Home' nav item is active (bg-gray-100)
1. GIVEN the sidebar is expanded WHEN I click the |← collapse button THEN the sidebar collapses to icon-only mode and state persists in localStorage
1. GIVEN the promo card is visible WHEN I click the × button THEN the promo card disappears and does not reappear on page refresh
1. GIVEN I click 'Chat' in the sidebar nav WHEN clicked THEN I navigate to /chat
1. GIVEN I click '+ New Agent' top-right WHEN clicked THEN a blank agent is created and I navigate to /agents/{id}/configure



**SCREEN 2: DASHBOARD HOME — SIDEBAR COLLAPSED**

Route: /home

`  `**SECTION 1**  

**SECTION 1 — Screen Identity**

|**Field**|**Value**|
| :- | :- |
|Screen name|Dashboard Home — Sidebar Collapsed|
|Route path|/home|
|Page file|app/(app)/home/page.tsx (same page, different sidebar state)|
|Component file|src/components/app/Sidebar.tsx (collapsed variant)|
|Layout|DashboardLayout: sidebar collapsed to ~48px showing only hamburger icon|
|Screenshots|Image 2 (Chat\_1) — sidebar collapsed, only ≡ icon visible|
|Auth requirement|Authenticated|
|Entry conditions|User clicked the |← collapse button OR localStorage has isExpanded=false|

`  `**SECTION 2**  

**SECTION 2 — UI Element Inventory**

|**Element**|**Tag**|**Shadcn**|**Content**|**Tailwind (est.)**|**Interactive?**|**State**|
| :- | :- | :- | :- | :- | :- | :- |
|Hamburger expand button|button|—|≡ (three horizontal lines)|p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded absolute top-4 left-4|Yes — expands sidebar|Collapsed|
|New Agent button (top right)|button|Button variant=outline|+ New Agent|border border-gray-200 rounded-lg px-4 py-2 text-sm absolute top-4 right-4|Yes|Always|
|Main content area|main|—|Full width agent builder UI (same as expanded)|flex-1 same content|—|Always|
|Sidebar (collapsed)|nav|—|48px wide, no labels visible|w-12 border-r border-gray-100 bg-white flex flex-col items-center py-4 gap-3|—|Collapsed|

`  `**SECTION 3**  

**SECTION 3 — TypeScript Interfaces**

// Same interfaces as Screen 1

// SidebarState.isExpanded = false in this view

interface CollapsedSidebarProps {

`  `onExpand: () => void;

}

`  `**SECTION 4**  

**SECTION 4 — State Machine**

|**State**|**Trigger**|**UI Changes**|**Side Effects**|**Next State**|
| :- | :- | :- | :- | :- |
|COLLAPSED (Image 2)|localStorage isExpanded=false OR click |←|Sidebar shows ≡ icon only; all nav labels hidden; no promo card; workspace name hidden|None|—|
|EXPANDING|Click ≡ hamburger|Sidebar animates from 48px to 220px, labels fade in|Write isExpanded=true to localStorage|EXPANDED|

`  `**SECTION 5**  

**SECTION 5 — API Contract**

// No additional API calls beyond Screen 1.

// Sidebar collapse/expand is purely client-side state.

`  `**SECTION 6**  

**SECTION 6 — Prisma Schema Fragment**

// No database interaction for sidebar collapse state.

// State persisted in browser localStorage only.

`  `**SECTION 7**  

**SECTION 7 — Business Rules**

- BR-201: In collapsed state, the promo card is NOT shown. Evidence: No promo visible in Image 2. Implementation: Conditional render based on isExpanded.
- BR-202: Main content area takes full remaining width when sidebar is collapsed. Evidence: Agent builder UI appears centered with more horizontal space. Implementation: sidebar width CSS variable drives flex layout.
- BR-203: The ≡ hamburger replaces the workspace avatar and name entirely when collapsed. Evidence: Image 2 shows only ≡. Implementation: Conditional render: if !isExpanded show hamburger; if isExpanded show avatar+name+|←.

`  `**SECTION 8**  

**SECTION 8 — Edge Cases**

- P2 — Animation preference: Respect prefers-reduced-motion; skip sidebar expand animation.
- P3 — Touch devices: Sidebar collapse should also respond to swipe left gesture.

`  `**SECTION 9**  

**SECTION 9 — Acceptance Criteria**

1. GIVEN the sidebar is collapsed WHEN I click the ≡ hamburger THEN the sidebar expands and shows workspace name, nav labels, and promo card
1. GIVEN the sidebar is expanded WHEN I click |← THEN sidebar collapses and localStorage isExpanded=false is set
1. GIVEN I refresh the page with sidebar collapsed WHEN the page loads THEN sidebar remains collapsed (localStorage restored)



**SCREEN 3: CHAT — EMPTY NEW TASK**

Route: /chat

`  `**SECTION 1**  

**SECTION 1 — Screen Identity**

|**Field**|**Value**|
| :- | :- |
|Screen name|Chat — Empty State / New Task|
|Route path|/chat|
|Page file|app/(app)/chat/page.tsx|
|Component file|src/components/chat/ChatLayout.tsx + ChatList.tsx + ChatEmpty.tsx|
|Layout|DashboardLayout + ChatLayout (three-panel: global sidebar + chat list 240px + main content)|
|Auth requirement|Authenticated|
|Screenshots|Image 3 (Chat\_2) — one 'New Task' in Today, empty main content, message input at bottom|
|Entry conditions|Click 'Chat' in sidebar nav, or navigate to /chat directly|
|Before|/home or any other page|
|After|/chat/{taskId} (select a task) or stays on /chat (send first message)|

`  `**SECTION 2**  

**SECTION 2 — UI Element Inventory — Chat List Panel**

|**Element**|**Tag**|**Shadcn**|**Content**|**Tailwind**|**Interactive?**|**State**|
| :- | :- | :- | :- | :- | :- | :- |
|Chat icon + 'Chat' title|div|—|🟡 Chat ▾ (amber square icon, dropdown caret)|flex items-center gap-2 text-sm font-semibold text-gray-900|Yes — dropdown for chat type?|Always|
|Search input|input|Input|Search (placeholder)|w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-sm text-gray-500 pl-8|Yes — text search|Always|
|Search icon|span|—|🔍 magnifying glass|absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4|No|Always|
|Filter button|button|—|≡ filter icon (three horizontal lines with dots)|p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded|Yes — opens filter dropdown|Always|
|New chat button|button|—|+ (plus icon)|p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded|Yes — creates new task|Always|
|'Today' section label|p|—|Today|text-xs font-medium text-gray-400 px-2 py-1 uppercase tracking-wider|No|Always|
|'New Task' chat item|button|—|New Task (selected/active)|w-full text-left px-3 py-2 text-sm text-gray-900 bg-gray-100 rounded-lg hover:bg-gray-100|Yes — selects this task|HAS\_ITEMS|
|Main content area|div|—|Empty white area|flex-1 bg-white|—|EMPTY|
|Message input bar|div|—|📎 Enter message | 🎤 | ▷|fixed bottom-0 right-0 left-[calc(240px+220px)] border-t border-gray-100 bg-white px-4 py-3 flex items-center gap-2|Yes|Always|
|Attachment icon in input|button|—|📎 paperclip|text-gray-400 hover:text-gray-600 w-5 h-5 shrink-0|Yes — opens file picker|Always|
|Message textarea|textarea|—|Enter message (placeholder)|flex-1 text-sm text-gray-500 outline-none resize-none bg-transparent|Yes — typing|Always|
|Voice input button|button|—|🎤 microphone|text-gray-400 hover:text-gray-600 w-5 h-5 shrink-0|Yes — voice|Always|
|Send button|button|Button|▷ send (triangle/arrow right)|text-gray-400 hover:text-gray-800 w-6 h-6 shrink-0|Yes — sends message|READY|

`  `**SECTION 3**  

**SECTION 3 — TypeScript Interfaces**

type TaskStatus = 'active' | 'error' | 'completed' | 'running';

interface ChatTask {

`  `id: string;

`  `title: string; // auto-generated from first message or 'New Task'

`  `agentId: string | null;

`  `agentName: string | null;

`  `agentIconUrl: string | null;

`  `status: TaskStatus;

`  `isUnread: boolean;

`  `isFavorite: boolean;

`  `createdAt: string;

`  `updatedAt: string;

`  `lastMessagePreview: string | null;

}

interface ChatListState {

`  `tasks: ChatTask[];

`  `searchQuery: string;

`  `activeFilter: 'all' | 'errors' | 'unread' | null;

`  `selectedTaskId: string | null;

`  `isLoading: boolean;

}

interface MessageInputState {

`  `content: string;

`  `attachments: File[];

`  `isVoiceActive: boolean;

`  `isSending: boolean;

}

interface SendMessageRequest {

`  `taskId: string;

`  `content: string;

`  `attachmentUrls?: string[];

}

interface SendMessageResponse {

`  `messageId: string;

`  `taskId: string;

`  `agentResponse: string; // streaming

}

`  `**SECTION 4**  

**SECTION 4 — State Machine**

|**State**|**Trigger**|**UI Changes**|**Side Effects**|**Next State**|
| :- | :- | :- | :- | :- |
|EMPTY\_NO\_TASKS|First visit / no tasks exist|Chat list shows empty state; main area empty; message input present|GET /api/tasks|—|
|HAS\_NEW\_TASK (Image 3)|New task auto-created on /chat visit|'New Task' appears under Today; selected (bg-gray-100); main content area blank; message input focused|POST /api/tasks { title: 'New Task' }|MESSAGE\_SENT|
|MESSAGE\_SENDING|User types and presses ▷ or Enter|Message input disabled, shows sending indicator|POST /api/tasks/{id}/messages|AGENT\_RESPONDING|
|AGENT\_RESPONDING|API starts streaming response|Typing indicator in main content area, streaming text appears|WebSocket or SSE stream|RESPONSE\_COMPLETE|
|RESPONSE\_COMPLETE|Stream ends|Full agent message visible, input re-enabled|Update task title from first message if title = 'New Task'|IDLE|

`  `**SECTION 5**  

**SECTION 5 — API Contract**

// GET /api/tasks?workspaceId={id}&limit=50

// Authorization: Bearer {sessionToken}

// 200: { tasks: ChatTask[], groupedByDate: { today: ChatTask[], yesterday: ChatTask[], older: ChatTask[] } }

// POST /api/tasks

// Request: { title?: string, agentId?: string }

// 201: { task: ChatTask }

// Side effects: create Task record, auto-navigate to /chat/{taskId}

// POST /api/tasks/{taskId}/messages

// Request: { content: string, attachmentUrls?: string[] }

// 200: streaming SSE with agent response chunks

// Headers: Content-Type: text/event-stream

// Events: data: { type: 'chunk', text: string } | { type: 'done', messageId: string }

// **⚠️ IMPLEMENTATION: See ARCHITECTURE.md §6 for the complete SSE streaming implementation.**
// **Uses ReadableStream + new Response() on Node.js runtime (NOT Edge).**
// **Server: app/api/tasks/[taskId]/messages/route.ts with `export const runtime = 'nodejs'`**
// **Client: useStreamingMessage() hook — full code in ARCHITECTURE.md §6**

`  `**SECTION 6**  

**SECTION 6 — Prisma Schema Fragment**

model Task {

`  `id            String    @id @default(cuid())

`  `title         String    @default('New Task')

`  `workspaceId   String

`  `workspace     Workspace @relation(fields: [workspaceId], references: [id])

`  `agentId       String?

`  `agent         Agent?    @relation(fields: [agentId], references: [id])

`  `createdById   String

`  `createdBy     User      @relation(fields: [createdById], references: [id])

`  `status        TaskStatus @default(ACTIVE)

`  `isUnread      Boolean   @default(false)

`  `isFavorite    Boolean   @default(false)

`  `messages      Message[]

`  `createdAt     DateTime  @default(now())

`  `updatedAt     DateTime  @updatedAt

}

model Message {

`  `id        String   @id @default(cuid())

`  `taskId    String

`  `task      Task     @relation(fields: [taskId], references: [id], onDelete: Cascade)

`  `role      MessageRole // USER | ASSISTANT | SYSTEM

`  `content   String   @db.Text

`  `createdAt DateTime @default(now())

}

enum TaskStatus { ACTIVE RUNNING ERROR COMPLETED ARCHIVED }

enum MessageRole { USER ASSISTANT SYSTEM }

`  `**SECTION 7**  

**SECTION 7 — Business Rules**

- BR-301: The Chat section uses a three-panel layout: global sidebar (220px) + chat list panel (240px) + main content (flex-1). Evidence: Three distinct columns visible in Image 3. Implementation: CSS Grid or nested flexbox.
- BR-302: A 'New Task' is auto-created and selected when user navigates to /chat with no active task. Evidence: Image 3 shows 'New Task' pre-selected. Implementation: If no taskId in URL, create a task and redirect to /chat/{id}.
- BR-303: Tasks in the chat list are grouped by date: 'Today', 'Yesterday', 'Earlier this week', etc. Evidence: 'Today' section header visible. Implementation: Group tasks by date in the frontend using date-fns.
- BR-304: The message input bar is always pinned to the bottom. Evidence: Visible in all chat states. Implementation: sticky bottom-0 or fixed positioning with left offset = sidebar widths.
- BR-305: The send button (▷) uses a triangle/arrow icon, not the same blue circle ↑ as the home prompt input. Evidence: Triangle icon in chat vs circle in home. Implementation: Different icon component.
- BR-306: Chat title defaults to 'New Task' and gets auto-updated to the first user message content (truncated). Evidence: Image 4 shows task titled 'Clean Minimal Blog Builder' — derived from conversation. Implementation: After first message, PATCH /api/tasks/{id} with derived title.

`  `**SECTION 8**  

**SECTION 8 — Edge Cases**

**B) Inferred**

- P0 — Message send fails: Show inline error below input 'Failed to send. Try again.' with retry button.
- P0 — Agent stream interrupted: Show partial message with error badge 'Response incomplete. Retry?'
- P1 — Very long message content: Textarea auto-expands up to max-height; then shows scroll inside textarea.
- P1 — File attachment too large: Toast 'File must be under 10MB.'
- P2 — Task title auto-generation: If first message is a URL or code snippet, use a generic title 'Task {n}'.

`  `**SECTION 9**  

**SECTION 9 — Acceptance Criteria**

1. GIVEN I navigate to /chat WHEN the page loads THEN a 'New Task' is auto-created, selected in the list, and the message input is focused
1. GIVEN I type a message in the input WHEN I press Enter or click ▷ THEN the message appears in the main area and the agent starts responding
1. GIVEN the agent is responding WHEN the response streams THEN I see text appearing character-by-character
1. GIVEN the agent response completes WHEN the stream ends THEN the task title updates to reflect the first user message
1. GIVEN I click the + button in the chat list WHEN clicked THEN a new task is created and I navigate to /chat/{newTaskId}



**SCREEN 4: CHAT — ACTIVE CONVERSATION**

Route: /chat/{taskId}

`  `**SECTION 1**  

**SECTION 1 — Screen Identity**

|**Field**|**Value**|
| :- | :- |
|Screen name|Chat — Active Conversation with Agent Response|
|Route path|/chat/{taskId}|
|Page file|app/(app)/chat/[taskId]/page.tsx|
|Component file|src/components/chat/ChatThread.tsx|
|Layout|DashboardLayout + ChatLayout (three panels)|
|Screenshots|Image 4 (Chat\_3) — 'Clean Minimal Blog Builder' task selected; agent response visible; Favorites + Recents in sidebar|
|Screenshots (cont.)|Image 5 (Chat\_4) — 'Monitor Gmail inbox' task active; Build agent action button visible at top of thread|
|Auth requirement|Authenticated|
|Entry conditions|User selects a task from chat list, OR navigates directly to /chat/{taskId}|
|Before|/chat (empty) or another task|
|After|Stay in thread (continue conversation) or navigate away|

`  `**SECTION 2**  

**SECTION 2 — UI Element Inventory — Sidebar with Favorites/Recents**

|**Element**|**Tag**|**Shadcn**|**Content**|**Tailwind**|**Interactive?**|**State**|
| :- | :- | :- | :- | :- | :- | :- |
|Favorites section label|p|—|Favorites|text-xs font-medium text-gray-400 px-2 mt-4 mb-1 uppercase tracking-wider|No|When favorites exist|
|Favorite item (SLMobbin Email Agent)|a|—|🔵 SLMobbin Email Agent|flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg|Yes — href=/chat/{agentTaskId}|Favorites exist|
|Recents section label|p|—|Recents|text-xs font-medium text-gray-400 px-2 mt-4 mb-1 uppercase tracking-wider|No|When recents exist|
|Recent: Meeting Notetaker|a|—|🔵 Meeting Notetaker (appears twice — two sessions)|flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg truncate|Yes|Recents exist|
|Recent: SLMobbin Email Agent|a|—|🔵 SLMobbin Email Agent|flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg|Yes|Recents exist|
|Recent: Gmail Inbox Monitor|a|—|🌀 Gmail Inbox Monitor|flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg|Yes|Recents exist|

**UI Element Inventory — Chat List Panel (with tasks)**

|**Element**|**Tag**|**Shadcn**|**Content**|**Tailwind**|**Interactive?**|**State**|
| :- | :- | :- | :- | :- | :- | :- |
|'Today' group|div|—|Today|text-xs text-gray-400 px-2 py-1 font-medium uppercase tracking-wide|No|Always|
|Active task item|button|—|Clean Minimal Blog Builder (selected)|w-full text-left px-3 py-2 text-sm text-gray-900 bg-gray-100 rounded-lg font-medium|Yes|SELECTED|
|'Yesterday' group|div|—|Yesterday|text-xs text-gray-400 px-2 py-1 mt-2 font-medium uppercase tracking-wide|No|Has yesterday tasks|
|Unselected task|button|—|Monitor Gmail inbox|w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg|Yes|UNSELECTED|
|Task with blue dot|button|—|🔵 - New Build Gmail Monitor|flex items-center gap-1 w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg|Yes|HAS\_STATUS\_DOT|

**UI Element Inventory — Main Chat Content (Image 4)**

|**Element**|**Tag**|**Shadcn**|**Content**|**Tailwind**|**Interactive?**|**State**|
| :- | :- | :- | :- | :- | :- | :- |
|Share button (top right)|button|Button variant=outline|Share|border border-gray-200 rounded-lg px-4 py-2 text-sm absolute top-4 right-4|Yes — opens share modal|HAS\_CONVERSATION|
|Agent response bubble|div|—|Agent markdown-formatted response (bullet lists, bold text, headers)|prose prose-sm max-w-none px-8 py-4 text-gray-800 leading-relaxed|No|HAS\_MESSAGES|
|Divider line in thread|hr|Separator|—|border-t border-gray-100 my-4 mx-8|No|Between message groups|
|'Next Steps' section|div|—|🎯 Next Steps heading + numbered items|Same prose rendering — markdown with emoji|No|Agent response|
|Numbered items in response|div|—|1️⃣ Run full QA testing - Check functionality... etc.|prose rendering|No|Agent response|
|Message input bar|div|—|Same as Screen 3|sticky bottom-0|Yes|Always|

**UI Element Inventory — Agent Action Buttons (Image 5)**

|**Element**|**Tag**|**Shadcn**|**Content**|**Tailwind**|**Interactive?**|**State**|
| :- | :- | :- | :- | :- | :- | :- |
|Update Agent action row|div|—|✅ Update Agent 🔄 ›|flex items-center gap-2 text-sm text-gray-700 py-2 px-4 border-b border-gray-100|Yes — clickable actions|After agent update|
|Build agent button|button|Button variant=outline|🔴 Build agent (with avatar icon)|flex items-center gap-2 border border-gray-200 rounded-lg px-4 py-2 text-sm|Yes — navigates to agent builder|After build response|

`  `**SECTION 3**  

**SECTION 3 — TypeScript Interfaces**

interface ChatMessage {

`  `id: string;

`  `role: 'user' | 'assistant' | 'system';

`  `content: string; // markdown string

`  `createdAt: string;

`  `agentAction?: AgentAction; // for assistant messages

}

interface AgentAction {

`  `type: 'update\_agent' | 'build\_agent' | 'run\_task' | 'tool\_call';

`  `label: string; // 'Update Agent', 'Build agent'

`  `status: 'pending' | 'completed' | 'failed';

`  `targetId?: string; // agentId if applicable

`  `targetUrl?: string;

}

interface ChatThreadState {

`  `taskId: string;

`  `messages: ChatMessage[];

`  `isStreaming: boolean;

`  `streamingContent: string;

}

interface FavoriteAgent {

`  `id: string;

`  `name: string;

`  `iconUrl: string;

`  `taskId: string; // last chat with this agent

}

`  `**SECTION 4**  

**SECTION 4 — State Machine**

|**State**|**Trigger**|**UI Changes**|**Side Effects**|**Next State**|
| :- | :- | :- | :- | :- |
|LOADING|Navigate to /chat/{id}|Skeleton loaders in message area|GET /api/tasks/{id}/messages|LOADED|
|LOADED\_WITH\_MESSAGES (Image 4)|API returns messages|Full thread visible; Share button appears; agent messages rendered as markdown|None|—|
|TASK\_WITH\_AGENT\_ACTION (Image 5)|Agent performed an action (build/update)|Action button row visible at top/inline in thread|Agent built or updated in background|—|
|USER\_TYPING|User types in input|Input grows, send button activates|None|SENDING|
|SENDING|Click ▷ or Enter|Message appears instantly in thread (optimistic), input clears, streaming indicator shows|POST /api/tasks/{id}/messages|STREAMING|
|STREAMING|SSE data arrives|Agent message appears with cursor, text streams in|SSE stream|IDLE|
|SHARE\_OPEN|Click Share button|Modal opens with share link|Generate share link if not exists|—|

`  `**SECTION 5**  

**SECTION 5 — API Contract**

// GET /api/tasks/{taskId}/messages?limit=50&before={cursor}

// 200: { messages: ChatMessage[], hasMore: boolean, nextCursor: string }

// POST /api/tasks/{taskId}/messages

// Request: { content: string, attachmentUrls?: string[] }

// 200: SSE stream (Content-Type: text/event-stream)

// data: { type: 'chunk', text: string }

// data: { type: 'action', action: AgentAction }

// data: { type: 'done', messageId: string }

// **⚠️ IMPLEMENTATION: See ARCHITECTURE.md §6 for complete server + client SSE code.**
// **Runtime: Node.js (NOT Edge). Pattern: ReadableStream + new Response().**
// **Client hook: useStreamingMessage() — handles chunk, action, done, error events.**

// 400: { error: 'empty\_message' }

// 402: { error: 'task\_limit\_reached' }

// POST /api/tasks/{taskId}/share

// 200: { shareUrl: string, shareToken: string }

// GET /api/users/me/favorites

// 200: { favorites: FavoriteAgent[] }

`  `**SECTION 6**  

**SECTION 6 — Prisma Schema Fragment**

model Task {

`  `// ... (from Screen 3)

`  `shareToken  String?   @unique // generated on first share

}

model FavoriteAgent {

`  `id        String   @id @default(cuid())

`  `userId    String

`  `user      User     @relation(fields: [userId], references: [id])

`  `agentId   String

`  `agent     Agent    @relation(fields: [agentId], references: [id])

`  `createdAt DateTime @default(now())

`  `@@unique([userId, agentId])

}

`  `**SECTION 7**  

**SECTION 7 — Business Rules**

- BR-401: Agent responses are rendered as markdown. Evidence: Bullet lists, bold text, emoji headers, numbered items all visible in Images 4 and 5. Implementation: react-markdown with remark-gfm plugin; prose Tailwind class.
- BR-402: The 'Share' button appears only when the task has messages. Evidence: Share button in Image 4 but absent in Image 3. Implementation: Conditional render based on messages.length > 0.
- BR-403: Favorites and Recents sections appear in the global LEFT sidebar (not the chat list panel). Evidence: Both visible in left sidebar in Images 4 and 5. Implementation: Separate from the chat list; fetched independently.
- BR-404: A blue dot prefix (🔵 -) appears on some chat list items. Evidence: '🔵 - New Build Gmail Monitor' in Image 4. Implementation: Status indicator — this task is actively running. Dot color encodes status: blue=running, red=error.
- BR-405: Agent action buttons (Update Agent, Build agent) are inline in the conversation thread, not in a sidebar. Evidence: Both visible inline in the message thread in Image 5. Implementation: Render AgentAction components within the message stream.
- BR-406: The sidebar Recents list shows individual agent interactions (not task titles). Evidence: 'Meeting Notetaker' appears twice (two separate sessions). Implementation: List recent Task records sorted by updatedAt, showing agent name.

`  `**SECTION 8**  

**SECTION 8 — Edge Cases**

**A) Observed**

- Agent action buttons (Image 5): ✅ Update Agent (completed) with 🔄 refresh icon and › expand arrow. Build agent button below it. These are interactive action confirmations embedded in the thread.

**B) Inferred**

- P0 — Task not found (404): Redirect to /chat with toast 'This conversation was not found.'
- P0 — Stream connection lost: Show 'Connection interrupted. Refresh to continue.' banner.
- P1 — Infinite scroll: Load more messages when user scrolls to top.
- P1 — Message copy: Right-click or hover reveals a 'Copy' button on agent messages.
- P2 — Long agent response: Auto-scroll to bottom as streaming.

`  `**SECTION 9**  

**SECTION 9 — Acceptance Criteria**

1. GIVEN I navigate to /chat/{taskId} WHEN messages exist THEN they render as markdown with emoji, bold, and bullet formatting
1. GIVEN a task has messages WHEN I view the chat THEN the 'Share' button appears in the top right
1. GIVEN I click 'Share' WHEN the API returns a share URL THEN a modal shows the share link with a copy button
1. GIVEN the agent performs a 'build agent' action WHEN the stream includes an action event THEN an action button renders inline in the thread
1. GIVEN I have favorited agents WHEN I view any chat screen THEN they appear under 'Favorites' in the left sidebar
1. GIVEN a task is actively running WHEN it appears in the chat list THEN it has a blue status dot prefix



**SCREEN 5: CHAT LIST — FILTER DROPDOWN OPEN**

Route: /chat (filter open)

`  `**SECTION 1**  

**SECTION 1 — Screen Identity**

|**Field**|**Value**|
| :- | :- |
|Screen name|Chat — Filter Dropdown Open|
|Route path|/chat/{taskId} (same route, filter is UI state not URL param)|
|Page file|app/(app)/chat/[taskId]/page.tsx|
|Component file|src/components/chat/ChatFilterDropdown.tsx|
|Screenshots|Image 8 (Filtering\_chats\_2) — filter dropdown open showing 'Filter by type: Errors, Unread'|
|Auth requirement|Authenticated|
|Entry conditions|User clicks the filter icon (≡ with dots) in the chat list header|

`  `**SECTION 2**  

**SECTION 2 — UI Element Inventory — Filter Dropdown**

|**Element**|**Tag**|**Shadcn**|**Content**|**Tailwind**|**Interactive?**|**State**|
| :- | :- | :- | :- | :- | :- | :- |
|Filter button (active)|button|—|≡ filter icon (highlighted)|p-1.5 text-gray-700 bg-gray-100 rounded|Yes — toggles dropdown|FILTER\_OPEN|
|Filter dropdown container|div|Popover/DropdownMenu|Filter by type dropdown|absolute top-12 left-0 z-50 bg-white border border-gray-100 rounded-xl shadow-lg w-48 py-2|—|FILTER\_OPEN|
|Dropdown header|p|—|Filter by type|text-xs font-medium text-gray-400 px-3 py-1 uppercase tracking-wider|No|FILTER\_OPEN|
|'Errors' filter option|button|DropdownMenuItem|Errors|w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg|Yes — applies errors filter|FILTER\_OPEN|
|'Unread' filter option|button|DropdownMenuItem|Unread|w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg|Yes — applies unread filter|FILTER\_OPEN|
|Backdrop/overlay|div|—|Invisible click-outside overlay|fixed inset-0 z-40|Yes — closes dropdown on click|FILTER\_OPEN|

`  `**SECTION 3**  

**SECTION 3 — TypeScript Interfaces**

type ChatFilter = 'errors' | 'unread';

interface FilterState {

`  `isOpen: boolean;

`  `activeFilter: ChatFilter | null;

}

interface FilterOption {

`  `value: ChatFilter;

`  `label: string;

}

const FILTER\_OPTIONS: FilterOption[] = [

`  `{ value: 'errors', label: 'Errors' },

`  `{ value: 'unread', label: 'Unread' },

];

`  `**SECTION 4**  

**SECTION 4 — State Machine**

|**State**|**Trigger**|**UI Changes**|**Side Effects**|**Next State**|
| :- | :- | :- | :- | :- |
|CLOSED|Default / click outside|Filter icon neutral; chat list shows all items|None|—|
|OPEN (Image 8)|Click filter icon|Dropdown appears with 'Filter by type' header and Errors/Unread options; filter icon turns darker|None|CLOSED or FILTER\_APPLIED|
|FILTER\_APPLIED\_ERRORS (Image 6)|Click 'Errors'|Dropdown closes; chat list filters to tasks with status=ERROR; if none → 'No tasks' empty state|GET /api/tasks?filter=errors|FILTER\_ACTIVE|
|FILTER\_APPLIED\_UNREAD|Click 'Unread'|Chat list filters to tasks with isUnread=true|GET /api/tasks?filter=unread|FILTER\_ACTIVE|
|FILTER\_ACTIVE|Filter applied|Filter icon shows active indicator (filled/colored); filter badge may appear above list|None|CLOSED\_WITH\_FILTER|
|FILTER\_CLEARED|Click same filter or clear button|Chat list shows all tasks again|None|CLOSED|

`  `**SECTION 5**  

**SECTION 5 — API Contract**

// GET /api/tasks?filter=errors

// 200: { tasks: ChatTask[] } — only tasks where status = 'ERROR'

// GET /api/tasks?filter=unread

// 200: { tasks: ChatTask[] } — only tasks where isUnread = true

// Note: Filter can also be applied client-side if all tasks are already loaded.

// Recommendation: client-side filtering for performance (tasks already fetched).

`  `**SECTION 6**  

**SECTION 6 — Prisma Schema Fragment**

// No new models needed. Uses existing Task model:

// status: TaskStatus — filter by ERROR

// isUnread: Boolean — filter by true

`  `**SECTION 7**  

**SECTION 7 — Business Rules**

- BR-501: Filter options are exactly two: 'Errors' and 'Unread'. Evidence: Image 8 shows only these two under 'Filter by type'. Implementation: Hardcoded filter options array.
- BR-502: Filter is applied immediately on click — no separate 'Apply' button. Evidence: Dropdown would close and list would update. Implementation: onClick handler applies filter and closes dropdown.
- BR-503: Only one filter can be active at a time. Evidence: Two separate clickable options (not checkboxes). Implementation: Single activeFilter state — clicking same filter toggles it off.
- BR-504: The filter dropdown uses a 'Filter by type' section header that is NOT clickable — it is a label only. Evidence: Different visual weight and uppercase style. Implementation: Pointer-events-none on the header element.
- BR-505: When a filter results in no matching tasks, show the 'No tasks' empty state (Image 6). Implementation: Conditional render based on filteredTasks.length === 0.

`  `**SECTION 8**  

**SECTION 8 — Edge Cases**

**A) Observed**

- No tasks after filter (Image 6): 'No tasks / This agent's tasks will appear here.' clipboard illustration. Recovery: Clear the filter.

**B) Inferred**

- P1 — Click outside dropdown: Closes dropdown, does not change active filter.
- P1 — Escape key: Closes dropdown.
- P2 — Filter persistence: Filter should persist during the session but reset on page navigation.

`  `**SECTION 9**  

**SECTION 9 — Acceptance Criteria**

1. GIVEN I am on /chat WHEN I click the filter icon THEN a dropdown appears with 'Filter by type', 'Errors', and 'Unread' options
1. GIVEN the filter dropdown is open WHEN I click 'Errors' THEN the dropdown closes and the chat list shows only tasks with error status
1. GIVEN the filter is 'Errors' and no tasks match WHEN the filter is applied THEN the chat list shows 'No tasks / This agent's tasks will appear here.' with clipboard illustration
1. GIVEN the filter dropdown is open WHEN I click outside it THEN the dropdown closes without changing the active filter
1. GIVEN a filter is active WHEN I click the filter icon and the same option THEN the filter is cleared and all tasks reappear



**SCREEN 6: CHAT LIST — FILTER APPLIED (NO RESULTS)**

Route: /chat (filtered, empty)

`  `**SECTION 1**  

**SECTION 1 — Screen Identity**

|**Field**|**Value**|
| :- | :- |
|Screen name|Chat — Filter Applied / No Tasks Empty State|
|Route path|/chat/{taskId} (filter state in UI)|
|Page file|app/(app)/chat/[taskId]/page.tsx|
|Component file|src/components/shared/ChatListEmptyState.tsx (**SHARED** — see ARCHITECTURE.md §4. Used by Screen 6 filter-empty, Screen 8 search-empty, and no-tasks state)|
|Screenshots|Image 6 (Filtering\_chats\_0) — filter active (filter icon highlighted), 'No tasks' empty state in chat list panel|
|Auth requirement|Authenticated|
|Entry conditions|Filter applied and no tasks match the filter criteria|

`  `**SECTION 2**  

**SECTION 2 — UI Element Inventory — Empty State**

|**Element**|**Tag**|**Shadcn**|**Content**|**Tailwind**|**Interactive?**|**State**|
| :- | :- | :- | :- | :- | :- | :- |
|Filter icon (active)|button|—|≡ filter icon (filled/active styling)|p-1.5 text-gray-700 bg-gray-100 rounded ring-1 ring-gray-300|Yes — opens filter to change|FILTER\_ACTIVE|
|Empty state container|div|—|Centered in chat list panel|flex flex-col items-center justify-center h-full py-12 px-4|No|NO\_RESULTS|
|Clipboard illustration|img/svg|—|Clipboard with checkmarks (gray/light)|w-20 h-20 text-gray-200 mb-4|No|NO\_RESULTS|
|Empty state title|p|—|No tasks|text-sm font-medium text-gray-500 mb-1|No|NO\_RESULTS|
|Empty state subtitle|p|—|This agent's tasks will appear here.|text-xs text-gray-400|No|NO\_RESULTS|

`  `**SECTION 3**  

**SECTION 3 — TypeScript Interfaces**

interface ChatListEmptyStateProps {

`  `reason: 'no\_tasks' | 'no\_search\_results' | 'filter\_no\_results';

`  `filterActive?: ChatFilter | null;

`  `searchQuery?: string;

}

`  `**SECTION 4**  

**SECTION 4 — State Machine**

|**State**|**Trigger**|**UI Changes**|**Side Effects**|**Next State**|
| :- | :- | :- | :- | :- |
|FILTER\_NO\_RESULTS (Images 6, 12)|Filter returns zero tasks|Clipboard illustration + 'No tasks' + subtitle in center of chat panel|None|—|
|FILTER\_CLEARED|Click filter icon → click active filter|Tasks list reappears, empty state hides|Clear filter state|NORMAL|

`  `**SECTION 5**  

**SECTION 5 — API Contract**

// No additional API call. Empty state is derived from filtered tasks.length === 0

// Client-side filtering only (or server returns empty array).

`  `**SECTION 6**  

**SECTION 6 — Prisma Schema Fragment**

// No additional models. Uses Task.status and Task.isUnread.

`  `**SECTION 7**  

**SECTION 7 — Business Rules**

- BR-601: The empty state illustration is a clipboard/checklist icon in light gray — NOT the same as a generic empty state. Evidence: Specific illustration visible in Images 6 and 12. Implementation: Use an SVG clipboard icon or image asset.
- BR-602: The subtitle text is 'This agent's tasks will appear here.' — implying the empty state is agent-specific context. Evidence: Exact text visible. Implementation: Hardcode this subtitle for filter/search empty states.
- BR-603: The main content area (right side) continues to show the last selected conversation even when the chat list has no results. Evidence: Agent response content still visible in Images 6 and 12. Implementation: Main content area is independent of chat list filtering.

`  `**SECTION 8**  

**SECTION 8 — Edge Cases**

- P1 — Filter + search both active: Show combined empty state 'No tasks matching your search and filter.'

`  `**SECTION 9**  

**SECTION 9 — Acceptance Criteria**

1. GIVEN a filter is applied WHEN no tasks match THEN a clipboard illustration appears with 'No tasks' and 'This agent's tasks will appear here.'
1. GIVEN the empty state is showing WHEN the main content area has a prior conversation THEN the conversation remains visible
1. GIVEN the no-results state WHEN I click the filter icon and clear the filter THEN the task list reappears



**SCREEN 7: CHAT LIST — SEARCH ACTIVE WITH RESULTS**

Route: /chat (search)

`  `**SECTION 1**  

**SECTION 1 — Screen Identity**

|**Field**|**Value**|
| :- | :- |
|Screen name|Chat — Search Active with Matching Results|
|Route path|/chat/{taskId} (search is UI state)|
|Page file|app/(app)/chat/[taskId]/page.tsx|
|Component file|src/components/chat/ChatSearch.tsx|
|Screenshots|Image 9 (Searching\_chats\_3) — query 'blog', one result 'Clean Minimal Blog Builder' with 'Blog' BOLD highlighted; no date groups|
|Screenshots (cont.)|Image 10 (Searching\_chats\_1) — query 'blog', two results: 'New Task' (top) + 'Clean Minimal Blog Builder' with bold 'Blog'|
|Auth requirement|Authenticated|
|Entry conditions|User clicks the search input and types|

`  `**SECTION 2**  

**SECTION 2 — UI Element Inventory — Search State**

|**Element**|**Tag**|**Shadcn**|**Content**|**Tailwind**|**Interactive?**|**State**|
| :- | :- | :- | :- | :- | :- | :- |
|Search input (active)|input|Input|'blog' typed in (Image 9/10)|w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 pl-8 focus:border-blue-400 focus:ring-1 focus:ring-blue-400|Yes — real-time search|SEARCH\_ACTIVE|
|Clear search button|button|—|× (X icon to clear)|absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 w-4 h-4|Yes — clears query|SEARCH\_ACTIVE (has text)|
|Search result item — matching|button|—|Clean Minimal Blog Builder (with 'Blog' in bold)|w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg|Yes — selects task|SEARCH\_RESULTS|
|Search highlight — matching text|span|—|Blog (bold/black)|font-bold text-gray-900|No|SEARCH\_RESULTS|
|Search result — 'New Task'|button|—|New Task (no highlight — full match or exact title)|w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg|Yes|SEARCH\_RESULTS|
|No date group headers in search|—|—|When search is active, 'Today'/'Yesterday' groups are hidden|—|—|SEARCH\_ACTIVE|

`  `**SECTION 3**  

**SECTION 3 — TypeScript Interfaces**

interface SearchState {

`  `query: string;

`  `results: SearchResult[];

`  `isSearching: boolean; // debounce in progress

}

interface SearchResult {

`  `taskId: string;

`  `title: string;

`  `highlightedTitle: HighlightSegment[]; // for bold highlighting

}

interface HighlightSegment {

`  `text: string;

`  `isMatch: boolean; // true = render as bold

}

// Example for 'Clean Minimal Blog Builder' with query 'blog':

// [

//   { text: 'Clean Minimal ', isMatch: false },

//   { text: 'Blog', isMatch: true },

//   { text: ' Builder', isMatch: false }

// ]

`  `**SECTION 4**  

**SECTION 4 — State Machine**

|**State**|**Trigger**|**UI Changes**|**Side Effects**|**Next State**|
| :- | :- | :- | :- | :- |
|SEARCH\_IDLE|No text in search input|Chat list shows date-grouped tasks normally|None|—|
|SEARCH\_TYPING|User types in search input|Input value updates, debounce timer starts (300ms)|None|SEARCH\_ACTIVE|
|SEARCH\_ACTIVE\_WITH\_RESULTS (Image 9)|Query matches 1+ tasks|Date group headers HIDDEN; flat list of matching tasks; query text bolded in titles|Client-side filter OR GET /api/tasks?q={query}|—|
|SEARCH\_ACTIVE\_MULTI\_RESULTS (Image 10)|Query 'blog' matches 2 tasks|'New Task' + 'Clean Minimal Blog Builder' both shown; Blog bolded in latter|Same|—|
|SEARCH\_NO\_RESULTS (Image 12)|Query 'asd' matches nothing|Clipboard empty state: 'No tasks' + subtitle|None|—|
|SEARCH\_CLEARED|Click × or clear input|Input clears; date-grouped list restores|None|SEARCH\_IDLE|

`  `**SECTION 5**  

**SECTION 5 — API Contract**

// Option A: Client-side search (recommended for performance)

// Filter already-fetched tasks array client-side using query string

// Implementation: tasks.filter(t => t.title.toLowerCase().includes(query.toLowerCase()))

// Option B: Server-side search

// GET /api/tasks?q={query}&workspaceId={id}

// 200: { tasks: ChatTask[] } — filtered and sorted by relevance

// Side note: title search only based on evidence from screenshots

`  `**SECTION 6**  

**SECTION 6 — Prisma Schema Fragment**

// For server-side search, add full-text search index:

model Task {

`  `// ...

`  `title String

`  `// PostgreSQL full-text search:

`  `// @@index([title], type: Gin) -- or use Prisma's fulltext search

}

`  `**SECTION 7**  

**SECTION 7 — Business Rules**

- BR-701: Search matches are highlighted in BOLD within the task title. Evidence: 'Blog' appears in bold/black in 'Clean Minimal Blog Builder' in Images 9 and 10. Implementation: Parse title and wrap matching segments in <strong> or font-bold span.
- BR-702: When search is active, date group headers ('Today', 'Yesterday') are HIDDEN. Evidence: Images 9 and 10 show no section headers. Implementation: Conditional render based on searchQuery.length > 0.
- BR-703: Search is case-insensitive. Evidence: User typed 'blog' (lowercase) and 'Blog' (capitalized in title) matched. Implementation: .toLowerCase() comparison.
- BR-704: Search is real-time with debounce. Evidence: UI shows instant results without submit button. Implementation: 300ms debounce on input onChange.
- BR-705: 'New Task' appears in search results even though the query 'blog' doesn't appear in the title (Image 10). This suggests search may also search message content, not just title. Evidence: 'New Task' shown alongside 'Clean Minimal Blog Builder' for query 'blog'. Implementation: Search task messages content OR 'New Task' is a recently created task that happens to match based on recency bias.

`  `**SECTION 8**  

**SECTION 8 — Edge Cases**

**A) Observed**

- No results state (Image 12): Query 'asd' shows clipboard empty state 'No tasks' + 'This agent's tasks will appear here.' Same illustration as filter empty state.

**B) Inferred**

- P1 — Simultaneous search + filter: Both should apply. Show no results if neither filter nor search matches.
- P1 — Special characters in search query: Sanitize before sending to avoid injection. Escape regex special chars for client-side matching.
- P2 — Very long task titles: Truncate with ellipsis in the result list. Max 40 chars visible.
- P2 — Search on empty list: Show 'No tasks yet' state immediately.

`  `**SECTION 9**  

**SECTION 9 — Acceptance Criteria**

1. GIVEN I type 'blog' in the search input WHEN query changes THEN tasks are filtered in real-time and matching text is bolded in the title
1. GIVEN search is active WHEN results appear THEN date section headers ('Today', 'Yesterday') are hidden
1. GIVEN search query 'blog' matches 'Clean Minimal Blog Builder' WHEN displayed THEN 'Blog' appears in bold and the rest in normal weight
1. GIVEN I type 'asd' WHEN no tasks match THEN clipboard empty state shows 'No tasks' with subtitle
1. GIVEN search has text WHEN I click the × clear button THEN input clears and date-grouped task list restores
1. GIVEN I type a query WHEN the debounce fires (300ms after last keystroke) THEN search executes



**SCREEN 8: CHAT LIST — SEARCH NO RESULTS**

Route: /chat (search empty)

`  `**SECTION 1**  

**SECTION 1 — Screen Identity**

|**Field**|**Value**|
| :- | :- |
|Screen name|Chat — Search No Results Empty State|
|Route path|/chat/{taskId} (same route)|
|Component file|src/components/shared/ChatListEmptyState.tsx (**SHARED** — reused from Screen 6, see ARCHITECTURE.md §4)|
|Screenshots|Image 12 (Searching\_chats\_3) — search query 'asd', no results, clipboard empty state|
|Auth requirement|Authenticated|
|Entry conditions|Search query has been entered and returns zero matching tasks|

`  `**SECTION 2**  

**SECTION 2 — UI Element Inventory**

|**Element**|**Tag**|**Shadcn**|**Content**|**Tailwind**|**Interactive?**|**State**|
| :- | :- | :- | :- | :- | :- | :- |
|Search input with query|input|Input|'asd' typed|same as Screen 7 search|Yes|SEARCH\_NO\_RESULTS|
|Chat list empty state|div|—|Same clipboard illustration + 'No tasks' + 'This agent's tasks will appear here.'|Same as Screen 6 empty state|No|NO\_RESULTS|
|Sidebar Favorites section|div|—|Favorites with SLMobbin Email Agent|Same as Screen 4|Yes|Always|
|Sidebar Recents section|div|—|Recents with Meeting Notetaker × 2, SLMobbin Email Agent, Gmail Inbox Monitor|Same as Screen 4|Yes|Always|

`  `**SECTION 3**  

**SECTION 3 — TypeScript Interfaces**

// Same as Screen 7 SearchState interface.

// When results.length === 0 and query.length > 0, render EmptyState with reason: 'no\_search\_results'

`  `**SECTION 4**  

**SECTION 4 — State Machine**

|**State**|**Trigger**|**UI Changes**|**Side Effects**|**Next State**|
| :- | :- | :- | :- | :- |
|SEARCH\_NO\_RESULTS (Image 12)|Query entered, 0 matches|Clipboard + 'No tasks' replaces task list; input still shows query|None|—|
|SEARCH\_CLEARED|User clears input (backspace or ×)|Task list reappears grouped by date|None|SEARCH\_IDLE|

`  `**SECTION 5**  

**SECTION 5 — API Contract**

// Client-side empty state — no additional API call.

// Same GET /api/tasks response; empty search result is UI-only.

`  `**SECTION 6**  

**SECTION 6 — Prisma Schema Fragment**

// No additional models needed.

`  `**SECTION 7**  

**SECTION 7 — Business Rules**

- BR-801: Search no-results state uses the EXACT same component and illustration as filter no-results state. Evidence: Same clipboard + 'No tasks' + 'This agent's tasks will appear here.' in both Images 6 and 12. Implementation: Reuse ChatListEmptyState component with different reason prop.
- BR-802: The main content area (right side) continues to show the previously selected conversation even during search. Evidence: Agent response content visible in Image 12. Implementation: Do not reset selectedTaskId when search changes.
- BR-803: Left sidebar Favorites/Recents remain visible and unaffected by search. Evidence: Both sections visible in Image 12. Implementation: Sidebar data is fetched independently from chat list search state.

`  `**SECTION 8**  

**SECTION 8 — Edge Cases**

- P1 — Single character query: Should still search and show results/empty state.
- P2 — Trailing/leading spaces: Trim query before matching.
- P2 — Emoji in search query: Support unicode search.

`  `**SECTION 9**  

**SECTION 9 — Acceptance Criteria**

1. GIVEN I type 'asd' in search WHEN no tasks match THEN the chat panel shows the clipboard empty state
1. GIVEN no search results are showing WHEN I clear the search input THEN the date-grouped task list reappears
1. GIVEN search has no results WHEN the main content area had a conversation THEN that conversation stays visible
1. GIVEN I search for a term with mixed case (e.g., 'BLOG') WHEN matched against 'Blog Builder' THEN the result appears (case-insensitive)


# **APPENDIX A — Chat Module Component Tree**

**Components marked [SHARED] are defined in `/src/components/shared/` — see ARCHITECTURE.md §4. Do NOT duplicate.**

**DashboardLayout** (ARCHITECTURE.md §3D)

- GlobalSidebar [SHARED] (220px when expanded, 48px when collapsed)
- WorkspaceHeader [SHARED] — avatar, name, collapse button
- NavItems [SHARED] — Home, Chat, My Agents, New Agent
- FavoritesList — agent favorites
- RecentsList — recent task/agent interactions
- PromoCard [SHARED] — dismissible promotional card

**ChatLayout (flex-row, flex-1)** — screen-specific, wraps panels below

- ChatListPanel (240px fixed width)
- ChatHeader — amber icon, 'Chat' label, dropdown caret
- ChatSearchBar — search input with filter + new-chat buttons
- ChatFilterDropdown — Errors / Unread options
- ChatGroupedList — date-grouped task items
- ChatListItem — task title, status dot, active/hover styles
- ChatListEmptyState [SHARED] — clipboard illustration + text

**ChatContent (flex-1)**

- ChatToolbar — Share button (when messages exist)
- ChatThread — scrollable message history
- ChatMessage — markdown rendered agent/user messages
- AgentActionButton — inline action confirmations
- ChatStreamingIndicator — typing indicator during response
- ChatMessageInput [SHARED as MessageInput] — fixed bottom: attachment, textarea, mic, send

# **APPENDIX B — Complete Task Status Matrix**

|**Status**|**Dot Color**|**Filter Category**|**Visible In List?**|**Description**|
| :- | :- | :- | :- | :- |
|ACTIVE|No dot|All|Yes|Task is open and awaiting user or agent action|
|RUNNING|🔵 Blue dot|All|Yes|Agent is actively executing — e.g., building code, sending email|
|ERROR|🔴 Red dot|Errors + All|Yes|Agent encountered an error; needs user attention|
|COMPLETED|No dot|All|Yes|Task finished successfully|
|ARCHIVED|—|None by default|No|Hidden from list; accessible via search or settings|

# **APPENDIX C — Search + Filter Interaction Matrix**

|**Scenario**|**Search Query**|**Filter**|**Expected Result**|
| :- | :- | :- | :- |
|No search, no filter|empty|none|All tasks grouped by date|
|Search with results|'blog'|none|Matching tasks flat list; 'Blog' bolded; no date groups|
|Search no results|'asd'|none|Clipboard empty state 'No tasks'|
|Filter: Errors, has results|empty|errors|Tasks with ERROR status only|
|Filter: Errors, no results|empty|errors|Clipboard empty state 'No tasks'|
|Filter: Unread, has results|empty|unread|Tasks with isUnread=true only|
|Combined search + filter|'blog'|errors|Tasks matching both criteria; implement AND logic|

# **APPENDIX D — CSS Layout Dimensions**

|**Panel**|**Width**|**Visibility**|**Z-index**|**Background**|
| :- | :- | :- | :- | :- |
|Global Sidebar (expanded)|220px|Always on desktop|10|bg-white border-r border-gray-100|
|Global Sidebar (collapsed)|48px|When user collapsed|10|bg-white border-r border-gray-100|
|Chat List Panel|240px|On /chat/\* routes only|5|bg-white border-r border-gray-100|
|Main Content Area|flex-1 (remaining)|Always|1|bg-white|
|Message Input Bar|calc(100% - sidebar - chat panel)|On /chat/\* routes|20|bg-white border-t border-gray-100|
|Filter Dropdown|192px (w-48)|On filter click|50|bg-white border border-gray-100 shadow-lg rounded-xl|


# **APPENDIX E — SSE STREAMING EVENT SCHEMA**

**See ARCHITECTURE.md §6 for the complete server-side and client-side implementation code.**

| Event Type | Payload | When |
| :- | :- | :- |
| `chunk` | `{ type: 'chunk', text: string }` | Each token/word of agent response |
| `action` | `{ type: 'action', action: AgentAction }` | Agent performs build/update/tool_call |
| `done` | `{ type: 'done', messageId: string }` | Stream complete, message saved |
| `error` | `{ type: 'error', message: string }` | Agent execution failed |

**Implementation details:**
- Runtime: `export const runtime = 'nodejs'` — do NOT use Edge runtime (Prisma requires Node.js)
- Pattern: `ReadableStream` with `new Response()` and SSE headers
- Client: Custom `useStreamingMessage()` hook using `response.body.getReader()`
- Buffer: SSE events are delimited by `\n\n`; client must buffer partial events
- Auto-title: After first user message, task title updates from 'New Task' to truncated first message (60 chars)

# **APPENDIX F — CROSS-REFERENCES TO ARCHITECTURE.MD**

This spec is one of three screen-level PRDs. The following cross-cutting concerns are defined in **ARCHITECTURE.md** and MUST be read before implementation:

| Concern | ARCHITECTURE.md Section |
| :- | :- |
| Consolidated Prisma schema (Task, Message, FavoriteAgent, Workspace, Agent + all relations) | §5 |
| DashboardLayout component spec (three-panel structure) | §3D |
| Middleware.ts auth guard (redirect logic for /chat routes) | §2 |
| Shared component registry (GlobalSidebar, MessageInput, ChatListEmptyState, PromoCard, NavItems) | §4 |
| SSE streaming implementation (complete server + client code) | §6 |
| Canonical route structure (/home is the dashboard, NOT /dashboard) | §1 |
| Design system tokens (sidebar widths, gradient values) | §8 |
| Env variable → feature mapping | §7 |
| Cross-document conflict resolutions | §9 |

**PRISMA NOTE:** Schema fragments in Screens 3, 4, 5, 6, 7, 8 are EXCERPTS of the consolidated schema in ARCHITECTURE.md §5. The `// ... (from Screen 3)` and `// ... (existing fields)` placeholders indicate where the fragment connects to the full schema. Generate `prisma/schema.prisma` from ARCHITECTURE.md §5 only.

**SHARED COMPONENT NOTE:** ChatListEmptyState (used in Screens 6 and 8) and MessageInput (used in Screens 3 and 4) are shared components. Build each ONCE in `/src/components/shared/` per ARCHITECTURE.md §4.

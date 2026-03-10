
**ENGINEERING PRD — V2 FORMAT**

**Home + Templates +**

**Search Flows**

Reverse-Engineered from Lindy.ai • 10 Screenshots

|**Property**|**Value**|
| :- | :- |
|Screenshots|10 images → 3 screens → 7 distinct states|
|Screen A|Home Dashboard (Images 4, 5, 6) — prompt bar + category tabs + template grid|
|Screen B|Template Gallery (Images 1/2, 3, 7/8) — full browse with filter sidebar|
|Screen C|Template Search (Images 9, 10) — search input + results / no-results|
|Format|V2 — 9-section engineering spec for Antigravity + Claude Code|
|Tech Stack|Next.js 14, TypeScript, Tailwind CSS, Shadcn/UI, Prisma, PostgreSQL|

PRD V2: HOME + TEMPLATES + SEARCH  |  LINDY.AI  |  CONFIDENTIAL

**⚠️ PREREQUISITE: Read ARCHITECTURE.md FIRST. It contains the consolidated Prisma schema, middleware.ts, layout specs, and shared component registry that this PRD references.**

**SCREEN A**

**SECTION 1: SCREEN IDENTITY — HOME DASHBOARD**

|**Property**|**Value**|
| :- | :- |
|Screen Name|Home Dashboard|
|Route|/home|
|Page Component|app/(app)/home/page.tsx|
|Main Component|src/components/app/AgentBuilderHome.tsx|
|Layout|DashboardLayout (from ARCHITECTURE.md §3D) — GlobalSidebar (left) + main content area. Full-width content. No ChatListPanel on this route.|
|Auth Requirement|Authenticated + onboarding complete. Redirect to /signup if no session. See ARCHITECTURE.md §2 for middleware logic.|
|Entry Conditions|User has completed onboarding (email verified, profile set, workspace created, trial/payment done)|
|Flow Position|Terminal screen of onboarding. Primary landing page for returning users. Transitions to: Agent Builder (prompt submit), Template Gallery ("See all" click), Template Detail (card click).|

*Images mapped: Image 4 (above fold — prompt bar + chips), Image 5 (below fold — Product + Meetings categories), Image 6 (Meetings tab selected + Most popular + Academy).*

**SECTION 2: UI ELEMENT INVENTORY — HOME DASHBOARD**

**2A. Above the Fold (Image 4)**

|**Element**|**Shadcn/HTML**|**Content**|**Tailwind (est.)**|**Interactive?**|
| :- | :- | :- | :- | :- |
|Hamburger menu|Button ghost + Menu icon|≡ icon|absolute top-4 left-4|Yes — opens sidebar nav|
|+ New Agent btn|Button outline|"+ New Agent"|absolute top-4 right-4 border rounded-lg px-4 py-2 text-sm font-medium|Yes — resets prompt bar, focuses it|
|Hero heading|h1|"How can I help?"|text-3xl font-bold text-center mt-32|No|
|Prompt textarea|Textarea in Card|Placeholder: "Build an agent or perform a task"|w-full max-w-2xl mx-auto rounded-2xl shadow-sm border p-4 min-h-[80px]|Yes — text input|
|Build apps chip|Badge/Button|"Build apps" with icon|bg-pink-50 text-pink-700 border-pink-200 rounded-full px-3 py-1 text-sm|Yes — toggles mode|
|Attach icon|Button ghost|Paperclip icon (lucide: Paperclip)|text-gray-400 hover:text-gray-600|Yes — opens file picker|
|Voice icon|Button ghost|Microphone icon (lucide: Mic)|text-gray-400 hover:text-gray-600|Yes — starts voice input|
|Send button|Button|Arrow-up icon (lucide: ArrowUp)|bg-blue-500 text-white rounded-full w-8 h-8 disabled:bg-gray-300|Yes — submits prompt. Disabled when empty.|
|Template chips Row 1|4x Badge buttons|Personal website | Customer support email | Outbound sales calls | Lead gen|flex gap-2 justify-center flex-wrap|Yes — each fills prompt + submits|
|Template chips Row 2|3x Badge buttons|Meeting recorder | LinkedIn outreach | Support chatbot|flex gap-2 justify-center|Yes — same behavior|
|Category tabs|Tabs component|Search icon | Product (selected) | Meetings | Most popular | Productivity | Sales | See all >|flex gap-1 justify-center border rounded-full px-3 py-1 text-sm|Yes — filters template grid below|

**2B. Below the Fold — Template Grid (Images 5, 6)**

|**Element**|**Shadcn/HTML**|**Content**|**Interactive?**|
| :- | :- | :- | :- |
|Category section header|h2 + "See all >" link|"Product" / "Meetings" / "Most popular" (dynamic)|"See all" navigates to /templates?category={slug}|
|Hero card (large)|Card with illustration|Category tagline + illustration (e.g., "From specs to shipping, get it done.")|Yes — navigates to category detail|
|Template cards (3 per row)|Card with icon + title + description|Icon (colored circle) + name + 1-line description|Yes — navigates to template detail / agent builder pre-filled|
|Academy section|Card (bottom)|"Academy" label + video thumbnail with play button|Yes — opens Academy page or video|
|Help FAB|Button|"?" icon, bottom-right|Yes — opens help center|

**2C. Template Card Component Spec**

**SHARED COMPONENT — File: `/src/components/shared/TemplateCard.tsx`**

**Used across Home (/home), Gallery (/templates), and Search results. Build ONCE. See ARCHITECTURE.md §4 for the complete shared component registry.**

|**Prop**|**Type**|**Source**|**Rendering**|
| :- | :- | :- | :- |
|id|string|template.id|Not rendered — used for onClick navigation|
|name|string|template.name|Bold text, ~14px, dark color. Truncate with ellipsis if >30 chars.|
|description|string|template.description|Gray text, ~13px, 2-line clamp. Some show "..." truncation.|
|icon|string (emoji or URL)|template.icon|Colored circle (~32px) with icon/emoji in top-left of card|
|iconBgColor|string (hex)|template.iconBgColor|Background color of icon circle (varies per template: blue, green, pink, orange, etc.)|
|isFeatured|boolean|template.isFeatured|If true: renders as hero card (2x width, illustration, tagline). If false: standard card.|

**SECTION 3: TYPESCRIPT INTERFACES**

// ===== Template Entity =====

interface Template {

`  `id: string;

`  `name: string;

`  `description: string;

`  `icon: string;            // emoji or image URL

`  `iconBgColor: string;     // hex color for icon circle bg

`  `category: TemplateCategory;

`  `roles: Role[];           // which roles this template targets

`  `useCases: UseCase[];     // which use cases it serves

`  `isFeatured: boolean;     // hero card treatment

`  `popularity: number;      // sort order for "Most popular"

`  `createdAt: Date;

}

// ===== Enums (from filter sidebar) =====

enum Role {

`  `ENGINEERING = 'Engineering',

`  `HUMAN\_RESOURCES = 'Human Resources',

`  `MARKETING = 'Marketing',

`  `OPERATIONS = 'Operations',

`  `PRODUCT = 'Product',

`  `SALES = 'Sales',

`  `SUPPORT = 'Support',

}

enum UseCase {

`  `AI\_ASSISTANT = 'AI Assistant',

`  `CHATBOT = 'Chatbot',

`  `COACHING = 'Coaching',

`  `CONTENT\_CREATION = 'Content creation',

`  `DOCUMENT\_PROCESSING = 'Document processing',

`  `EMAILS = 'Emails',

`  `MEETINGS = 'Meetings',

`  `OUTREACH = 'Outreach',

`  `PHONE = 'Phone',

`  `PRODUCTIVITY = 'Productivity',

`  `RESEARCH = 'Research',

`  `TEAMS = 'Teams',

`  `WEB\_SCRAPER = 'Web scraper',

}

enum TemplateCategory {

`  `PRODUCT = 'Product',

`  `MEETINGS = 'Meetings',

`  `MOST\_POPULAR = 'Most popular',

`  `PRODUCTIVITY = 'Productivity',

`  `SALES = 'Sales',

}

// ===== Dashboard Props =====

interface DashboardState {

`  `promptText: string;

`  `selectedCategory: TemplateCategory | null;

`  `templates: Template[];

`  `isPromptSubmitting: boolean;

}

// ===== Template Gallery Props =====

interface TemplateGalleryState {

`  `searchQuery: string;

`  `selectedRoles: Role[];    // multi-select checkboxes

`  `selectedUseCases: UseCase[];  // multi-select checkboxes

`  `filteredTemplates: Template[];

`  `isLoading: boolean;

}

// ===== API Response =====

interface TemplatesResponse {

`  `templates: Template[];

`  `total: number;

`  `categories: { name: TemplateCategory; count: number }[];

}



**SECTION 4: STATE MACHINE**

**Screen A: Home Dashboard States**

|**State**|**Trigger**|**UI Changes**|**Side Effects**|**Next State**|
| :- | :- | :- | :- | :- |
|IDLE (Image 4)|Page load|Prompt bar empty. Send button gray/disabled. Category tabs visible. "Product" selected by default. Template grid shows Product category below fold.|GET /api/templates?grouped=true|IDLE|
|CATEGORY\_CHANGED (Image 6)|Click different tab (e.g., "Meetings")|Tab underline moves. Template grid updates to show Meetings templates. Section header changes. Content scrolls to top of grid.|GET /api/templates?category=meetings|IDLE (with new category)|
|PROMPT\_TYPING|User types in textarea|Send button turns blue (enabled). Text appears in textarea. Template chips remain visible.|None|PROMPT\_READY|
|PROMPT\_READY|Text length > 0|Send button is blue/active. Paperclip + mic still visible.|None|PROMPT\_SUBMITTING (on click/enter)|
|PROMPT\_SUBMITTING|Click send or press Enter|Send button shows spinner. Textarea disabled. Prompt text preserved.|POST /api/agents/from-prompt { prompt: string }|Redirect to /chat/{agentId}|
|CHIP\_CLICKED|Click template chip|Chip text fills prompt bar (or immediately submits)|Same as PROMPT\_SUBMITTING but with template-specific prompt|Redirect to agent builder|
|SEE\_ALL\_CLICKED|Click "See all >" on any category|Navigation transition|router.push('/templates?category={slug}')|Screen B loads|

**Screen B: Template Gallery States**

|**State**|**Trigger**|**UI Changes**|**Side Effects**|**Next State**|
| :- | :- | :- | :- | :- |
|DEFAULT (Image 1/2)|Navigate to /templates|No filters selected. "Most popular" section with hero card + 4 cards. "All templates" section with full grid (3-col). Left sidebar: all Role + Use case checkboxes unchecked.|GET /api/templates|DEFAULT|
|FILTERED (Image 3)|Check Role: "Engineering" + Use case: "Document processing"|Checkboxes turn blue with checkmark. Sections update to "Most popular in Engineering and Document processing". "All templates in Engineering and Document processing". Template cards change to filtered results (Pull Request Reviewer, QA Engineer, Invoice Parser, etc.).|GET /api/templates?roles=Engineering&useCases=Document+processing|FILTERED|
|FILTER\_REMOVED|Uncheck a filter|Checkbox returns to empty. Grid updates. If all unchecked, reverts to DEFAULT.|Re-fetch with updated params|FILTERED or DEFAULT|

**Screen C: Template Search States**

|**State**|**Trigger**|**UI Changes**|**Side Effects**|**Next State**|
| :- | :- | :- | :- | :- |
|IDLE (Image 7/8)|Navigate to /templates|Search input empty with placeholder "Search". "Most popular" + "All templates" sections visible.|None|IDLE|
|TYPING|User types in search input|Text appears in search field. X (clear) button appears on right side of input.|Debounced search (300ms)|RESULTS or NO\_RESULTS|
|NO\_RESULTS (Image 9)|Search query: "asd" (no matches)|"All templates" header visible but grid is EMPTY. No template cards rendered. No "No results found" message visible. Filter sidebar remains.|GET /api/templates?search=asd returns empty array|NO\_RESULTS|
|RESULTS (Image 10)|Search query: "tracker" (matches found)|"All templates" section shows 8 matching cards in 3-col grid. "Most popular" section HIDDEN (only shows with no search). Cards: User feedback tracker, Competition Tracker, Customer Sentiment Tracker, Vendor Invoice & Payment..., Brand Monitor, Daily Engineering Metrics Digest, Project Status Updater, Bug Reports & Resolution Agent.|GET /api/templates?search=tracker|RESULTS|
|CLEARED|Click X button in search input|Search field empties. X button disappears. Grid reverts to default (Most popular + All templates).|GET /api/templates (no search param)|IDLE|



**SECTION 5: API CONTRACT**

**GET /api/templates**

Fetches templates with optional filtering, search, and category grouping.

// GET /api/templates?grouped=true

// Used by: Home Dashboard (grouped by category)

// Response 200:

{

`  `categories: [

`    `{ name: 'Product', templates: Template[], hero: Template | null },

`    `{ name: 'Meetings', templates: Template[], hero: Template | null },

`    `{ name: 'Most popular', templates: Template[], hero: Template | null },

`    `{ name: 'Productivity', templates: Template[] },

`    `{ name: 'Sales', templates: Template[] }

`  `]

}

// GET /api/templates?roles=Engineering&useCases=Document+processing

// Used by: Template Gallery (filtered)

// Response 200:

{

`  `templates: Template[],  // filtered results

`  `total: number,

`  `appliedFilters: { roles: string[], useCases: string[] }

}

// GET /api/templates?search=tracker

// Used by: Template Search

// Response 200:

{

`  `templates: Template[],  // search results (fuzzy match on name + description)

`  `total: number,

`  `query: string

}

// GET /api/templates?search=asd

// No results case

// Response 200: { templates: [], total: 0, query: 'asd' }

**POST /api/agents/from-prompt**

Creates an agent from natural language prompt (Home Dashboard submit).

// POST /api/agents/from-prompt

// Headers: { Authorization: 'Bearer {sessionToken}', Content-Type: 'application/json' }

// Request: { prompt: string, mode?: 'agent' | 'app' }

// 201: { agentId: string, chatId: string, name: string }

// 400: { error: 'empty\_prompt', message: 'Please describe what you want to build.' }

// 402: { error: 'credits\_exhausted', message: 'You have no credits remaining.' }

// Redirect: router.push(`/chat/${chatId}`)

**SECTION 6: PRISMA SCHEMA FRAGMENT**

**⚠️ FRAGMENT ONLY — See ARCHITECTURE.md §5 for the COMPLETE consolidated schema.prisma file. Do NOT generate schema.prisma from this fragment alone.**

model Template {

`  `id          String   @id @default(cuid())

`  `name        String                    // e.g., "Meeting Notetaker"

`  `description String                    // 1-line: "Captures key meeting details..."

`  `icon        String                    // emoji or image URL

`  `iconBgColor String   @default("#3B82F6") // hex for icon circle bg

`  `isFeatured  Boolean  @default(false)  // hero card treatment

`  `popularity  Int      @default(0)      // sort order for "Most popular"

`  `createdAt   DateTime @default(now())

`  `// Relationships

`  `categories  TemplateCategoryMap[]

`  `roles       TemplateRoleMap[]

`  `useCases    TemplateUseCaseMap[]

}

model TemplateCategoryMap {

`  `id         String   @id @default(cuid())

`  `templateId String

`  `category   TemplateCategory

`  `template   Template @relation(fields: [templateId], references: [id])

`  `@@unique([templateId, category])

}

model TemplateRoleMap {

`  `id         String @id @default(cuid())

`  `templateId String

`  `role       Role

`  `template   Template @relation(fields: [templateId], references: [id])

`  `@@unique([templateId, role])

}

model TemplateUseCaseMap {

`  `id         String  @id @default(cuid())

`  `templateId String

`  `useCase    UseCase

`  `template   Template @relation(fields: [templateId], references: [id])

`  `@@unique([templateId, useCase])

}

enum TemplateCategory { PRODUCT  MEETINGS  MOST\_POPULAR  PRODUCTIVITY  SALES }

enum Role { ENGINEERING  HUMAN\_RESOURCES  MARKETING  OPERATIONS  PRODUCT  SALES  SUPPORT }

enum UseCase { AI\_ASSISTANT  CHATBOT  COACHING  CONTENT\_CREATION  DOCUMENT\_PROCESSING  EMAILS  MEETINGS  OUTREACH  PHONE  PRODUCTIVITY  RESEARCH  TEAMS  WEB\_SCRAPER }



**SECTION 7: BUSINESS RULES**

|**ID**|**Rule**|**Evidence**|**Implementation**|
| :- | :- | :- | :- |
|BR-001|Dashboard zero-state IS the creation interface. No empty agent list. Prompt bar is the primary element.|Image 4: prompt bar centered, hero-sized, above everything else.|No conditional empty state. Dashboard always shows prompt bar + chips + template grid.|
|BR-002|"Product" is the default category tab on first load.|Image 4: "Product" tab has selected/bordered state. Image 5 shows Product templates first.|Default selectedCategory = 'Product'. Tab component renders with Product active.|
|BR-003|Category tabs and template grid are a single scroll page, NOT separate routes.|Images 4→5→6 are the same URL at different scroll positions and tab states. No route change visible.|Implement as client-side state. Category change = re-render grid, not navigation.|
|BR-004|"See all >" navigates to the full Template Gallery (/templates) with the category pre-selected.|"See all >" link visible next to each category header. Clicking it shows the full gallery with filter sidebar.|router.push(`/templates?category=${slug}`)|
|BR-005|Template Gallery uses multi-select checkboxes for filtering. Role and Use case are independent AND filters.|Image 3: Engineering (Role) AND Document processing (Use case) both checked. Results show intersection.|Filter logic: templates WHERE roles CONTAINS selectedRoles AND useCases CONTAINS selectedUseCases.|
|BR-006|Filters are cumulative (AND), not exclusive (OR). Checking more filters NARROWS results, not broadens.|Image 3: 2 filters active, results are specific to Engineering + Document processing only.|SQL: WHERE roles @> [checked\_roles] AND useCases @> [checked\_useCases]|
|BR-007|Filter selection dynamically updates both "Most popular" and "All templates" sections.|Image 3 header: "Most popular in Engineering and Document processing" (dynamic string).|Section headers template: `Most popular in ${selectedFilters.join(' and ')}`|
|BR-008|"Most popular" section shows hero card (2:1 ratio) + featured templates. Different from "All templates" which shows a flat grid.|Image 1: hero card with star illustration vs. Image 3: hero card shows different featured templates based on filters.|Two distinct grid layouts: FeaturedGrid (hero + 4) and AllTemplatesGrid (flat 3-col).|
|BR-009|Search is real-time with debounce, not submit-based. No search button visible.|Image 10: typing "tracker" shows results immediately. No submit button next to search field.|Use debounced search (300ms) on input onChange. No form submit.|
|BR-010|Search clears the "Most popular" section. Only "All templates" section shows during search.|Image 10: only "All templates" header visible. No "Most popular" hero card during search.|Conditional render: if (searchQuery) show only AllTemplates; else show MostPopular + AllTemplates.|
|BR-011|No-results state shows empty grid with NO message. Just the "All templates" header and nothing below it.|Image 9: search "asd" shows header but zero cards. No "No results" text, no illustration, no CTA.|Render empty div when templates.length === 0 during search. Consider IMPROVEMENT: add empty state message.|
|BR-012|Search input shows an X (clear) button when text is present. Not visible when empty.|Image 9/10: X button visible. Images 1/7/8: no X button (search is empty).|Conditional render: {searchQuery && <button onClick={clearSearch}><X /></button>}|
|BR-013|Filter sidebar checkboxes and search input coexist. Both can be active simultaneously.|Images 9/10: search active, filters still visible (unchecked). Image 3: filters active, search empty.|Combine: WHERE (roles filter) AND (useCase filter) AND (name ILIKE search OR description ILIKE search)|
|BR-014|7 template quick-launch chips on dashboard map to pre-built templates, not free-form prompts.|Chips: Personal website, Customer support email, Outbound sales calls, Lead gen, Meeting recorder, LinkedIn outreach, Support chatbot.|Each chip has a templateSlug. onClick: either pre-fills prompt with template description OR directly navigates to agent builder with template ID.|
|BR-015|Send button (arrow) is DISABLED (gray) when prompt is empty, ENABLED (blue) when text exists.|Image 4: prompt empty, send button gray circle. Chips present don't enable it.|disabled={promptText.trim().length === 0}|
|BR-016|"Build apps" chip (pink) in prompt bar suggests a separate mode toggle.|Image 4: pink chip with icon inside the prompt area.|Likely: mode state ('agent' | 'app'). Changes the API call on submit. Build apps creates a full application, not a workflow agent.|
|BR-017|Navigation: "< Back" appears on gallery but NOT on dashboard. Hamburger always present.|Image 1: "< Back" top-left next to hamburger. Image 4: only hamburger.|Gallery page: show BackButton. Dashboard page: hide BackButton.|



**SECTION 8: EDGE CASES & ERROR HANDLING**

**8A. Observed**

|**ID**|**Edge Case**|**Screenshot**|**UI Treatment**|**Recovery**|
| :- | :- | :- | :- | :- |
|OBS-01|Search with no results ("asd")|Image 9|Empty grid. "All templates" header visible. No cards. No empty state message.|User clears search with X button or modifies query. Filters remain accessible.|

**8B. Inferred (Must Build)**

|**ID**|**Edge Case**|**Treatment**|**Message**|**Priority**|
| :- | :- | :- | :- | :- |
|INF-01|Search no-results should show empty state message|Add: centered text + illustration below "All templates" header|"No templates found for '{query}'. Try a different search or browse by category."|P1|
|INF-02|API failure loading templates|Toast notification + retry button|"Failed to load templates. Please try again."|P0|
|INF-03|Prompt submit with only whitespace|Prevent submission, don't send API call|N/A (button stays disabled)|P0|
|INF-04|Prompt submit when credits are exhausted|Modal dialog with upgrade CTA|"You're out of credits. Upgrade to Pro to continue building agents."|P0|
|INF-05|Template card description exceeds 2 lines|CSS line-clamp: 2 with text-overflow: ellipsis|N/A (visual truncation)|P1|
|INF-06|Very long search query (>200 chars)|Client-side maxLength on search input|N/A (input silently truncated)|P2|
|INF-07|Filter combination returns no results|Same as INF-01 but for filter-only (no search)|"No templates match your filters. Try removing some filters."|P1|
|INF-08|Deep link to /templates?roles=Engineering (URL-based filtering)|Parse URL query params on mount. Set checkboxes from URL state.|N/A|P1|
|INF-09|Browser back from gallery to dashboard|Standard browser back. Dashboard should NOT re-trigger onboarding.|N/A|P1|
|INF-10|Rapid checkbox toggling (filter spam)|Debounce filter API calls (300ms). Show loading skeleton during fetch.|N/A|P2|
|INF-11|Template data slow to load (>2s)|Show skeleton cards (gray placeholder cards) in grid during loading|N/A|P1|



**SECTION 9: ACCEPTANCE CRITERIA**

**AC-01: Dashboard Default Load**

GIVEN I am authenticated and navigate to /home

WHEN the page loads

THEN I see the heading "How can I help?"

AND a prompt textarea with placeholder "Build an agent or perform a task"

AND 7 template chips below the prompt (Personal website, Customer support email, Outbound sales calls, Lead gen, Meeting recorder, LinkedIn outreach, Support chatbot)

AND category tabs with "Product" selected by default

AND a template grid showing Product category templates below the tabs

AND the send button is gray/disabled

**AC-02: Category Tab Switch**

GIVEN I am on the dashboard with "Product" tab selected

WHEN I click the "Meetings" tab

THEN the tab underline moves to "Meetings"

AND the template grid updates to show Meetings templates (Meeting Notetaker, Meeting Scheduler, Meeting Prep Assistant, Meeting Coach)

AND a hero card with "Book, reschedule, and follow up, automatically." appears

**AC-03: Prompt Submit**

GIVEN I have typed "Monitor my Gmail inbox" in the prompt textarea

WHEN I click the send button (or press Enter)

THEN the send button shows a loading spinner

AND the textarea becomes disabled

AND a POST /api/agents/from-prompt request fires with { prompt: "Monitor my Gmail inbox" }

AND on success I am redirected to /chat/{chatId}

**AC-04: Template Gallery Default**

GIVEN I click "See all >" on any category from the dashboard

WHEN the Template Gallery loads

THEN I see a "< Back" button in the top-left

AND a search input with placeholder "Search"

AND a left sidebar with Role checkboxes (7 options) and Use case checkboxes (13 options), all unchecked

AND a "Most popular" section with a hero card and featured templates

AND an "All templates" section with a 3-column grid of all template cards

**AC-05: Filter Selection**

GIVEN I am on the Template Gallery with no filters

WHEN I check "Engineering" under Role AND "Document processing" under Use case

THEN both checkboxes show a blue checkmark

AND the section headers update to "Most popular in Engineering and Document processing"

AND the template grid shows only templates matching BOTH Engineering role AND Document processing use case

AND templates like Pull Request Reviewer, QA Engineer, Invoice Parser appear

**AC-06: Search with Results**

GIVEN I am on the Template Gallery

WHEN I type "tracker" in the search input

THEN an X (clear) button appears in the search input

AND the "Most popular" section disappears

AND the "All templates" section shows matching results: User feedback tracker, Competition Tracker, Customer Sentiment Tracker, Vendor Invoice & Payment..., Brand Monitor, Daily Engineering Metrics Digest, Project Status Updater, Bug Reports & Resolution Agent

**AC-07: Search with No Results**

GIVEN I am on the Template Gallery

WHEN I type "asd" in the search input

THEN the "Most popular" section disappears

AND the "All templates" header is visible but the grid below it is empty

AND no template cards are rendered

**AC-08: Search Clear**

GIVEN I have searched for "tracker" and see results

WHEN I click the X button in the search input

THEN the search field is cleared

AND the X button disappears

AND the "Most popular" section reappears

AND the "All templates" section shows the full unfiltered grid

**AC-09: Template Card Click**

GIVEN I see a template card (e.g., "Meeting Notetaker") on any screen

WHEN I click the card

THEN I am navigated to the agent builder with that template pre-loaded

OR I see a template detail modal/page (behavior to verify)

**AC-10: Template Chip Click**

GIVEN I am on the dashboard

WHEN I click the "Customer support email" chip

THEN I am navigated to the agent builder with that template's prompt pre-filled

AND the agent creation process begins automatically

**AC-11: Empty Prompt Prevents Submit**

GIVEN the prompt textarea is empty

WHEN I click the send button

THEN nothing happens (button is disabled, no API call fires)

AND no error message is shown


**END OF PRD — 10 SCREENSHOTS, 3 SCREENS, 7 STATES, 17 BUSINESS RULES, 12 EDGE CASES, 11 ACCEPTANCE CRITERIA, FULL PRISMA SCHEMA + API CONTRACTS + TYPESCRIPT INTERFACES**


**APPENDIX: CROSS-REFERENCES TO ARCHITECTURE.MD**

This PRD is one of three screen-level specs. The following cross-cutting concerns are defined in **ARCHITECTURE.md** and MUST be read before implementation:

| Concern | ARCHITECTURE.md Section |
| :- | :- |
| Consolidated Prisma schema (Template, TemplateCategoryMap, TemplateRoleMap, TemplateUseCaseMap) | §5 |
| DashboardLayout component spec (wraps /home) | §3D |
| Middleware.ts auth guard (redirect logic for /home and /templates) | §2 |
| Shared component registry (TemplateCard, CategoryTabs, AgentBuilderInput, EmptyState) | §4 |
| Route structure (/home NOT /dashboard) | §1 |
| Design system tokens (gradient values, card styles) | §8 |
| Env variable → feature mapping (what degrades if APIs are missing) | §7 |

**ROUTE CORRECTION:** All previous references to `/dashboard` in this document have been corrected to `/home`. The canonical route for the post-onboarding dashboard is `/home` as defined in ARCHITECTURE.md §1 and §9.
